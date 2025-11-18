import db from "../db/prisma.js";

export const getCommadesByAcheteur= async (req, res) => {
  try{
    const { clientId } = req.params;

    const commandes = await db.commande.findMany({
      where: { clientId },
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
}
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
export const updateCommandeStatus = async (req, res) => {
  try {
    const { commandeId } = req.params;
    const { status } = req.body; // New status sent in request body

    // Example using Mongoose/Sequelize
    const commande = await Commande.findByIdAndUpdate(
      commandeId,
      { status },
      { new: true }
    );

    if (!commande)
      return res.status(404).json({ message: "Commande not found" });

    res.json(commande);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du statut" });
  }
};
export const getStatsCommandesByBoutique = async (req, res) => {
  try {
    const { vendeurId } = req.params;

    const boutiques = await db.boutique.findMany({
      where: { vendeurId },
    });

    const boutiqueIds = boutiques.map(b => b.id);

    const commandes = await db.commande.findMany({
      where: { boutiqueId: { in: boutiqueIds } }
    });

    // Group commands by boutique
    const stats = boutiques.map(b => ({
      boutique: b.nom,
      count: commandes.filter(c => c.boutiqueId === b.id).length
    }));

    res.json({ stats });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// e.g., GET /api/stats/vendeur/:vendeurId?year=2025&month=11
// GET /api/stats/vendeur/:vendeurId/months
export const getStatsByMonth = async (req, res) => {
  try {
    const { vendeurId } = req.params;

    // Get all boutiques of this vendor
    const boutiques = await db.boutique.findMany({
      where: { vendeurId },
      select: { id: true }
    });

    if (boutiques.length === 0) {
      return res.json({ stats: [] });
    }

    const boutiqueIds = boutiques.map(b => b.id);

    // Group commands by month (YYYY-MM format)
 const commands = await db.commande.findMany({
      where: {
        boutiqueId: { in: boutiqueIds } // ✅ Prisma handles string → ObjectId internally
      },
      select: {
        dateCommande: true
      }
    });
    // Format as { month: "2025-11", count: 42 }
    const monthlyCount = {};

    commands.forEach(cmd => {
      const d = new Date(cmd.dateCommande);
      // Handle invalid dates
      if (isNaN(d.getTime())) {
        console.warn('⚠️ Invalid dateCommande:', cmd.dateCommande);
        return;
      }
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
    });


     // 🔹 4. Format & sort
    const stats = Object.entries(monthlyCount)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({ stats });

  } catch (error) {
    // 🔹 5. Log REAL error
    console.error('❌ [getStatsByMonth] Server error:', error);
    
    // Send safe error to client
    res.status(500).json({
      message: 'Erreur lors du calcul des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};
}
// GET /api/stats/vendeur/:vendeurId/months?year=2025&month=11
export const getStatsByMonthAndYear = async (req, res) => {
  try {
    const { vendeurId } = req.params;
    const { year, month } = req.query;

    const yr = parseInt(year );
    const mo = parseInt(month ); // 1–12

    const startDate = new Date(Date.UTC(yr, mo - 1, 1));
    const endDate = new Date(Date.UTC(yr, mo, 0, 23, 59, 59, 999));

    const boutiques = await db.boutique.findMany({
      where: { vendeurId },
      select: { id: true }
    });

    if (boutiques.length === 0) {
      return res.json({ stats: [] });
    }

    const boutiqueIds = boutiques.map(b => b.id);

    const count = await db.commande.count({
      where: {
        boutiqueId: { in: boutiqueIds },
        dateCommande: { gte: startDate, lte: endDate }
      }
    });

    res.json({
      stats: [{
        month: `${yr}-${String(mo).padStart(2, '0')}`,
        count
      }]
    });

  } catch (error) {
    console.error('❌ Error fetching stats for month:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

export const getStatsByStatusForMonth = async (req, res) => {
  try {
    const { vendeurId } = req.params;
    const { year, month } = req.query;

    const yr = parseInt(year );
    const mo = parseInt(month ); // 1–12

    const startDate = new Date(Date.UTC(yr, mo - 1, 1));
    const endDate = new Date(Date.UTC(yr, mo, 0, 23, 59, 59, 999));

    const boutiques = await db.boutique.findMany({
      where: { vendeurId },
      select: { id: true }
    });

    if (boutiques.length === 0) {
      return res.json({ stats: [] });
    }

    const boutiqueIds = boutiques.map(b => b.id);

    // Group by status
    const results = await db.commande.groupBy({
      by: ['status'],
      where: {
        boutiqueId: { in: boutiqueIds },
        dateCommande: { gte: startDate, lte: endDate }
      },
      _count: { _all: true }
    });

    // Format: { status: 'DELIVERED', count: 12 }
    const stats = results.map(r => ({
      status: r.status,
      count: r._count._all
    }));

    res.json({ stats });

  } catch (error) {
    console.error('❌ Error fetching status stats:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};