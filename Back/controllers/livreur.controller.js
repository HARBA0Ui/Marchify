import db from "../db/prisma.js";
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
    });

    res.json({ missions });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


