import db from "../db/prisma.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const JWT_EXPIRES_IN = "7d"; // durée du token

// Helper pour générer un token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const createUser = async (req, res) => {
  try {
    const { nom, prenom, email, PWD, telephone, adresse, role } = req.body;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const user = await db.user.create({
      data: {
        nom,
        prenom,
        email,
        PWD,          // à sécuriser plus tard avec bcrypt
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

    const token = generateToken(user);

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user,
      token,
    });
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

    const token = generateToken(user);

    res.status(200).json({
      message: "Connexion réussie",
      user,
      token,
    });
  } catch (error) {
    console.error("Erreur login utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Logout côté JWT = côté client (on efface le token).
// On peut néanmoins exposer un endpoint pour compatibilité / logs.
export const logoutUser = async (req, res) => {
  try {
    // avec JWT stateless, il n'y a rien à faire côté serveur
    return res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Erreur logout utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
