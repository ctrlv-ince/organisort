const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

let genAI = null;

// Models to try in order — only GA models with active free-tier quota
const MODEL_CHAIN = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
const modelInstances = {};

function getModel(modelName) {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    if (!modelInstances[modelName]) {
        modelInstances[modelName] = genAI.getGenerativeModel({ model: modelName });
    }
    return modelInstances[modelName];
}

/**
 * Call Gemini with automatic retry + model fallback.
 * Tries each model in MODEL_CHAIN; retries once on 429 with a short delay.
 */
async function callGemini(prompt) {
    if (!GEMINI_API_KEY) return null;

    for (const modelName of MODEL_CHAIN) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const model = getModel(modelName);
                const result = await model.generateContent(prompt);
                let text = result.response.text().trim();
                // Strip markdown code fences (```json ... ```) that some models add
                text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
                return text;
            } catch (err) {
                const is429 = err.message?.includes('429') || err.message?.includes('quota');
                if (is429 && attempt === 0) {
                    // Retry after short delay for per-minute limits
                    await new Promise(r => setTimeout(r, 4000));
                    continue;
                }
                if (is429) {
                    // This model's quota is exhausted, try next model
                    console.warn(`[gemini] ${modelName} quota exhausted, trying fallback...`);
                    break;
                }
                // Non-quota error, throw
                throw err;
            }
        }
    }
    console.warn('[gemini] All models exhausted — returning null');
    return null;
}

// ─── Caches ──────────────────────────────────────────────
const tipsCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours (was 1h)

const impactCache = new Map();
const IMPACT_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours (was 6h)

// ─── Waste Tips ──────────────────────────────────────────
const generateWasteTips = async (wasteClasses) => {
    if (!GEMINI_API_KEY || !wasteClasses || wasteClasses.length === 0) return [];

    const cacheKey = [...wasteClasses].sort().join('|');
    const cached = tipsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) return cached.tips;

    try {
        const classList = wasteClasses.join(', ');
        const prompt = `You are an eco-friendly waste management assistant for a Philippine waste sorting app called OrganiSort. The user just scanned and detected these waste items: ${classList}.

Give exactly 4 short, practical, and actionable tips about how to properly dispose of or recycle these specific items. Consider Philippine context (barangay collection, junkshops, composting). Each tip should be 1-2 sentences max.

Respond ONLY with a JSON array of strings. No markdown, no explanation. Example format:
["Tip 1 here.", "Tip 2 here.", "Tip 3 here.", "Tip 4 here."]`;

        const text = await callGemini(prompt);
        if (!text) return [];

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

// ─── Eco Impact ──────────────────────────────────────────
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

    if (!GEMINI_API_KEY || totalItems === 0) return fallback;

    const cacheKey = 'eco|' + Object.entries(wasteSummary)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join('|');
    const cached = impactCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < IMPACT_CACHE_TTL_MS) return cached.result;

    try {
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

        const text = await callGemini(prompt);
        if (!text) return fallback;

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
