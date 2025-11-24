import db from "../db/prisma.js";
import {
  notifyDeliveryAssigned,
  createNotification,
  notifyOrderStatusChange,
} from "../services/notification.service.js";

// -----------------------------------------------------
// 1️⃣ GET ALL BON DE LIVRAISON
// -----------------------------------------------------
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
      });
    }

    res.json({ bons });
  } catch (error) {
    console.error("getAllBonsDeLivraison error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------
// 2️⃣ GET BONS BY LIVREUR
// -----------------------------------------------------
export const getBonsDeLivraisonByLivreur = async (req, res) => {
  try {
    const { livreurId } = req.params;

    const bons = await db.bonDeLivraison.findMany({
      where: {
        livreurId: String(livreurId),
        livreurId: { not: null }, // ✅ Exclude bons without livreur
      },
      include: {
        commande: {
          include: {
            client: { select: { nom: true, prenom: true, telephone: true } },
            boutique: {
              select: { nom: true, telephone: true, adresse: true },
            },
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

 if (!bons || bons.length === 0) {
   console.log(`ℹ️ No bons found for livreur ${livreurId}`);
   return res.status(200).json({
     message: "Aucun bon de livraison assigné pour ce livreur",
     bons: [], // ✅ Empty array
     livreurId,
   });
 }

    return res.status(200).json({ bons });
  } catch (error) {
    console.error("getBonsDeLivraisonByLivreur error:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des bons",
      error: error.message || error.toString(),
    });
  }
};
// -----------------------------------------------------
// ✅ GET BON BY ID
// -----------------------------------------------------
export const getBonById = async (req, res) => {
  try {
    const { bonId } = req.params;

    const bon = await db.bonDeLivraison.findUnique({
      where: { id: bonId },
      include: {
        commande: {
          include: {
            client: { select: { nom: true, prenom: true, telephone: true, adresse: true } },
            boutique: {
              select: { nom: true, telephone: true, adresse: true },
            },
            produits: {
              include: {
                produit: { select: { nom: true, prix: true, image: true } },
              },
            },
          },
        },
        livreur: {
          include: { 
            user: { select: { nom: true, prenom: true, telephone: true } } 
          },
        },
      },
    });

    if (!bon) {
      return res.status(404).json({ message: "Bon de livraison introuvable" });
    }

    res.json({ bon });
  } catch (error) {
    console.error("getBonById error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------
// ✅ GET BON BY COMMANDE ID
// -----------------------------------------------------
export const getBonByCommandeId = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const bon = await db.bonDeLivraison.findUnique({
      where: { commandeId: commandeId },
      include: {
        commande: {
          include: {
            client: { select: { nom: true, prenom: true, telephone: true, adresse: true } },
            boutique: {
              select: { nom: true, telephone: true, adresse: true },
            },
            produits: {
              include: {
                produit: { select: { nom: true, prix: true, image: true } },
              },
            },
          },
        },
        livreur: {
          include: { 
            user: { select: { nom: true, prenom: true, telephone: true } } 
          },
        },
      },
    });

    if (!bon) {
      return res.status(404).json({ 
        message: "Aucun bon de livraison trouvé pour cette commande" 
      });
    }

    res.json({ bon });
  } catch (error) {
    console.error("getBonByCommandeId error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// -----------------------------------------------------
// ✅ GET UNASSIGNED BONS - WORKING SOLUTION FOR MONGODB
// -----------------------------------------------------
export const getUnassignedBons = async (req, res) => {
  try {
    // Get all PENDING_PICKUP bons
    const allBons = await db.bonDeLivraison.findMany({
      where: {
        status: "PENDING_PICKUP",
      },
      include: {
        commande: {
          include: {
            client: { 
              select: { nom: true, prenom: true, telephone: true, adresse: true } 
            },
            boutique: {
              select: { nom: true, telephone: true, adresse: true },
            },
            produits: {
              include: {
                produit: { select: { nom: true, prix: true } },
              },
            },
          },
        },
        livreur: true, // Include to check if exists
      },
      orderBy: { dateCreation: "asc" },
    });

    // ✅ Filter in JavaScript: only bons without a livreur
    const bons = allBons.filter(bon => !bon.livreurId);

    console.log(`✅ Total PENDING_PICKUP: ${allBons.length}`);
    console.log(`✅ Unassigned (no livreur): ${bons.length}`);

    res.json({ 
      bons,
      count: bons.length 
    });
  } catch (error) {
    console.error("getUnassignedBons error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// -----------------------------------------------------
// 3️⃣ CREATE BON DE LIVRAISON
// -----------------------------------------------------
export const createBonDeLivraison = async (req, res) => {
  try {
    const { commandeId, livreurId } = req.body;

    const commande = await db.commande.findUnique({
      where: { id: commandeId },
      include: { boutique: true, client: true },
    });

    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (commande.status !== "READY") {
      return res.status(400).json({
        message: "La commande doit être READY pour créer un bon de livraison",
      });
    }

    const bon = await db.bonDeLivraison.create({
      data: {
        commandeId,
        livreurId,
        status: "PENDING_PICKUP",
      },
      include: {
        commande: { include: { client: true, boutique: true } },
        livreur: { include: { user: true } },
      },
    });

    await notifyDeliveryAssigned(bon, commande);

    const orderNumber = commande.id.slice(-8).toUpperCase();
    await createNotification({
      userId: commande.clientId,
      type: "DELIVERY_ASSIGNED",
      data: { orderNumber },
      commandeId: commande.id,
      actionUrl: `/orders/${commande.id}/track`,
    });

    res.status(201).json({
      message: "Bon de livraison créé avec succès",
      bonDeLivraison: bon,
    });
  } catch (error) {
    console.error("createBonDeLivraison error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------
// 4️⃣ PICKUP COMMANDE (IN_TRANSIT)
// -----------------------------------------------------
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

    if (!bon) return res.status(404).json({ message: "Bon introuvable" });
    if (bon.status !== "PENDING_PICKUP")
      return res.status(400).json({ message: "Le bon n'est pas en attente" });

    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: {
        status: "IN_TRANSIT",
        commande: { update: { status: "SHIPPED" } },
      },
      include: { commande: true, livreur: { include: { user: true } } },
    });

    const orderNumber = bon.commande.id.slice(-8).toUpperCase();
    await createNotification({
      userId: bon.commande.clientId,
      type: "DELIVERY_PICKED_UP",
      data: { orderNumber },
      commandeId: bon.commande.id,
    });

    await notifyOrderStatusChange(updatedBon.commande, "SHIPPED");

    res.json({ message: "Commande récupérée", bonDeLivraison: updatedBon });
  } catch (error) {
    console.error("pickupCommande error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------
// 5️⃣ LIVRER COMMANDE
// -----------------------------------------------------
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
      },
    });

    if (!bon) return res.status(404).json({ message: "Bon introuvable" });
    if (bon.status !== "IN_TRANSIT")
      return res.status(400).json({ message: "La livraison n'est pas en cours" });

    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: {
        status: "DELIVERED",
        commande: { update: { status: "DELIVERED" } },
      },
      include: { commande: true },
    });

    await notifyOrderStatusChange(updatedBon.commande, "DELIVERED");

    res.json({
      message: "Commande livrée avec succès",
      bonDeLivraison: updatedBon,
    });
  } catch (error) {
    console.error("livrerCommande error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------
// 6️⃣ FAIL DELIVERY
// -----------------------------------------------------
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
      },
    });

    if (!bon) return res.status(404).json({ message: "Bon introuvable" });

    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: { status: "FAILED" },
      include: { commande: true },
    });

    const orderNumber = bon.commande.id.slice(-8).toUpperCase();
    await createNotification({
      userId: bon.commande.clientId,
      type: "DELIVERY_FAILED",
      data: { orderNumber },
      commandeId: bon.commande.id,
      metadata: { reason },
    });

    res.json({
      message: "Échec de livraison enregistré",
      bonDeLivraison: updatedBon,
    });
  } catch (error) {
    console.error("failDelivery error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// -----------------------------------------------------
// ✅ NEW: ASSIGN LIVREUR TO EXISTING BON
// -----------------------------------------------------
export const assignLivreurToBon = async (req, res) => {
  try {
    const { bonId } = req.params;
    const { livreurId } = req.body;

    if (!livreurId) {
      return res.status(400).json({ message: "livreurId est requis" });
    }

    // Verify bon exists
    const bon = await db.bonDeLivraison.findUnique({
      where: { id: bonId },
      include: {
        commande: { include: { client: true, boutique: true } },
      },
    });

    if (!bon) {
      return res.status(404).json({ message: "Bon de livraison introuvable" });
    }

    if (bon.livreurId) {
      return res.status(400).json({
        message: "Un livreur est déjà assigné à ce bon",
      });
    }

    // Verify livreur exists
    const livreur = await db.livreur.findUnique({
      where: { id: livreurId },
      include: { user: true },
    });

    if (!livreur) {
      return res.status(404).json({ message: "Livreur introuvable" });
    }

    // Assign livreur
    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: { livreurId: livreurId },
      include: {
        commande: { include: { client: true, boutique: true } },
        livreur: { include: { user: true } },
      },
    });

    // Notify delivery assigned
    await notifyDeliveryAssigned(updatedBon, updatedBon.commande);

    const orderNumber = updatedBon.commande.id.slice(-8).toUpperCase();
    await createNotification({
      userId: updatedBon.commande.clientId,
      type: "DELIVERY_ASSIGNED",
      data: {
        orderNumber,
        livreurNom: livreur.user.nom,
        livreurPrenom: livreur.user.prenom,
      },
      commandeId: updatedBon.commande.id,
      actionUrl: `/orders/${updatedBon.commande.id}/track`,
    });

    res.json({
      message: "Livreur assigné avec succès",
      bonDeLivraison: updatedBon,
    });
  } catch (error) {
    console.error("assignLivreurToBon error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

