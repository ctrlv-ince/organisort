require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const { buildPythonServiceUrl } = require("./utils/python-service-url");

// Import configurations
const { initializeFirebase } = require("./config/firebase-config");
const { connectDB } = require("./config/db");

// Import middleware
const { errorHandler } = require("./middleware/error-middleware");
const { logActivity, logErrorActivity } = require("./middleware/activity-log-middleware");

// Import routes
const authRoutes = require("./routes/auth-routes");
const userRoutes = require("./routes/user-routes");
const detectionRoutes = require("./routes/detection-routes");
const activityLogRoutes = require("./routes/activity-log-routes");

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

// Activity logging middleware (add EARLY, before routes)
app.use(logActivity);

// Health check handler for admin dashboard and service monitors
const healthCheckHandler = async (_req, res) => {
  const pythonServiceHealthUrl = buildPythonServiceUrl("/health");

  const backendApi = {
    label: "Backend API",
    status: "ACTIVE",
    healthy: true,
  };

  const database = {
    label: "Database",
    status: mongoose.connection.readyState === 1 ? "SYNCED" : "DISCONNECTED",
    healthy: mongoose.connection.readyState === 1,
  };

  let pythonAiService = {
    label: "Python AI Service",
    status: "INACTIVE",
    healthy: false,
  };

  try {
    const response = await axios.get(pythonServiceHealthUrl, { timeout: 3000 });

    if (response.status === 200) {
      pythonAiService = {
        label: "Python AI Service",
        status: "ACTIVE",
        healthy: true,
      };
    }
  } catch (error) {
    console.warn("⚠️ Python AI service health check failed:", error.message);
  }

  res.json({
    updatedAt: new Date().toISOString(),
    services: [backendApi, pythonAiService, database],
  });
};

// Health check routes
app.get("/api/health", healthCheckHandler);
app.get("/health", healthCheckHandler);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/detections", detectionRoutes);
app.use("/api/activity-logs", activityLogRoutes);

// Error logging middleware (before error handler)
app.use(logErrorActivity);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
