├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── firebase-config.js
│   ├── controllers/
│   │   ├── activity-log-controller.js
│   │   ├── auth-controller.js
│   │   ├── detection-controller.js
│   │   └── user-controller.js
│   ├── middleware/
│   │   ├── activity-log-middleware.js
│   │   ├── auth-middleware.js
│   │   └── error-middleware.js
│   ├── models/
│   │   ├── ActivityLog.js
│   │   ├── Detection.js
│   │   └── User.js
│   ├── python-service/
│   │   ├── app.py
│   │   ├── best.pt
│   │   ├── bestv2.pt
│   │   ├── bestv3.pt
│   │   └── requirements.txt
│   ├── routes/
│   │   ├── activity-log-routes.js
│   │   ├── auth-routes.js
│   │   ├── detection-routes.js
│   │   └── user-routes.js
│   ├── scripts/
│   │   └── create-admin.js
│   ├── utils/
│   │   └── jwt.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── mobile/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── _layout.jsx
│   │   │   ├── admin.jsx
│   │   │   ├── history.jsx
│   │   │   └── index.jsx
│   │   ├── (auth)/
│   │   │   ├── _layout.jsx
│   │   │   ├── login.jsx
│   │   │   └── register.jsx
│   │   └── _layout.jsx
│   ├── assets/
│   │   ├── adaptive-icon.png
│   │   ├── favicon.png
│   │   ├── icon.png
│   │   └── splash.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminProtectedScreen.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedScreen.jsx
│   │   ├── config/
│   │   │   └── firebaseConfig.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── utils/
│   │       ├── apiClient.js
│   │       └── env.js
│   ├── .env.example
│   ├── .gitignore
│   ├── app.json
│   ├── babel.config.js
│   ├── eas.json
│   ├── jsconfig.json
│   └── package.json
├── webapp/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── config/
│   │   │   └── firebaseConfig.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── ActivityLogs.jsx
│   │   │   │   ├── AnalyticsPage.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── DetectionsPage.jsx
│   │   │   │   ├── ReportsPage.jsx
│   │   │   │   ├── UsersPage.jsx
│   │   │   │   └── WasteCategoriesPage.jsx
│   │   │   ├── user/
│   │   │   │   ├── Achievements.jsx
│   │   │   │   ├── Leaderboard.jsx
│   │   │   │   ├── MyDetections.jsx
│   │   │   │   ├── ScanWaste.jsx
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   ├── UserHome.jsx
│   │   │   │   ├── UserProfile.jsx
│   │   │   │   └── UserSettings.jsx
│   │   │   ├── Index.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── Landing.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── tailwind.config.js
│   └── vite.config.js
└── .gitignore
