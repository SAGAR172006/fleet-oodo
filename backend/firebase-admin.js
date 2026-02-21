const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, "fleet-33608-f60c8e3dd340.json");

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "fleet-33608",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          : undefined,
      }),
    });
  }
}

const db = admin.firestore();
module.exports = { db, admin };
