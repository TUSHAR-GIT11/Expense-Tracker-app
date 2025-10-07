// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyClOZ0u_3FFWDdbu5Kxfvq2ElRMOvWpCEA",
  authDomain: "expense-tracker-79b62.firebaseapp.com",
  projectId: "expense-tracker-79b62",
  storageBucket: "expense-tracker-79b62.appspot.com",
  messagingSenderId: "415956492023",
  appId: "1:415956492023:web:d180591c8352ade1347df2",
  measurementId: "G-GPQ9HRB4ED",
};

// ✅ Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Initialize Auth (React Native + AsyncStorage)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Firestore (export as db)
const db = getFirestore(app);

// ✅ Storage
const storage = getStorage(app);

export { app, auth, db, storage };
