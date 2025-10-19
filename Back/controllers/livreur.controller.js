import db from "../db/prisma.js";

export const getMissionsDisponibles = async (req, res) => {
  try {
    const missions = await db.commande.findMany({
      where: {
        status: "READY",
        livreurId: null 
      },
      select: {
        id: true,
        status: true,
        adresseLivraison: true,
        totalCommande: true,
        dateCommande: true,
        clientId: true,
        boutiqueId: true,
        produits: {
          select: {
            produitId: true,
            quantite: true,
            prixTotal: true
          }
        }
      },
      orderBy: { dateCommande: "asc" }
    });

    res.json({ missions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const accepterMission = async (req, res) => {
  try {
    const { commandeId, livreurId } = req.params;

    const commande = await db.commande.findUnique({ where: { id: commandeId } });
    if (!commande) return res.status(404).json({ message: "Commande introuvable" });

    if (commande.status !== "READY") 
      return res.status(400).json({ message: "Commande non disponible pour livraison" });

    if (commande.livreurId) 
      return res.status(400).json({ message: "Mission déjà prise par un autre livreur" });

    const updated = await db.commande.update({
      where: { id: commandeId },
      data: { livreurId, status: "PROCESSING" }
    });

    res.json({ message: "Mission acceptée", mission: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const livrerCommande = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const commande = await db.commande.findUnique({ where: { id: commandeId } });
    if (!commande) return res.status(404).json({ message: "Commande introuvable" });

    if (commande.status !== "PROCESSING") 
      return res.status(400).json({ message: "Commande non en cours de livraison" });

    const updated = await db.commande.update({
      where: { id: commandeId },
      data: { status: "DELIVERED" }
    });

    res.json({ message: "Commande livrée", commande: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const refuserMission = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const commande = await db.commande.findUnique({ where: { id: commandeId } });
    if (!commande) return res.status(404).json({ message: "Commande introuvable" });

    if (commande.status !== "READY") 
      return res.status(400).json({ message: "Commande non disponible pour livraison" });

    
    res.json({ message: "Mission refusée, elle reste disponible pour un autre livreur" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};