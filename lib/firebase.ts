import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { Messaging } from "firebase/messaging";
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
const isAlreadyInitialized = getApps().length > 0;
const app = isAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);

// 🔐 Auth
export const auth = getAuth(app);

// 🗄️ Firestore
let dbInstance;
if (isAlreadyInitialized) {
  dbInstance = getFirestore(app);
} else {
  if (typeof window !== "undefined") {
    try {
      dbInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    } catch (e) {
      console.warn("Firestore cache failed:", e);
      dbInstance = getFirestore(app);
    }
  } else {
    dbInstance = getFirestore(app);
  }
}
export const db = dbInstance;
// 📦 Storage
export const storage = getStorage(app);

let messaging: Messaging | null = null;

if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn("Firebase messaging not supported:", error);
  }
}

export { messaging };
