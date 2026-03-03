const admin = require('firebase-admin');
const path = require('path');

/**
 * Initialize Firebase Admin SDK
 * Reads the service account key from the environment variable or file
 */
const initializeFirebase = () => {
  try {
    let serviceAccount;

    // Option 1: Load from JSON string in environment variable (for cloud deployments)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      console.log('🔑 Firebase credentials loaded from environment variable');
    } else {
      // Option 2: Load from file path
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        || path.join(__dirname, '../serviceAccountKey.json');
      serviceAccount = require(serviceAccountPath);
      console.log('🔑 Firebase credentials loaded from file');
    }

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
