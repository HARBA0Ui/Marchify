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

// Routes
router.post("/", addReview); // ajout d'un review
router.get("/product/:produitId", getProductReviews); // récup reviews produit
router.get("/boutique/:boutiqueId", getBoutiqueReviews); // récup reviews boutique
router.delete("/:id", deleteReview); // supprimer un review

export default router;
