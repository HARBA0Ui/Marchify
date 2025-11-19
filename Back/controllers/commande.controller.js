import db from "../db/prisma.js";
import {
  notifyOrderStatusChange,
  notifyLowStock,
  createNotification,
} from "../services/notification.service.js";

export const getCommadesByAcheteur = async (req, res) => {
  try {
    const { clientId } = req.params;

    const commandes = await db.commande.findMany({
      where: { clientId },
      include: {
        produits: { include: { produit: true } },
        client: true,
        boutique: true,
      },
      orderBy: { dateCommande: "desc" },
    });

    res.json({ commandes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommandesVendeur = async (req, res) => {
  try {
    const { vendeurId } = req.params;

    const boutiques = await db.boutique.findMany({ where: { vendeurId } });
    const boutiqueIds = boutiques.map((b) => b.id);

    const commandes = await db.commande.findMany({
      where: { boutiqueId: { in: boutiqueIds } },
      include: {
        produits: { include: { produit: true } },
        client: true,
        boutique: true,
      },
      orderBy: { dateCommande: "desc" },
    });

    res.json({ commandes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDetailCommande = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const commande = await db.commande.findUnique({
      where: { id: commandeId },
      include: {
        produits: { include: { produit: true } },
        client: true,
        boutique: true,
      },
    });

    if (!commande)
      return res.status(404).json({ message: "Commande introuvable" });

    res.json({ commande });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommandesBoutique = async (req, res) => {
  try {
    const { boutiqueId } = req.params;

    const boutique = await db.boutique.findUnique({
      where: { id: boutiqueId },
    });

    if (!boutique)
      return res.status(404).json({ message: "Boutique introuvable" });

    const commandes = await db.commande.findMany({
      where: { boutiqueId },
      include: {
        produits: { include: { produit: true } },
        client: true,
        boutique: true,
      },
      orderBy: { dateCommande: "desc" },
    });

    res.json({ commandes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: Accept order (PENDING → PROCESSING)
export const accepterCommande = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const commande = await db.commande.findUnique({
      where: { id: commandeId },
      include: {
        produits: { include: { produit: true } },
        client: true,
        boutique: { include: { vendeur: true } },
      },
    });

    if (!commande)
      return res.status(404).json({ message: "Commande introuvable" });

    if (commande.status !== "PENDING") {
      return res.status(400).json({
        message: `Impossible d'accepter une commande ${commande.status}`,
      });
    }

    // Check stock availability
    const indisponibles = commande.produits.filter(
      (p) => p.produit.quantite < p.quantite
    );

    if (indisponibles.length > 0) {
      return res.status(400).json({
        message: "Certains produits sont indisponibles",
        produits: indisponibles.map((p) => ({
          nom: p.produit.nom,
          disponible: p.produit.quantite,
          demande: p.quantite,
        })),
      });
    }

    const commandeUpdated = await db.commande.update({
      where: { id: commandeId },
      data: { status: "PROCESSING" },
      include: {
        client: true,
        boutique: true,
        produits: { include: { produit: true } },
      },
    });

    await notifyOrderStatusChange(commandeUpdated, "PROCESSING");

    res.json({
      message: "Commande acceptée et en cours de traitement",
      commande: commandeUpdated,
    });
  } catch (error) {
    console.error("accepterCommande error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATED: Prepare order (PROCESSING → READY)
export const preparerCommande = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const commande = await db.commande.findUnique({
      where: { id: commandeId },
      include: {
        produits: { include: { produit: true } },
        client: true,
        boutique: { include: { vendeur: true } },
      },
    });

    if (!commande)
      return res.status(404).json({ message: "Commande introuvable" });

    if (commande.status !== "PROCESSING") {
      return res.status(400).json({
        message: `Impossible de préparer une commande ${commande.status}`,
      });
    }

    // Check stock one more time
    const indisponibles = commande.produits.filter(
      (p) => p.produit.quantite < p.quantite
    );

    if (indisponibles.length > 0) {
      return res.status(400).json({
        message: "Certains produits sont indisponibles",
        produits: indisponibles.map((p) => ({
          nom: p.produit.nom,
          disponible: p.produit.quantite,
        })),
      });
    }

    for (const p of commande.produits) {
      const updatedProduit = await db.produit.update({
        where: { id: p.produitId },
        data: { quantite: { decrement: p.quantite } },
      });

      const STOCK_THRESHOLD = 10;
      if (updatedProduit.quantite <= STOCK_THRESHOLD) {
        await notifyLowStock(updatedProduit);
      }
    }

    const commandePrep = await db.commande.update({
      where: { id: commandeId },
      data: { status: "READY" },
      include: {
        client: true,
        boutique: true,
        produits: { include: { produit: true } },
      },
    });

    await notifyOrderStatusChange(commandePrep, "READY");

    res.json({
      message: "Commande prête pour livraison",
      commande: commandePrep,
    });
  } catch (error) {
    console.error("preparerCommande error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const expedierCommande = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const commande = await db.commande.findUnique({
      where: { id: commandeId },
      include: {
        client: true,
        boutique: { include: { vendeur: true } },
        produits: { include: { produit: true } },
      },
    });

    if (!commande)
      return res.status(404).json({ message: "Commande introuvable" });

    if (commande.status !== "READY") {
      return res.status(400).json({
        message: `Impossible d'expédier une commande ${commande.status}`,
      });
    }

    const commandeExpediee = await db.commande.update({
      where: { id: commandeId },
      data: { status: "SHIPPED" },
      include: {
        client: true,
        boutique: true,
        produits: { include: { produit: true } },
      },
    });

    await notifyOrderStatusChange(commandeExpediee, "SHIPPED");

    res.json({
      message: "Commande expédiée",
      commande: commandeExpediee,
    });
  } catch (error) {
    console.error("expedierCommande error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const livrerCommande = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const commande = await db.commande.findUnique({
      where: { id: commandeId },
      include: {
        client: true,
        boutique: { include: { vendeur: true } },
        produits: { include: { produit: true } },
      },
    });

    if (!commande)
      return res.status(404).json({ message: "Commande introuvable" });

    if (commande.status !== "SHIPPED") {
      return res.status(400).json({
        message: `Impossible de livrer une commande ${commande.status}`,
      });
    }

    const commandeLivree = await db.commande.update({
      where: { id: commandeId },
      data: { status: "DELIVERED" },
      include: {
        client: true,
        boutique: true,
        produits: { include: { produit: true } },
      },
    });

    await notifyOrderStatusChange(commandeLivree, "DELIVERED");

    res.json({
      message: "Commande livrée avec succès",
      commande: commandeLivree,
    });
  } catch (error) {
    console.error("livrerCommande error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const annulerCommande = async (req, res) => {
  try {
    const { commandeId } = req.params;
    const { raison } = req.body;

    const commande = await db.commande.findUnique({
      where: { id: commandeId },
      include: {
        client: true,
        boutique: { include: { vendeur: true } },
        produits: { include: { produit: true } },
      },
    });

    if (!commande)
      return res.status(404).json({ message: "Commande introuvable" });

    if (!["PENDING", "PROCESSING"].includes(commande.status)) {
      return res.status(400).json({
        message: `Impossible d'annuler une commande ${commande.status}`,
      });
    }

    // ✅ If stock was already deducted (status was PROCESSING), restore it
    if (commande.status === "PROCESSING") {
      for (const p of commande.produits) {
        await db.produit.update({
          where: { id: p.produitId },
          data: { quantite: { increment: p.quantite } },
        });
      }
    }

    const commandeAnnulee = await db.commande.update({
      where: { id: commandeId },
      data: { status: "CANCELLED" },
      include: {
        client: true,
        boutique: true,
        produits: { include: { produit: true } },
      },
    });

    await notifyOrderStatusChange(commandeAnnulee, "CANCELLED");

    if (commande.boutique?.vendeur?.userId) {
      await createNotification({
        userId: commande.client.id,
        type: "ORDER_CANCELLED",
        data: {
          orderNumber: commande.id.slice(-8).toUpperCase(),
          raison: raison || "Non spécifié",
        },
        commandeId: commande.id,
        actionUrl: `/orders/${commande.id}`,
      });
    }

    res.json({
      message: "Commande annulée",
      commande: commandeAnnulee,
    });
  } catch (error) {
    console.error("annulerCommande error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Generic status update (with validation)
export const updateCommandeStatus = async (req, res) => {
  try {
    const { commandeId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "READY",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Statut invalide",
        validStatuses,
      });
    }

    const commande = await db.commande.update({
      where: { id: commandeId },
      data: { status },
      include: {
        client: true,
        boutique: { include: { vendeur: true } },
        produits: { include: { produit: true } },
      },
    });

    await notifyOrderStatusChange(commande, status);

    res.json({
      message: `Statut mis à jour: ${status}`,
      commande,
    });
  } catch (error) {
    console.error("updateCommandeStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};
