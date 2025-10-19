import express from "express";
import {
  getCommandesVendeur,
  getDetailCommande,
  preparerCommande,
  getCommandesBoutique
} from "../controllers/commande.controller.js"

const router = express.Router();

router.get("/vendeur/:vendeurId", getCommandesVendeur);

router.get("/:commandeId", getDetailCommande);

router.patch("/preparer/:commandeId", preparerCommande);

router.get("/boutique/:boutiqueId", getCommandesBoutique);

export default router;
