import express from "express";
import {
  getMissionsDisponibles,
  accepterMission,
  
  refuserMission,
  
} from "../controllers/livreur.controller.js"

const router = express.Router();

router.get("/missions", getMissionsDisponibles);

router.patch("/missions/accepter/:livreurId/:commandeId", accepterMission);


router.patch("/missions/refuser/:commandeId", refuserMission);

export default router;
