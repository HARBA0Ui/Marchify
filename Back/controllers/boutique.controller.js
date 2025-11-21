import db from "../db/prisma.js";
// 🔔 ADD THIS IMPORT
import { notifyNewReview } from "../services/notification.service.js";

// Créer une boutique
export const createBoutique = async (req, res) => {
  try {
    const { nom, adresse, localisation, categorie, telephone, vendeurId } =
      req.body;

    const boutique = await db.boutique.create({
      data: {
        nom,
        adresse,
        localisation,
        categorie,
        telephone,
        vendeurId,
      },
    });

    res.status(201).json(boutique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer toutes les boutiques
export const getBoutiques = async (req, res) => {
  try {
    const boutiques = await db.boutique.findMany({
      include: { produits: true },
    });
    res.json(boutiques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une boutique par ID
export const getBoutiqueById = async (req, res) => {
  try {
    const { id } = req.params;
    const boutique = await db.boutique.findUnique({
      where: { id },
      include: { produits: true },
    });
    if (!boutique)
      return res.status(404).json({ message: "Boutique non trouvée" });
    res.json(boutique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une boutique
export const updateBoutique = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const boutique = await db.boutique.update({
      where: { id },
      data,
    });
    res.json(boutique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔔 ADD THIS: Create a review for a boutique
export const createBoutiqueReview = async (req, res) => {
  try {
    const { id } = req.params; // boutiqueId
    const { rating, comment } = req.body;
    const auteurId = req.user.id; // Assuming user is attached by auth middleware

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "La note doit être entre 1 et 5",
      });
    }

    // Check if boutique exists
    const boutique = await db.boutique.findUnique({
      where: { id },
      include: { vendeur: true },
    });

    if (!boutique) {
      return res.status(404).json({ message: "Boutique non trouvée" });
    }

    // Create review
    const review = await db.review.create({
      data: {
        type: "BOUTIQUE",
        rating,
        comment,
        auteurId,
        boutiqueId: id,
      },
      include: {
        auteur: {
          select: { nom: true, prenom: true, email: true },
        },
      },
    });

    // 🔔 Notify vendeur about new review
    await notifyNewReview(review);

    res.status(201).json({
      message: "Avis créé avec succès",
      review,
    });
  } catch (error) {
    console.error("createBoutiqueReview error:", error);
    res.status(500).json({
      message: "Erreur lors de la création de l'avis",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔔 ADD THIS: Get reviews for a boutique
export const getBoutiqueReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await db.review.findMany({
      where: {
        boutiqueId: id,
        type: "BOUTIQUE",
      },
      include: {
        auteur: {
          select: { nom: true, prenom: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    res.json({
      reviews,
      stats: {
        total: reviews.length,
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
    });
  } catch (error) {
    console.error("getBoutiqueReviews error:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des avis",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const getBoutiquesByVendeurId = async (req, res) => {
  try {
    const { vendeurId } = req.params; // ✅ Changed from req.query to req.params

    if (!vendeurId) {
      return res.status(400).json({
        message: "vendeurId est requis",
      });
    }

    // Check if vendeur exists
    const vendeur = await db.vendeur.findUnique({
      where: { id: vendeurId },
    });

    if (!vendeur) {
      return res.status(404).json({
        message: "Vendeur non trouvé",
      });
    }

    // Get all boutiques for this vendeur
    const boutiques = await db.boutique.findMany({
      where: {
        vendeurId: vendeurId,
      },
      include: {
        produits: true,
        vendeur: {
          include: {
            user: {
              select: {
                nom: true,
                prenom: true,
                email: true,
                telephone: true,
              },
            },
          },
        },
      },
      orderBy: {
        nom: "asc",
      },
    });

    res.json(boutiques);
  } catch (error) {
    console.error("getBoutiquesByVendeurId error:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des boutiques",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

