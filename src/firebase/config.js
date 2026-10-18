/**
 * FIREBASE CONFIGURATION
 * ============================================================
 * Conexión a Cloud Firestore (Plan Spark - Gratuito)
 * BD: EliminatoriasFC
 *
 * Las credenciales se inyectan desde .env.local en desarrollo
 * y desde GitHub Secrets en producción (GitHub Pages).
 * ============================================================
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const DEFAULT_PROJECT_ID = 'elimitanoriasfc';
const projectId =
  (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim() || DEFAULT_PROJECT_ID;

const firebaseConfig = {
  apiKey:
    (import.meta.env.VITE_FIREBASE_API_KEY || '').trim() ||
    'AIzaSyA41Ky9LVuhQkAev5v3NfMgPXAKVzupXjE',
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim() ||
    `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket:
    (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim() ||
    `${projectId}.firebasestorage.app`,
  messagingSenderId:
    (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim() ||
    '654742690688',
  appId:
    (import.meta.env.VITE_FIREBASE_APP_ID || '').trim() ||
    '1:654742690688:web:05cfeeea640049dfa03f65',
};

// Inicializar Firebase App
const app = initializeApp(firebaseConfig);

// Inicializar Firestore (conexión directa limpia sin colas de IndexedDB zombi)
export const db = getFirestore(app);

// Inicializar Firebase Authentication y proveedor de Google (100% gratuito en Plan Spark)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Referencia al documento centralizado del torneo.
 * Colección: "tournaments"
 * Documento: "EliminatoriasFC"
 * 
 * Toda la app lee y escribe en este único documento para
 * maximizar eficiencia y mantenerse 100% dentro del plan gratuito.
 */
export const TOURNAMENT_DOC_ID = 'EliminatoriasFC';
export const TOURNAMENT_COLLECTION = 'tournaments';

