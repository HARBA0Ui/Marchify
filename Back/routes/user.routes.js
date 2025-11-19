import express from "express";

import {
  createUser,
  getAllUsers,
  loginUser,
  logoutUser,
  getVendeurByUserId,
  getLivreurByUserId,
  
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/:userId/vendeur", getVendeurByUserId);
router.get("/:userId/livreur", getLivreurByUserId);

export default router;
