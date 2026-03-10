const asyncHandler = require('express-async-handler');
const Detection = require('../models/Detection');
const { generateEcoImpact } = require('../utils/gemini');

const User = require('../models/User');

/**
 * @desc    Get AI-calculated eco impact based on user's detection history
 * @route   GET /api/detections/eco-impact
 * @access  Private
 */
const getEcoImpact = asyncHandler(async (req, res) => {
    // If admin, we could aggregate across all users, but usually this is user-specific
    // For now, if admin, we'll just return overall stats or use the current user
    const userId = req.user.id;
    const query = req.user.role === 'admin' ? {} : { user: userId };

    const [detections, userDoc] = await Promise.all([
        Detection.find(query).select('detections detectedWasteTypes summary'),
        User.findById(userId).select('ecoImpact')
    ]);

    if (detections.length === 0) {
        return res.json({
            success: true,
            data: {
                totalScans: 0,
                totalItems: 0,
                wasteSummary: {},
                impact: null,
                aiInsight: null,
            },
        });
    }

    // Build waste type counts
    const wasteSummary = {};
    let totalItems = 0;

    detections.forEach((d) => {
        (d.detections || []).forEach((item) => {
            const cls = item.class;
            if (cls) {
                wasteSummary[cls] = (wasteSummary[cls] || 0) + 1;
                totalItems++;
            }
        });
    });

    // Instead of calling Gemini for impact calculation over entire history,
    // just use the accumulated impact data from the User document and ask for a quick insight.
    let aiInsight = null;
    try {
        const topWasteType = Object.entries(wasteSummary).sort((a, b) => b[1] - a[1])[0]?.[0] || 'waste';
        const prompt = `A user has properly sorted ${totalItems} items. Their most common item is ${topWasteType}. Provide a single personalized, encouraging 2-sentence insight about their environmental impact and a quick tip.`;
        aiInsight = await require('../utils/gemini').generateWasteTips([topWasteType])
            .then(res => res && res.length > 0 ? res[res.length - 1].replace("Local Philippine Context: ", "") : null)
            .catch(() => null);
    } catch (e) {
        console.warn("Failed to generate ai Insight");
    }

    res.json({
        success: true,
        data: {
            totalScans: detections.length,
            totalItems,
            wasteSummary,
            impact: userDoc?.ecoImpact || null,
            aiInsight: aiInsight || "Keep up the great work sorting your waste properly!",
        },
    });
});

module.exports = {
    getEcoImpact,
};
