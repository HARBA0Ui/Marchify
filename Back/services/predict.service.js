// services/predict.service.js
import axios from "axios";
import { haversineDistanceKm } from "../utils/distance.js";
import db from "../db/prisma.js";

const FASTAPI_URL =
  process.env.FASTAPI_URL || "http://127.0.0.1:8000/api/marchify/predict/";
const TOP_PREDICTIONS = parseInt(process.env.TOP_PREDICTIONS || "5", 10);
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS || "20", 10);

// Search weights for relevance calculation
const SEARCH_WEIGHT_NAME = parseFloat(process.env.SEARCH_WEIGHT_NAME || "10.0");
const SEARCH_WEIGHT_CATEGORY = parseFloat(
  process.env.SEARCH_WEIGHT_CATEGORY || "1.0"
);
const SEARCH_WEIGHT_DESC = parseFloat(process.env.SEARCH_WEIGHT_DESC || "0.3");
const EXACT_MATCH_BONUS = parseFloat(process.env.EXACT_MATCH_BONUS || "5.0");

async function callFastApi(imageBase64) {
  const payload = { image_base64: imageBase64 };
  const r = await axios.post(FASTAPI_URL, payload, { timeout: 60000 });
  return r.data?.predictions || [];
}

/**
 * Multi-pass search: name FIRST, then add category/description
 */
async function searchProductsMultiPass(predictions) {
  const searchTerms = [];

  for (const p of predictions) {
    const terms = [p.name, p.fr, p.ar].filter(Boolean);
    searchTerms.push(...terms);
  }

  if (searchTerms.length === 0) return [];

  // PASS 1: Search ONLY in NAME field (highest priority)
  const nameQuery = searchTerms.map((term) => ({
    nom: { contains: term, mode: "insensitive" },
  }));

  const nameResults = await db.produit.findMany({
    where: { OR: nameQuery },
    include: { boutique: true },
    take: MAX_RESULTS,
  });

  // PASS 2: If we need more results, add category matches
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
          { NOT: { id: { in: Array.from(nameIds) } } },
        ],
      },
      include: { boutique: true },
      take: MAX_RESULTS - allResults.length,
    });

    allResults = [...allResults, ...categoryResults];
  }

  // PASS 3: If still need more, add description matches
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
 * Calculate relevance with HEAVY name priority and exact match bonus
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
      // Check EXACT name match first (highest priority)
      if (productName === term) {
        const score = pred.value * SEARCH_WEIGHT_NAME * EXACT_MATCH_BONUS;
        if (score > maxScore) {
          maxScore = score;
          matchedIn = "name_exact";
          isExactMatch = true;
        }
      }

      // Check partial name match (still very high priority)
      else if (productName.includes(term)) {
        const score = pred.value * SEARCH_WEIGHT_NAME;
        if (score > maxScore) {
          maxScore = score;
          matchedIn = "name";
          isExactMatch = false;
        }
      }

      // Check category match (much lower priority)
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

  // 3. Multi-pass search (name first!)
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

  // 5. Build products with metadata
  const productsWithScores = foundProducts.map((prod, idx) => {
    const price = prod.prix || 0;
    const dist = distances[idx];

    // Calculate relevance
    const { relevanceScore, matchedIn, isExactMatch } = calculateMatchRelevance(
      prod,
      topPreds
    );

    return {
      produit: prod,
      matchConfidence: relevanceScore,
      matchedIn,
      isExactMatch,
      computed: {
        price,
        distanceKm: dist,
      },
    };
  });

  // 6. Sort with STRICT hierarchical priority: Name → Price → Distance → Category → Description
  productsWithScores.sort((a, b) => {
    // Priority 1: Exact name matches ALWAYS first
    if (a.isExactMatch && !b.isExactMatch) return -1;
    if (!a.isExactMatch && b.isExactMatch) return 1;

    // Priority 2: Name matches before category/description
    const matchPriority = {
      name_exact: 4,
      name: 3,
      category: 2,
      description: 1,
    };
    const priorityA = matchPriority[a.matchedIn] || 0;
    const priorityB = matchPriority[b.matchedIn] || 0;

    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }

    // Priority 3: Within same match type, sort by PRICE (lower is better)
    const priceA = a.computed.price || 0;
    const priceB = b.computed.price || 0;

    if (Math.abs(priceA - priceB) > 0.01) {
      return priceA - priceB; // Lower price first
    }

    // Priority 4: Within same price, sort by DISTANCE (closer is better)
    const distA =
      a.computed.distanceKm === Infinity
        ? Number.MAX_VALUE
        : a.computed.distanceKm;
    const distB =
      b.computed.distanceKm === Infinity
        ? Number.MAX_VALUE
        : b.computed.distanceKm;

    if (Math.abs(distA - distB) > 0.01) {
      return distA - distB; // Closer first
    }

    // Priority 5: Final tiebreaker - match confidence
    return b.matchConfidence - a.matchConfidence;
  });

  // 7. Format results
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
