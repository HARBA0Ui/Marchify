// services/predict.service.js
import axios from "axios";
import { haversineDistanceKm } from "../utils/distance.js";
import db from "../db/prisma.js";


const FASTAPI_URL =
  process.env.FASTAPI_URL || "http://127.0.0.1:8000/api/marchify/predict/";
const TOP_PREDICTIONS = parseInt(process.env.TOP_PREDICTIONS || "5", 10);
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS || "20", 10);

// Weights for scoring (tweakable via env)
const W_CONF = parseFloat(process.env.W_CONF || "0.6");
const W_PRICE = parseFloat(process.env.W_PRICE || "0.2");
const W_DIST = parseFloat(process.env.W_DIST || "0.2");

async function callFastApi(imageBase64) {
const payload = { image_base64: imageBase64 };
  const r = await axios.post(FASTAPI_URL, payload, { timeout: 60000 });
  return r.data?.predictions || [];
}

function normalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

async function getMatches(imageBase64, userLocation) {
  // 1. call fastapi
  const predictions = await callFastApi(imageBase64);

  if (!Array.isArray(predictions) || predictions.length === 0) {
    return { predictions: [], results: [] };
  }

  // 2. take top N by confidence (value)
  const topPreds = predictions
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_PREDICTIONS);

  // 3. find products for each prediction (use OR across name/desc/categorie)
  // Build OR query for prisma combining all prediction names (insensitive contains)
  const orClauses = [];
  for (const p of topPreds) {
    const name = p.name;
    orClauses.push({ nom: { contains: name, mode: "insensitive" } });
    orClauses.push({ description: { contains: name, mode: "insensitive" } });
    orClauses.push({ categorie: { contains: name, mode: "insensitive" } });
    // also try translated names if provided (fr/ar)
    if (p.fr) orClauses.push({ nom: { contains: p.fr, mode: "insensitive" } });
    if (p.ar) orClauses.push({ nom: { contains: p.ar, mode: "insensitive" } });
  }

  // If nothing in orClauses, fallback to first prediction
  if (orClauses.length === 0) {
    orClauses.push({
      nom: { contains: predictions[0].name, mode: "insensitive" },
    });
  }

  // Query products and include boutique (which holds localisation)
  const foundProducts = await db.produit.findMany({
    where: { OR: orClauses },
    include: {
      boutique: true,
    },
    take: MAX_RESULTS,
  });

  if (foundProducts.length === 0) return { predictions: topPreds, results: [] };

  // 4. compute scores
  // We need ranges for price and distance
  const prices = foundProducts.map((p) => p.prix || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // distances: compute distance (km) to boutique if userLocation given, else treat distance = large number
  const distances = foundProducts.map((prod) => {
    try {
      const loc = prod.boutique?.localisation;
      // expected loc either { lat, lng } or [lat, lng]
      if (!loc || !userLocation) return Infinity;

      let lat, lng;
      if (Array.isArray(loc)) {
        lat = Number(loc[0]);
        lng = Number(loc[1]);
      } else if (loc.lat !== undefined && loc.lng !== undefined) {
        lat = Number(loc.lat);
        lng = Number(loc.lng);
      } else {
        // if loc shape unknown, try common keys
        lat = Number(loc.latitude || loc.lat || loc[0]);
        lng = Number(loc.longitude || loc.lng || loc[1]);
      }
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return haversineDistanceKm(
          userLocation.lat,
          userLocation.lng,
          lat,
          lng
        );
      } else return Infinity;
    } catch (e) {
      return Infinity;
    }
  });

  const finiteDistances = distances.filter((d) => Number.isFinite(d));
  const minDist = finiteDistances.length ? Math.min(...finiteDistances) : 0;
  const maxDist = finiteDistances.length
    ? Math.max(...finiteDistances)
    : minDist || 1;

  // helper: find the best prediction value that matches the product
  function bestPredictionValueForProduct(prod) {
    const textFields = [prod.nom, prod.categorie, prod.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    let best = 0;
    for (const p of topPreds) {
      const tokens = [p.name, p.fr, p.ar].filter(Boolean);
      for (const t of tokens) {
        if (!t) continue;
        const txt = String(t).toLowerCase();
        if (textFields.includes(txt)) {
          best = Math.max(best, p.value);
        }
      }
    }
    // fallback: use top prediction highest value
    if (best === 0) best = topPreds[0]?.value || 0;
    return best;
  }

  const productsWithScores = foundProducts.map((prod, idx) => {
    const price = prod.prix || 0;
    const dist = distances[idx];
    const predVal = bestPredictionValueForProduct(prod);

    // normalized price: lower is better => normalizedPriceScore = 1 - normalized(price)
    const normPrice = 1 - normalize(price, minPrice, maxPrice);
    // normalized distance: closer is better => 1 - normalized(distance)
    const normDist =
      dist === Infinity ? 0 : 1 - normalize(dist, minDist, maxDist);
    const normConf = predVal; // predVal already [0,1]

    // final score
    const score = W_CONF * normConf + W_PRICE * normPrice + W_DIST * normDist;

    return {
      produit: prod,
      score,
      matchConfidence: predVal,
      computed: {
        normConf: normConf,
        normPrice,
        normDist,
        price,
        distanceKm: dist,
      },
    };
  });

  // 5. sort and return top K
  productsWithScores.sort((a, b) => b.score - a.score);

  const results = productsWithScores.map((p) => ({
    id: p.produit.id,
    nom: p.produit.nom,
    prix: p.produit.prix,
    image: p.produit.image,
    unite: p.produit.unite,
    boutique: {
      id: p.produit.boutique?.id,
      nom: p.produit.boutique?.nom,
      localisation: p.produit.boutique?.localisation,
    },
    score: p.score,
    matchConfidence: p.matchConfidence,
    distanceKm:
      p.computed.distanceKm === Infinity
        ? null
        : Number((p.computed.distanceKm || 0).toFixed(3)),
  }));

  return { predictions: topPreds, results };


    
}

export { getMatches };