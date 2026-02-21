import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace placeholder values with your actual Firebase config
// You can find these in Firebase Console -> Project Settings -> Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyBwvUI61XXmTLWvR0iUzSgXH4leeCS4aQk",
  authDomain: "fleet-33608.firebaseapp.com",
  projectId: "fleet-33608",
  storageBucket: "fleet-33608.firebasestorage.app",
  messagingSenderId: "14302289624",
  appId: "1:14302289624:web:53bbc2084d9b5a44ec01ad",
  measurementId: "G-458KN9FCP3"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
