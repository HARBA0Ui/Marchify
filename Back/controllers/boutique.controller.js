import db from "../db/prisma.js";

// Créer une boutique
export const createBoutique = async (req, res) => {
  try {
    const { nom, adresse, localisation, categorie, telephone, vendeurId } = req.body;

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
    if (!boutique) return res.status(404).json({ message: "Boutique non trouvée" });
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
