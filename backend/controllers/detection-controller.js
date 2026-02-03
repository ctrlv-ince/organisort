const asyncHandler = require('express-async-handler');
const axios = require('axios');
const FormData = require('form-data');
const Detection = require('../models/Detection');

// @desc    Analyze an image and save the detection
// @route   POST /api/detections/analyze
// @access  Private
const analyzeImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  const form = new FormData();
  form.append('image', req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype,
  });

  let pythonServiceResponse;
  try {
    const pythonServiceUrl =
      process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5001/detect';
    
    console.log(`Forwarding image to Python service: ${pythonServiceUrl}`);
    
    const response = await axios.post(pythonServiceUrl, form, {
      headers: { ...form.getHeaders() },
      timeout: 30000, // 30 second timeout
    });
    
    pythonServiceResponse = response.data;
    console.log('Python service response received:', {
      success: pythonServiceResponse.success,
      detectionsCount: pythonServiceResponse.detections?.length,
    });
    
  } catch (error) {
    console.error('Error forwarding request to Python service:', error.message);
    res.status(500).json({
      message: 'Failed to process image',
      error: error.message,
    });
    return;
  }

  // Save the detection to the database
  try {
    const { detections, annotated_image, summary, image_dimensions } = pythonServiceResponse;

    const detection = await Detection.create({
      user: req.user.id, // Comes from the 'protect' middleware
      detections,
      annotated_image,
      summary,
      image_dimensions,
    });

    console.log('Detection saved to database:', detection._id);

  } catch (error) {
    // Log the error but don't block the user
    console.error('Failed to save detection to database:', error.message);
  }

  // Forward the original response from the Python service to the client
  res.json(pythonServiceResponse);
});

// @desc    Get detection history for the logged-in user
// @route   GET /api/detections/history
// @access  Private
const getDetectionHistory = asyncHandler(async (req, res) => {
  // Get query parameters for pagination (optional)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // Fetch detections with pagination
  const detections = await Detection.find({ user: req.user.id })
    .sort({ createdAt: -1 }) // Most recent first
    .limit(limit)
    .skip(skip)
    .select('-__v'); // Exclude version key

  // Get total count for pagination info
  const total = await Detection.countDocuments({ user: req.user.id });

  res.json({
    detections,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get a single detection by ID
// @route   GET /api/detections/:id
// @access  Private
const getDetectionById = asyncHandler(async (req, res) => {
  const detection = await Detection.findById(req.params.id);

  if (!detection) {
    res.status(404);
    throw new Error('Detection not found');
  }

  // Make sure user owns this detection
  if (detection.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view this detection');
  }

  res.json(detection);
});

// @desc    Delete a detection
// @route   DELETE /api/detections/:id
// @access  Private
const deleteDetection = asyncHandler(async (req, res) => {
  const detection = await Detection.findById(req.params.id);

  if (!detection) {
    res.status(404);
    throw new Error('Detection not found');
  }

  // Make sure user owns this detection
  if (detection.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this detection');
  }

  await detection.deleteOne();

  res.json({ message: 'Detection removed', id: req.params.id });
});

// @desc    Get detection statistics for the user
// @route   GET /api/detections/stats
// @access  Private
const getDetectionStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get all detections for the user
  const detections = await Detection.find({ user: userId });

  // Calculate statistics
  const stats = {
    totalDetections: detections.length,
    byCategory: {
      organic: 0,
      recyclable: 0,
      'non-recyclable': 0,
      unknown: 0,
    },
    byWasteType: {},
    recentActivity: [],
  };

  // Count by category and waste type
  detections.forEach((detection) => {
    // Category stats
    if (stats.byCategory[detection.category] !== undefined) {
      stats.byCategory[detection.category]++;
    }

    // Waste type stats
    if (detection.wasteType) {
      stats.byWasteType[detection.wasteType] = 
        (stats.byWasteType[detection.wasteType] || 0) + 1;
    }
  });

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentDetections = await Detection.find({
    user: userId,
    createdAt: { $gte: sevenDaysAgo },
  }).select('createdAt category');

  stats.recentActivity = recentDetections.map(d => ({
    date: d.createdAt.toISOString().split('T')[0],
    category: d.category,
  }));

  res.json(stats);
});

module.exports = {
  analyzeImage,
  getDetectionHistory,
  getDetectionById,
  deleteDetection,
  getDetectionStats,
};