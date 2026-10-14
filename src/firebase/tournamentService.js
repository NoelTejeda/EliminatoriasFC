/**
 * SERVICIO DE FIRESTORE - TORNEO ELIMINATORIAS
 * ============================================================
 * Centraliza toda la lógica de lectura y escritura en Firestore.
 * El resto de la app SOLO interactúa con estas funciones,
 * nunca directamente con el SDK de Firebase.
 * ============================================================
 */

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, TOURNAMENT_DOC_ID, TOURNAMENT_COLLECTION } from './config';

/**
 * Retorna la referencia al documento centralizado del torneo.
 */
const getTournamentRef = () =>
  doc(db, TOURNAMENT_COLLECTION, TOURNAMENT_DOC_ID);

/**
 * LECTURA INICIAL (una sola vez)
 * Obtiene el estado actual del torneo desde Firestore.
 * Retorna null si el documento aún no existe (primera vez).
 */
export async function fetchTournamentOnce() {
  try {
    const docSnap = await getDoc(getTournamentRef());
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('[Firestore] Error al leer el torneo:', error);
    return null;
  }
}

/**
 * LISTENER EN TIEMPO REAL (onSnapshot)
 * Suscribe a cambios en el documento del torneo.
 * Cada vez que el Admin guarda un gol o actualiza asistencia,
 * esta función notifica a TODOS los clientes conectados al instante.
 *
 * @param {Function} onUpdate  - Callback con los datos actualizados
 * @param {Function} onError   - Callback en caso de error de conexión
 * @returns {Function} unsubscribe - Función para cancelar la suscripción
 */
export function subscribeTournament(onUpdate, onError) {
  return onSnapshot(
    getTournamentRef(),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      } else {
        // Documento no existe todavía (torneo no inicializado en la nube)
        onUpdate(null);
      }
    },
    (error) => {
      console.error('[Firestore] Error en listener de tiempo real:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * ESCRITURA COMPLETA DEL ESTADO DEL TORNEO
 * Reemplaza o crea el documento centralizado con el estado actual completo.
 * Se llama al:
 *  - Confirmar participantes y generar fixture (primera escritura)
 *  - Reiniciar el torneo completo
 *
 * @param {Object} tournamentData - Estado completo del torneo
 * @param {string} updatedBy - Identificador del rol que escribe ('admin')
 */
export async function saveTournamentState(tournamentData, updatedBy = 'admin') {
  try {
    await setDoc(getTournamentRef(), {
      ...tournamentData,
      updatedAt: serverTimestamp(),
      updatedBy,
    });
    return true;
  } catch (error) {
    console.error('[Firestore] Error al guardar estado del torneo:', error);
    return false;
  }
}

/**
 * ACTUALIZACIÓN PARCIAL (Merge)
 * Actualiza solo los campos especificados sin sobreescribir todo el documento.
 * Se usa para operaciones frecuentes y ligeras:
 *  - Guardar el resultado de un partido (actualizar array matches)
 *  - Actualizar la asistencia del día (presentPlayerIds)
 *
 * @param {Object} partialData - Campos a actualizar en el documento
 * @param {string} updatedBy - Identificador del rol que escribe
 */
export async function updateTournamentFields(partialData, updatedBy = 'admin') {
  try {
    // Usamos setDoc con merge:true para actualización parcial eficiente
    await setDoc(
      getTournamentRef(),
      {
        ...partialData,
        updatedAt: serverTimestamp(),
        updatedBy,
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('[Firestore] Error al actualizar campos del torneo:', error);
    return false;
  }
}
