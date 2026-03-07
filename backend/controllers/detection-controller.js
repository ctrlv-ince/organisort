const asyncHandler = require('express-async-handler');
const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');
const mongoose = require('mongoose');
const Detection = require('../models/Detection');
const {
  WASTE_DISPOSAL_GUIDES,
  DEFAULT_DISPOSAL_GUIDE,
} = require('../constants/waste-disposal-guides');
const { buildPythonServiceUrl } = require('../utils/python-service-url');
const { getPaginationParams } = require('../utils/pagination');
const { WASTE_GUIDES, buildDisposalGuides } = require('../data/waste-guides');
const { uploadImageToCloudinary, deleteCloudinaryImage } = require('../utils/cloudinary');
const { generateWasteTips } = require('../utils/gemini');

const DEFAULT_WASTE_GUIDE = {
  category: 'Unknown',
  description: 'No waste guide available for this item.',
  compostable: null,
  avgDecompositionDays: null,
  color: '#9ca3af',
};

const attachDetectionGuides = (detection) => {
  const rawDetection = typeof detection.toObject === 'function'
    ? detection.toObject()
    : detection;

  const items = Array.isArray(rawDetection.detections)
    ? rawDetection.detections
    : [];

  const classCounts = rawDetection.summary?.class_counts || {};
  const fallbackCounts = items.reduce((acc, item) => {
    const className = item?.class;
    if (!className) {
      return acc;
    }

    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {});
  const wasteGuides = {};
  const wasteDisposalGuides = {};

  items.forEach((item) => {
    const className = item?.class;
    if (!className) {
      return;
    }

    const itemCount = Number(classCounts[className] || 0) || fallbackCounts[className] || 0;

    if (!wasteGuides[className]) {
      wasteGuides[className] = {
        ...(WASTE_GUIDES[className] || DEFAULT_WASTE_GUIDE),
        count: itemCount,
      };
    }

    if (!wasteDisposalGuides[className]) {
      wasteDisposalGuides[className] = {
        ...(WASTE_DISPOSAL_GUIDES[className] || DEFAULT_DISPOSAL_GUIDE),
        count: itemCount,
      };
    }
  });

  return {
    ...rawDetection,
    waste_guides: wasteGuides,
    waste_disposal_guides: wasteDisposalGuides,
  };
};



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

  // Optional confidence threshold from request
  const confidenceThreshold = req.body.confidence || req.query.confidence;
  if (confidenceThreshold) {
    form.append('confidence', confidenceThreshold);
  }

  let pythonServiceResponse;
  try {
    const pythonServiceDetectUrl = buildPythonServiceUrl('/detect');

    console.log(`Forwarding image to Python service: ${pythonServiceDetectUrl}`);

    const response = await axios.post(pythonServiceDetectUrl, form, {
      headers: { ...form.getHeaders() },
      timeout: 30000, // 30 second timeout
    });

    pythonServiceResponse = response.data;
    console.log('Python service response received:', {
      success: pythonServiceResponse.success,
      detectionsCount: pythonServiceResponse.detections?.length,
      uniqueClasses: pythonServiceResponse.summary?.unique_classes,
    });
  } catch (error) {
    console.error('Error forwarding request to Python service:', error.message);

    if (error.response) {
      const upstreamStatus = error.response.status;
      const upstreamMessage = error.response.data?.error
        || error.response.data?.message
        || 'Image processing failed';

      res.status(upstreamStatus).json({
        message: upstreamMessage,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      message: 'Failed to process image',
      error: error.message,
    });
    return;
  }

  // Save the detection to the database
  try {
    const {
      detections,
      annotated_image: annotatedImage,
      summary,
      image_dimensions: imageDimensions,
    } = pythonServiceResponse;

    // If no items were detected, skip saving and tell the client
    const hasDetections = Array.isArray(detections) && detections.length > 0;
    if (!hasDetections) {
      console.log('[analyzeImage] No detections found — skipping save.');
      return res.json({
        success: true,
        no_detections: true,
        message: 'No waste items were detected in this image. Try using a clearer photo with better lighting, or move closer to the waste item.',
        detections: [],
        summary: summary || { total_detections: 0, class_counts: {} },
        disposal_guides: [],
        ai_tips: [],
      });
    }

    let imageResult = null;
    if (annotatedImage) {
      imageResult = await uploadImageToCloudinary({
        imageData: annotatedImage,
        folderName: 'organisort/detections',
      });
    }

    // Generate AI tips BEFORE saving so they persist in the DB
    let aiTips = [];
    try {
      const wasteClasses = [...new Set(
        (detections || []).map(d => d?.class).filter(Boolean)
      )];
      aiTips = await generateWasteTips(wasteClasses);
    } catch (tipErr) {
      console.error('[analyzeImage] AI tips generation failed:', tipErr.message);
    }

    const detection = await Detection.create({
      user: req.user.id,
      detections,
      annotated_image: imageResult?.secureUrl || '',
      annotated_image_public_id: imageResult?.publicId || null,
      summary,
      image_dimensions: imageDimensions,
      ai_tips: aiTips,
    });

    // Return the URL-backed image to clients; keeps response shape stable.
    pythonServiceResponse.annotated_image = imageResult?.secureUrl || '';
    pythonServiceResponse.ai_tips = aiTips;

    console.log('Detection saved to database:', detection._id, {
      storedInCloudinary: imageResult?.storedInCloudinary,
      cloudinaryPublicId: imageResult?.publicId,
      storageNote: imageResult?.reason,
      aiTipsCount: aiTips.length,
    });
  } catch (error) {
    // Log the error but don't block the user
    console.error('Failed to save detection to database:', error.message);
  }

  const detections = Array.isArray(pythonServiceResponse.detections)
    ? pythonServiceResponse.detections
    : [];
  const classCounts = pythonServiceResponse.summary?.class_counts || {};

  const uniqueClasses = [...new Set(
    detections
      .map((detection) => detection?.class)
      .filter(Boolean)
  )];

  const disposalGuides = uniqueClasses.map((classLabel) => ({
    class: classLabel,
    count: Number(classCounts[classLabel] || 0),
    guide: WASTE_DISPOSAL_GUIDES[classLabel] || DEFAULT_DISPOSAL_GUIDE,
  }));

  pythonServiceResponse.disposal_guides = disposalGuides;

  // Forward the original response from the Python service to the client
  pythonServiceResponse.disposal_guides = buildDisposalGuides(pythonServiceResponse.detections || []);

  res.json(pythonServiceResponse);
});

