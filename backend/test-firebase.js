#!/usr/bin/env node

/**
 * Firebase Connection Test Script
 * 
 * This script tests your Firebase Admin SDK configuration
 * and helps diagnose connection issues.
 */

require("dotenv").config();

console.log("\n🔍 Firebase Connection Diagnostic Tool");
console.log("=".repeat(60));

// Step 1: Check environment variables
console.log("\n📋 Step 1: Checking environment variables...");
console.log(`   FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID || '❌ NOT SET'}`);
console.log(`   FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? '✅ SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : '❌ NOT SET'}`);

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error("\n❌ Missing Firebase credentials in backend/.env");
  console.error("\n📋 To fix:");
  console.error("1. Make sure backend/.env file exists");
  console.error("2. Add these lines:");
  console.error("   FIREBASE_PROJECT_ID=fleet-6a128");
  console.error("   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@fleet-6a128.iam.gserviceaccount.com");
  console.error("   FIREBASE_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n\"");
  console.error("\n3. Or run: node setup-firebase.js\n");
  process.exit(1);
}

// Step 2: Load Firebase Admin SDK
console.log("\n📦 Step 2: Loading Firebase Admin SDK...");
let db, admin;
try {
  const firebaseAdmin = require("./firebase-admin");
  db = firebaseAdmin.db;
  admin = firebaseAdmin.admin;
  console.log("   ✅ Firebase Admin SDK loaded successfully");
} catch (error) {
  console.error("   ❌ Failed to load Firebase Admin SDK");
  console.error(`   Error: ${error.message}`);
  console.error("\n📋 To fix:");
  console.error("1. Check that backend/.env has correct credentials");
  console.error("2. Make sure firebase-admin package is installed: npm install");
  console.error("3. Check for syntax errors in backend/.env\n");
  process.exit(1);
}

// Step 3: Test Firestore connection
console.log("\n🔌 Step 3: Testing Firestore connection...");
(async () => {
  try {
    // Try to write a test document
    const testRef = db.collection("_connection_test").doc("_test");
    await testRef.set({
      test: true,
      timestamp: new Date().toISOString(),
      message: "Connection test successful"
    });
    console.log("   ✅ Write test successful");

    // Try to read it back
    const doc = await testRef.get();
    if (doc.exists) {
      console.log("   ✅ Read test successful");
      console.log(`   Data: ${JSON.stringify(doc.data())}`);
    } else {
      console.log("   ⚠️  Document not found after write");
    }

    // Clean up
    await testRef.delete();
    console.log("   ✅ Delete test successful");

    // Step 4: Check collections
    console.log("\n📊 Step 4: Checking existing collections...");
    const collections = await db.listCollections();
    if (collections.length === 0) {
      console.log("   ℹ️  No collections found (database is empty)");
    } else {
      console.log(`   ✅ Found ${collections.length} collection(s):`);
      for (const col of collections) {
        const snapshot = await col.limit(1).get();
        console.log(`      - ${col.id} (${snapshot.size} document${snapshot.size !== 1 ? 's' : ''})`);
      }
    }

    // Step 5: Check for existing users
    console.log("\n👤 Step 5: Checking for existing users...");
    const usersSnapshot = await db.collection("users")
      .where("businessKey", "==", "BK-DEMO-999")
      .get();
    
    if (usersSnapshot.empty) {
      console.log("   ℹ️  No demo users found (database needs seeding)");
    } else {
      console.log(`   ✅ Found ${usersSnapshot.size} demo user(s):`);
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`      - ${data.username} (${data.userId}) - ${data.role}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests passed! Firebase is configured correctly.");
    console.log("\n📋 Next steps:");
    if (usersSnapshot.empty) {
      console.log("   1. Run: npm run seed");
      console.log("   2. Login at http://localhost:5173");
      console.log("      User ID: alice-mgr");
      console.log("      Password: demo1234");
      console.log("      Role: Fleet Manager");
    } else {
      console.log("   1. Start backend: npm start");
      console.log("   2. Start frontend: npm run dev (in root folder)");
      console.log("   3. Login at http://localhost:5173");
    }
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("   ❌ Firestore connection failed");
    console.error(`   Error: ${error.message}`);
    
    console.error("\n📋 Common issues and solutions:");
    console.error("\n1. Firestore Database not enabled:");
    console.error("   → Go to https://console.firebase.google.com/");
    console.error("   → Select project: fleet-6a128");
    console.error("   → Click 'Firestore Database' in left sidebar");
    console.error("   → If you see 'Create database' button, click it");
    console.error("   → Choose 'Start in test mode' (for development)");
    console.error("   → Select a location (closest to you)");
    console.error("   → Click 'Enable'");
    
    console.error("\n2. Wrong project ID:");
    console.error("   → Check that FIREBASE_PROJECT_ID in backend/.env matches your Firebase project");
    console.error("   → Current: " + process.env.FIREBASE_PROJECT_ID);
    
    console.error("\n3. Invalid credentials:");
    console.error("   → Re-download service account key from Firebase Console");
    console.error("   → Run: node setup-firebase.js");
    
    console.error("\n4. Network/Firewall issues:");
    console.error("   → Check internet connection");
    console.error("   → Check if firewall blocks firestore.googleapis.com");
    
    console.error("\n5. Insufficient permissions:");
    console.error("   → Make sure service account has 'Cloud Datastore User' role");
    console.error("   → Check Firebase Console → Project Settings → Service Accounts");
    
    if (error.code) {
      console.error(`\nError code: ${error.code}`);
    }
    
    console.error("\nFull error details:");
    console.error(error);
    console.error("");
    
    process.exit(1);
  }
})();
