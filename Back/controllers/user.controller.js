import db from "../db/prisma.js"

export const createUser = async (req, res) => {
  try {
    const { nom, prenom, email, PWD, telephone, adresse, role } = req.body;


    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email déjà utilisé" });


    const user = await db.user.create({
      data: {
        nom,
        prenom,
        email,
        PWD,
        telephone,
        adresse,
        role,
      },
    });


    if (role === "VENDEUR") {
      await db.vendeur.create({
        data: {
          userId: user.id,
        },
      });
    }


    if (role === "LIVREUR") {
      await db.livreur.create({
        data: {
          userId: user.id,
        },
      });
    }


    if (role === "CLIENT") {
      await db.panier.create({
        data: {
          clientId: user.id,
        },
      });
    }

    res.status(201).json({ message: "Utilisateur créé avec succès", user });
  } catch (error) {
    console.error("Erreur création utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await db.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
