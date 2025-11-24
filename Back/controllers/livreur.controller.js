import db from "../db/prisma.js";
import {
  notifyDeliveryAssigned,
  createNotification,
  notifyOrderStatusChange,
} from "../services/notification.service.js";


export const getMissionsDisponibles = async (req, res) => {
  console.log("🔍 Raw MongoDB query for PENDING_PICKUP");
  
  try {
    // Raw MongoDB aggregation
    const rawResult = await db.$runCommandRaw({
      aggregate: "bon_de_livraison",
      pipeline: [
        { $match: { 
            status: "PENDING_PICKUP",
            $or: [
              { livreurId: { $exists: false } },
              { livreurId: null },
              { livreurId: "" }
            ]
          }
        },
        { $sort: { dateCreation: 1 } },
        { $limit: 50 }
      ],
      cursor: {}
    });

    // ✅ FIXED: Extract STRING IDs from ObjectId
    const missionIds = rawResult.cursor.firstBatch.map((m) => m._id.$oid);
    console.log("✅ Extracted STRING IDs:", missionIds);

    // ✅ Prisma findMany with STRING IDs
    const fullMissions = await db.bonDeLivraison.findMany({
      where: { 
        id: { in: missionIds }  // Now strings! ✅
      },
      include: {
        commande: {
          include: {
            client: true,
            boutique: true,
            produits: { include: { produit: true } },
          },
        },
      },
    });

    console.log("✅ Full missions loaded:", fullMissions.length);
    res.json({ missions: fullMissions });
  } catch (error) {
    console.error("❌ Raw Mongo error:", error);
    res.status(500).json({ message: error.message });
  }
};



export const getMissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const mission = await db.bonDeLivraison.findUnique({
      where: { id },
      include: {
        commande: {
          include: {
            client: true,
            boutique: { include: { vendeur: { include: { user: true } } } },
          },
        },
        livreur: { include: { user: true } },
      },
    });

    if (!mission) {
      return res.status(404).json({ message: "Mission introuvable" });
    }

    res.json({ mission });
  } catch (error) {
    console.error("Erreur lors de la récupération de la mission:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// ✅ FIXED: Separate updates
export const accepterMission = async (req, res) => {
  try {
    const { livreurId, bonId } = req.params;

    const bon = await db.bonDeLivraison.findUnique({
      where: { id: bonId },
      include: {
        commande: {
          include: {
            client: true,
            boutique: { include: { vendeur: true } },
          },
        },
        livreur: { include: { user: true } },
      },
    });

    if (!bon)
      return res.status(404).json({ message: "Bon de livraison introuvable" });
    if (bon.status !== "PENDING_PICKUP")
      return res.status(400).json({ message: "Mission non disponible" });
    if (bon.livreurId)
      return res.status(402).json({ message: "Mission déjà prise" });

    const livreur = await db.livreur.findUnique({
      where: { id: livreurId },
      include: { user: true },
    });

    if (!livreur) {
      return res.status(404).json({ message: "Livreur introuvable" });
    }

    // ✅ STEP 1: Update BON
    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: {
        livreurId,
        status: "IN_TRANSIT",
      },
      include: {
        commande: {
          include: {
            client: true,
            boutique: { include: { vendeur: true } },
          },
        },
        livreur: { include: { user: true } },
      },
    });

    // ✅ STEP 2: Update COMMANDE
    await db.commande.update({
      where: { id: updatedBon.commandeId },
      data: { status: "SHIPPED" },
    });

    // Notifications
    const orderNumber = updatedBon.commande.id.slice(-8).toUpperCase();
    await createNotification({
      userId: updatedBon.commande.clientId,
      type: "ORDER_SHIPPED",
      data: { orderNumber },
      commandeId: updatedBon.commande.id,
      actionUrl: `/orders/${updatedBon.commande.id}/track`,
      metadata: {
        deliveryId: updatedBon.id,
        livreurName: `${livreur.user.prenom} ${livreur.user.nom}`,
        livreurPhone: livreur.user.telephone,
        status: "accepted_and_in_transit",
      },
    });

    if (updatedBon.commande.boutique?.vendeur?.userId) {
      await createNotification({
        userId: updatedBon.commande.boutique.vendeur.userId,
        type: "DELIVERY_PICKED_UP",
        data: { orderNumber },
        commandeId: updatedBon.commande.id,
        actionUrl: `/vendor/orders/${updatedBon.commande.id}`,
        metadata: {
          deliveryId: updatedBon.id,
          livreurName: `${livreur.user.prenom} ${livreur.user.nom}`,
          acceptedAt: new Date().toISOString(),
        },
      });
    }

    await notifyOrderStatusChange(updatedBon.commande, "SHIPPED");

    res.json({
      message: "Mission acceptée avec succès",
      bonDeLivraison: updatedBon,
    });
  } catch (error) {
    console.error("accepterMission error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ FIXED: Separate updates
export const refuserMission = async (req, res) => {
  try {
    const { bonId } = req.params;

    const bon = await db.bonDeLivraison.findUnique({
      where: { id: bonId },
      include: {
        commande: {
          include: {
            client: true,
            boutique: { include: { vendeur: true } },
          },
        },
        livreur: { include: { user: true } },
      },
    });

    if (!bon)
      return res.status(404).json({ message: "Bon de livraison introuvable" });
    if (bon.status !== "PENDING_PICKUP" && bon.status !== "IN_TRANSIT") {
      return res.status(400).json({ message: "Mission non disponible pour refus" });
    }

    // ✅ STEP 1: Update BON
    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: {
        livreurId: null,
        status: "PENDING_PICKUP",
      },
      include: {
        commande: {
          include: {
            client: true,
            boutique: { include: { vendeur: true } },
          },
        },
      },
    });

    // ✅ STEP 2: Update COMMANDE
    await db.commande.update({
      where: { id: updatedBon.commandeId },
      data: { status: "READY" },
    });

    const orderNumber = updatedBon.commande.id.slice(-8).toUpperCase();
    await createNotification({
      userId: updatedBon.commande.clientId,
      type: "SYSTEM_ANNOUNCEMENT",
      data: { orderNumber },
      commandeId: updatedBon.commande.id,
      actionUrl: `/orders/${updatedBon.commande.id}`,
      metadata: {
        message: "Recherche d'un nouveau livreur en cours...",
        previousDeliveryId: bon.id,
        status: "reassignment_in_progress",
      },
    });

    res.json({
      message: "Mission refusée, disponible pour un autre livreur",
      bonDeLivraison: updatedBon,
    });
  } catch (error) {
    console.error("refuserMission error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMesLivraisons = async (req, res) => {
  try {
    const { livreurId } = req.params;

    if (!livreurId) {
      return res.status(400).json({ message: "ID livreur manquant" });
    }

    const livraisons = await db.bonDeLivraison.findMany({
      where: { livreurId },
      include: {
        commande: {
          include: {
            client: {
              select: { nom: true, prenom: true, telephone: true },
            },
            boutique: {
              select: { nom: true, adresse: true, telephone: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      livraisons,
      stats: {
        total: livraisons.length,
        delivered: livraisons.filter((l) => l.status === "DELIVERED").length,
        inTransit: livraisons.filter((l) => l.status === "IN_TRANSIT").length,
      },
    });
  } catch (error) {
    console.error("getMesLivraisons error:", error);
    res.status(500).json({ message: error.message });
  }
};
