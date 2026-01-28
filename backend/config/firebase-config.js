const admin = require('firebase-admin');
const path = require('path');

/**
 * Initialize Firebase Admin SDK
 * Reads the service account key from the environment variable or file
 */
const initializeFirebase = () => {
  try {
    // Get service account path from environment or use default
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      || path.join(__dirname, '../serviceAccountKey.json');

    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    process.exit(1);
  }
};

/**
 * Get the Firebase Auth instance
 */
const getAuth = () => {
  return admin.auth();
};

module.exports = {
  initializeFirebase,
  getAuth,
};
