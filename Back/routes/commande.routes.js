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
} from "../controllers/commande.controller.js";

const router = express.Router();


router.get("/vendeur/:vendeurId", getCommandesVendeur);
router.get("/boutique/:boutiqueId", getCommandesBoutique);
router.get("/commandesList/:clientId", getCommadesByAcheteur);
router.get("/:commandeId", getDetailCommande);

router.patch("/accepter/:commandeId", accepterCommande); // PENDING → PROCESSING
router.patch("/preparer/:commandeId", preparerCommande); // PROCESSING → READY
router.patch("/expedier/:commandeId", expedierCommande); // READY → SHIPPED
router.patch("/livrer/:commandeId", livrerCommande); // SHIPPED → DELIVERED
router.patch("/annuler/:commandeId", annulerCommande); // PENDING/PROCESSING → CANCELLED

router.patch("/status/:commandeId", updateCommandeStatus);

export default router;
