import prisma from "../db/prisma.js";

export const addReview = async (req, res) => {
  console.log("running");
  try {
    // ✅ Get userId from request body instead of req.user
    const { type, produitId, boutiqueId, rating, comment, userId } = req.body;
    console.log("userId from body:", userId);

    if (!userId)
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    if (!type || !rating)
      return res.status(400).json({ message: "Type et rating obligatoires" });
    if (!["PRODUIT", "BOUTIQUE"].includes(type))
      return res.status(400).json({ message: "Type invalide" });

    if (type === "PRODUIT") {
      if (!produitId)
        return res.status(400).json({ message: "produitId obligatoire" });
      const produit = await prisma.produit.findUnique({
        where: { id: produitId },
      });
      if (!produit)
        return res.status(404).json({ message: "Produit introuvable" });
    }

    if (type === "BOUTIQUE") {
      if (!boutiqueId)
        return res.status(400).json({ message: "boutiqueId obligatoire" });
      const boutique = await prisma.boutique.findUnique({
        where: { id: boutiqueId },
      });
      if (!boutique)
        return res.status(404).json({ message: "Boutique introuvable" });
    }

    // ✅ Use userId from body
    const review = await prisma.review.create({
      data: {
        type,
        rating,
        comment,
        auteurId: userId,
        produitId: type === "PRODUIT" ? produitId : null,
        boutiqueId: type === "BOUTIQUE" ? boutiqueId : null,
      },
    });

    res.status(201).json({ message: "Review ajoutée avec succès", review });
  } catch (error) {
    console.error("Erreur addReview :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Récupérer reviews d'un produit
export const getProductReviews = async (req, res) => {
  try {
    const { produitId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { produitId },
      include: { auteur: true },
    });
    res.json(reviews);
  } catch (error) {
    console.error("Erreur getProductReviews :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export const getBoutiqueReviews = async (req, res) => {
  try {
    const { boutiqueId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { boutiqueId },
      include: { auteur: true },
    });
    res.json(reviews);
  } catch (error) {
    console.error("Erreur getBoutiqueReviews :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ message: "Review introuvable" });

    // ✅ For delete, you'll need to pass userId in body or keep middleware
    const { userId } = req.body;
    if (review.auteurId !== userId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: "Review supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteReview :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
