import db from "../db/prisma.js";

// Ajouter un produit
export const createProduit = async (req, res) => {
  try {
    const { nom, prix, categorie, description, image, quantite, unite, boutiqueId } = req.body;

    const produit = await db.produit.create({
      data: {
        nom,
        prix,
        categorie,
        description,
        image,
        quantite,
        unite,
        boutiqueId,
      },
    });

    res.status(201).json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les produits
export const getProduits = async (req, res) => {
  try {
    const produits = await db.produit.findMany();
    res.json(produits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un produit par ID
export const getProduitById = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await db.produit.findUnique({ where: { id } });
    if (!produit) return res.status(404).json({ message: "Produit non trouvé" });
    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un produit
export const updateProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const produit = await db.produit.update({
      where: { id },
      data,
    });

    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
