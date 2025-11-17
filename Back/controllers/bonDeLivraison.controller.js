import db from "../db/prisma.js";
// 🔔 ADD THIS IMPORT
import {
  notifyDeliveryAssigned,
  createNotification,
  notifyOrderStatusChange,
} from "../services/notification.service.js";

export const getAllBonsDeLivraison = async (req, res) => {
  try {
    const bons = await db.bonDeLivraison.findMany({
      include: {
        commande: {
          include: {
            client: true,
            boutique: true,
          },
        },
        livreur: {
          include: { user: true },
        },
      },
      orderBy: { dateCreation: "desc" },
    });

    if (bons.length === 0) {
      return res.status(200).json({
        message: "Aucun bon de livraison trouvé.",
        bons: [],
        hint: "Créez une commande avec statut 'READY', puis générez un bon via votre logique métier.",
      });
    }

    res.json({ bons });
  } catch (error) {
    console.error(" getAllBonsDeLivraison error:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getBonsDeLivraisonByLivreur = async (req, res) => {
  try {
    const { livreurId } = req.params;

    if (!livreurId || livreurId.length !== 24) {
      return res.status(400).json({ message: "ID de livreur invalide" });
    }

    const bons = await db.bonDeLivraison.findMany({
      where: { livreurId },
      include: {
        commande: {
          include: {
            client: { select: { nom: true, prenom: true, telephone: true } },
            boutique: { select: { nom: true, telephone: true } },
            produits: {
              include: {
                produit: { select: { nom: true, prix: true } },
              },
            },
          },
        },
        livreur: {
          include: { user: { select: { nom: true, prenom: true } } },
        },
      },
      orderBy: { dateCreation: "desc" },
    });

    if (bons.length === 0) {
      return res.status(404).json({
        message: "Aucun bon de livraison trouvé pour ce livreur",
        livreurId,
      });
    }

    res.json({ bons });
  } catch (error) {
    console.error(" getBonsDeLivraisonByLivreur error:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des bons",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔔 ADD THIS: New function to create bon and assign delivery
export const createBonDeLivraison = async (req, res) => {
  try {
    const { commandeId, livreurId } = req.body;

    // Check if commande exists and is READY
    const commande = await db.commande.findUnique({
      where: { id: commandeId },
      include: { boutique: true },
    });

    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (commande.status !== "READY") {
      return res.status(400).json({
        message:
          "La commande doit être au statut READY pour créer un bon de livraison",
      });
    }

    // Create bon de livraison
    const bon = await db.bonDeLivraison.create({
      data: {
        commandeId,
        livreurId,
        status: "PENDING_PICKUP",
      },
      include: {
        commande: {
          include: { client: true, boutique: true },
        },
        livreur: { include: { user: true } },
      },
    });

    // 🔔 Notify livreur about new delivery assignment
    await notifyDeliveryAssigned(bon, commande);

    // 🔔 Notify client that delivery has been assigned
    const orderNumber = commande.id.slice(-8).toUpperCase();
    await createNotification({
      userId: commande.clientId,
      type: "DELIVERY_ASSIGNED",
      data: { orderNumber },
      commandeId: commande.id,
      actionUrl: `/orders/${commande.id}/track`,
      metadata: {
        deliveryId: bon.id,
        livreurName: `${bon.livreur.user.prenom} ${bon.livreur.user.nom}`,
      },
    });

    res.status(201).json({
      message: "Bon de livraison créé avec succès",
      bonDeLivraison: bon,
    });
  } catch (error) {
    console.error("createBonDeLivraison error:", error);
    res.status(500).json({
      message: "Erreur lors de la création du bon de livraison",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔔 ADD THIS: Update delivery status to IN_TRANSIT (pickup)
export const pickupCommande = async (req, res) => {
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

    if (!bon) {
      return res.status(404).json({ message: "Bon de livraison introuvable" });
    }

    if (bon.status !== "PENDING_PICKUP") {
      return res.status(400).json({
        message: "Le bon doit être en attente de ramassage",
      });
    }

    // Update bon status
    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: {
        status: "IN_TRANSIT",
        commande: { update: { status: "SHIPPED" } },
      },
      include: {
        commande: true,
        livreur: { include: { user: true } },
      },
    });

    // 🔔 Notify client that order is picked up and on the way
    const orderNumber = bon.commande.id.slice(-8).toUpperCase();
    await createNotification({
      userId: bon.commande.clientId,
      type: "DELIVERY_PICKED_UP",
      data: { orderNumber },
      commandeId: bon.commande.id,
      actionUrl: `/orders/${bon.commande.id}/track`,
      metadata: {
        deliveryId: bon.id,
        livreurName: `${bon.livreur.user.prenom} ${bon.livreur.user.nom}`,
        livreurPhone: bon.livreur.user.telephone,
      },
    });

    // 🔔 Notify vendeur that order was picked up
    if (bon.commande.boutique?.vendeur?.userId) {
      await createNotification({
        userId: bon.commande.boutique.vendeur.userId,
        type: "DELIVERY_PICKED_UP",
        data: { orderNumber },
        commandeId: bon.commande.id,
        actionUrl: `/vendor/orders/${bon.commande.id}`,
        metadata: {
          deliveryId: bon.id,
          livreurName: `${bon.livreur.user.prenom} ${bon.livreur.user.nom}`,
        },
      });
    }

    // 🔔 Update order status notification
    await notifyOrderStatusChange(updatedBon.commande, "SHIPPED");

    res.json({
      message: "Commande récupérée avec succès",
      bonDeLivraison: updatedBon,
    });
  } catch (error) {
    console.error("pickupCommande error:", error);
    res.status(500).json({
      message: "Erreur lors du ramassage",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const livrerCommande = async (req, res) => {
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

    if (!bon) {
      return res.status(404).json({ message: "Bon de livraison introuvable" });
    }

    if (bon.status !== "IN_TRANSIT") {
      return res.status(400).json({ message: "Livraison non en cours" });
    }

    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: {
        status: "DELIVERED",
        commande: { update: { status: "DELIVERED" } },
      },
      include: { commande: true },
    });

    // 🔔 Notify client about successful delivery
    await notifyOrderStatusChange(updatedBon.commande, "DELIVERED");

    // 🔔 Notify vendeur about completed delivery
    if (bon.commande.boutique?.vendeur?.userId) {
      const orderNumber = bon.commande.id.slice(-8).toUpperCase();
      await createNotification({
        userId: bon.commande.boutique.vendeur.userId,
        type: "ORDER_DELIVERED",
        data: { orderNumber },
        commandeId: bon.commande.id,
        actionUrl: `/vendor/orders/${bon.commande.id}`,
        metadata: {
          deliveryId: bon.id,
          deliveredAt: new Date().toISOString(),
        },
      });
    }

    res.json({
      message: "Commande livrée avec succès",
      bonDeLivraison: updatedBon,
    });
  } catch (error) {
    console.error("livrerCommande error:", error);
    res.status(500).json({
      message: "Erreur lors de la livraison",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔔 ADD THIS: Handle failed delivery
export const failDelivery = async (req, res) => {
  try {
    const { bonId } = req.params;
    const { reason } = req.body;

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

    if (!bon) {
      return res.status(404).json({ message: "Bon de livraison introuvable" });
    }

    if (bon.status === "DELIVERED") {
      return res
        .status(400)
        .json({ message: "Cette commande a déjà été livrée" });
    }

    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: { status: "FAILED" },
      include: { commande: true },
    });

    // 🔔 Notify client about failed delivery
    const orderNumber = bon.commande.id.slice(-8).toUpperCase();
    await createNotification({
      userId: bon.commande.clientId,
      type: "DELIVERY_FAILED",
      data: { orderNumber },
      commandeId: bon.commande.id,
      actionUrl: `/orders/${bon.commande.id}`,
      metadata: {
        deliveryId: bon.id,
        reason: reason || "Échec de livraison",
        failedAt: new Date().toISOString(),
      },
    });

    // 🔔 Notify vendeur about failed delivery
    if (bon.commande.boutique?.vendeur?.userId) {
      await createNotification({
        userId: bon.commande.boutique.vendeur.userId,
        type: "DELIVERY_FAILED",
        data: { orderNumber },
        commandeId: bon.commande.id,
        actionUrl: `/vendor/orders/${bon.commande.id}`,
        metadata: {
          deliveryId: bon.id,
          reason: reason || "Échec de livraison",
        },
      });
    }

    res.json({
      message: "Échec de livraison enregistré",
      bonDeLivraison: updatedBon,
    });
  } catch (error) {
    console.error("failDelivery error:", error);
    res.status(500).json({
      message: "Erreur lors de l'enregistrement de l'échec",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
