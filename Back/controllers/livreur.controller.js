import db from "../db/prisma.js";
<<<<<<< HEAD

export const getMissionsDisponibles = async (req, res) => {
  try {
    const missions = await db.commande.findMany({
      where: {
        status: "READY",
        //livreurId: null 
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
=======
export const getMissionsDisponibles = async (req, res) => {
  try {
    const missions = await db.bonDeLivraison.findMany({
      where: { status: "PENDING_PICKUP" },
      include: {
        commande: {
          include: {
            client: true,
            boutique: true,
            produits: { include: { produit: true } }
          }
        }
      },
      orderBy: { dateCreation: "asc" }
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
    });

    res.json({ missions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< HEAD

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
=======
export const getMissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const mission = await db.bonDeLivraison.findUnique({
      where: { id },
      include: {
        commande: {
          include: {
            client: true,
            boutique: { include: { vendeur: { include: { user: true } } } },
          },
        },
        livreur: { include: { user: true } },
      },
    });

    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable' });
    }

    res.json({ mission });
  } catch (error) {
    console.error('Erreur lors de la récupération de la mission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};


export const accepterMission = async (req, res) => {
  try {
    const { bonId, livreurId } = req.params;

    const bon = await db.bonDeLivraison.findUnique({
      where: { id: bonId },
      include: { commande: true }
    });

    if (!bon) return res.status(404).json({ message: "Bon de livraison introuvable" });
    if (bon.status !== "PENDING_PICKUP") return res.status(400).json({ message: "Mission non disponible" });
    if (bon.livreurId) return res.status(400).json({ message: "Mission déjà prise" });

    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: {
        livreurId,
        status: "IN_TRANSIT",
        commande: { update: { status: "PROCESSING" } }
      },
      include: { commande: true }
    });

    res.json({ message: "Mission acceptée", bonDeLivraison: updatedBon });
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< HEAD

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
=======
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
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< HEAD

export const refuserMission = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const commande = await db.commande.findUnique({ where: { id: commandeId } });
    if (!commande) return res.status(404).json({ message: "Commande introuvable" });

    if (commande.status !== "READY") 
      return res.status(400).json({ message: "Commande non disponible pour livraison" });

    
    res.json({ message: "Mission refusée, elle reste disponible pour un autre livreur" });
=======
export const refuserMission = async (req, res) => {
  try {
    const { bonId } = req.params;

    const bon = await db.bonDeLivraison.findUnique({
      where: { id: bonId }
    });

    if (!bon) return res.status(404).json({ message: "Bon de livraison introuvable" });
    if (bon.status !== "PENDING_PICKUP" && bon.status !== "IN_TRANSIT") 
      return res.status(400).json({ message: "Mission non disponible pour refus" });

    const updatedBon = await db.bonDeLivraison.update({
      where: { id: bonId },
      data: {
        livreurId: null,     
        status: "PENDING_PICKUP" 
      }
    });

    res.json({ 
      message: "Mission refusée, disponible pour un autre livreur", 
      bonDeLivraison: updatedBon 
    });
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};