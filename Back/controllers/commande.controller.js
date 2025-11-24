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
// ✅ PERFECT: Calls createBonDeLivraison correctly
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

    // ✅ Check stock
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

    // ✅ DÉDUCT STOCK
    for (const p of commande.produits) {
      const updatedProduit = await db.produit.update({
        where: { id: p.produitId },
        data: { quantite: { decrement: p.quantite } },
      });

      const STOCK_THRESHOLD = 10;
      if (updatedProduit.quantite <= STOCK_THRESHOLD) {
        try {
          await notifyLowStock(updatedProduit);
        } catch (notifError) {
          console.error("Low stock notification failed:", notifError);
        }
      }
    }

    // ✅ UPDATE STATUS TO READY
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

    const bonDeLivraison = await createBonDeLivraison(commandeId);

    console.log("✅ Commande préparée + Bon créé:", commandePrep.id);

    res.json({
      message: "Commande prête pour livraison + Bon de livraison créé",
      commande: commandePrep,
      bonDeLivraison: bonDeLivraison || null,
    });
  } catch (error) {
    console.error("preparerCommande error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const createBonDeLivraison = async (commandeId, livreurId = null) => {
  try {
    const commande = await db.commande.findUnique({
      where: { id: commandeId },
      include: { boutique: true, client: true },
    });

    if (!commande || commande.status !== "READY") {
      console.error("❌ Commande invalid:", commande?.status);
      return null;
    }

    // ✅ DELETE existing bon first
    await db.bonDeLivraison.deleteMany({
      where: { commandeId }
    });

    // ✅ NO livreurId field = automatically null!
    const bon = await db.bonDeLivraison.create({
      data: {
        commande: { connect: { id: commandeId } },
        status: "PENDING_PICKUP",
        // ✅ NO livreurId = Prisma sets null automatically
      },
      include: {
        commande: { include: { client: true, boutique: true } },
      },
    });

    console.log("✅ Bon créé (livreurId=NULL):", bon.id);

    // Notify it's ready for pickup
    try {
      await notifyDeliveryAssigned(bon, commande);
    } catch (notifError) {
      console.error("Notification failed:", notifError);
    }

    return bon;
  } catch (error) {
    console.error("❌ createBonDeLivraison:", error);
    return null;
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
// Get stats by month for a vendeur
export const getStatsByMonth = async (req, res) => {
  try {
    const { vendeurId } = req.params;

    // Get all boutiques for this vendeur
    const boutiques = await db.boutique.findMany({
      where: { vendeurId },
      select: { id: true }
    });

    const boutiqueIds = boutiques.map(b => b.id);

    if (boutiqueIds.length === 0) {
      return res.json({ stats: [] });
    }

    // Get all commandes for these boutiques
    const commandes = await db.commande.findMany({
      where: {
        boutiqueId: { in: boutiqueIds }
      },
      select: {
        dateCommande: true
      }
    });

    // Group by month
    const monthCounts = {};
    commandes.forEach(cmd => {
      const date = new Date(cmd.dateCommande);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    // Convert to array format
    const stats = Object.entries(monthCounts).map(([month, count]) => ({
      month,
      count
    }));

    res.json({ stats });
  } catch (error) {
    console.error('getStatsByMonth error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get stats by month and year for a vendeur
export const getStatsByMonthAndYear = async (req, res) => {
  try {
    const { vendeurId } = req.params;
    const { year, month } = req.query;

    const boutiques = await db.boutique.findMany({
      where: { vendeurId },
      select: { id: true }
    });

    const boutiqueIds = boutiques.map(b => b.id);

    if (boutiqueIds.length === 0) {
      return res.json({ stats: [] });
    }

    // Create date range for the specific month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const commandes = await db.commande.findMany({
      where: {
        boutiqueId: { in: boutiqueIds },
        dateCommande: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const stats = [{
      month: monthKey,
      count: commandes.length
    }];

    res.json({ stats });
  } catch (error) {
    console.error('getStatsByMonthAndYear error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get stats by status for a specific month
export const getStatsByStatusForMonth = async (req, res) => {
  try {
    const { vendeurId } = req.params;
    const { year, month } = req.query;

    const boutiques = await db.boutique.findMany({
      where: { vendeurId },
      select: { id: true }
    });

    const boutiqueIds = boutiques.map(b => b.id);

    if (boutiqueIds.length === 0) {
      return res.json({ stats: [] });
    }

    // Create date range
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const commandes = await db.commande.findMany({
      where: {
        boutiqueId: { in: boutiqueIds },
        dateCommande: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        status: true
      }
    });

    // Group by status
    const statusCounts = {};
    commandes.forEach(cmd => {
      statusCounts[cmd.status] = (statusCounts[cmd.status] || 0) + 1;
    });

    // Convert to array format
    const stats = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));

    res.json({ stats });
  } catch (error) {
    console.error('getStatsByStatusForMonth error:', error);
    res.status(500).json({ message: error.message });
  }
};

