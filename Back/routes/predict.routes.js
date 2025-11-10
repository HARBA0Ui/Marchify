import express from "express";
import * as predictController from "../controllers/predict.controller.js";
const router = express.Router();


router.post("/", predictController.predict);

export default router;