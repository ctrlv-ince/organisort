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

module.exports = {
    generateWasteTips,
};
