// contexts/authContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { db, auth } from "../config/firebase"; // ✅ use db instead of firestore
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

// 1. Create Context
const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // 2. Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // 🔑 Fetch Firestore data for this user
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUser({ uid: firebaseUser.uid, ...docSnap.data() });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || "",
            });
          }
        } else {
          setUser(null);
          router.replace("/(auth)/welcome");
        }
      } catch (err) {
        console.log("Auth error:", err);
        setUser(null);
        router.replace("/(auth)/welcome");
      }
    });

    return () => unsub();
  }, []);

  // 3. Login
  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);

      const docRef = doc(db, "users", response.user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUser({ uid: response.user.uid, ...docSnap.data() });
      } else {
        setUser({
          uid: response.user.uid,
          email: response.user.email,
          name: response.user.displayName || "",
        });
      }

      return { success: true };
    } catch (error) {
      console.log("❌ Login error:", error.message);
      return { success: false, msg: error.message };
    }
  };

  // 4. Register
  const register = async (email, password, name) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", response.user.uid), {
        uid: response.user.uid,
        name,
        email,
      });

      setUser({ uid: response.user.uid, name, email });

      return { success: true };
    } catch (error) {
      console.log("❌ Register error:", error.message);
      return { success: false, msg: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
