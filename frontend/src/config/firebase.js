// MediBook Hospital Appointment Booking System - Firebase Configuration & Services
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBCdYwXa4NbWDBqdqj7-OrebLR2A-XZHe0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hospital-management-673c8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hospital-management-673c8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hospital-management-673c8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "938020815416",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:938020815416:web:5217ab2205383c68315ccd"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore Database
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
};

export default app;
