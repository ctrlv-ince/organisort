const asyncHandler = require('express-async-handler');
const Detection = require('../models/Detection');
const { generateEcoImpact } = require('../utils/gemini');

/**
 * @desc    Get AI-calculated eco impact based on user's detection history
 * @route   GET /api/detections/eco-impact
 * @access  Private
 */
const getEcoImpact = asyncHandler(async (req, res) => {
    const query = req.user.role === 'admin' ? {} : { user: req.user.id };

    const detections = await Detection.find(query).select('detections detectedWasteTypes summary');

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

    // Ask Gemini to calculate eco impact
    const aiResult = await generateEcoImpact(wasteSummary, totalItems);

    res.json({
        success: true,
        data: {
            totalScans: detections.length,
            totalItems,
            wasteSummary,
            ...aiResult,
        },
    });
});

module.exports = {
    getEcoImpact,
};
