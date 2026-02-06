const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  analyzeImage,
  getDetectionHistory,
  getDetectionById,
  deleteDetection,
  getDetectionStats,
} = require('../controllers/detection-controller');
const { unifiedAuth } = require('../middleware/auth-middleware');

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

/**
 * @route   POST /api/detections/analyze
 * @desc    Analyze an image to detect waste type
 * @access  Private (requires Bearer token)
 */
router.post('/analyze', unifiedAuth, upload.single('image'), analyzeImage);

/**
 * @route   GET /api/detections/history
 * @desc    Get all detections for the logged-in user (with pagination)
 * @access  Private
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 50)
 */
router.get('/history', unifiedAuth, getDetectionHistory);

/**
 * @route   GET /api/detections/stats
 * @desc    Get detection statistics for the logged-in user
 * @access  Private
 */
router.get('/stats', unifiedAuth, getDetectionStats);

/**
 * @route   GET /api/detections/:id
 * @desc    Get a single detection by ID
 * @access  Private
 */
router.get('/:id', unifiedAuth, getDetectionById);

/**
 * @route   DELETE /api/detections/:id
 * @desc    Delete a detection
 * @access  Private
 */
router.delete('/:id', unifiedAuth, deleteDetection);

module.exports = router;