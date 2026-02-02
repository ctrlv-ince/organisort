/**
 * Centralized error handling middleware
 * Must be registered as the last middleware in server.js
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  console.error('❌ Error name:', err.name);
  console.error('❌ Error code:', err.code);
  console.error('❌ Error stack:', err.stack);

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error: ' + Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date(),
  });
};

module.exports = {
  errorHandler,
};
