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

        res.json({ message: "Produit ajouté au panier", panRes });
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