// @desc    Get centralized waste-guide metadata map
// @route   GET /api/detections/waste-guides
// @access  Private
const getWasteGuides = asyncHandler(async (_req, res) => {
  res.json({
    wasteGuides: WASTE_GUIDES,
    count: Object.keys(WASTE_GUIDES).length,
  });
});

// @desc    Get detection history for the logged-in user
// @route   GET /api/detections/history
// @access  Private
const getDetectionHistory = asyncHandler(async (req, res) => {
  let page;
  let limit;
  let skip;

  try {
    ({ page, limit, skip } = getPaginationParams(req.query));
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

  // Build query based on user role
  const query = req.user.role === 'admin' ? {} : { user: req.user.id };

  // Optional filtering by waste type
  if (req.query.wasteType) {
    query.primaryWasteType = req.query.wasteType;
  }

  // Fetch detections with pagination
  const detections = await Detection.find(query)
    .sort({ createdAt: -1 }) // Most recent first
    .limit(limit)
    .skip(skip)
    .select('-__v -annotated_image_public_id');

  const detectionsWithGuides = detections.map((detection) => attachDetectionGuides(detection));

  // Get total count for pagination info
  const total = await Detection.countDocuments(query);

  res.json({
    detections: detectionsWithGuides,
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
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid detection ID');
  }

  const detection = await Detection.findById(req.params.id).select('-annotated_image_public_id');

  if (!detection) {
    res.status(404);
    throw new Error('Detection not found');
  }

  // Make sure user owns this detection or is an admin
  if (detection.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this detection');
  }

  res.json(attachDetectionGuides(detection));
});

// @desc    Delete a detection
// @route   DELETE /api/detections/:id
// @access  Private
const deleteDetection = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid detection ID');
  }

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

  try {
    await deleteCloudinaryImage(detection.annotated_image_public_id);
  } catch (cloudinaryError) {
    console.warn('Failed to delete Cloudinary image:', cloudinaryError.message);
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
    totalItems: 0, // Total individual items detected across all scans
    byWasteType: {}, // Count by specific waste type (e.g., apple: 15, banana-peel: 23)
    topWasteTypes: [], // Top 10 most detected waste types
    recentActivity: [],
    averageItemsPerScan: 0,
    averageConfidence: 0,
  };

  let totalConfidence = 0;
  let totalItemCount = 0;

  // Count by waste type
  detections.forEach((detection) => {
    // Count total items from this detection
    const itemCount = detection.detections?.length || 0;
    totalItemCount += itemCount;

    // Process each detected item
    if (detection.detections && detection.detections.length > 0) {
      detection.detections.forEach((item) => {
        const wasteType = item.class;
        stats.byWasteType[wasteType] = (stats.byWasteType[wasteType] || 0) + 1;
        totalConfidence += item.confidence;
      });
    }
  });

  stats.totalItems = totalItemCount;
  stats.averageItemsPerScan = detections.length > 0
    ? (totalItemCount / detections.length).toFixed(2)
    : 0;
  stats.averageConfidence = totalItemCount > 0
    ? (totalConfidence / totalItemCount).toFixed(4)
    : 0;

  // Get top 10 waste types
  stats.topWasteTypes = Object.entries(stats.byWasteType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([type, count]) => ({ type, count }));

  // Get recent activity (last 30 days grouped by date)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentDetectionsQuery = {
    ...query,
    createdAt: { $gte: thirtyDaysAgo },
  };

  const recentDetections = await Detection.find(recentDetectionsQuery)
    .select('createdAt detections primaryWasteType')
    .sort({ createdAt: 1 });

  // Group by date
  const activityByDate = {};
  recentDetections.forEach((d) => {
    const date = d.createdAt.toISOString().split('T')[0];
    if (!activityByDate[date]) {
      activityByDate[date] = {
        date,
        scans: 0,
        items: 0,
        wasteTypes: new Set(),
      };
    }
    activityByDate[date].scans += 1;
    activityByDate[date].items += d.detections?.length || 0;
    if (d.primaryWasteType) {
      activityByDate[date].wasteTypes.add(d.primaryWasteType);
    }
  });

  stats.recentActivity = Object.values(activityByDate).map((day) => ({
    date: day.date,
    scans: day.scans,
    items: day.items,
    uniqueWasteTypes: day.wasteTypes.size,
  }));

  res.json(stats);
});

