import express from "express";
import{

    getAllBonsDeLivraison,
    getBonsDeLivraisonByLivreur,
    livrerCommande
}from "../controllers/bonDeLivraison.controller.js"

const router = express.Router();

router.get("/livreur/:livreurId", getBonsDeLivraisonByLivreur);
router.get("/getAllBons", getAllBonsDeLivraison);
router.post("/livreur/:bonId", livrerCommande);
export default router;
