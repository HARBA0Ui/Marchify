import express from "express";
<<<<<<< HEAD
import {
  createUser,
  getAllUsers,
  loginUser,
} from "../controllers/user.controller.js";
=======
import { createUser, getAllUsers } from "../controllers/user.controller.js"
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21

const router = express.Router();

router.post("/", createUser);
<<<<<<< HEAD
router.get("/", getAllUsers);
router.post("/login", loginUser);
=======
router.get("/", getAllUsers); 
>>>>>>> bd5a0f9fe8c737f8c867724af0f33f1e30ceee21

export default router;
