import db from "../db/prisma.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const JWT_EXPIRES_IN = "7d";

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
        PWD,
        telephone,
        adresse,
        role,
      },
    });

    let vendeurId = null;
    let livreurId = null;

    // ✅ Create vendeur and get vendeurId
    if (role === "VENDEUR") {
      const vendeur = await db.vendeur.create({
        data: {
          userId: user.id,
        },
      });
      vendeurId = vendeur.id;
    }

    // ✅ Create livreur and get livreurId
    if (role === "LIVREUR") {
      const livreur = await db.livreur.create({
        data: {
          userId: user.id,
        },
      });
      livreurId = livreur.id;
    }

    // ✅ Create panier for client
    if (role === "CLIENT") {
      await db.panier.create({
        data: {
          clientId: user.id,
        },
      });
    }

    const token = generateToken(user);

    // ✅ Build user response with vendeurId/livreurId
    const userResponse = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      telephone: user.telephone,
      adresse: user.adresse,
      ...(vendeurId && { vendeurId }),
      ...(livreurId && { livreurId }),
    };

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: userResponse,
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

    // ✅ Include vendeur and livreur relations
    const user = await db.user.findUnique({
      where: { email },
      include: {
        vendeur: true,
        livreur: true,
      },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });

    if (user.PWD !== PWD)
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });

    const token = generateToken(user);

    // ✅ Build user response with vendeurId/livreurId
    const userResponse = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      telephone: user.telephone,
      adresse: user.adresse,
      ...(user.vendeur && { vendeurId: user.vendeur.id }),
      ...(user.livreur && { livreurId: user.livreur.id }),
    };

    res.status(200).json({
      message: "Connexion réussie",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Erreur login utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ NEW: Get vendeur by user ID
export const getVendeurByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const vendeur = await db.vendeur.findUnique({
      where: { userId: userId },
    });

    if (!vendeur) {
      return res.status(404).json({
        message: "Vendeur non trouvé pour cet utilisateur",
      });
    }

    res.json({
      vendeurId: vendeur.id,
      id: vendeur.id,
      userId: vendeur.userId,
    });
  } catch (error) {
    console.error("getVendeurByUserId error:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération du vendeur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✅ NEW: Get livreur by user ID
export const getLivreurByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const livreur = await db.livreur.findUnique({
      where: { userId: userId },
    });

    if (!livreur) {
      return res.status(404).json({
        message: "Livreur non trouvé pour cet utilisateur",
      });
    }

    res.json({
      livreurId: livreur.id,
      id: livreur.id,
      userId: livreur.userId,
    });
  } catch (error) {
    console.error("getLivreurByUserId error:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération du livreur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Erreur logout utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
