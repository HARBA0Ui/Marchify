import express from "express";
import {
  addToCart,
  getCart,
  updateCartQuantities,
  recalcCartTotal,
  confirmOrder,
} from "../controllers/cartController.controller.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/:clientId", getCart);
router.put("/update", updateCartQuantities);
router.get("/recalc/:clientId", recalcCartTotal);
router.post("/confirm", confirmOrder);

export default router;
