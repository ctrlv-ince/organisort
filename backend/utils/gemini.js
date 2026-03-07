const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

let genAI = null;
let model = null;

// Simple in-memory cache: key = sorted waste classes, value = { tips, timestamp }
const tipsCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate personalized waste disposal tips using Gemini.
 *
 * @param {string[]} wasteClasses - Array of detected waste class names (e.g. ["plastic-bottle", "banana-peel"])
 * @returns {Promise<string[]>} Array of tip strings, or empty array on failure
 */
const generateWasteTips = async (wasteClasses) => {
    if (!GEMINI_API_KEY || !wasteClasses || wasteClasses.length === 0) {
        return [];
    }

    // Check cache
    const cacheKey = [...wasteClasses].sort().join('|');
    const cached = tipsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        return cached.tips;
    }

    try {
        if (!genAI) {
            genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        }

        const classList = wasteClasses.join(', ');
        const prompt = `You are an eco-friendly waste management assistant for a Philippine waste sorting app called OrganiSort. The user just scanned and detected these waste items: ${classList}.

Give exactly 4 short, practical, and actionable tips about how to properly dispose of or recycle these specific items. Consider Philippine context (barangay collection, junkshops, composting). Each tip should be 1-2 sentences max.

Respond ONLY with a JSON array of strings. No markdown, no explanation. Example format:
["Tip 1 here.", "Tip 2 here.", "Tip 3 here.", "Tip 4 here."]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Parse the JSON array from the response
        const tips = JSON.parse(text);

        if (Array.isArray(tips) && tips.length > 0) {
            tipsCache.set(cacheKey, { tips, timestamp: Date.now() });
            return tips;
        }

        return [];
    } catch (error) {
        console.error('[gemini.js] Failed to generate waste tips:', error.message);
        return [];
    }
};

// Cache for eco impact results (longer TTL since these change less frequently)
const impactCache = new Map();
const IMPACT_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Generate environmental impact estimates using Gemini.
 *
 * @param {Object} wasteSummary - Map of waste class → count (e.g. { "banana-peel": 15, "plastic-bottle": 8 })
 * @param {number} totalItems - Total number of items detected
 * @returns {Promise<Object>} { impact: { co2_kg, landfill_kg, water_liters, trees_equivalent }, aiInsight: string }
 */
const generateEcoImpact = async (wasteSummary, totalItems) => {
    const fallback = {
        impact: {
            co2_kg: (totalItems * 0.3).toFixed(1),
            landfill_kg: (totalItems * 0.5).toFixed(1),
            water_liters: (totalItems * 2).toFixed(0),
            trees_equivalent: (totalItems * 0.01).toFixed(2),
        },
        aiInsight: null,
    };

    if (!GEMINI_API_KEY || totalItems === 0) {
        return fallback;
    }

    // Build cache key from waste summary
    const cacheKey = 'eco|' + Object.entries(wasteSummary)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join('|');
    const cached = impactCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < IMPACT_CACHE_TTL_MS) {
        return cached.result;
    }

    try {
        if (!genAI) {
            genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        }

        const wasteList = Object.entries(wasteSummary)
            .map(([type, count]) => `${type}: ${count} items`)
            .join(', ');

        const prompt = `You are an environmental impact calculator for a Philippine waste sorting app. A user has properly sorted and detected the following waste items: ${wasteList}. Total: ${totalItems} items.

Calculate realistic environmental impact estimates IF these items were properly sorted and disposed of (composted for organic, recycled for recyclable, etc.) compared to all going to landfill. Use real environmental science data for your calculations.

Respond ONLY with a JSON object in this exact format, no markdown:
{
  "impact": {
    "co2_kg": <number as string with 1 decimal>,
    "landfill_kg": <number as string with 1 decimal>,
    "water_liters": <number as string with 0 decimal>,
    "trees_equivalent": <number as string with 2 decimals>
  },
  "aiInsight": "<one personalized 2-sentence insight about their environmental impact, mentioning their most common waste type and a specific eco tip>"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const parsed = JSON.parse(text);

        if (parsed.impact) {
            impactCache.set(cacheKey, { result: parsed, timestamp: Date.now() });
            return parsed;
        }

        return fallback;
    } catch (error) {
        console.error('[gemini.js] Failed to generate eco impact:', error.message);
        return fallback;
    }
};

module.exports = {
    generateWasteTips,
    generateEcoImpact,
};
