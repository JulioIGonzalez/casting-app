import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAQfeFveLCB8peIwPxBGHmXnIIPJEh6id8",
  authDomain: "casting-app-75340.firebaseapp.com",
  projectId: "casting-app-75340",
  storageBucket: "casting-app-75340.firebasestorage.app",
  messagingSenderId: "75560099826",
  appId: "1:75560099826:web:e8d091a3441cbd3a3c156b",
  measurementId: "G-2HBJXVNH2Q"
};

// Inicializar Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exportar los servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;