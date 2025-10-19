import db from "../db/prisma.js";


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

        const panRes= {produits, total}

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

    res.json({  total });
    // res.json({ produits: panier.produits, total });
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

    
    const outOfStock = panier.produits.filter((p) => p.produit.quantite < p.quantite);
    if (outOfStock.length > 0) {
      return res.status(400).json({
        message: "Certains produits sont indisponibles",
        produits: outOfStock.map((p) => ({ nom: p.produit.nom, disponible: p.produit.quantite })),
      });
    }

    
    const totalCommande = panier.produits.reduce((acc, p) => acc + p.prixTotal, 0);

    const commande = await db.commande.create({
      data: {
        clientId,
        boutiqueId: null, 
        adresseLivraison,
        totalCommande,
        produits: {
          create: panier.produits.map((p) => ({
            produitId: p.produitId,
            quantite: p.quantite,
            prixTotal: p.prixTotal,
          })),
        },
      },
      include: { produits: true },
    });

    
    await db.panierProduit.deleteMany({ where: { panierId: panier.id } });
    await db.panier.update({ where: { id: panier.id }, data: { total: 0 } });

    res.json({ message: "Commande confirmée", commande });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};