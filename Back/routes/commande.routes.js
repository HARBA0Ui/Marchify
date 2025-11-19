import express from "express";
import {
  getCommandesVendeur,
  getDetailCommande,
  preparerCommande,
  getCommandesBoutique,
  updateCommandeStatus,
  getCommadesByAcheteur,
  accepterCommande,
  expedierCommande,
  livrerCommande,
  annulerCommande,
  getStatsByMonth, // ✅ Add
  getStatsByMonthAndYear, // ✅ Add
  getStatsByStatusForMonth, // ✅ Add
} from "../controllers/commande.controller.js";

const router = express.Router();

// Get commandes
router.get("/vendeur/:vendeurId", getCommandesVendeur);
router.get("/boutique/:boutiqueId", getCommandesBoutique);
router.get("/commandesList/:clientId", getCommadesByAcheteur);
router.get("/:commandeId", getDetailCommande);

// ✅ Statistics routes - MUST be before /:commandeId route
router.get("/stats/vendeur/:vendeurId/months", getStatsByMonth);
router.get("/stats/vendeur/:vendeurId/status", getStatsByStatusForMonth);
router.get("/stats/vendeur/:vendeurId/month/:month/year/:year", getStatsByMonthAndYear);

// Status transitions
router.patch("/accepter/:commandeId", accepterCommande);
router.patch("/preparer/:commandeId", preparerCommande);
router.patch("/expedier/:commandeId", expedierCommande);
router.patch("/livrer/:commandeId", livrerCommande);
router.patch("/annuler/:commandeId", annulerCommande);

// Generic status update
router.patch("/status/:commandeId", updateCommandeStatus);

export default router;
