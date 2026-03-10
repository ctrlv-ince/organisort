const Review = require('../models/Review');
const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a comment',
            });
        }

        // Call Python AI Service for Sentiment Analysis
        let sentiment = 'neutral';
        let rating = 3;

        try {
            const aiResponse = await axios.post(`${PYTHON_SERVICE_URL}/analyze-sentiment`, {
                text: comment,
            });

            if (aiResponse.data && aiResponse.data.success) {
                sentiment = aiResponse.data.sentiment;

                // Derive rating from sentiment
                switch (sentiment) {
                    case 'very negative': rating = 1; break;
                    case 'negative': rating = 2; break;
                    case 'neutral': rating = 3; break;
                    case 'positive': rating = 4; break;
                    case 'very positive': rating = 5; break;
                    default: rating = 3;
                }
            }
        } catch (error) {
            console.error('Error analyzing sentiment with Python Service. Falling back to neutral', error.message);
            // Continue with saving the review even if sentiment analysis fails
        }

        // Check if user already has a review
        let review = await Review.findOne({ user: req.user._id });

        if (review) {
            // Update existing
            review.comment = comment;
            review.sentiment = sentiment;
            review.rating = rating;
            await review.save();

            return res.status(200).json({
                success: true,
                data: review,
                message: 'Review updated successfully',
            });
        } else {
            // Create new
            review = await Review.create({
                user: req.user._id,
                rating,
                comment,
                sentiment,
            });

            return res.status(201).json({
                success: true,
                data: review,
                message: 'Review submitted successfully',
            });
        }
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating review',
            error: error.message,
        });
    }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Private
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'displayName photoURL email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews',
            error: error.message,
        });
    }
};

// @desc    Get user's own review
// @route   GET /api/reviews/me
// @access  Private
const getMyReview = async (req, res) => {
    try {
        const review = await Review.findOne({ user: req.user._id });

        if (!review) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (error) {
        console.error('Get My Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching your review',
            error: error.message,
        });
    }
};

module.exports = {
    createReview,
    getAllReviews,
    getMyReview,
};
