import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'; // Usamos el auth básico
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWDTmylGPSxZee3f_TmZtLyyjM0sie44g",
  authDomain: "eventoscomunitarios-d0cb1.firebaseapp.com",
  projectId: "eventoscomunitarios-d0cb1",
  storageBucket: "eventoscomunitarios-d0cb1.firebasestorage.app",
  messagingSenderId: "975260654276",
  appId: "1:975260654276:web:610a803fe8ba5bf7c98791",
  measurementId: "G-HQFWTTBGPB"
};

// Inicializar App (Singleton para evitar errores de duplicado)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicializar Auth de forma simple (Funciona en Web y Celular sin crashear)
const auth = getAuth(app);

// Inicializar Base de Datos
const db = getFirestore(app);

export { auth, db };
