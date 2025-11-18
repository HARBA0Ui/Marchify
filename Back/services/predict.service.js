// services/predict.service.js
import axios from "axios";
import { haversineDistanceKm } from "../utils/distance.js";
import db from "../db/prisma.js";

const FASTAPI_URL =
  process.env.FASTAPI_URL || "http://127.0.0.1:8000/api/marchify/predict/";
const TOP_PREDICTIONS = parseInt(process.env.TOP_PREDICTIONS || "5", 10);
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS || "20", 10);

// MASSIVE weight difference - name gets 10x priority over category [web:37][web:45]
const SEARCH_WEIGHT_NAME = parseFloat(process.env.SEARCH_WEIGHT_NAME || "10.0");
const SEARCH_WEIGHT_CATEGORY = parseFloat(
  process.env.SEARCH_WEIGHT_CATEGORY || "1.0"
);
const SEARCH_WEIGHT_DESC = parseFloat(process.env.SEARCH_WEIGHT_DESC || "0.3");
const EXACT_MATCH_BONUS = parseFloat(process.env.EXACT_MATCH_BONUS || "5.0"); // Extra boost for exact name match [web:33][web:45]

// Scoring weights
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

/**
 * Multi-pass search: name FIRST, then add category/description [web:31]
 */
async function searchProductsMultiPass(predictions) {
  const searchTerms = [];

  for (const p of predictions) {
    const terms = [p.name, p.fr, p.ar].filter(Boolean);
    searchTerms.push(...terms);
  }

  if (searchTerms.length === 0) return [];

  // PASS 1: Search ONLY in NAME field (highest priority) [web:31][web:37]
  const nameQuery = searchTerms.map((term) => ({
    nom: { contains: term, mode: "insensitive" },
  }));

  const nameResults = await db.produit.findMany({
    where: { OR: nameQuery },
    include: { boutique: true },
    take: MAX_RESULTS,
  });

  // PASS 2: If we need more results, add category matches [web:31]
  let allResults = [...nameResults];
  const nameIds = new Set(nameResults.map((p) => p.id));

  if (allResults.length < MAX_RESULTS) {
    const categoryQuery = searchTerms.map((term) => ({
      categorie: { contains: term, mode: "insensitive" },
    }));

    const categoryResults = await db.produit.findMany({
      where: {
        AND: [
          { OR: categoryQuery },
          { NOT: { id: { in: Array.from(nameIds) } } }, // Exclude already found
        ],
      },
      include: { boutique: true },
      take: MAX_RESULTS - allResults.length,
    });

    allResults = [...allResults, ...categoryResults];
  }

  // PASS 3: If still need more, add description matches [web:31]
  if (allResults.length < MAX_RESULTS) {
    const allIds = new Set(allResults.map((p) => p.id));
    const descQuery = searchTerms.map((term) => ({
      description: { contains: term, mode: "insensitive" },
    }));

    const descResults = await db.produit.findMany({
      where: {
        AND: [{ OR: descQuery }, { NOT: { id: { in: Array.from(allIds) } } }],
      },
      include: { boutique: true },
      take: MAX_RESULTS - allResults.length,
    });

    allResults = [...allResults, ...descResults];
  }

  return allResults;
}

/**
 * Calculate relevance with HEAVY name priority and exact match bonus [web:33][web:37][web:45]
 */
function calculateMatchRelevance(product, predictions) {
  let maxScore = 0;
  let matchedIn = null;
  let isExactMatch = false;

  const productName = (product.nom || "").toLowerCase().trim();
  const productCategory = (product.categorie || "").toLowerCase();
  const productDesc = (product.description || "").toLowerCase();

  for (const pred of predictions) {
    const searchTerms = [pred.name, pred.fr, pred.ar]
      .filter(Boolean)
      .map((t) => t.toLowerCase().trim());

    for (const term of searchTerms) {
      // Check EXACT name match first (highest priority) [web:37][web:45]
      if (productName === term) {
        const score = pred.value * SEARCH_WEIGHT_NAME * EXACT_MATCH_BONUS;
        if (score > maxScore) {
          maxScore = score;
          matchedIn = "name_exact";
          isExactMatch = true;
        }
      }

      // Check partial name match (still very high priority) [web:37]
      else if (productName.includes(term)) {
        const score = pred.value * SEARCH_WEIGHT_NAME;
        if (score > maxScore) {
          maxScore = score;
          matchedIn = "name";
          isExactMatch = false;
        }
      }

      // Check category match (much lower priority) [web:36]
      else if (productCategory.includes(term)) {
        const score = pred.value * SEARCH_WEIGHT_CATEGORY;
        if (score > maxScore) {
          maxScore = score;
          matchedIn = "category";
          isExactMatch = false;
        }
      }

      // Check description match (lowest priority)
      else if (productDesc.includes(term)) {
        const score = pred.value * SEARCH_WEIGHT_DESC;
        if (score > maxScore) {
          maxScore = score;
          matchedIn = "description";
          isExactMatch = false;
        }
      }
    }
  }

  return { relevanceScore: maxScore, matchedIn, isExactMatch };
}

