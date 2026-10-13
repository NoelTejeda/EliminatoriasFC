import { useState, useEffect, useMemo } from 'react';
import { generateCompleteFixture } from '../data/mockTournamentData';
import {
  calculateLeaderboard,
  getAvailableMatchesForPresent,
  getTournamentSummary,
} from '../utils/tournamentCalculations';

const STORAGE_KEY_PLAYERS = 'fifa_ps4_real_players_v1';
const STORAGE_KEY_MATCHES = 'fifa_ps4_real_matches_v1';
const STORAGE_KEY_ATTENDANCE = 'fifa_ps4_real_attendance_v1';
const STORAGE_KEY_STARTED = 'fifa_ps4_real_started_v1';

export function useTournament() {
  // 1. Estado de Jugadores (arranca vacío por defecto para registro real)
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error al cargar jugadores:', e);
      }
    }
    return [];
  });

  // 2. Estado de Torneo Iniciado / Fixture Generado
  const [isTournamentStarted, setIsTournamentStarted] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STARTED);
    return saved === 'true';
  });

  // 3. Estado del Fixture de 120 partidos
  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MATCHES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 120) {
          return parsed;
        }
      } catch (e) {
        console.error('Error al cargar fixture:', e);
      }
    }
    return [];
  });

  // 4. Asistencia diaria (IDs de jugadores presentes en la casa)
  const [presentPlayerIds, setPresentPlayerIds] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error al cargar asistencia:', e);
      }
    }
    return [];
  });

  // 5. Partido activo seleccionado para el módulo de carga
  const [activeMatchId, setActiveMatchId] = useState(null);

  // 6. Notificación temporal (Toast)
  const [notification, setNotification] = useState(null);

  // Persistencia de jugadores
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
  }, [players]);

  // Persistencia de estado de inicio
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STARTED, String(isTournamentStarted));
  }, [isTournamentStarted]);

  // Persistencia de fixture
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
  }, [matches]);

  // Persistencia de asistencia
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(presentPlayerIds));
  }, [presentPlayerIds]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // AGREGAR JUGADOR INDIVIDUAL (FASE DE CONFIGURACIÓN)
  const addPlayer = (newPlayer) => {
    if (players.length >= 16) {
      showToast('Ya se alcanzó el límite de 16 participantes', 'error');
      return false;
    }
    setPlayers((prev) => [...prev, newPlayer]);
    showToast(`Jugador agregado: ${newPlayer.name} (${newPlayer.favoriteTeam})`, 'success');
    return true;
  };

  // ELIMINAR JUGADOR (FASE DE CONFIGURACIÓN)
  const removePlayer = (playerId) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    showToast('Jugador eliminado de la lista', 'info');
  };

  // CONFIRMAR PARTICIPANTES Y GENERAR FIXTURE DE 120 PARTIDOS
  const confirmAndGenerateFixture = () => {
    if (players.length !== 16) {
      showToast('Se requieren exactamente 16 participantes para generar el fixture', 'error');
      return false;
    }

    const generatedFixture = generateCompleteFixture(players);
    setMatches(generatedFixture);
    setIsTournamentStarted(true);
    // Por defecto todos los 16 jugadores presentes para comenzar
    setPresentPlayerIds(players.map((p) => p.id));
    if (generatedFixture.length > 0) {
      setActiveMatchId(generatedFixture[0].id);
    }

    showToast('¡Fixture generado exitosamente! 120 partidos únicos programados.', 'success');
    return true;
  };

  // REINICIAR TODO EL TORNEO (CON CONFIRMACIÓN OBLIGATORIA)
  const resetEntireTournament = () => {
    setPlayers([]);
    setMatches([]);
    setPresentPlayerIds([]);
    setActiveMatchId(null);
    setIsTournamentStarted(false);

    localStorage.removeItem(STORAGE_KEY_PLAYERS);
    localStorage.removeItem(STORAGE_KEY_MATCHES);
    localStorage.removeItem(STORAGE_KEY_ATTENDANCE);
    localStorage.removeItem(STORAGE_KEY_STARTED);

    showToast('Torneo reiniciado completamente. Estado limpio para nuevos registros.', 'info');
  };

  // Manejo de asistencia
  const togglePlayerAttendance = (playerId) => {
    setPresentPlayerIds((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const selectAllAttendance = () => {
    setPresentPlayerIds(players.map((p) => p.id));
  };

  const clearAllAttendance = () => {
    setPresentPlayerIds([]);
  };

  const setRandomAttendance = (count = 8) => {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    setPresentPlayerIds(shuffled.slice(0, count).map((p) => p.id));
  };

  // Guardar resultado de partido
  const submitMatchResult = (matchId, golesLocal, golesVisitante) => {
    const parsedLocal = parseInt(golesLocal, 10);
    const parsedVisitante = parseInt(golesVisitante, 10);

    if (isNaN(parsedLocal) || isNaN(parsedVisitante) || parsedLocal < 0 || parsedVisitante < 0) {
      showToast('Por favor ingresa marcadores válidos mayores o iguales a 0', 'error');
      return false;
    }

    let updatedMatch = null;

    setMatches((prevMatches) => {
      return prevMatches.map((match) => {
        if (match.id === matchId) {
          updatedMatch = {
            ...match,
            jugado: true,
            golesLocal: parsedLocal,
            golesVisitante: parsedVisitante,
            playedAt: new Date().toISOString(),
          };
          return updatedMatch;
        }
        return match;
      });
    });

    if (updatedMatch) {
      showToast(
        `Resultado guardado: ${updatedMatch.homePlayerName} ${parsedLocal} - ${parsedVisitante} ${updatedMatch.awayPlayerName}!`,
        'success'
      );
    }

    return true;
  };

  // Reabrir o editar partido
  const resetMatchResult = (matchId) => {
    setMatches((prevMatches) => {
      return prevMatches.map((match) => {
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
    });
    showToast('Partido reabierto como pendiente', 'info');
  };

  // Cálculos memorizados
  const leaderboard = useMemo(() => calculateLeaderboard(players, matches), [players, matches]);

  const suggestedMatchesToday = useMemo(
    () => getAvailableMatchesForPresent(matches, presentPlayerIds),
    [matches, presentPlayerIds]
  );

  const summary = useMemo(() => getTournamentSummary(matches), [matches]);

  // Selección automática de partido activo
  useEffect(() => {
    if (!activeMatchId && matches.length > 0) {
      if (suggestedMatchesToday.length > 0) {
        setActiveMatchId(suggestedMatchesToday[0].id);
      } else {
        const firstPending = matches.find((m) => !m.jugado);
        if (firstPending) {
          setActiveMatchId(firstPending.id);
        }
      }
    } else if (activeMatchId) {
      const current = matches.find((m) => m.id === activeMatchId);
      if (current && current.jugado && suggestedMatchesToday.length > 0) {
        setActiveMatchId(suggestedMatchesToday[0].id);
      }
    }
  }, [suggestedMatchesToday, matches, activeMatchId]);

  const activeMatch = useMemo(() => {
    return matches.find((m) => m.id === activeMatchId) || null;
  }, [matches, activeMatchId]);

  return {
    players,
    matches,
    isTournamentStarted,
    presentPlayerIds,
    activeMatch,
    activeMatchId,
    setActiveMatchId,
    leaderboard,
    suggestedMatchesToday,
    summary,
    notification,
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
