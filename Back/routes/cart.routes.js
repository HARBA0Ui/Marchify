import express from "express";
import {
  addToCart,
  getCart,
  updateCartQuantities,
  recalcCartTotal,
  confirmOrder,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/:clientId", getCart);
router.put("/update", updateCartQuantities);
router.get("/recalc/:clientId", recalcCartTotal);
router.post("/confirm", confirmOrder);

// nouvelles routes
router.post("/remove", removeFromCart);      // body: { clientId, produitId }
router.delete("/clear/:clientId", clearCart); // vider tout le panier

export default router;
