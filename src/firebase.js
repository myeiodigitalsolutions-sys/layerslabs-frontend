// src/firebase.js
// Firebase v9 modular setup - update with your config
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
   apiKey: "AIzaSyDOlRICZjrJu7xQTEE1ZfwInp0ZmWH8Wlw",
  authDomain: "layerlabs-e738e.firebaseapp.com",
  projectId: "layerlabs-e738e",
  storageBucket: "layerlabs-e738e.firebasestorage.app",
  messagingSenderId: "422346416230",
  appId: "1:422346416230:web:e7b3219ed4dd03efff8da7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


