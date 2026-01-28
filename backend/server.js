require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import configurations
const { initializeFirebase } = require('./config/firebase-config');
const { connectDB } = require('./config/db');

// Import middleware
const { errorHandler } = require('./middleware/error-middleware');
const { verifyFirebaseToken } = require('./middleware/auth-middleware');

// Import routes
const authRoutes = require('./routes/auth-routes');

// Initialize Firebase
initializeFirebase();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// Protected test route
app.get('/api/test', verifyFirebaseToken, (req, res) => {
  res.json({
    message: 'Authentication successful',
    uid: req.user.uid,
    email: req.user.email,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
