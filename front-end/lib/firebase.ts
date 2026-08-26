import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3Tjefzcy-YxOr3c8YJ91HhH8AO3r1LuY",
  authDomain: "combogoponto.firebaseapp.com",
  projectId: "combogoponto",
  storageBucket: "combogoponto.firebasestorage.app",
  messagingSenderId: "20657185811",
  appId: "1:20657185811:web:21b6111d7a29b370a20be6",
  measurementId: "G-BJZKEBN9FH"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
