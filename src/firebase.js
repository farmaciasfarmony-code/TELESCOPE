// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Importa los servicios que necesites (ejemplo: Auth)
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// TU CONFIGURACIÓN DE FIREBASE (LEYENDO DESDE EL ARCHIVO .env.local)
// Las variables se acceden usando import.meta.env y el prefijo VITE_
const firebaseConfig = {
  // Las claves se leen de VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios que uses en tu app
export const auth = getAuth(app); 

// --- CREAR Y EXPORTAR PROVEEDORES DE AUTENTICACIÓN ---
// Esto es lo que faltaba para resolver el error 'facebookProvider'
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Si usas Firestore, descomenta la siguiente línea y su importación:
// import { getFirestore } from "firebase/firestore";
// export const db = getFirestore(app);

export default app;