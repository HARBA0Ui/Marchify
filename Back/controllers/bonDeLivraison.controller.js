import db from "../db/prisma.js";
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
                produit: { select: { nom: true, prix: true } }
              }
            }
          }
        },
        livreur: {
          include: { user: { select: { nom: true, prenom: true } } }
        }
      },
      orderBy: { dateCreation: "desc" }
    });

    if (bons.length === 0) {
      return res.status(404).json({
        message: "Aucun bon de livraison trouvé pour ce livreur",
        livreurId
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


export const livrerCommande = async (req, res) => {
  try {
    const { bonId } = req.params;

    const bon = await db.bonDeLivraison.findUnique({
      where: { id: bonId },
      include: { commande: true }
    });

    if (!bon) return res.status(404).json({ message: "Bon de livraison introuvable" });
    if (bon.status !== "IN_TRANSIT") return res.status(400).json({ message: "Livraison non en cours" });

    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: {
        status: "DELIVERED",
        commande: { update: { status: "DELIVERED" } }
      },
      include: { commande: true }
    });

    res.json({ message: "Commande livrée", bonDeLivraison: updatedBon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
