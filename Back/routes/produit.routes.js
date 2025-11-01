import express from "express";
import {
  createProduit,
  getProduits,
  getProduitById,
  updateProduit,
} from "../controllers/produit.controller.js";

const router = express.Router();

router.post("/", createProduit);
router.get("/", getProduits);
router.get("/:id", getProduitById);
router.put("/:id", updateProduit);

export default router;
