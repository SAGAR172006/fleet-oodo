const admin = require("firebase-admin");
require("dotenv").config();

if (!admin.apps.length) {
  // Use environment variables for Firebase Admin SDK
  // This is more secure and works in all environments
  const projectId = process.env.FIREBASE_PROJECT_ID || "fleet-33608";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    // Initialize with environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase Admin initialized with environment variables");
  } else {
    // Fallback: Initialize with application default credentials
    // This works if you have gcloud CLI configured or running on Google Cloud
    try {
      admin.initializeApp({
        projectId,
      });
      console.log("✅ Firebase Admin initialized with default credentials");
    } catch (error) {
      console.error("❌ Firebase Admin initialization failed:", error.message);
      console.error("\n📋 To fix this, you need to:");
      console.error("1. Go to https://console.firebase.google.com/");
      console.error("2. Select your project: fleet-33608");
      console.error("3. Go to Project Settings → Service Accounts");
      console.error("4. Click 'Generate New Private Key'");
      console.error("5. Open the downloaded JSON file");
      console.error("6. Add these to backend/.env:");
      console.error("   FIREBASE_PROJECT_ID=<project_id from JSON>");
      console.error("   FIREBASE_CLIENT_EMAIL=<client_email from JSON>");
      console.error("   FIREBASE_PRIVATE_KEY=\"<private_key from JSON>\"");
      console.error("\nOr run: npm run setup-firebase\n");
      throw error;
    }
  }
}

const db = admin.firestore();
module.exports = { db, admin };
