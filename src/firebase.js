// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TU CONFIGURACIÓN DE FIREBASE (LEYENDO DESDE EL ARCHIVO .env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase (Instancia Principal - Clientes)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar Firebase (Instancia Secundaria - Admin)
// Esto permite tener dos sesiones activas diferentes (cliente y admin)
const adminApp = !getApps().some(app => app.name === 'AdminApp')
  ? initializeApp(firebaseConfig, 'AdminApp')
  : getApp('AdminApp');

// Exportar servicios
export const auth = getAuth(app); // Auth para clientes
export const adminAuth = getAuth(adminApp); // Auth para administradores
export const db = getFirestore(app);
export const adminDb = getFirestore(adminApp); // Base de datos usando credenciales de Admin
export const storage = getStorage(app);

// Proveedores de autenticación
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export default app;