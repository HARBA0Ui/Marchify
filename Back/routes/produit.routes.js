import express from "express";
import {
  createProduit,
  getProduits,
  getProduitById,
  updateProduit,
  getProduitsByIds,
  getProduitsByShopId,
  deleteProduit,
  getPinnedTopRatedProduits
} from "../controllers/produit.controller.js";
import upload from "../utils/multer.js"; // import multer config

const router = express.Router();

// add upload.array('imageFile', 5) to handle multiple images
router.post("/", upload.array("imageFile", 5), createProduit);

router.get("/", getProduits);
router.get("/:id", getProduitById);
router.put("/:id", upload.array("imageFile", 5), updateProduit);
router.post('/batch', getProduitsByIds);
router.get("/pinned/top-rated", getPinnedTopRatedProduits);
router.get("/shop/:shopId", getProduitsByShopId);
router.delete("/:id", deleteProduit);

export default router;
