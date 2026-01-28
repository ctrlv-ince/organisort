# Capstone Backend - MVC Architecture

Professional Node.js/Express backend with Firebase authentication and MongoDB integration.

## 📁 Directory Structure

```
capstone-backend/
├── config/
│   ├── firebase-config.js      # Firebase Admin initialization
│   └── db.js                   # MongoDB connection
├── middleware/
│   ├── auth-middleware.js      # Firebase token verification
│   └── error-middleware.js     # Centralized error handling
├── models/
│   └── User.js                 # User schema (Firebase UID as _id)
├── controllers/
│   └── auth-controller.js      # Auth business logic
├── routes/
│   └── auth-routes.js          # Auth API endpoints
├── utils/                      # Utility functions (future)
├── server.js                   # Entry point
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Setup & Installation

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `serviceAccountKey.json` in the root directory

⚠️ **IMPORTANT**: Never commit `serviceAccountKey.json` to version control!

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Navigate to **Clusters** > **Connect**
4. Get your connection string
5. Create `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/capstone-db?retryWrites=true&w=majority
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server runs on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```
No authentication required. Returns server status.

### Test Protected Route
```http
GET /api/test
Authorization: Bearer <firebase_id_token>
```
Verifies Firebase token and returns user UID.

### Auth Endpoints

#### Sync Firebase User to MongoDB
```http
POST /api/auth/sync
Content-Type: application/json

{
  "uid": "firebase_uid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "emailVerified": true
}
```

#### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <firebase_id_token>
```

#### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer <firebase_id_token>
Content-Type: application/json

{
  "displayName": "New Name",
  "photoURL": "https://..."
}
```

## 🔐 Authentication Flow

1. User signs up/logs in with Firebase (client-side)
2. Firebase returns an ID token
3. Client sends POST to `/api/auth/sync` with user data
4. User is created/updated in MongoDB
5. For protected routes, client sends ID token in Authorization header
6. `verifyFirebaseToken` middleware validates token and attaches `req.user`

## 🏗️ Architecture Highlights

- **MVC Pattern**: Separation of concerns with controllers, models, and routes
- **Firebase Auth**: No passwords stored in MongoDB
- **MongoDB**: User data with Firebase UID as document ID
- **Error Handling**: Centralized middleware for consistent error responses
- **Environment Variables**: All sensitive data in `.env`
- **Scalable**: Easy to add new models, controllers, and routes

## 📝 User Model

The `User` model uses Firebase UID as the document `_id`:

```javascript
{
  _id: "firebase_uid",           // String - Firebase UID
  email: "user@example.com",      // String - Unique
  displayName: "John Doe",        // String
  photoURL: "https://...",        // String or null
  emailVerified: true,            // Boolean
  isActive: true,                 // Boolean
  createdAt: "2024-01-28T...",    // Timestamp
  updatedAt: "2024-01-28T..."     // Timestamp
}
```

## 🔄 Next Steps

Once infrastructure is confirmed working:
1. Add waste detection models
2. Implement image upload to cloud storage
3. Add waste detection API endpoints
4. Create frontend React app to consume API

## 📚 Technologies

- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Authentication**: Firebase Admin SDK
- **Database**: MongoDB + Mongoose
- **Environment**: dotenv
- **CORS**: cors package

## 🛠️ Development

- `npm run dev` - Start with hot reload (nodemon)
- `npm start` - Start production server
- Check logs for initialization status (Firebase, MongoDB)

---

**Happy coding! 🎉**