// @desc    Get list of all detected waste types (for filters/dropdowns)
// @route   GET /api/detections/waste-types
// @access  Private
const getWasteTypes = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { user: req.user.id };

  // Get all unique waste types from user's detections
  const detections = await Detection.find(query).select('detectedWasteTypes');

  const wasteTypesSet = new Set();
  detections.forEach((d) => {
    if (d.detectedWasteTypes && d.detectedWasteTypes.length > 0) {
      d.detectedWasteTypes.forEach((type) => wasteTypesSet.add(type));
    }
  });

  const wasteTypes = Array.from(wasteTypesSet).sort();

  res.json({
    wasteTypes,
    count: wasteTypes.length,
  });
});

// @desc    Get leaderboard ranked by total scans per user
// @route   GET /api/detections/leaderboard
// @access  Private
const getDetectionLeaderboard = asyncHandler(async (_req, res) => {
  const leaderboard = await Detection.aggregate([
    {
      $group: {
        _id: '$user',
        detectionCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        detectionCount: 1,
        displayName: '$user.displayName',
        email: '$user.email',
      },
    },
    {
      $sort: { detectionCount: -1 },
    },
  ]);

  res.json({
    success: true,
    data: leaderboard,
  });
});

module.exports = {
  analyzeImage,
  getDetectionHistory,
  getDetectionById,
  deleteDetection,
  getDetectionStats,
  getWasteTypes,
  getDetectionLeaderboard,
  getWasteGuides,
};
