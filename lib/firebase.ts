import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// 🔑 Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQa6Nx0YPRM6v4A9-mXlIFP0-Gw_MSPCg",
  authDomain: "hedoomyy.firebaseapp.com",
  projectId: "hedoomyy",
  storageBucket: "gs://hedoomyy.firebasestorage.app",
  messagingSenderId: "298566845163",
  appId: "1:298566845163:web:5c284e9ce1f53bc33474ae",
};

// ✅ Prevent multiple initializations (Next.js)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🔐 Auth
export const auth = getAuth(app);

// 🗄️ Firestore
export const db = getFirestore(app);
// 📦 Storage
export const storage = getStorage(app);
