import express from "express";
import {
  getMissionsDisponibles,
  accepterMission,
  livrerCommande,
  refuserMission
} from "../controllers/livreur.controller.js"

const router = express.Router();

router.get("/missions", getMissionsDisponibles);

router.patch("/missions/accepter/:livreurId/:commandeId", accepterMission);

router.patch("/missions/delivered/:commandeId", livrerCommande);

router.patch("/missions/refuser/:commandeId", refuserMission);

export default router;
