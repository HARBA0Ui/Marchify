// controllers/predict.controller.js
import * as predictService from "../services/predict.service.js";

async function predict(req, res) {
  try {
    const { imageBase64, userLocation } = req.body;
    if (!imageBase64)
      return res.status(400).json({ error: "imageBase64 is required" });

    // userLocation optional but recommended: { lat: number, lng: number }
    const results = await predictService.getMatches(imageBase64, userLocation);
    return res.json(results);
  } catch (err) {
    console.error("predict.controller error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export { predict };