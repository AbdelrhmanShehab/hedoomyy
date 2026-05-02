import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import type { Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCQa6Nx0YPRM6v4A9-mXlIFP0-Gw_MSPCg",
  authDomain: "hedoomyy.firebaseapp.com",
  projectId: "hedoomyy",
  storageBucket: "gs://hedoomyy.firebasestorage.app",
  messagingSenderId: "298566845163",
  appId: "1:298566845163:web:5c284e9ce1f53bc33474ae",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🔐 Auth & Storage (Safe for client)
export const auth = getAuth(app);
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
