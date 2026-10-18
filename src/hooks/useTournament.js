/**
 * HOOK PRINCIPAL DE TORNEO CON FIREBASE FIRESTORE + PERFILES HÍBRIDOS + MUNDIAL TOP 8
 * ===================================================================================
 * Gestiona todo el estado del torneo con sincronización en tiempo
 * real a través de Firestore (Plan Spark - Gratuito).
 *
 * Incluye:
 * - Eliminatorias Round Robin (16 jugadores, 120 partidos)
 * - Fase Copa del Mundo (Top 8): Sorteo con Cabezas de Serie (1º -> Grupo A, 2º -> Grupo B),
 *   Fase de Grupos A y B, Semifinales (1ºA vs 2ºB, 1ºB vs 2ºA), 3er Puesto y Gran Final
 * - Palmarés Histórico Persistente: Veces clasificado al Top 8 (🌐), Estrellas de Campeón (⭐)
 *   y Distintivo de Campeón Vigente (👑) al iniciar una nueva eliminatoria
 * ===================================================================================
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  INITIAL_PLAYERS,
  generateCompleteFixture,
  getInitialFixtureWithMockResults,
} from '../data/mockTournamentData';
import {
  calculateLeaderboard,
  getAvailableMatchesForPresent,
  getTournamentSummary,
  calculateTournamentGlobalAnalytics,
  getPlayerCareerKey,
  generateWorldCupGroupMatches,
  calculateWorldCupGroupStandings,
} from '../utils/tournamentCalculations';
import {
  subscribeTournament,
  saveTournamentState,
  updateTournamentFields,
} from '../firebase/tournamentService';

const LS_KEY = 'fifa_ps4_local_fallback_v1';

const AVATAR_COLORS = [
  '#00f59b', '#38bdf8', '#f43f5e', '#fbbf24',
  '#a855f7', '#ef4444', '#06b6d4', '#eab308',
  '#3b82f6', '#ec4899', '#94a3b8', '#facc15',
  '#f97316', '#0ea5e9', '#dc2626', '#8b5cf6',
];

export const INITIAL_WORLD_CUP = {
  status: 'not_started', // 'not_started' | 'draw_pending' | 'group_stage' | 'knockout' | 'completed'
  qualifiedPlayers: [],
  groupA: [],
  groupB: [],
  groupMatches: [],
  knockoutMatches: [],
  championPlayer: null,
  runnerUpPlayer: null,
  thirdPlacePlayer: null,
  completedAt: null,
};

function loadLocalFallback() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveLocalFallback(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function useTournament(isAdmin = false, currentUser = null) {
  // ── Estado del Torneo ─────────────────────────────────────
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [presentPlayerIds, setPresentPlayerIds] = useState([]);
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);
  const [careerHistory, setCareerHistory] = useState({});
  const [worldCup, setWorldCup] = useState(INITIAL_WORLD_CUP);

  // ── Estado de Conexión a Firebase ─────────────────────────
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── UI State ──────────────────────────────────────────────
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [notification, setNotification] = useState(null);

  const isRemoteUpdate = useRef(false);

  // ── Toast ─────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // ── Aplicar datos recibidos de Firestore ──────────────────
  const applyRemoteData = useCallback((data) => {
    if (!data) return;
    isRemoteUpdate.current = true;
    setPlayers(data.players || []);
    setMatches(data.matches || []);
    setPresentPlayerIds(data.presentPlayerIds || []);
    setIsTournamentStarted(data.isTournamentStarted || false);
    setCareerHistory(data.careerHistory || {});
    setWorldCup(data.worldCup || INITIAL_WORLD_CUP);
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
  }, [applyRemoteData]);

  // ── Helper: Escribir en Firestore o fallback local ─────────
  const persistState = useCallback(
    async (newState, options = {}) => {
      const canWrite = isAdmin || options.allowUserWrite === true;
      if (!canWrite) return;

      setIsSyncing(true);
      const payload = {
        players: newState.players ?? players,
        matches: newState.matches ?? matches,
        presentPlayerIds: newState.presentPlayerIds ?? presentPlayerIds,
        isTournamentStarted: newState.isTournamentStarted ?? isTournamentStarted,
        careerHistory: newState.careerHistory ?? careerHistory,
        worldCup: newState.worldCup ?? worldCup,
      };

      const writerRole = isAdmin
        ? 'admin'
        : currentUser?.email || currentUser?.uid || 'google_user';

      let success = false;
      try {
        if (newState._fullSave) {
          success = await saveTournamentState(payload, writerRole);
        } else {
          success = await updateTournamentFields(payload, writerRole);
        }
      } catch {
        success = false;
      }

      saveLocalFallback(payload);

      if (!success) {
        showToast('Guardado localmente (modo sin conexión a la nube)', 'info');
      }
      setIsSyncing(false);
    },
    [
      isAdmin,
      currentUser,
      players,
      matches,
      presentPlayerIds,
      isTournamentStarted,
      careerHistory,
      worldCup,
      showToast,
    ]
  );

  // ── AGREGAR JUGADOR (MANUAL POR ADMIN) ────────────────────
  const addPlayer = useCallback(
    async (newPlayer) => {
      if (!isAdmin) return false;
      if (players.length >= 16) {
        showToast('Ya se alcanzó el límite de 16 participantes', 'error');
        return false;
      }
      const enrichedPlayer = {
        authType: 'manual',
        uid: null,
        email: null,
        photoURL: null,
        ...newPlayer,
      };
      const updatedPlayers = [...players, enrichedPlayer];
      setPlayers(updatedPlayers);
      await persistState({ players: updatedPlayers, _fullSave: false });
      showToast(
        `Jugador agregado: ${enrichedPlayer.name} (${enrichedPlayer.favoriteTeam})`,
        'success'
      );
      return true;
    },
    [isAdmin, players, persistState, showToast]
  );

  // ── AUTO-REGISTRO CON GOOGLE (FASE 1) ─────────────────────
  const selfRegisterWithGoogle = useCallback(
    async (customName, favoriteTeam) => {
      if (!currentUser) {
        showToast('Primero inicia sesión con tu cuenta de Google', 'error');
        return false;
      }
      if (isTournamentStarted) {
        showToast('El torneo ya comenzó. Usa "Reclamar Perfil" para vincular tu jugador.', 'error');
        return false;
      }
      if (players.length >= 16) {
        showToast('Ya se completaron los 16 cupos del torneo', 'error');
        return false;
      }

      const trimmedName = String(customName || currentUser.displayName || '').trim();
      const trimmedTeam = String(favoriteTeam || '').trim();

      if (!trimmedName || !trimmedTeam) {
        showToast('Ingresa tu nombre/apodo y tu equipo favorito', 'error');
        return false;
      }

      const alreadyByUid = players.some((p) => p.uid && p.uid === currentUser.uid);
      if (alreadyByUid) {
        showToast('Tu cuenta de Google ya está inscrita en este torneo', 'error');
        return false;
      }

      const isDuplicateName = players.some(
        (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicateName) {
        showToast(
          `El nombre "${trimmedName}" ya existe. Si eres tú, vincúlalo con "Reclamar Perfil".`,
          'error'
        );
        return false;
      }

      const colorIndex = players.length % AVATAR_COLORS.length;
      const newGooglePlayer = {
        id: `p${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: trimmedName,
        tag: trimmedName.substring(0, 4).toUpperCase(),
        favoriteTeam: trimmedTeam,
        color: AVATAR_COLORS[colorIndex],
        authType: 'google',
        uid: currentUser.uid,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        claimedAt: new Date().toISOString(),
      };

      // Si existía historial bajo ese nombre manual en torneos previos, asociarlo también a su UID
      const oldNameKey = `name_${trimmedName.toLowerCase()}`;
      const newUidKey = `uid_${currentUser.uid}`;
      const updatedCareer = { ...careerHistory };
      const baseCareerRecord = updatedCareer[oldNameKey] || updatedCareer[newUidKey] || {};
      const mergedRecord = {
        ...baseCareerRecord,
        linkedUid: currentUser.uid,
        linkedEmail: currentUser.email,
        photoURL: currentUser.photoURL || baseCareerRecord.photoURL || null,
        playerName: trimmedName,
      };
      updatedCareer[oldNameKey] = mergedRecord;
      updatedCareer[newUidKey] = mergedRecord;

      const updatedPlayers = [...players, newGooglePlayer];
      setPlayers(updatedPlayers);
      setCareerHistory(updatedCareer);
      await persistState(
        { players: updatedPlayers, careerHistory: updatedCareer, _fullSave: false },
        { allowUserWrite: true }
      );
      showToast(
        `¡Inscrito con Google! ${newGooglePlayer.name} (${newGooglePlayer.favoriteTeam})`,
        'success'
      );
      return true;
    },
    [currentUser, isTournamentStarted, players, careerHistory, persistState, showToast]
  );

  // ── RECLAMAR / VINCULAR PERFIL MANUAL A CUENTA GOOGLE ──────
  const claimPlayerProfile = useCallback(
    async (targetPlayerId) => {
      if (!currentUser) {
        showToast('Debes iniciar sesión con Google para reclamar tu perfil', 'error');
        return false;
      }

      const existingLinked = players.find(
        (p) => p.uid === currentUser.uid && p.id !== targetPlayerId
      );
      if (existingLinked) {
        showToast(
          `Tu cuenta Google ya está vinculada al jugador "${existingLinked.name}"`,
          'error'
        );
        return false;
      }

      const targetPlayer = players.find((p) => p.id === targetPlayerId);
      if (!targetPlayer) return false;

      if (targetPlayer.uid && targetPlayer.uid !== currentUser.uid && !isAdmin) {
        showToast('Este jugador ya fue vinculado por otra cuenta de Google', 'error');
        return false;
      }

      const updatedPlayers = players.map((p) => {
        if (p.id === targetPlayerId) {
          return {
            ...p,
            authType: 'google',
            uid: currentUser.uid,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            claimedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      const oldNameKey = `name_${String(targetPlayer.name || '').trim().toLowerCase()}`;
      const newUidKey = `uid_${currentUser.uid}`;
      const updatedCareer = { ...careerHistory };
      const mergedCareerRecord = {
        ...(updatedCareer[oldNameKey] || {}),
        ...(updatedCareer[newUidKey] || {}),
        titlesWon: Math.max(
          updatedCareer[oldNameKey]?.titlesWon || 0,
          updatedCareer[newUidKey]?.titlesWon || 0
        ),
        isReigningChampion:
          Boolean(updatedCareer[oldNameKey]?.isReigningChampion) ||
          Boolean(updatedCareer[newUidKey]?.isReigningChampion),
        worldCupQualifications: Math.max(
          updatedCareer[oldNameKey]?.worldCupQualifications || 0,
          updatedCareer[newUidKey]?.worldCupQualifications || 0
        ),
        linkedUid: currentUser.uid,
        linkedEmail: currentUser.email,
        photoURL:
          currentUser.photoURL ||
          updatedCareer[newUidKey]?.photoURL ||
          updatedCareer[oldNameKey]?.photoURL ||
          null,
        playerName: targetPlayer.name,
      };
      updatedCareer[oldNameKey] = mergedCareerRecord;
      updatedCareer[newUidKey] = mergedCareerRecord;

      setPlayers(updatedPlayers);
      setCareerHistory(updatedCareer);
      await persistState(
        { players: updatedPlayers, careerHistory: updatedCareer },
        { allowUserWrite: true }
      );

      showToast(
        `🔗 Perfil de "${targetPlayer.name}" vinculado a ${currentUser.email || currentUser.displayName}`,
        'success'
      );
      return true;
    },
    [currentUser, isAdmin, players, careerHistory, persistState, showToast]
  );

  // ── DESVINCULAR CUENTA GOOGLE DE UN JUGADOR ───────────────
  const unlinkPlayerProfile = useCallback(
    async (targetPlayerId) => {
      const targetPlayer = players.find((p) => p.id === targetPlayerId);
      if (!targetPlayer) return false;

      const isOwner = currentUser && targetPlayer.uid === currentUser.uid;
      if (!isAdmin && !isOwner) {
        showToast('No tienes permiso para desvincular este perfil', 'error');
        return false;
      }

      const updatedPlayers = players.map((p) => {
        if (p.id === targetPlayerId) {
          return {
            ...p,
            authType: 'manual',
            uid: null,
            email: null,
            photoURL: null,
            claimedAt: null,
          };
        }
        return p;
      });

      setPlayers(updatedPlayers);
      await persistState(
        { players: updatedPlayers },
        { allowUserWrite: isOwner }
      );
      showToast(`Perfil de "${targetPlayer.name}" cambiado a modo manual`, 'info');
      return true;
    },
    [players, currentUser, isAdmin, persistState, showToast]
  );

  // ── ELIMINAR JUGADOR ─────────────────────────────────────
  const removePlayer = useCallback(
    async (playerId) => {
      const target = players.find((p) => p.id === playerId);
      const isSelfInSetup =
        !isTournamentStarted && currentUser && target?.uid === currentUser.uid;

      if (!isAdmin && !isSelfInSetup) return;

      const updatedPlayers = players.filter((p) => p.id !== playerId);
      setPlayers(updatedPlayers);
      await persistState(
        { players: updatedPlayers },
        { allowUserWrite: isSelfInSetup }
      );
      showToast('Jugador eliminado de la lista', 'info');
    },
    [isAdmin, isTournamentStarted, currentUser, players, persistState, showToast]
  );

  // ── CARGAR PLANTILLA BASE DE 16 JUGADORES (ADMIN) ─────────
  const loadDefaultPlayers = useCallback(async () => {
    if (!isAdmin) return false;
    const enrichedDefaults = INITIAL_PLAYERS.map((p) => {
      const existing = players.find(
        (ep) => ep.name.toLowerCase() === p.name.toLowerCase()
      );
      const nameKey = `name_${p.name.toLowerCase()}`;
      const savedCareer = careerHistory[nameKey] || {};
      return {
        ...p,
        authType: existing?.authType || (savedCareer.linkedUid ? 'google' : 'manual'),
        uid: existing?.uid || savedCareer.linkedUid || null,
        email: existing?.email || savedCareer.linkedEmail || null,
        photoURL: existing?.photoURL || savedCareer.photoURL || null,
      };
    });
    setPlayers(enrichedDefaults);
    await persistState({ players: enrichedDefaults });
    showToast('¡16 participantes base cargados! Puedes editarlos o iniciar el torneo.', 'success');
    return true;
  }, [isAdmin, players, careerHistory, persistState, showToast]);

  // ── CARGAR DEMO CON 28 PARTIDOS JUGADOS (ADMIN) ───────────
  const loadDemoTournamentWithResults = useCallback(async () => {
    if (!isAdmin) return false;
    const basePlayers = (players.length === 16 ? players : INITIAL_PLAYERS).map((p) => {
      const existing = players.find(
        (ep) => ep.name.toLowerCase() === p.name.toLowerCase()
      );
      const nameKey = `name_${p.name.toLowerCase()}`;
      const savedCareer = careerHistory[nameKey] || {};
      return {
        ...p,
        authType: existing?.authType || (savedCareer.linkedUid ? 'google' : 'manual'),
        uid: existing?.uid || savedCareer.linkedUid || null,
        email: existing?.email || savedCareer.linkedEmail || null,
        photoURL: existing?.photoURL || savedCareer.photoURL || null,
      };
    });
    const demoMatches = getInitialFixtureWithMockResults();
    const allIds = basePlayers.map((p) => p.id);

    setPlayers(basePlayers);
    setMatches(demoMatches);
    setPresentPlayerIds(allIds);
    setIsTournamentStarted(true);
    setWorldCup(INITIAL_WORLD_CUP);

    const firstPending = demoMatches.find((m) => !m.jugado);
    if (firstPending) setActiveMatchId(firstPending.id);

    await persistState({
      players: basePlayers,
      matches: demoMatches,
      presentPlayerIds: allIds,
      isTournamentStarted: true,
      worldCup: INITIAL_WORLD_CUP,
      _fullSave: true,
    });

    showToast('¡Modo Demo cargado con 28 partidos jugados y estadísticas listas!', 'success');
    return true;
  }, [isAdmin, players, careerHistory, persistState, showToast]);

  // ── CONFIRMAR PARTICIPANTES Y GENERAR FIXTURE ─────────────
  const confirmAndGenerateFixture = useCallback(async () => {
    if (!isAdmin) return false;
    if (players.length !== 16) {
      showToast('Se requieren exactamente 16 participantes', 'error');
      return false;
    }

    const generatedFixture = generateCompleteFixture(players);
    const allPresentIds = players.map((p) => p.id);

    // Limpiar el flag temporal _currentWCQualifiedCounted al empezar una nueva eliminatoria
    const cleanCareer = { ...careerHistory };
    Object.keys(cleanCareer).forEach((k) => {
      if (cleanCareer[k]?._currentWCQualifiedCounted) {
        cleanCareer[k] = { ...cleanCareer[k], _currentWCQualifiedCounted: false };
      }
    });

    setMatches(generatedFixture);
    setIsTournamentStarted(true);
    setPresentPlayerIds(allPresentIds);
    setCareerHistory(cleanCareer);
    setWorldCup(INITIAL_WORLD_CUP);
    if (generatedFixture.length > 0) setActiveMatchId(generatedFixture[0].id);

    await persistState({
      players,
      matches: generatedFixture,
      presentPlayerIds: allPresentIds,
      isTournamentStarted: true,
      careerHistory: cleanCareer,
      worldCup: INITIAL_WORLD_CUP,
      _fullSave: true,
    });

    showToast('¡Fixture generado! 120 partidos únicos programados. ¡Que empiece el torneo!', 'success');
    return true;
  }, [isAdmin, players, careerHistory, persistState, showToast]);

  // ════════════════════════════════════════════════════════════════════════
  // FASE COPA DEL MUNDO (TOP 8): SORTEO CABEZAS DE SERIE, GRUPOS A/B Y FINAL
  // ════════════════════════════════════════════════════════════════════════

  const leaderboard = useMemo(
    () => calculateLeaderboard(players, matches),
    [players, matches]
  );

  /**
   * 1. Abre la Fase Mundial con el Top 8 de la Tabla General.
   *    Obligatoriamente coloca al 1º como Cabeza de Serie del Grupo A
   *    y al 2º como Cabeza de Serie del Grupo B.
   */
  const startWorldCupPhase = useCallback(async () => {
    if (!isAdmin) return false;
    if (leaderboard.length < 8) {
      showToast('Se requieren al menos 8 jugadores en la tabla para iniciar el Mundial', 'error');
      return false;
    }

    const top8 = leaderboard.slice(0, 8).map((row, idx) => ({
      ...row.player,
      qualifierRank: idx + 1,
      qualifierPts: row.pts,
      qualifierDG: row.dg,
    }));

    const seed1 = top8[0]; // 1º General -> Cabeza de Serie Grupo A
    const seed2 = top8[1]; // 2º General -> Cabeza de Serie Grupo B

    const nextWorldCup = {
      ...INITIAL_WORLD_CUP,
      status: 'draw_pending',
      qualifiedPlayers: top8,
      groupA: [seed1],
      groupB: [seed2],
    };

    setWorldCup(nextWorldCup);
    await persistState({ worldCup: nextWorldCup });
    showToast(
      `🏆 ¡Fase Mundial activada! ${seed1.name} (1º) lidera el Grupo A y ${seed2.name} (2º) lidera el Grupo B.`,
      'success'
    );
    return true;
  }, [isAdmin, leaderboard, persistState, showToast]);

  /**
   * 2. Ejecuta o actualiza paso a paso el Sorteo de los puestos 3º al 8º
   *    manteniendo fijos al 1º en el Grupo A y al 2º en el Grupo B.
   */
  const executeWorldCupDraw = useCallback(
    async (customDrawState = null) => {
      if (!isAdmin) return false;
      const qualified = worldCup.qualifiedPlayers;
      if (!qualified || qualified.length < 8) return false;

      if (
        customDrawState &&
        Array.isArray(customDrawState.groupA) &&
        Array.isArray(customDrawState.groupB)
      ) {
        const nextWorldCup = {
          ...worldCup,
          groupA: customDrawState.groupA,
          groupB: customDrawState.groupB,
        };
        setWorldCup(nextWorldCup);
        await persistState({ worldCup: nextWorldCup });
        if (customDrawState.toastMessage) {
          showToast(customDrawState.toastMessage, 'success');
        }
        return true;
      }

      const seed1 = qualified[0];
      const seed2 = qualified[1];
      const potPlayers = [...qualified.slice(2)]; // Puestos 3º al 8º

      // Algoritmo Fisher-Yates para mezclar el bombo (puestos 3..8)
      for (let i = potPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [potPlayers[i], potPlayers[j]] = [potPlayers[j], potPlayers[i]];
      }

      const groupA = [seed1, ...potPlayers.slice(0, 3)];
      const groupB = [seed2, ...potPlayers.slice(3, 6)];

      const nextWorldCup = {
        ...worldCup,
        groupA,
        groupB,
      };

      setWorldCup(nextWorldCup);
      await persistState({ worldCup: nextWorldCup });
      showToast('🎲 ¡Bombo sorteado! Revisa cómo quedaron los Grupos A y B.', 'success');
      return true;
    },
    [isAdmin, worldCup, persistState, showToast]
  );

  /**
   * 3. Confirma los Grupos A y B sorteados y genera los 12 partidos de Fase de Grupos.
   *    Además registra oficialmente +1 Clasificación al Mundial Top 8 a los 8 clasificados.
   */
  const confirmWorldCupGroups = useCallback(async () => {
    if (!isAdmin) return false;
    if (worldCup.groupA.length !== 4 || worldCup.groupB.length !== 4) {
      showToast('Primero realiza el sorteo para completar los 4 integrantes de cada grupo', 'error');
      return false;
    }

    const groupMatches = generateWorldCupGroupMatches(worldCup.groupA, worldCup.groupB);

    // Registrar +1 Clasificación al Mundial en careerHistory para los 8 clasificados
    const updatedCareer = { ...careerHistory };
    worldCup.qualifiedPlayers.forEach((p) => {
      const uidKey = p.uid ? `uid_${p.uid}` : null;
      const nameKey = `name_${String(p.name || '').trim().toLowerCase()}`;
      const primaryKey = uidKey || nameKey;

      const prev = updatedCareer[primaryKey] || updatedCareer[nameKey] || {
        playerName: p.name,
        linkedEmail: p.email || null,
        tournamentsPlayed: 0,
        titlesWon: 0,
        isReigningChampion: false,
        runnerUpCount: 0,
        worldCupQualifications: 0,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        pts: 0,
        cleanSheets: 0,
      };

      if (!prev._currentWCQualifiedCounted) {
        const updatedRecord = {
          ...prev,
          playerName: p.name,
          worldCupQualifications: (prev.worldCupQualifications || 0) + 1,
          _currentWCQualifiedCounted: true,
        };
        updatedCareer[primaryKey] = updatedRecord;
        updatedCareer[nameKey] = updatedRecord;
      }
    });

    const nextWorldCup = {
      ...worldCup,
      status: 'group_stage',
      groupMatches,
    };

    setWorldCup(nextWorldCup);
    setCareerHistory(updatedCareer);
    await persistState({ worldCup: nextWorldCup, careerHistory: updatedCareer });
    showToast('⚽ ¡Fase de Grupos del Mundial iniciada! 12 partidos programados.', 'success');
    return true;
  }, [isAdmin, worldCup, careerHistory, persistState, showToast]);

  /**
   * 4. Guarda el marcador de un partido de Grupo A o Grupo B del Mundial
   */
  const submitWorldCupGroupMatch = useCallback(
    async (matchId, golesLocal, golesVisitante) => {
      if (!isAdmin) return false;
      const lGoals = parseInt(golesLocal, 10);
      const vGoals = parseInt(golesVisitante, 10);
      if (isNaN(lGoals) || isNaN(vGoals) || lGoals < 0 || vGoals < 0) {
        showToast('Ingresa un marcador válido (0 o mayor)', 'error');
        return false;
      }

      const updatedGroupMatches = worldCup.groupMatches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            jugado: true,
            golesLocal: lGoals,
            golesVisitante: vGoals,
            playedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      const nextWorldCup = {
        ...worldCup,
        groupMatches: updatedGroupMatches,
      };

      setWorldCup(nextWorldCup);
      await persistState({ worldCup: nextWorldCup });
      showToast('Marcador de Fase de Grupos guardado', 'success');
      return true;
    },
    [isAdmin, worldCup, persistState, showToast]
  );

  /**
   * 5. Avanza a Semifinales cruzando a los 2 mejores de cada grupo:
   *    Semifinal 1: 1º Grupo A vs 2º Grupo B
   *    Semifinal 2: 1º Grupo B vs 2º Grupo A
   */
  const advanceToWorldCupKnockout = useCallback(async () => {
    if (!isAdmin) return false;

    const standingsA = calculateWorldCupGroupStandings(
      worldCup.groupA,
      worldCup.groupMatches,
      'A'
    );
    const standingsB = calculateWorldCupGroupStandings(
      worldCup.groupB,
      worldCup.groupMatches,
      'B'
    );

    if (standingsA.length < 2 || standingsB.length < 2) return false;

    const firstA = standingsA[0].player;
    const secondA = standingsA[1].player;
    const firstB = standingsB[0].player;
    const secondB = standingsB[1].player;

    const knockoutMatches = [
      {
        id: 'SF1',
        stage: 'SEMIFINAL 1',
        subtitle: '1º Grupo A vs 2º Grupo B',
        homePlayer: firstA,
        awayPlayer: secondB,
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        penaltyWinnerId: null,
        winnerPlayer: null,
        loserPlayer: null,
      },
      {
        id: 'SF2',
        stage: 'SEMIFINAL 2',
        subtitle: '1º Grupo B vs 2º Grupo A',
        homePlayer: firstB,
        awayPlayer: secondA,
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        penaltyWinnerId: null,
        winnerPlayer: null,
        loserPlayer: null,
      },
      {
        id: 'THIRD',
        stage: 'TERCER PUESTO',
        subtitle: 'Definición Medalla de Bronce',
        homePlayer: null,
        awayPlayer: null,
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        penaltyWinnerId: null,
        winnerPlayer: null,
        loserPlayer: null,
      },
      {
        id: 'FINAL',
        stage: 'GRAN FINAL DEL MUNDIAL',
        subtitle: 'Definición del Campeón del Mundo',
        homePlayer: null,
        awayPlayer: null,
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        penaltyWinnerId: null,
        winnerPlayer: null,
        loserPlayer: null,
      },
    ];

    const nextWorldCup = {
      ...worldCup,
      status: 'knockout',
      knockoutMatches,
    };

    setWorldCup(nextWorldCup);
    await persistState({ worldCup: nextWorldCup });
    showToast(
      `🔥 ¡Semifinales listas! ${firstA.name} vs ${secondB.name} y ${firstB.name} vs ${secondA.name}`,
      'success'
    );
    return true;
  }, [isAdmin, worldCup, persistState, showToast]);

  /**
   * 6. Guarda el resultado de una Semifinal, Tercer Puesto o la Gran Final.
   *    Si es la Gran Final, corona al Campeón y le otorga su Estrella (⭐) y
   *    el distintivo de Campeón Vigente (👑) para la próxima eliminatoria.
   */
  const submitWorldCupKnockoutMatch = useCallback(
    async (matchId, golesLocal, golesVisitante, penaltyWinnerId = null) => {
      if (!isAdmin) return false;
      const lGoals = parseInt(golesLocal, 10);
      const vGoals = parseInt(golesVisitante, 10);

      if (isNaN(lGoals) || isNaN(vGoals) || lGoals < 0 || vGoals < 0) {
        showToast('Ingresa marcadores válidos (0 o mayor)', 'error');
        return false;
      }

      const targetMatch = worldCup.knockoutMatches.find((m) => m.id === matchId);
      if (!targetMatch || !targetMatch.homePlayer || !targetMatch.awayPlayer) {
        return false;
      }

      if (lGoals === vGoals && !penaltyWinnerId) {
        showToast(
          'En eliminación directa no hay empate: selecciona quién avanzó por penales / gol de oro',
          'error'
        );
        return false;
      }

      let winnerPlayer = null;
      let loserPlayer = null;

      if (lGoals > vGoals) {
        winnerPlayer = targetMatch.homePlayer;
        loserPlayer = targetMatch.awayPlayer;
      } else if (vGoals > lGoals) {
        winnerPlayer = targetMatch.awayPlayer;
        loserPlayer = targetMatch.homePlayer;
      } else {
        winnerPlayer =
          penaltyWinnerId === targetMatch.homePlayer.id
            ? targetMatch.homePlayer
            : targetMatch.awayPlayer;
        loserPlayer =
          penaltyWinnerId === targetMatch.homePlayer.id
            ? targetMatch.awayPlayer
            : targetMatch.homePlayer;
      }

      let updatedKnockout = worldCup.knockoutMatches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            jugado: true,
            golesLocal: lGoals,
            golesVisitante: vGoals,
            penaltyWinnerId: lGoals === vGoals ? penaltyWinnerId : null,
            winnerPlayer,
            loserPlayer,
          };
        }
        return m;
      });

      // Si se jugaron ambas semifinales, poblar automáticamente FINAL y TERCER PUESTO
      const sf1 = updatedKnockout.find((m) => m.id === 'SF1');
      const sf2 = updatedKnockout.find((m) => m.id === 'SF2');

      if (sf1?.jugado && sf2?.jugado) {
        updatedKnockout = updatedKnockout.map((m) => {
          if (m.id === 'FINAL') {
            return {
              ...m,
              homePlayer: sf1.winnerPlayer,
              awayPlayer: sf2.winnerPlayer,
            };
          }
          if (m.id === 'THIRD') {
            return {
              ...m,
              homePlayer: sf1.loserPlayer,
              awayPlayer: sf2.loserPlayer,
            };
          }
          return m;
        });
      }

      let nextStatus = worldCup.status;
      let championPlayer = worldCup.championPlayer;
      let runnerUpPlayer = worldCup.runnerUpPlayer;
      let thirdPlacePlayer = worldCup.thirdPlacePlayer;
      let completedAt = worldCup.completedAt;
      let updatedCareer = { ...careerHistory };

      if (matchId === 'THIRD') {
        thirdPlacePlayer = winnerPlayer;
      }

      // Si se acaba de definir la GRAN FINAL DEL MUNDIAL
      if (matchId === 'FINAL' && winnerPlayer && loserPlayer) {
        const wasAlreadyCompleted = worldCup.status === 'completed';
        nextStatus = 'completed';
        championPlayer = winnerPlayer;
        runnerUpPlayer = loserPlayer;
        completedAt = new Date().toISOString();

        // 1. Quitar el distintivo de "Campeón Vigente" a cualquier campeón anterior
        Object.keys(updatedCareer).forEach((k) => {
          if (updatedCareer[k]?.isReigningChampion) {
            updatedCareer[k] = {
              ...updatedCareer[k],
              isReigningChampion: false,
            };
          }
        });

        // 2. Otorgar Estrella de Campeón (⭐) y Corona Vigente (👑) al nuevo Campeón
        const champUidKey = winnerPlayer.uid ? `uid_${winnerPlayer.uid}` : null;
        const champNameKey = `name_${String(winnerPlayer.name || '').trim().toLowerCase()}`;
        const champPrimaryKey = champUidKey || champNameKey;

        const prevChamp =
          updatedCareer[champPrimaryKey] || updatedCareer[champNameKey] || {
            playerName: winnerPlayer.name,
            linkedEmail: winnerPlayer.email || null,
            tournamentsPlayed: 0,
            titlesWon: 0,
            worldCupQualifications: 1,
            runnerUpCount: 0,
            pj: 0,
            pg: 0,
            pe: 0,
            pp: 0,
            gf: 0,
            gc: 0,
            pts: 0,
            cleanSheets: 0,
          };

        const newChampRecord = {
          ...prevChamp,
          playerName: winnerPlayer.name,
          titlesWon: (prevChamp.titlesWon || 0) + (wasAlreadyCompleted ? 0 : 1),
          isReigningChampion: true,
          lastTitleAt: completedAt,
        };

        updatedCareer[champPrimaryKey] = newChampRecord;
        updatedCareer[champNameKey] = newChampRecord;

        // 3. Registrar Subcampeonato al finalista
        const runnerUidKey = loserPlayer.uid ? `uid_${loserPlayer.uid}` : null;
        const runnerNameKey = `name_${String(loserPlayer.name || '').trim().toLowerCase()}`;
        const runnerPrimaryKey = runnerUidKey || runnerNameKey;
        const prevRunner =
          updatedCareer[runnerPrimaryKey] || updatedCareer[runnerNameKey] || {
            playerName: loserPlayer.name,
            worldCupQualifications: 1,
            titlesWon: 0,
            runnerUpCount: 0,
          };

        const newRunnerRecord = {
          ...prevRunner,
          playerName: loserPlayer.name,
          runnerUpCount: (prevRunner.runnerUpCount || 0) + (wasAlreadyCompleted ? 0 : 1),
        };
        updatedCareer[runnerPrimaryKey] = newRunnerRecord;
        updatedCareer[runnerNameKey] = newRunnerRecord;
      }

      const nextWorldCup = {
        ...worldCup,
        status: nextStatus,
        knockoutMatches: updatedKnockout,
        championPlayer,
        runnerUpPlayer,
        thirdPlacePlayer,
        completedAt,
      };

      setWorldCup(nextWorldCup);
      setCareerHistory(updatedCareer);
      await persistState({ worldCup: nextWorldCup, careerHistory: updatedCareer });

      if (matchId === 'FINAL' && winnerPlayer) {
        showToast(
          `👑 ¡${winnerPlayer.name.toUpperCase()} ES EL CAMPEÓN DEL MUNDO! Estrella y distintivo asignados a su perfil.`,
          'success'
        );
      } else {
        showToast(`Resultado de ${targetMatch.stage} guardado`, 'success');
      }
      return true;
    },
    [isAdmin, worldCup, careerHistory, persistState, showToast]
  );

  // ── REINICIAR TODO EL TORNEO (CONSERVANDO CAMPEÓN Y RÉCORDS) ──
  const resetEntireTournament = useCallback(
    async (preserveCareerRecords = true) => {
      if (!isAdmin) return;

      let nextCareerHistory = { ...careerHistory };

      const hasPlayedMatches = matches.some((m) => m.jugado);
      if (preserveCareerRecords && hasPlayedMatches && players.length > 0) {
        const currentStandings = calculateLeaderboard(players, matches);

        currentStandings.forEach((row) => {
          if (row.pj === 0) return;
          const uidKey = row.player.uid ? `uid_${row.player.uid}` : null;
          const nameKey = `name_${String(row.player.name || '').trim().toLowerCase()}`;
          const primaryKey = uidKey || nameKey;

          const prev =
            nextCareerHistory[primaryKey] || nextCareerHistory[nameKey] || {
              playerName: row.player.name,
              linkedEmail: row.player.email || null,
              tournamentsPlayed: 0,
              titlesWon: 0,
              isReigningChampion: false,
              runnerUpCount: 0,
              worldCupQualifications: 0,
              pj: 0,
              pg: 0,
              pe: 0,
              pp: 0,
              gf: 0,
              gc: 0,
              pts: 0,
              cleanSheets: 0,
            };

          const alreadyCountedWC = Boolean(prev._currentWCQualifiedCounted);

          const updatedRecord = {
            ...prev,
            playerName: row.player.name,
            linkedEmail: row.player.email || prev.linkedEmail,
            tournamentsPlayed: (prev.tournamentsPlayed || 0) + 1,
            worldCupQualifications:
              (prev.worldCupQualifications || 0) +
              (row.position <= 8 && !alreadyCountedWC ? 1 : 0),
            _currentWCQualifiedCounted: false,
            pj: (prev.pj || 0) + row.pj,
            pg: (prev.pg || 0) + row.pg,
            pe: (prev.pe || 0) + row.pe,
            pp: (prev.pp || 0) + row.pp,
            gf: (prev.gf || 0) + row.gf,
            gc: (prev.gc || 0) + row.gc,
            pts: (prev.pts || 0) + row.pts,
            cleanSheets: (prev.cleanSheets || 0) + (row.cleanSheets || 0),
            lastArchivedAt: new Date().toISOString(),
          };

          nextCareerHistory[primaryKey] = updatedRecord;
          nextCareerHistory[nameKey] = updatedRecord;
        });
      } else if (!preserveCareerRecords) {
        nextCareerHistory = {};
      }

      const emptyState = {
        players: [],
        matches: [],
        presentPlayerIds: [],
        isTournamentStarted: false,
        careerHistory: nextCareerHistory,
        worldCup: INITIAL_WORLD_CUP,
        _fullSave: true,
      };

      setPlayers([]);
      setMatches([]);
      setPresentPlayerIds([]);
      setActiveMatchId(null);
      setIsTournamentStarted(false);
      setCareerHistory(nextCareerHistory);
      setWorldCup(INITIAL_WORLD_CUP);

      await persistState(emptyState);
      showToast(
        preserveCareerRecords
          ? 'Nueva Eliminatoria lista. El Campeón Vigente conservará su corona (👑) y estrellas (⭐).'
          : 'Torneo reiniciado completamente de fábrica.',
        'info'
      );
    },
    [isAdmin, careerHistory, matches, players, persistState, showToast]
  );

  // ── ASISTENCIA DIARIA ─────────────────────────────────────
  const togglePlayerAttendance = useCallback(
    async (playerId) => {
      if (!isAdmin) return;
      const updated = presentPlayerIds.includes(playerId)
        ? presentPlayerIds.filter((id) => id !== playerId)
        : [...presentPlayerIds, playerId];
      setPresentPlayerIds(updated);
      await persistState({ presentPlayerIds: updated });
    },
    [isAdmin, presentPlayerIds, persistState]
  );

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

  const setRandomAttendance = useCallback(
    async (count = 8) => {
      if (!isAdmin) return;
      const shuffled = [...players].sort(() => 0.5 - Math.random());
      const randomIds = shuffled.slice(0, count).map((p) => p.id);
      setPresentPlayerIds(randomIds);
      await persistState({ presentPlayerIds: randomIds });
    },
    [isAdmin, players, persistState]
  );

  // ── GUARDAR RESULTADO DE PARTIDO DE ELIMINATORIAS ─────────
  const submitMatchResult = useCallback(
    async (matchId, golesLocal, golesVisitante) => {
      if (!isAdmin) return false;

      const parsedLocal = parseInt(golesLocal, 10);
      const parsedVisitante = parseInt(golesVisitante, 10);

      if (
        isNaN(parsedLocal) ||
        isNaN(parsedVisitante) ||
        parsedLocal < 0 ||
        parsedVisitante < 0
      ) {
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
    },
    [isAdmin, matches, persistState, showToast]
  );

  // ── REABRIR PARTIDO ───────────────────────────────────────
  const resetMatchResult = useCallback(
    async (matchId) => {
      if (!isAdmin) return;
      const updatedMatches = matches.map((match) => {
        if (match.id === matchId) {
          return {
            ...match,
            jugado: false,
            golesLocal: null,
            golesVisitante: null,
            playedAt: null,
          };
        }
        return match;
      });
      setMatches(updatedMatches);
      await persistState({ matches: updatedMatches });
      showToast('Partido reabierto como pendiente', 'info');
    },
    [isAdmin, matches, persistState, showToast]
  );

  // ── CÁLCULOS DERIVADOS (MEMOIZADOS) ───────────────────────
  const suggestedMatchesToday = useMemo(
    () => getAvailableMatchesForPresent(matches, presentPlayerIds),
    [matches, presentPlayerIds]
  );

  const summary = useMemo(() => getTournamentSummary(matches), [matches]);

  const globalAnalytics = useMemo(
    () => calculateTournamentGlobalAnalytics(players, matches, leaderboard),
    [players, matches, leaderboard]
  );

  const myLinkedPlayer = useMemo(() => {
    if (!currentUser) return null;
    const byUid = players.find((p) => p.uid && p.uid === currentUser.uid);
    if (byUid) return byUid;

    const userDisplay = String(currentUser.displayName || '').trim().toLowerCase();
    const userFirstWord = userDisplay.split(/\s+/)[0] || '';
    const emailPrefix = String(currentUser.email || '')
      .split('@')[0]
      .toLowerCase();

    return (
      players.find((p) => {
        if (p.uid) return false;
        const pName = String(p.name || '').trim().toLowerCase();
        const pFirst = pName.split(/\s+/)[0] || '';
        return (
          pName === userDisplay ||
          (pFirst.length >= 3 && pFirst === userFirstWord) ||
          (pFirst.length >= 3 && emailPrefix.startsWith(pFirst))
        );
      }) || null
    );
  }, [currentUser, players]);

  // Si el usuario tiene sesión Google activa con foto y su jugador vinculado aún no tiene photoURL guardado, sincronizarlo
  useEffect(() => {
    if (!currentUser?.photoURL || !myLinkedPlayer) return;
    if (myLinkedPlayer.photoURL === currentUser.photoURL && myLinkedPlayer.uid === currentUser.uid) {
      return;
    }
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === myLinkedPlayer.id
          ? {
              ...p,
              authType: 'google',
              uid: p.uid || currentUser.uid,
              email: p.email || currentUser.email,
              photoURL: currentUser.photoURL,
            }
          : p
      )
    );
  }, [currentUser, myLinkedPlayer]);

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
    careerHistory,
    worldCup,
    activeMatch,
    activeMatchId,
    setActiveMatchId,
    myLinkedPlayer,
    // Firebase
    isFirebaseConnected,
    isSyncing,
    // Cálculos
    leaderboard,
    suggestedMatchesToday,
    summary,
    globalAnalytics,
    // UI
    notification,
    showToast,
    // Acciones Admin y Usuario Híbrido
    addPlayer,
    selfRegisterWithGoogle,
    claimPlayerProfile,
    unlinkPlayerProfile,
    removePlayer,
    loadDefaultPlayers,
    loadDemoTournamentWithResults,
    confirmAndGenerateFixture,
    resetEntireTournament,
    togglePlayerAttendance,
    selectAllAttendance,
    clearAllAttendance,
    setRandomAttendance,
    submitMatchResult,
    resetMatchResult,
    // Acciones Copa del Mundo (Top 8)
    startWorldCupPhase,
    executeWorldCupDraw,
    confirmWorldCupGroups,
    submitWorldCupGroupMatch,
    advanceToWorldCupKnockout,
    submitWorldCupKnockoutMatch,
  };
}
