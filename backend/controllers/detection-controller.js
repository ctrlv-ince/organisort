const asyncHandler = require('express-async-handler');
const axios = require('axios');
const FormData = require('form-data');

// @desc    Analyze an image for waste detection
// @route   POST /api/detections/analyze
// @access  Private
const analyzeImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  // Forward the image to the Python service
  const form = new FormData();
  form.append('image', req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype,
  });

  try {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5001/detect';
    const response = await axios.post(pythonServiceUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    // Forward the response from the Python service to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding request to Python service:', error.message);
    res.status(500).json({
      message: 'Failed to process image',
      error: error.message,
    });
  }
});

module.exports = {
  analyzeImage,
};
