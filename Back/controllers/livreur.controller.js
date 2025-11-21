import db from "../db/prisma.js";
// 🔔 ADD THESE IMPORTS
import {
  notifyDeliveryAssigned,
  createNotification,
  notifyOrderStatusChange,
} from "../services/notification.service.js";

export const getMissionsDisponibles = async (req, res) => {
  try {
    const missions = await db.bonDeLivraison.findMany({
      where: { status: "PENDING_PICKUP" },
      include: {
        commande: {
          include: {
            client: true,
            boutique: true,
            produits: { include: { produit: true } },
          },
        },
      },
      orderBy: { dateCreation: "asc" },
    });

    res.json({ missions });
  } catch (error) {
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

  export const accepterMission = async (req, res) => {
    try {
      const {  livreurId,bonId } = req.params;

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

      // Get livreur info
      const livreur = await db.livreur.findUnique({
        where: { id: livreurId },
        include: { user: true },
      });

      if (!livreur) {
        return res.status(404).json({ message: "Livreur introuvable" });
      }

      const updatedBon = await db.bonDeLivraison.update({
        where: { id: bonId },
        data: {
          livreurId,
          status: "IN_TRANSIT",
          commande: { update: { status: "SHIPPED" } },
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

      // 🔔 Notify client that delivery has been assigned and is on the way
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

      // 🔔 Notify vendeur that delivery has been accepted
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

      // 🔔 Update order status notification
      await notifyOrderStatusChange(updatedBon.commande, "SHIPPED");

      res.json({
        message: "Mission acceptée avec succès",
        bonDeLivraison: updatedBon,
      });
    } catch (error) {
      console.error("accepterMission error:", error);
      res.status(500).json({
        message: "Erreur lors de l'acceptation de la mission",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };

export const refuserMission = async (req, res) => {
  try {
    const { bonId } = req.params;
    const livreurId = req.user?.livreurId || req.params.livreurId; // Get from auth or params

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
      return res
        .status(400)
        .json({ message: "Mission non disponible pour refus" });
    }

    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: {
        livreurId: null,
        status: "PENDING_PICKUP",
        commande: { update: { status: "READY" } },
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

    // 🔔 Notify client about delivery issue
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

    // 🔔 Notify vendeur about delivery refusal
    if (updatedBon.commande.boutique?.vendeur?.userId) {
      await createNotification({
        userId: updatedBon.commande.boutique.vendeur.userId,
        type: "SYSTEM_ANNOUNCEMENT",
        data: {
          details: `Livraison #${orderNumber} refusée, en attente d'un nouveau livreur`,
        },
        commandeId: updatedBon.commande.id,
        actionUrl: `/vendor/orders/${updatedBon.commande.id}`,
        metadata: {
          deliveryId: bon.id,
          refusedAt: new Date().toISOString(),
          reason: "livreur_refused",
        },
      });
    }

    res.json({
      message: "Mission refusée, disponible pour un autre livreur",
      bonDeLivraison: updatedBon,
    });
  } catch (error) {
    console.error("refuserMission error:", error);
    res.status(500).json({
      message: "Erreur lors du refus de la mission",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔔 ADD THIS: Get livreur's missions history
export const getMesLivraisons = async (req, res) => {
  try {
    const livreurId = req.user?.livreurId || req.params.livreurId;

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
      orderBy: { dateCreation: "desc" },
    });

    // Calculate stats
    const stats = {
      total: livraisons.length,
      delivered: livraisons.filter((l) => l.status === "DELIVERED").length,
      inTransit: livraisons.filter((l) => l.status === "IN_TRANSIT").length,
      failed: livraisons.filter((l) => l.status === "FAILED").length,
      pending: livraisons.filter((l) => l.status === "PENDING_PICKUP").length,
    };

    res.json({
      livraisons,
      stats,
    });
  } catch (error) {
    console.error("getMesLivraisons error:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des livraisons",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
