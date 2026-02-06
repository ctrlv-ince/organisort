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

  // Build query based on user role
  const query = req.user.role === 'admin' ? {} : { user: req.user.id };

  // Fetch detections with pagination
  const detections = await Detection.find(query)
    .sort({ createdAt: -1 }) // Most recent first
    .limit(limit)
    .skip(skip)
    .select('-__v'); // Exclude version key

  // Get total count for pagination info
  const total = await Detection.countDocuments(query);

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

  // Make sure user owns this detection or is an admin
  if (detection.user.toString() !== req.user.id && req.user.role !== 'admin') {
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

  // Make sure user owns this detection or is an admin
  if (detection.user.toString() !== req.user.id && req.user.role !== 'admin') {
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
  const query = req.user.role === 'admin' ? {} : { user: req.user.id };

  // Get all detections based on query
  const detections = await Detection.find(query);

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
    // Determine category - use the pre-saved category if available, otherwise calculate it
    let category = detection.category;
    let wasteType = detection.wasteType;
    
    // If category/wasteType weren't set by pre-save hook, calculate them from detections array
    if (!category || category === 'unknown' || !wasteType || wasteType === 'Unknown') {
      if (detection.detections && detection.detections.length > 0) {
        // Get the detection with highest confidence
        const topDetection = detection.detections.reduce((prev, current) => 
          (prev.confidence > current.confidence) ? prev : current
        );
        
        wasteType = topDetection.class;
        
        // Determine category from class name
        const className = topDetection.class.toLowerCase();
        if (className.includes('organic')) {
          category = 'organic';
        } else if (className.includes('recycl') && !className.includes('non')) {
          category = 'recyclable';
        } else if (className.includes('non-recycl')) {
          category = 'non-recyclable';
        } else {
          category = 'unknown';
        }
      }
    }
    
    // Category stats
    if (category && stats.byCategory[category] !== undefined) {
      stats.byCategory[category]++;
    } else {
      stats.byCategory['unknown']++;
    }

    // Waste type stats
    if (wasteType) {
      stats.byWasteType[wasteType] = (stats.byWasteType[wasteType] || 0) + 1;
    }
  });

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentDetectionsQuery = {
    ...query,
    createdAt: { $gte: sevenDaysAgo },
  };
  
  const recentDetections = await Detection.find(recentDetectionsQuery).select('createdAt category detections');

  stats.recentActivity = recentDetections.map(d => {
    let category = d.category;
    
    // Fallback if category wasn't set
    if (!category || category === 'unknown') {
      if (d.detections && d.detections.length > 0) {
        const topDetection = d.detections.reduce((prev, current) => 
          (prev.confidence > current.confidence) ? prev : current
        );
        const className = topDetection.class.toLowerCase();
        if (className.includes('organic')) {
          category = 'organic';
        } else if (className.includes('recycl') && !className.includes('non')) {
          category = 'recyclable';
        } else if (className.includes('non-recycl')) {
          category = 'non-recyclable';
        } else {
          category = 'unknown';
        }
      }
    }
    
    return {
      date: d.createdAt.toISOString().split('T')[0],
      category: category || 'unknown',
    };
  });

  res.json(stats);
});

module.exports = {
  analyzeImage,
  getDetectionHistory,
  getDetectionById,
  deleteDetection,
  getDetectionStats,
};