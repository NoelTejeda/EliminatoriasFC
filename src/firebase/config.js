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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase App
const app = initializeApp(firebaseConfig);

// Inicializar Firestore (conexión directa limpia sin colas de IndexedDB zombi)
export const db = getFirestore(app);

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
