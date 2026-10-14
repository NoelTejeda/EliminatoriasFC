/**
 * HOOK PRINCIPAL DE TORNEO CON FIREBASE FIRESTORE
 * ============================================================
 * Gestiona todo el estado del torneo con sincronización en tiempo
 * real a través de Firestore (Plan Spark - Gratuito).
 *
 * Estrategia de datos:
 * - 1 documento único en Firestore para todo el torneo
 * - onSnapshot para recibir actualizaciones en tiempo real
 * - localStorage como fallback si Firestore no está disponible
 * - Escrituras solo cuando isAdmin === true
 * ============================================================
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { generateCompleteFixture } from '../data/mockTournamentData';
import {
  calculateLeaderboard,
  getAvailableMatchesForPresent,
  getTournamentSummary,
} from '../utils/tournamentCalculations';
import {
  subscribeTournament,
  saveTournamentState,
  updateTournamentFields,
} from '../firebase/tournamentService';

// Claves de localStorage como fallback cuando Firestore no responde
const LS_KEY = 'fifa_ps4_local_fallback_v1';

/**
 * Lee el estado guardado en localStorage como fallback
 */
function loadLocalFallback() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda el estado en localStorage como fallback
 */
function saveLocalFallback(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded o error — ignorar */
  }
}

