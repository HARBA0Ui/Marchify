import express from "express";
import {
  getCommandesVendeur,
  getDetailCommande,
  preparerCommande,
  getCommandesBoutique
  , updateCommandeStatus,
  getCommadesByAcheteur,
  getStatsCommandesByBoutique,
  getStatsByMonth,
  getStatsByStatusForMonth
} from "../controllers/commande.controller.js"

const router = express.Router();

router.get("/vendeur/:vendeurId", getCommandesVendeur);

router.get("/:commandeId", getDetailCommande);

router.patch("/preparer/:commandeId", preparerCommande);

router.get("/boutique/:boutiqueId", getCommandesBoutique);
router.patch("/status/:commandeId", updateCommandeStatus);
router.get("/commandesList/:clientId",getCommadesByAcheteur);

router.get("/stats/vendeur/:vendeurId", getStatsCommandesByBoutique);

router.get('/stats/vendeur/:vendeurId/months', getStatsByMonth);


router.get('/stats/vendeur/:vendeurId/status', getStatsByStatusForMonth);
export default router;
