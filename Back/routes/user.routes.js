import express from "express";
import {
  createUser,
  getAllUsers,
  loginUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.post("/login", loginUser);

export default router;
