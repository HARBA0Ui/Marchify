import db from "../db/prisma.js";
import cloudinary from "../db/cloudinary.js";

// Ajouter un produit
export const createProduit = async (req, res) => {
  try {
    const {
      nom,
      prix,
      categorie,
      description,
      quantite,
      unite,
      livrable,
      boutiqueId,
    } = req.body;
    const files = req.files || [];
    const imageUrls = [];

    for (const file of files) {
      const url = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
      imageUrls.push(url);
    }

    const produit = await db.produit.create({
      data: {
        nom,
        prix: parseFloat(prix),
        categorie,
        description,
        image: imageUrls[0] || "", // first uploaded image
        quantite: parseInt(quantite),
        unite,
        livrable: livrable === "true",
        boutiqueId,
      },
    });

    res.status(201).json(produit);
  } catch (error) {
    console.error(error);
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
    if (!produit)
      return res.status(404).json({ message: "Produit non trouvé" });
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

export const getProduitsByIds =async (req, res) =>{
  try {
    const { ids } = req.body;
    const produits = await db.produit.findMany({ where: { id: { in: ids } } });
    res.json(produits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}