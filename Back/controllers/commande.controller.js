import db from "../db/prisma.js";

export const getCommandesVendeur = async (req, res) => {
  try {
    const { vendeurId } = req.params;

    const boutiques = await db.boutique.findMany({ where: { vendeurId } });
    const boutiqueIds = boutiques.map(b => b.id);

    const commandes = await db.commande.findMany({
      where: { boutiqueId: { in: boutiqueIds } },
      include: {
        produits: { include: { produit: true } },
        client: true
      },
      orderBy: { dateCommande: "desc" }
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
        boutique: true
      }
    });

    if (!commande) return res.status(404).json({ message: "Commande introuvable" });

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
      include: { produits: { include: { produit: true } } }
    });

    if (!commande) return res.status(404).json({ message: "Commande introuvable" });

    const indisponibles = commande.produits.filter(p => p.produit.quantite < p.quantite);
    if (indisponibles.length > 0) {
      return res.status(400).json({
        message: "Certains produits sont indisponibles",
        produits: indisponibles.map(p => ({ nom: p.produit.nom, disponible: p.produit.quantite }))
      });
    }

    for (const p of commande.produits) {
      await db.produit.update({
        where: { id: p.produitId },
        data: { quantite: p.produit.quantite - p.quantite }
      });
    }

    const commandePrep = await db.commande.update({
      where: { id: commandeId },
      data: { status: "READY" }
    });

    res.json({ message: "Commande prête pour livraison", commande: commandePrep });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getCommandesBoutique = async (req, res) => {
  try {
    const { boutiqueId } = req.params;

    const boutique = await db.boutique.findUnique({ where: { id: boutiqueId } });
    if (!boutique) return res.status(404).json({ message: "Boutique introuvable" });

    const commandes = await db.commande.findMany({
      where: { boutiqueId },
      include: {
        produits: { include: { produit: true } },
        client: true
      },
      orderBy: { dateCommande: "desc" }
    });

    res.json({ commandes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
