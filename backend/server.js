require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import configurations
const { initializeFirebase } = require("./config/firebase-config");
const { connectDB } = require("./config/db");

// Import middleware
const { errorHandler } = require("./middleware/error-middleware");
const { protect } = require("./middleware/auth-middleware"); // Use protect middleware

// Import routes
const authRoutes = require("./routes/auth-routes");
const userRoutes = require("./routes/user-routes");

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
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint (no auth required)
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running", timestamp: new Date() });
});

// Test registration endpoint (for debugging)
app.post("/api/test-register", async (req, res) => {
  try {
    console.log('Test registration request:', req.body);
    
    const { email, password, displayName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User with that email already exists' });
    }

    // Create new user
    user = await User.create({
      email,
      password,
      displayName: displayName || '',
    });

    console.log('Test user created successfully:', user._id);

    res.status(201).json({
      success: true,
      message: 'Test user registered successfully',
      data: { _id: user._id, email: user.email, displayName: user.displayName },
    });
  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

// Protected test route
app.get("/api/test", protect, (req, res) => {
  res.json({
    message: "Authentication successful",
    _id: req.user._id, // Use _id consistently
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