export function useTournament(isAdmin = false) {
  // ── Estado del Torneo ─────────────────────────────────────
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [presentPlayerIds, setPresentPlayerIds] = useState([]);
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);

  // ── Estado de Conexión a Firebase ─────────────────────────
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── UI State ──────────────────────────────────────────────
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Ref para evitar bucles de escritura durante actualizaciones de onSnapshot
  const isRemoteUpdate = useRef(false);

  // ── Toast ─────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  // ── Aplicar datos recibidos de Firestore ──────────────────
  const applyRemoteData = useCallback((data) => {
    if (!data) return;
    isRemoteUpdate.current = true;
    setPlayers(data.players || []);
    setMatches(data.matches || []);
    setPresentPlayerIds(data.presentPlayerIds || []);
    setIsTournamentStarted(data.isTournamentStarted || false);
    // Guardar copia local como fallback
    saveLocalFallback(data);
    isRemoteUpdate.current = false;
  }, []);

  // ── Suscripción en tiempo real a Firestore ─────────────────
  useEffect(() => {
    let unsubscribe = () => {};

    try {
      unsubscribe = subscribeTournament(
        (data) => {
          if (data === null) {
            // El documento no existe en Firestore → cargar fallback local
            const local = loadLocalFallback();
            if (local) {
              applyRemoteData(local);
            }
          } else {
            applyRemoteData(data);
          }
          setIsFirebaseConnected(true);
        },
        (error) => {
          // Error de conexión → usar datos locales
          console.warn('[useTournament] Firestore offline, usando fallback local:', error);
          setIsFirebaseConnected(false);
          const local = loadLocalFallback();
          if (local) applyRemoteData(local);
        }
      );
    } catch (error) {
      console.warn('[useTournament] Firebase no inicializado, modo offline:', error);
      setIsFirebaseConnected(false);
      const local = loadLocalFallback();
      if (local) applyRemoteData(local);
    }

    return () => unsubscribe();
  }, []); // Solo se ejecuta una vez al montar

  // ── Helper: Escribir en Firestore o fallback local ─────────
  const persistState = useCallback(async (newState) => {
    // Solo el admin puede escribir
    if (!isAdmin) return;

    setIsSyncing(true);
    const payload = {
      players: newState.players ?? players,
      matches: newState.matches ?? matches,
      presentPlayerIds: newState.presentPlayerIds ?? presentPlayerIds,
      isTournamentStarted: newState.isTournamentStarted ?? isTournamentStarted,
    };

    // Intentar guardar en Firestore
    let success = false;
    try {
      if (newState._fullSave) {
        success = await saveTournamentState(payload);
      } else {
        success = await updateTournamentFields(payload);
      }
    } catch {
      success = false;
    }

    if (!success) {
      // Fallback local si Firestore falla
      saveLocalFallback(payload);
      showToast('Guardado localmente (sin conexión a la nube)', 'info');
    }
    setIsSyncing(false);
  }, [isAdmin, players, matches, presentPlayerIds, isTournamentStarted, showToast]);

  // ── AGREGAR JUGADOR ──────────────────────────────────────
  const addPlayer = useCallback(async (newPlayer) => {
    if (!isAdmin) return false;
    if (players.length >= 16) {
      showToast('Ya se alcanzó el límite de 16 participantes', 'error');
      return false;
    }
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    await persistState({ players: updatedPlayers, _fullSave: false });
    showToast(`Jugador agregado: ${newPlayer.name} (${newPlayer.favoriteTeam})`, 'success');
    return true;
  }, [isAdmin, players, persistState, showToast]);

  // ── ELIMINAR JUGADOR ─────────────────────────────────────
  const removePlayer = useCallback(async (playerId) => {
    if (!isAdmin) return;
    const updatedPlayers = players.filter((p) => p.id !== playerId);
    setPlayers(updatedPlayers);
    await persistState({ players: updatedPlayers });
    showToast('Jugador eliminado de la lista', 'info');
  }, [isAdmin, players, persistState, showToast]);

  // ── CONFIRMAR PARTICIPANTES Y GENERAR FIXTURE ─────────────
  const confirmAndGenerateFixture = useCallback(async () => {
    if (!isAdmin) return false;
    if (players.length !== 16) {
      showToast('Se requieren exactamente 16 participantes', 'error');
      return false;
    }

    const generatedFixture = generateCompleteFixture(players);
    const allPresentIds = players.map((p) => p.id);

    setMatches(generatedFixture);
    setIsTournamentStarted(true);
    setPresentPlayerIds(allPresentIds);
    if (generatedFixture.length > 0) setActiveMatchId(generatedFixture[0].id);

    await persistState({
      players,
      matches: generatedFixture,
      presentPlayerIds: allPresentIds,
      isTournamentStarted: true,
      _fullSave: true,
    });

    showToast('¡Fixture generado! 120 partidos únicos programados. ¡Que empiece el torneo!', 'success');
    return true;
  }, [isAdmin, players, persistState, showToast]);

  // ── REINICIAR TODO EL TORNEO ──────────────────────────────
  const resetEntireTournament = useCallback(async () => {
    if (!isAdmin) return;

    const emptyState = {
      players: [],
      matches: [],
      presentPlayerIds: [],
      isTournamentStarted: false,
      _fullSave: true,
    };

    setPlayers([]);
    setMatches([]);
    setPresentPlayerIds([]);
    setActiveMatchId(null);
    setIsTournamentStarted(false);
    localStorage.removeItem(LS_KEY);

    await persistState(emptyState);
    showToast('Torneo reiniciado completamente. Estado limpio para nuevos registros.', 'info');
  }, [isAdmin, persistState, showToast]);

  // ── ASISTENCIA DIARIA ─────────────────────────────────────
  const togglePlayerAttendance = useCallback(async (playerId) => {
    if (!isAdmin) return;
    const updated = presentPlayerIds.includes(playerId)
      ? presentPlayerIds.filter((id) => id !== playerId)
      : [...presentPlayerIds, playerId];
    setPresentPlayerIds(updated);
    await persistState({ presentPlayerIds: updated });
  }, [isAdmin, presentPlayerIds, persistState]);

  const selectAllAttendance = useCallback(async () => {
    if (!isAdmin) return;
    const allIds = players.map((p) => p.id);
    setPresentPlayerIds(allIds);
    await persistState({ presentPlayerIds: allIds });
  }, [isAdmin, players, persistState]);

  const clearAllAttendance = useCallback(async () => {
    if (!isAdmin) return;
    setPresentPlayerIds([]);
    await persistState({ presentPlayerIds: [] });
  }, [isAdmin, persistState]);

  const setRandomAttendance = useCallback(async (count = 8) => {
    if (!isAdmin) return;
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const randomIds = shuffled.slice(0, count).map((p) => p.id);
    setPresentPlayerIds(randomIds);
    await persistState({ presentPlayerIds: randomIds });
  }, [isAdmin, players, persistState]);

  // ── GUARDAR RESULTADO DE PARTIDO ──────────────────────────
  const submitMatchResult = useCallback(async (matchId, golesLocal, golesVisitante) => {
    if (!isAdmin) return false;

    const parsedLocal = parseInt(golesLocal, 10);
    const parsedVisitante = parseInt(golesVisitante, 10);

    if (isNaN(parsedLocal) || isNaN(parsedVisitante) || parsedLocal < 0 || parsedVisitante < 0) {
      showToast('Por favor ingresa marcadores válidos (0 o mayor)', 'error');
      return false;
    }

    let updatedMatchData = null;
    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        updatedMatchData = {
          ...match,
          jugado: true,
          golesLocal: parsedLocal,
          golesVisitante: parsedVisitante,
          playedAt: new Date().toISOString(),
        };
        return updatedMatchData;
      }
      return match;
    });

    setMatches(updatedMatches);
    await persistState({ matches: updatedMatches });

    if (updatedMatchData) {
      showToast(
        `✅ ${updatedMatchData.homePlayerName} ${parsedLocal} - ${parsedVisitante} ${updatedMatchData.awayPlayerName}`,
        'success'
      );
    }
    return true;
  }, [isAdmin, matches, persistState, showToast]);

  // ── REABRIR PARTIDO ───────────────────────────────────────
  const resetMatchResult = useCallback(async (matchId) => {
    if (!isAdmin) return;
    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        return { ...match, jugado: false, golesLocal: null, golesVisitante: null, playedAt: null };
      }
      return match;
    });
    setMatches(updatedMatches);
    await persistState({ matches: updatedMatches });
    showToast('Partido reabierto como pendiente', 'info');
  }, [isAdmin, matches, persistState, showToast]);

  // ── CÁLCULOS DERIVADOS (MEMOIZADOS) ───────────────────────
  const leaderboard = useMemo(
    () => calculateLeaderboard(players, matches),
    [players, matches]
  );

  const suggestedMatchesToday = useMemo(
    () => getAvailableMatchesForPresent(matches, presentPlayerIds),
    [matches, presentPlayerIds]
  );

  const summary = useMemo(() => getTournamentSummary(matches), [matches]);

  // ── AUTO-SELECCIÓN DE PARTIDO ACTIVO ──────────────────────
  useEffect(() => {
    if (!activeMatchId && matches.length > 0) {
      const first = suggestedMatchesToday[0] || matches.find((m) => !m.jugado);
      if (first) setActiveMatchId(first.id);
    } else if (activeMatchId) {
      const current = matches.find((m) => m.id === activeMatchId);
      if (current?.jugado && suggestedMatchesToday.length > 0) {
        setActiveMatchId(suggestedMatchesToday[0].id);
      }
    }
  }, [suggestedMatchesToday, matches, activeMatchId]);

  const activeMatch = useMemo(
    () => matches.find((m) => m.id === activeMatchId) || null,
    [matches, activeMatchId]
  );

  return {
    // Estado
    players,
    matches,
    isTournamentStarted,
    presentPlayerIds,
    activeMatch,
    activeMatchId,
    setActiveMatchId,
    // Firebase
    isFirebaseConnected,
    isSyncing,
    // Cálculos
    leaderboard,
    suggestedMatchesToday,
    summary,
    // UI
    notification,
    // Acciones (solo disponibles si isAdmin === true)
    addPlayer,
    removePlayer,
    confirmAndGenerateFixture,
    resetEntireTournament,
    togglePlayerAttendance,
    selectAllAttendance,
    clearAllAttendance,
    setRandomAttendance,
    submitMatchResult,
    resetMatchResult,
  };
}
