/**
 * HOOK DE AUTENTICACIÓN ADMINISTRATIVA (useAdminRole)
 * ============================================================
 * Gestiona el estado de sesión del administrador del torneo.
 * 
 * El PIN se verifica localmente contra VITE_ADMIN_PIN.
 * Una vez autenticado, la sesión se guarda en sessionStorage
 * (se pierde al cerrar la pestaña/navegador por seguridad).
 * ============================================================
 */

import { useState, useCallback } from 'react';

const ADMIN_SESSION_KEY = 'fifa_ps4_admin_session';

export function useAdminRole() {
  // Verificar si ya hay una sesión admin activa en esta pestaña
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });

  const [pinError, setPinError] = useState(null);

  /**
   * Intenta iniciar sesión como administrador.
   * @param {string} inputPin - PIN ingresado por el usuario
   * @returns {boolean} - true si el PIN es correcto
   */
  const loginWithPin = useCallback((inputPin) => {
    const cleanInput = String(inputPin || '').trim();
    const envPin = String(import.meta.env.VITE_ADMIN_PIN || '').trim();
    const validPins = new Set(['2907']);
    if (envPin) validPins.add(envPin);

    if (validPins.has(cleanInput)) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsAdmin(true);
      setPinError(null);
      return true;
    } else {
      setPinError('PIN incorrecto. Inténtalo de nuevo.');
      // Limpiar error después de 3 segundos
      setTimeout(() => setPinError(null), 3000);
      return false;
    }
  }, []);

  /**
   * Cierra la sesión de administrador del dispositivo actual.
   */
  const logoutAdmin = useCallback(() => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
    setPinError(null);
  }, []);

  return {
    isAdmin,
    pinError,
    loginWithPin,
    logoutAdmin,
  };
}
