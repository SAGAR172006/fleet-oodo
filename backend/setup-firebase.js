#!/usr/bin/env node

/**
 * Firebase Setup Helper Script
 * 
 * This script helps you configure Firebase Admin SDK credentials
 * by extracting values from a service account JSON file.
 * 
 * Usage:
 *   1. Download your service account key from Firebase Console
 *   2. Save it as backend/serviceAccountKey.json
 *   3. Run: node setup-firebase.js
 *   4. Copy the output to your backend/.env file
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 Firebase Admin SDK Setup Helper\n');
console.log('═'.repeat(60));

// Look for service account key file
const possiblePaths = [
  path.join(__dirname, 'serviceAccountKey.json'),
  path.join(__dirname, 'fleet-33608-f60c8e3dd340.json'),
  path.join(__dirname, 'firebase-service-account.json'),
];

let serviceAccountPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    serviceAccountPath = p;
    break;
  }
}

if (!serviceAccountPath) {
  console.error('❌ No service account key file found!\n');
  console.log('📋 To get your Firebase service account key:\n');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select your project');
  console.log('3. Click the gear icon → Project Settings');
  console.log('4. Go to "Service Accounts" tab');
  console.log('5. Click "Generate New Private Key"');
  console.log('6. Save the downloaded file as:');
  console.log('   backend/serviceAccountKey.json\n');
  console.log('Then run this script again: node setup-firebase.js\n');
  process.exit(1);
}

try {
  console.log(`✅ Found service account key: ${path.basename(serviceAccountPath)}\n`);
  
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
  
  console.log('📝 Add these lines to your backend/.env file:\n');
  console.log('─'.repeat(60));
  console.log(`FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log(`FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  console.log(`FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"`);
  console.log('─'.repeat(60));
  console.log('\n✅ Setup complete! Your backend should now work.\n');
  
  // Optionally write to .env file
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('💡 Would you like to automatically update backend/.env?');
    console.log('   (This will append the Firebase credentials to your .env file)');
    console.log('\n   To do this manually, copy the lines above to backend/.env\n');
  }
  
} catch (error) {
  console.error('❌ Error reading service account key:', error.message);
  console.log('\nMake sure the JSON file is valid and not corrupted.\n');
  process.exit(1);
}
