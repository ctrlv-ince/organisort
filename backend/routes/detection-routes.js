const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeImage } = require('../controllers/detection-controller');
const { protect } = require('../middleware/auth-middleware');

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @route   POST /api/detections/analyze
 * @desc    Analyze an image to detect waste type
 * @access  Private (requires Bearer token)
 */
router.post('/analyze', protect, upload.single('image'), analyzeImage);

module.exports = router;
