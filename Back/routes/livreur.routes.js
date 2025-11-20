import express from "express";
import {
  getMissionsDisponibles,
  accepterMission,
  
  refuserMission,

  getMissionById
} from "../controllers/livreur.controller.js"

const router = express.Router();

router.get("/missions", getMissionsDisponibles);

router.get('/missions/:id', getMissionById);

router.patch("/missions/accepter/:livreurId/:bonId", accepterMission);


router.patch("/missions/refuser/:commandeId", refuserMission);

export default router;
