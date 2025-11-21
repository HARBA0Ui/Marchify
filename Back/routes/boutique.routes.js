import express from "express";
import {
  createBoutique,
  getBoutiques,
  getBoutiqueById,
  updateBoutique,
  getBoutiquesByVendeurId,
} from "../controllers/boutique.controller.js";

const router = express.Router();

router.get("/vendeur/:vendeurId", getBoutiquesByVendeurId);

router.post("/", createBoutique);       
router.get("/", getBoutiques);   
router.get("/:id", getBoutiqueById); 
router.put("/:id", updateBoutique);


export default router;
