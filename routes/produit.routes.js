import express from "express";
import {
  createProduit,
  getProduits,
  getProduitById,
  updateProduit,
} from "../controllers/produit.controller.js";
import upload from "../utils/multer.js"; // import multer config

const router = express.Router();

// add upload.array('imageFile', 5) to handle multiple images
router.post("/", upload.array("imageFile", 5), createProduit);

router.get("/", getProduits);
router.get("/:id", getProduitById);
router.put("/:id", updateProduit);

export default router;
