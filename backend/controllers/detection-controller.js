const asyncHandler = require('express-async-handler');
const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');
const Detection = require('../models/Detection');

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
      && process.env.CLOUDINARY_API_KEY
      && process.env.CLOUDINARY_API_SECRET
  );
};

const buildCloudinarySignature = (timestamp, folder) => {
  const payload = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  return crypto.createHash('sha1').update(payload).digest('hex');
};

const uploadDetectionImageToCloudinary = async ({ imageData }) => {
  if (!imageData) {
    return null;
  }

  if (!isCloudinaryConfigured()) {
    return {
      secureUrl: imageData,
      publicId: null,
      storedInCloudinary: false,
      reason: 'Cloudinary env vars not configured',
    };
  }

  const folder = 'organisort/detections';
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildCloudinarySignature(timestamp, folder);

  const uploadForm = new FormData();
  uploadForm.append('file', imageData);
  uploadForm.append('api_key', process.env.CLOUDINARY_API_KEY);
  uploadForm.append('timestamp', timestamp);
  uploadForm.append('folder', folder);
  uploadForm.append('signature', signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

  const response = await axios.post(endpoint, uploadForm, {
    headers: uploadForm.getHeaders(),
    timeout: 30000,
  });

  return {
    secureUrl: response.data.secure_url,
    publicId: response.data.public_id,
    storedInCloudinary: true,
    reason: null,
    metadata: {
      bytes: response.data.bytes,
      format: response.data.format,
      width: response.data.width,
      height: response.data.height,
    },
  };
};

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) {
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

  const destroyForm = new FormData();
  destroyForm.append('public_id', publicId);
  destroyForm.append('api_key', process.env.CLOUDINARY_API_KEY);
  destroyForm.append('timestamp', timestamp);
  destroyForm.append('signature', signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`;

  await axios.post(endpoint, destroyForm, {
    headers: destroyForm.getHeaders(),
    timeout: 15000,
  });
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

    const imageResult = await uploadDetectionImageToCloudinary({
      imageData: annotatedImage,
    });

    const detection = await Detection.create({
      user: req.user.id, // Comes from the 'protect' middleware
      detections,
      annotated_image: imageResult?.secureUrl || '',
      annotated_image_public_id: imageResult?.publicId || null,
      summary,
      image_dimensions: imageDimensions,
    });

    // Return the URL-backed image to clients; keeps response shape stable.
    pythonServiceResponse.annotated_image = imageResult?.secureUrl || '';

    console.log('Detection saved to database:', detection._id, {
      storedInCloudinary: imageResult?.storedInCloudinary,
      cloudinaryPublicId: imageResult?.publicId,
      storageNote: imageResult?.reason,
    });
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
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

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

module.exports = {
  analyzeImage,
  getDetectionHistory,
  getDetectionById,
  deleteDetection,
  getDetectionStats,
  getWasteTypes,
};
