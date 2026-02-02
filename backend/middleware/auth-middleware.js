const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Lazy load Firebase Auth to avoid initialization issues
let admin = null;

const getFirebaseAuth = () => {
  if (!admin) {
    const { getAuth } = require("../config/firebase-config");
    admin = getAuth();
  }
  return admin;
};

/**
 * Middleware to protect routes
 * Verifies custom JWT (for email/password users).
 * Attaches user details (from MongoDB) to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify the custom JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user in MongoDB by _id
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: "User not found" 
        });
      }

      // Ensure _id is a string for consistency
      user._id = user._id.toString();
      
      // Attach user to request object
      req.user = user;
      return next();

    } catch (error) {
      console.error("JWT verification failed:", error.message);
      return res.status(401).json({ 
        success: false, 
        error: "Not authorized, token failed" 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: "Not authorized, no token" 
    });
  }
};

/**
 * Unified authentication middleware that handles both Firebase and custom JWT tokens.
 *
 * This middleware first attempts to verify the token as a Firebase ID token.
 * If Firebase verification fails, it proceeds to verify it as a custom JWT.
 * This allows for a single authentication middleware to handle both user types.
 */
const unifiedAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header with Bearer token is required',
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // First, try to verify as a Firebase token
    const firebaseAuth = getFirebaseAuth();
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    // If Firebase token is valid, attach user info and proceed
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.displayName,
      photoURL: decodedToken.picture,
      emailVerified: decodedToken.email_verified || false,
      isFirebase: true, // Flag to indicate Firebase user
    };
    return next();
  } catch (firebaseError) {
    // If Firebase verification fails, try to verify as a custom JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
        });
      }

      req.user = {
        ...user.toObject(),
        isFirebase: false, // Flag to indicate non-Firebase user
      };
      return next();
    } catch (jwtError) {
      // If both verifications fail, return an error
      console.error('Unified auth failed:', {
        firebaseError: firebaseError.message,
        jwtError: jwtError.message,
      });
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed',
      });
    }
  }
};

module.exports = {
  protect,
  unifiedAuth,
};
