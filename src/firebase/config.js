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
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

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

// Inicializar Firestore
export const db = getFirestore(app);

// Habilitar persistencia offline (IndexedDB) — fallback si no hay conexión
// Permite que la app funcione aunque los amigos pierdan señal momentáneamente
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // La persistencia offline solo funciona en una pestaña a la vez
    console.warn('[Firebase] Persistencia offline no disponible: múltiples pestañas abiertas.');
  } else if (err.code === 'unimplemented') {
    // El navegador no soporta la API requerida
    console.warn('[Firebase] Este navegador no soporta persistencia offline.');
  }
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
