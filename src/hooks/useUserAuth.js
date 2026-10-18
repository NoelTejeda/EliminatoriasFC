/**
 * HOOK DE AUTENTICACIÓN DE USUARIO CON GOOGLE (useUserAuth)
 * ============================================================
 * Gestiona la sesión individual del jugador mediante Firebase
 * Authentication (Google Sign-In, 100% gratuito en el Plan Spark).
 *
 * Incluye además soporte resiliente (Fallback / Simulador Local)
 * en caso de que el proveedor Google aún no esté habilitado en
 * Firebase Console o se esté probando sin conexión.
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

const DEMO_USER_STORAGE_KEY = 'fifa_ps4_google_demo_user_v1';

export function useUserAuth() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      return savedDemo ? JSON.parse(savedDemo) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Escuchar el estado real de Firebase Auth
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (firebaseUser) {
            const normalizedUser = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Jugador',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || null,
              isDemoAccount: false,
            };
            setCurrentUser(normalizedUser);
            localStorage.removeItem(DEMO_USER_STORAGE_KEY);
          } else {
            // Si no hay sesión real en Firebase, verificar si hay cuenta simulada activa
            try {
              const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
              setCurrentUser(savedDemo ? JSON.parse(savedDemo) : null);
            } catch {
              setCurrentUser(null);
            }
          }
          setAuthLoading(false);
        },
        (error) => {
          console.warn('[useUserAuth] Error en listener de Auth:', error);
          setAuthLoading(false);
        }
      );
    } catch (err) {
      console.warn('[useUserAuth] No se pudo inicializar Firebase Auth:', err);
      setAuthLoading(false);
    }

    return () => unsubscribe();
  }, []);

  /**
   * Inicia sesión con el popup oficial de Google
   */
  const loginWithGoogle = useCallback(async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const normalizedUser = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Jugador',
        email: user.email || '',
        photoURL: user.photoURL || null,
        isDemoAccount: false,
      };
      setCurrentUser(normalizedUser);
      setAuthLoading(false);
      return { success: true, user: normalizedUser };
    } catch (error) {
      setAuthLoading(false);
      console.error('[useUserAuth] Error al iniciar sesión con Google:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Cerraste la ventana de inicio de sesión antes de completar.');
      } else if (
        error.code === 'auth/operation-not-allowed' ||
        error.code === 'auth/configuration-not-found'
      ) {
        setAuthError(
          'El proveedor de Google aún no está activado en tu consola de Firebase (Authentication > Sign-in method > Google). Puedes activarlo gratis en 1 clic o usar el acceso rápido de prueba.'
        );
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError(
          'Este dominio no está autorizado en Firebase Auth. Agrégalo en Firebase Console > Authentication > Settings > Authorized domains.'
        );
      } else {
        setAuthError(error.message || 'No se pudo conectar con Google Auth.');
      }
      return { success: false, error };
    }
  }, []);

  /**
   * Permite simular/crear una sesión tipo Google localmente para pruebas rápidas
   * sin depender de la configuración externa de Firebase Console
   */
  const loginWithQuickProfile = useCallback((name, email = '') => {
    const cleanName = String(name || '').trim();
    if (!cleanName) return { success: false };

    const cleanEmail =
      String(email || '').trim().toLowerCase() ||
      `${cleanName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

    // Generar un UID determinístico por email para mantener el mismo perfil en pruebas
    const safeSlug = cleanEmail.replace(/[^a-z0-9]/g, '_');
    const demoUser = {
      uid: `google_local_${safeSlug}`,
      displayName: cleanName,
      email: cleanEmail,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        cleanName
      )}&background=00f59b&color=080c14&bold=true`,
      isDemoAccount: true,
    };

    try {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    } catch {
      /* ignore */
    }
    setCurrentUser(demoUser);
    setAuthError(null);
    return { success: true, user: demoUser };
  }, []);

  /**
   * Cierra la sesión de Google (y limpia cualquier sesión local)
   */
  const logoutUser = useCallback(async () => {
    try {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      await signOut(auth);
    } catch (err) {
      console.warn('[useUserAuth] Error al cerrar sesión:', err);
    } finally {
      setCurrentUser(null);
      setAuthError(null);
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return {
    currentUser,
    authLoading,
    authError,
    loginWithGoogle,
    loginWithQuickProfile,
    logoutUser,
    clearAuthError,
  };
}
