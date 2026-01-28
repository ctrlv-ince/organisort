const { getAuth } = require('../config/firebase-config');

/**
 * Middleware to verify Firebase Bearer token
 * Attaches decoded token to req.user
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Extract authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.slice(7);

    // Verify token with Firebase
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);

    // Attach decoded token to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      emailVerified: decodedToken.email_verified || false,
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

module.exports = {
  verifyFirebaseToken,
};
