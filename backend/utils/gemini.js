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
        const prompt = `You are a highly knowledgeable environmental scientist, agronomist, and waste management expert for a Philippine waste sorting app called OrganiSort.
The user just scanned the following waste items: ${classList}.

Provide a highly detailed, educational, and actionable deep dive into these specific items. Your response MUST be an array of EXACTLY 5 strings, where each string is a detailed paragraph (3-5 sentences) focusing on a specific scientific or practical aspect.

FORMATTING RULES:
- DO NOT use any markdown formatting (no asterisks, no bolding, no italics).
- Each string must begin exactly with its category title followed by a colon and a space.

1. "Immediate Prep & Segregation: " - Step-by-step instructions on how the user should prepare this item at home before composting or disposal (e.g., crushing eggshells, cutting banana peels, washing).
2. "Decomposition Biology: " - Detail exactly how long it takes to break down naturally in a compost bin versus a landfill, the biological process of its decomposition, and factors that speed it up.
3. "Soil & Composting Value: " - For organic waste, explain its carbon-to-nitrogen (C:N) ratio, the specific nutrients it adds to the soil (like Potassium, Phosphorus), and how it benefits plant growth. For non-organics, discuss recyclability.
4. "Environmental Impact: " - Explain the negative consequences if this ends up in a landfill (e.g., anaerobic decomposition releasing methane) versus the positive impact of proper diversion.
5. "Local Philippine Context: " - How to integrate this waste into the local waste ecosystem (e.g., barangay MRFs, local junkshops, community gardens, or feeding stray animals/livestock if applicable).

Respond ONLY with a valid JSON array of five strings. Do not include markdown code fences around the JSON. Example format:
["Immediate Prep & Segregation: ...", "Decomposition Biology: ...", "Soil & Composting Value: ...", "Environmental Impact: ...", "Local Philippine Context: ..."]`;

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
CRITICAL: ALL VALUES MUST BE POSITIVE NUMBERS. DO NOT RETURN NEGATIVE VALUES. For example, if emissions are avoided, return a positive number representing the amount avoided.

Respond ONLY with a JSON object in this exact format, no markdown:
{
  "impact": {
    "co2_kg": <positive number as string with 1 decimal>,
    "landfill_kg": <positive number as string with 1 decimal>,
    "water_liters": <positive number as string with 0 decimal>,
    "trees_equivalent": <positive number as string with 2 decimals>
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
