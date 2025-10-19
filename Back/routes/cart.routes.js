import express from "express";
import { addToCart, getCart } from "../controllers/cartController.controller.js";

const router = express.Router();

router.post("/add", addToCart);   
router.get("/:clientId", getCart);   
export default router;
