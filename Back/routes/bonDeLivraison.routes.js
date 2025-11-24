import express from "express";
import {
  getAllBonsDeLivraison,
  getBonsDeLivraisonByLivreur,
  getBonById,
  getBonByCommandeId,
  assignLivreurToBon,
  pickupCommande,
  livrerCommande,
  failDelivery,
  getUnassignedBons,
} from "../controllers/bonDeLivraison.controller.js";

const router = express.Router();

// ✅ GET ROUTES (order matters - specific routes before parameterized)
router.get("/getAllBons", getAllBonsDeLivraison); // Admin: all bons
router.get("/unassigned", getUnassignedBons); // Admin: unassigned bons
router.get("/livreur/:livreurId", getBonsDeLivraisonByLivreur); // Livreur: their bons
router.get("/commande/:commandeId", getBonByCommandeId); // Track by commande
router.get("/:bonId", getBonById); // Get specific bon

// ✅ PATCH ROUTES (state transitions)
router.patch("/:bonId/assign-livreur", assignLivreurToBon); // Admin assigns livreur
router.patch("/:bonId/pickup", pickupCommande); // Livreur picks up
router.patch("/:bonId/deliver", livrerCommande); // Livreur delivers
router.patch("/:bonId/fail", failDelivery); // Livreur marks failed

export default router;
