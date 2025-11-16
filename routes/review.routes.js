import express from "express";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
import {
  addReview,
  getProductReviews,
  getBoutiqueReviews,
  deleteReview,
} from "../controllers/review.controller.js";

const router = express.Router();

// Middleware interne pour vérifier le token directement
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader)
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) return res.status(401).json({ message: "Invalid token." });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

// Routes
router.post("/", verifyToken, addReview); // ajout d'un review
router.get("/product/:produitId", getProductReviews); // récup reviews produit
router.get("/boutique/:boutiqueId", getBoutiqueReviews); // récup reviews boutique
router.delete("/:id", verifyToken, deleteReview); // supprimer un review

export default router;
