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

// 🔹 NEW: Récupérer tous les produits d'une boutique spécifique
export const getProduitsByShopId = async (req, res) => {
  try {
    const { shopId } = req.params;

    // Validate shopId
    if (!shopId) {
      return res.status(400).json({ message: "Shop ID is required" });
    }

    // Find all products belonging to this boutique
    const produits = await db.produit.findMany({
      where: {
        boutiqueId: shopId,
      },
      orderBy: {
        nom: "asc", // Sort by name alphabetically
      },
    });

    res.json(produits);
  } catch (error) {
    console.error("Error fetching products by shop ID:", error);
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

// Récupérer plusieurs produits par leurs IDs (batch)
export const getProduitsByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "IDs array is required" });
    }

    const produits = await db.produit.findMany({
      where: {
        id: { in: ids },
      },
    });

    res.json(produits);
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 DELETE: Supprimer un produit
export const deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const produit = await db.produit.findUnique({ where: { id } });
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Delete the product
    await db.produit.delete({
      where: { id },
    });

    res.json({ message: "Produit supprimé avec succès", id });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message });
  }
};
// Get pinned products with the best average rating
export const getPinnedTopRatedProduits = async (req, res) => {
  try {
    // 1. Get all pinned products
    const pinnedProducts = await db.produit.findMany({
      where: { Ispinned: true },
      include: {
        reviews: true, // assuming you have Produit.reviews[]
      },
    });

    if (!pinnedProducts.length) {
      return res.json([]);
    }

    // 2. Calculate average rating for each pinned product
    const productsWithAvgRating = pinnedProducts.map((p) => {
      const total = p.reviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = p.reviews.length ? total / p.reviews.length : 0;
      return { ...p, averageRating: avg };
    });

    // 3. Find the highest average rating (can be several products with the same)
    let bestAvg = 0;
    productsWithAvgRating.forEach((p) => {
      if (p.averageRating > bestAvg) bestAvg = p.averageRating;
    });

    // 4. Filter all pinned products that have this best average rating
    const topPinned = productsWithAvgRating.filter(
      (p) => p.averageRating === bestAvg && bestAvg > 0
    );

    // OR: Return all pinned, sorted by average rating descending
    // const topPinned = productsWithAvgRating
    //   .filter(p => p.averageRating > 0)
    //   .sort((a, b) => b.averageRating - a.averageRating);

    res.json(topPinned);
  } catch (error) {
    console.error("Error fetching best pinned products:", error);
    res.status(500).json({ message: error.message });
  }
};

