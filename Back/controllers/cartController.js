import db from "../db/prisma.js";
import {
  createNotification,
} from "../services/notification.service.js";
  export const addToCart = async (req, res) => {
    try {
      const { clientId, produitId, quantite = 1 } = req.body;

      const produit = await db.produit.findUnique({ where: { id: produitId } });
      if (!produit) return res.status(404).json({ message: "Produit introuvable" });
      if (produit.quantite < quantite) {
        return res.status(400).json({ message: "Produit temporairement indisponible" });
      }

      let panier = await db.panier.findUnique({
        where: { clientId },
        include: { produits: true },
      });

      if (!panier) {
        panier = await db.panier.create({
          data: { clientId },
        });
      }

      const existing = await db.panierProduit.findUnique({
        where: {
          panierId_produitId: {
            panierId: panier.id,
            produitId,
          },
        },
      });

      if (existing) {
        await db.panierProduit.update({
          where: { panierId_produitId: { panierId: panier.id, produitId } },
          data: {
            quantite: existing.quantite + quantite,
            prixTotal: (existing.quantite + quantite) * produit.prix,
          },
        });
      } else {
        await db.panierProduit.create({
          data: {
            panierId: panier.id,
            produitId,
            quantite,
            prixTotal: quantite * produit.prix,
          },
        });
      }

      const produits = await db.panierProduit.findMany({
        where: { panierId: panier.id },
      });
      const total = produits.reduce((acc, p) => acc + p.prixTotal, 0);

      await db.panier.update({
        where: { id: panier.id },
        data: { total },
      });

      res.json({ message: "Produit ajouté au panier", produits });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const getCart = async (req, res) => {
    try {
      const { clientId } = req.params;

      const panier = await db.panier.findUnique({
        where: { clientId },
        include: {
          produits: {
            include: {
              produit: true,
            },
          },
        },
      });

      if (!panier) return res.status(404).json({ message: "Panier vide" });
      res.json(panier);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const fetchCart = async (clientId) => {
    const panier = await db.panier.findUnique({
      where: { clientId },
      include: {
        produits: {
          include: { produit: true },
        },
      },
    });
    if (!panier) throw new Error("Panier vide");
    return panier;
  };

  export const updateCartQuantities = async (req, res) => {
    try {
      const { clientId, updates } = req.body;

      const panier = await fetchCart(clientId);

      for (const item of updates) {
        const panierProduit = await db.panierProduit.findUnique({
          where: {
            panierId_produitId: { panierId: panier.id, produitId: item.produitId },
          },
          include: { produit: true },
        });

        if (!panierProduit) continue;

        if (item.quantite <= 0) {
          await db.panierProduit.delete({
            where: { panierId_produitId: { panierId: panier.id, produitId: item.produitId } },
          });
        } else {
          if (panierProduit.produit.quantite < item.quantite) {
            return res.status(400).json({
              message: `Produit "${panierProduit.produit.nom}" indisponible en quantité demandée`,
            });
          }
          await db.panierProduit.update({
            where: { panierId_produitId: { panierId: panier.id, produitId: item.produitId } },
            data: {
              quantite: item.quantite,
              prixTotal: item.quantite * panierProduit.produit.prix,
            },
          });
        }
      }

      const produits = await db.panierProduit.findMany({ where: { panierId: panier.id } });
      const total = produits.reduce((acc, p) => acc + p.prixTotal, 0);
      await db.panier.update({ where: { id: panier.id }, data: { total } });

      res.json({ message: "Panier mis à jour", produits, total });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const recalcCartTotal = async (req, res) => {
    try {
      const { clientId } = req.params;
      const panier = await fetchCart(clientId);

      const total = panier.produits.reduce((acc, p) => acc + p.prixTotal, 0);
      await db.panier.update({ where: { id: panier.id }, data: { total } });

      res.json({ total });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
  
export const confirmOrder = async (req, res) => {
  try {
    const { clientId, adresseLivraison } = req.body;
    const panier = await fetchCart(clientId);

    if (panier.produits.length === 0)
      return res.status(400).json({ message: "Le panier est vide" });

    const outOfStock = panier.produits.filter(
      (p) => p.produit.quantite < p.quantite
    );
    if (outOfStock.length > 0) {
      return res.status(400).json({
        message: "Certains produits sont indisponibles",
        produits: outOfStock.map((p) => ({
          nom: p.produit.nom,
          disponible: p.produit.quantite,
        })),
      });
    }

    const produitsParBoutique = {};
    panier.produits.forEach((p) => {
      const boutiqueId = p.produit.boutiqueId;
      if (!produitsParBoutique[boutiqueId]) {
        produitsParBoutique[boutiqueId] = [];
      }
      produitsParBoutique[boutiqueId].push(p);
    });

    const commandes = [];

    for (const [boutiqueId, produits] of Object.entries(produitsParBoutique)) {
      const totalCommande = produits.reduce((acc, p) => acc + p.prixTotal, 0);

      const commande = await db.commande.create({
        data: {
          clientId,
          adresseLivraison,
          totalCommande,
          boutiqueId,
          produits: {
            create: produits.map((p) => ({
              quantite: p.quantite,
              prixTotal: p.prixTotal,
              produit: { connect: { id: p.produitId } },
              boutique: { connect: { id: boutiqueId } },
            })),
          },
        },
        include: {
          produits: { include: { produit: true } },
          client: true,
          boutique: { include: { vendeur: true } },
        },
      });

      commandes.push(commande);
      const orderNumber = commande.id.slice(-8).toUpperCase();

      // ✅ Notify CLIENT
      try {
        await createNotification({
          userId: clientId,
          type: "ORDER_PLACED",
          data: { orderNumber },
          commandeId: commande.id,
          actionUrl: `/orders/${commande.id}`,
          metadata: {
            orderTotal: commande.totalCommande,
            itemsCount: commande.produits.length,
          },
        });
        console.log(`📬 Client notified: Order ${orderNumber}`);
      } catch (err) {
        console.error("Client notification error:", err);
      }

      // ✅ Notify VENDEUR
      if (commande.boutique?.vendeur?.userId) {
        try {
          await createNotification({
            userId: commande.boutique.vendeur.userId,
            type: "NEW_ORDER_RECEIVED",
            data: { orderNumber },
            commandeId: commande.id,
            actionUrl: `/seller/commande-list-vendor`,
            metadata: {
              orderTotal: commande.totalCommande,
              itemsCount: commande.produits.length,
              clientName: `${commande.client.nom} ${
                commande.client.prenom || ""
              }`.trim(),
              clientPhone: commande.client.telephone,
            },
          });
          console.log(`📬 Vendeur notified: Order ${orderNumber}`);
        } catch (err) {
          console.error("Vendeur notification error:", err);
        }
      }
    }

    await db.panierProduit.deleteMany({ where: { panierId: panier.id } });
    await db.panier.update({ where: { id: panier.id }, data: { total: 0 } });

    res.json({
      message: `${commandes.length} commande(s) confirmée(s)`,
      commandes,
      count: commandes.length,
    });
  } catch (error) {
    console.error("confirmOrder error:", error);
    res.status(500).json({ message: error.message });
  }
};



  export const removeFromCart = async (req, res) => {
  try {
    const { clientId, produitId } = req.body;

    if (!clientId || !produitId) {
      return res.status(400).json({ message: "clientId et produitId sont obligatoires" });
    }

    // Récupérer le panier du client
    const panier = await db.panier.findUnique({
      where: { clientId },
    });

    if (!panier) {
      return res.status(404).json({ message: "Panier introuvable" });
    }

    // Supprimer la ligne panierProduit correspondante
    await db.panierProduit.delete({
      where: {
        panierId_produitId: {
          panierId: panier.id,
          produitId,
        },
      },
    });

    // Recalculer le total
    const produitsRestants = await db.panierProduit.findMany({
      where: { panierId: panier.id },
    });

    const total = produitsRestants.reduce((acc, p) => acc + p.prixTotal, 0);

    await db.panier.update({
      where: { id: panier.id },
      data: { total },
    });

    return res.json({
      message: "Produit supprimé du panier",
      produits: produitsRestants,
      total,
    });
  } catch (error) {
    console.error("removeFromCart error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ message: "clientId est obligatoire" });
    }

    const panier = await db.panier.findUnique({
      where: { clientId },
    });

    if (!panier) {
      // Panier déjà vide
      return res.json({ message: "Panier déjà vide", produits: [], total: 0 });
    }

    // Supprimer toutes les lignes du panier
    await db.panierProduit.deleteMany({
      where: { panierId: panier.id },
    });

    // Remettre le total à 0
    await db.panier.update({
      where: { id: panier.id },
      data: { total: 0 },
    });

    return res.json({ message: "Panier vidé", produits: [], total: 0 });
  } catch (error) {
    console.error("clearCart error:", error);
    return res.status(500).json({ message: error.message });
  }
};
