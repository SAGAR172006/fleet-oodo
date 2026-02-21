const admin = require("firebase-admin");
require("dotenv").config();

// TODO: Place your downloaded serviceAccountKey.json in the backend/ folder
// and uncomment the line below, OR use environment variables as shown.
//
// Option A (local dev only — DO NOT commit serviceAccountKey.json):
//   const serviceAccount = require("./serviceAccountKey.json");
//   admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
//
// Option B (recommended for production — use environment variables):
//   Set these in backend/.env:
//     FIREBASE_PROJECT_ID=your-project-id
//     FIREBASE_CLIENT_EMAIL=your-client-email
//     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "YOUR_CLIENT_EMAIL",
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "YOUR_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();
module.exports = { db };