async function getMatches(imageBase64, userLocation) {
  // 1. Call FastAPI
  const predictions = await callFastApi(imageBase64);

  if (!Array.isArray(predictions) || predictions.length === 0) {
    return { predictions: [], results: [] };
  }

  // 2. Take top N by confidence
  const topPreds = predictions
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_PREDICTIONS);

  // 3. Multi-pass search (name first!) [web:31]
  const foundProducts = await searchProductsMultiPass(topPreds);

  if (foundProducts.length === 0) {
    return { predictions: topPreds, results: [] };
  }

  // 4. Calculate distances
  const distances = foundProducts.map((prod) => {
    try {
      const loc = prod.boutique?.localisation;
      if (!loc || !userLocation) return Infinity;

      let lat, lng;
      if (Array.isArray(loc)) {
        [lat, lng] = loc.map(Number);
      } else {
        lat = Number(loc.lat || loc.latitude);
        lng = Number(loc.lng || loc.longitude);
      }

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return haversineDistanceKm(
          userLocation.lat,
          userLocation.lng,
          lat,
          lng
        );
      }
      return Infinity;
    } catch (e) {
      return Infinity;
    }
  });

  // 5. Get min/max for normalization
  const prices = foundProducts.map((p) => p.prix || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const finiteDistances = distances.filter((d) => Number.isFinite(d));
  const minDist = finiteDistances.length ? Math.min(...finiteDistances) : 0;
  const maxDist = finiteDistances.length
    ? Math.max(...finiteDistances)
    : minDist || 1;

  // 6. Score each product with HEAVY name priority [web:37][web:45]
  const productsWithScores = foundProducts.map((prod, idx) => {
    const price = prod.prix || 0;
    const dist = distances[idx];

    // Calculate relevance (with 10x name boost and exact match bonus) [web:33][web:45]
    const { relevanceScore, matchedIn, isExactMatch } = calculateMatchRelevance(
      prod,
      topPreds
    );

    // Normalize components
    const normPrice = 1 - normalize(price, minPrice, maxPrice);
    const normDist =
      dist === Infinity ? 0 : 1 - normalize(dist, minDist, maxDist);
    const normConf = relevanceScore;

    // Final score
    const score = W_CONF * normConf + W_PRICE * normPrice + W_DIST * normDist;

    return {
      produit: prod,
      score,
      matchConfidence: relevanceScore,
      matchedIn,
      isExactMatch,
      computed: {
        normConf,
        normPrice,
        normDist,
        price,
        distanceKm: dist,
      },
    };
  });

  // 7. Sort with STRICT name priority [web:37][web:40]
  productsWithScores.sort((a, b) => {
    // Priority 1: Exact name matches ALWAYS first [web:37]
    if (a.isExactMatch && !b.isExactMatch) return -1;
    if (!a.isExactMatch && b.isExactMatch) return 1;

    // Priority 2: Name matches before category/description [web:36]
    const matchPriority = {
      name_exact: 4,
      name: 3,
      category: 2,
      description: 1,
    };
    const priorityA = matchPriority[a.matchedIn] || 0;
    const priorityB = matchPriority[b.matchedIn] || 0;

    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    // Priority 3: Within same match type, sort by score
    return b.score - a.score;
  });

  // 8. Format results
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
    score: Number(p.score.toFixed(4)),
    matchConfidence: Number(p.matchConfidence.toFixed(4)),
    matchedIn: p.matchedIn,
    isExactMatch: p.isExactMatch,
    distanceKm:
      p.computed.distanceKm === Infinity
        ? null
        : Number(p.computed.distanceKm.toFixed(3)),
  }));

  return { predictions: topPreds, results };
}

export { getMatches };
