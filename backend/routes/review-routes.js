const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review-controller');
const { protect } = require('../middleware/auth-middleware');

// @route   POST /api/reviews
// @desc    Create a new review and analyze sentiment
// @access  Private
router.post('/', protect, reviewController.createReview);

// @route   GET /api/reviews/me
// @desc    Get user's own review
// @access  Private
router.get('/me', protect, reviewController.getMyReview);

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Private/Admin
router.get('/', protect, reviewController.getAllReviews);

module.exports = router;
