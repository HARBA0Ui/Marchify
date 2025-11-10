import express from "express";
import {
  getMissionsDisponibles,
  accepterMission,
  livrerCommande,
<<<<<<< HEAD
  refuserMission
=======
  refuserMission,
  getMissionById
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
} from "../controllers/livreur.controller.js"

const router = express.Router();

router.get("/missions", getMissionsDisponibles);

<<<<<<< HEAD
=======
router.get('/missions/:id', getMissionById);

>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21
router.patch("/missions/accepter/:livreurId/:commandeId", accepterMission);

router.patch("/missions/delivered/:commandeId", livrerCommande);

router.patch("/missions/refuser/:commandeId", refuserMission);

export default router;
