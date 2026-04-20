// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate that required config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase configuration!');
  console.error('Missing keys:', missingKeys.join(', '));
  console.error('\n📋 To fix this:');
  console.error('1. Make sure .env file exists in root directory');
  console.error('2. Check that all VITE_FIREBASE_* variables are set');
  console.error('3. Restart the dev server (npm run dev)\n');
  throw new Error('Firebase configuration incomplete. Check console for details.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export your services so you can use them in other files
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;