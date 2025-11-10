<<<<<<< HEAD
import db from "../db/prisma.js";
=======
import db from "../db/prisma.js"
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21

export const createUser = async (req, res) => {
  try {
    const { nom, prenom, email, PWD, telephone, adresse, role } = req.body;

<<<<<<< HEAD
    const existing = await db.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email déjà utilisé" });
=======

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email déjà utilisé" });

>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21

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

<<<<<<< HEAD
=======

>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
    if (role === "VENDEUR") {
      await db.vendeur.create({
        data: {
          userId: user.id,
        },
      });
    }

<<<<<<< HEAD
=======

>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
    if (role === "LIVREUR") {
      await db.livreur.create({
        data: {
          userId: user.id,
        },
      });
    }

<<<<<<< HEAD
=======

>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
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
<<<<<<< HEAD
export const loginUser = async (req, res) => {
  try {
    const { email, PWD } = req.body;

    const user = await db.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });

    
    if (user.PWD !== PWD)
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });

    

    res.status(200).json({ message: "Connexion réussie", user /*, token */ });
  } catch (error) {
    console.error("Erreur login utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
=======
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
