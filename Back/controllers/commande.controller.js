import db from "../db/prisma.js";
// 🔔 ADD THESE IMPORTS
import {
  notifyOrderStatusChange,
  notifyLowStock,
  createNotification,
} from "../services/notification.service.js";

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

    // Update product quantities and check for low stock
    for (const p of commande.produits) {
      const updatedProduit = await db.produit.update({
        where: { id: p.produitId },
        data: { quantite: p.produit.quantite - p.quantite },
      });

      // 🔔 Check if product is low stock or out of stock after update
      const STOCK_THRESHOLD = 10; // Define your threshold
      if (updatedProduit.quantite <= STOCK_THRESHOLD) {
        await notifyLowStock(updatedProduit);
      }
    }

    const commandePrep = await db.commande.update({
      where: { id: commandeId },
      data: { status: "READY" },
      include: { client: true, boutique: true },
    });

    // 🔔 Notify client that order is ready
    await notifyOrderStatusChange(commandePrep, "READY");

    res.json({
      message: "Commande prête pour livraison",
      commande: commandePrep,
    });
  } catch (error) {
    console.error("preparerCommande error:", error);
    res.status(500).json({
      message: "Erreur lors de la préparation de la commande",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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
      },
      orderBy: { dateCommande: "desc" },
    });

    res.json({ commandes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCommandeStatus = async (req, res) => {
  try {
    const { commandeId } = req.params;
    const { status } = req.body;

    // Validate status
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

    // Get current commande
    const currentCommande = await db.commande.findUnique({
      where: { id: commandeId },
      include: {
        client: true,
        boutique: { include: { vendeur: true } },
      },
    });

    if (!currentCommande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    // Update commande status
    const commande = await db.commande.update({
      where: { id: commandeId },
      data: { status },
      include: {
        client: true,
        boutique: { include: { vendeur: true } },
        produits: { include: { produit: true } },
      },
    });

    // 🔔 Notify about status change
    await notifyOrderStatusChange(commande, status);

    // 🔔 Additional notifications based on status
    const orderNumber = commande.id.slice(-8).toUpperCase();

    // If order is confirmed by vendeur, notify client
    if (status === "PROCESSING" && commande.boutique?.vendeur?.userId) {
      await createNotification({
        userId: commande.boutique.vendeur.userId,
        type: "ORDER_PROCESSING",
        data: { orderNumber },
        commandeId: commande.id,
        actionUrl: `/vendor/orders/${commande.id}`,
        metadata: {
          orderTotal: commande.totalCommande,
          itemsCount: commande.produits.length,
        },
      });
    }

    // If order is cancelled, notify vendeur
    if (status === "CANCELLED" && commande.boutique?.vendeur?.userId) {
      await createNotification({
        userId: commande.boutique.vendeur.userId,
        type: "ORDER_CANCELLED",
        data: { orderNumber },
        commandeId: commande.id,
        actionUrl: `/vendor/orders/${commande.id}`,
        metadata: {
          cancelledBy: "system",
          orderTotal: commande.totalCommande,
        },
      });
    }

    res.json({
      message: `Statut de la commande mis à jour: ${status}`,
      commande,
    });
  } catch (error) {
    console.error("updateCommandeStatus error:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔔 ADD THIS: Create a new order (if you don't have this function)
export const createCommande = async (req, res) => {
  try {
    const {
      adresseLivraison,
      totalCommande,
      boutiqueId,
      produits, // Array of { produitId, quantite, prixTotal }
    } = req.body;
    const clientId = req.user.id; // Assuming auth middleware

    // Validate products availability
    for (const item of produits) {
      const produit = await db.produit.findUnique({
        where: { id: item.produitId },
      });

      if (!produit) {
        return res.status(404).json({
          message: `Produit ${item.produitId} introuvable`,
        });
      }

      if (produit.quantite < item.quantite) {
        return res.status(400).json({
          message: `Stock insuffisant pour ${produit.nom}. Disponible: ${produit.quantite}`,
        });
      }
    }

    // Create commande
    const commande = await db.commande.create({
      data: {
        clientId,
        boutiqueId,
        adresseLivraison,
        totalCommande,
        status: "PENDING",
        produits: {
          create: produits.map((p) => ({
            produitId: p.produitId,
            quantite: p.quantite,
            prixTotal: p.prixTotal,
            boutiqueId,
          })),
        },
      },
      include: {
        client: true,
        boutique: { include: { vendeur: true } },
        produits: { include: { produit: true } },
      },
    });

    // 🔔 Notify client about order placement
    await notifyOrderStatusChange(commande, "PENDING");

    // 🔔 Notify vendeur about new order
    if (commande.boutique?.vendeur?.userId) {
      const orderNumber = commande.id.slice(-8).toUpperCase();
      await createNotification({
        userId: commande.boutique.vendeur.userId,
        type: "ORDER_PLACED",
        data: { orderNumber },
        commandeId: commande.id,
        actionUrl: `/vendor/orders/${commande.id}`,
        metadata: {
          orderTotal: commande.totalCommande,
          itemsCount: commande.produits.length,
          clientName: `${commande.client.prenom} ${commande.client.nom}`,
        },
      });
    }

    res.status(201).json({
      message: "Commande créée avec succès",
      commande,
    });
  } catch (error) {
    console.error("createCommande error:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la commande",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
