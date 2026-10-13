/**
 * UTILIDADES Y CÁLCULOS ESTRICTOS DE LIGA Y TORNEO
 */

/**
 * Calcula la tabla de posiciones en tiempo real
 * Criterio de ordenamiento estricto:
 * 1º Puntos (PTS)
 * 2º Diferencia de Goles (DG)
 * 3º Goles a Favor (GF)
 * 4º Partidos Ganados (PG)
 */
export function calculateLeaderboard(players, matches) {
  // Inicializar acumuladores para cada jugador
  const statsMap = new Map();

  players.forEach((p) => {
    statsMap.set(p.id, {
      player: p,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0,
      recentForm: [], // W, D, L
    });
  });

  // Procesar solo los partidos que ya fueron jugados
  const playedMatches = matches.filter((m) => m.jugado && m.golesLocal !== null && m.golesVisitante !== null);

  // Ordenar por fecha/id para calcular la racha cronológicamente
  playedMatches.forEach((match) => {
    const home = statsMap.get(match.homePlayerId);
    const away = statsMap.get(match.awayPlayerId);

    if (!home || !away) return;

    home.pj += 1;
    away.pj += 1;

    home.gf += match.golesLocal;
    home.gc += match.golesVisitante;
    away.gf += match.golesVisitante;
    away.gc += match.golesLocal;

    if (match.golesLocal > match.golesVisitante) {
      // Gana Local
      home.pg += 1;
      home.pts += 3;
      home.recentForm.push('W');

      away.pp += 1;
      away.recentForm.push('L');
    } else if (match.golesLocal < match.golesVisitante) {
      // Gana Visitante
      away.pg += 1;
      away.pts += 3;
      away.recentForm.push('W');

      home.pp += 1;
      home.recentForm.push('L');
    } else {
      // Empate
      home.pe += 1;
      home.pts += 1;
      home.recentForm.push('D');

      away.pe += 1;
      away.pts += 1;
      away.recentForm.push('D');
    }
  });

  // Calcular diferencia de goles y racha de últimos 5
  const leaderboardList = Array.from(statsMap.values()).map((item) => {
    return {
      ...item,
      dg: item.gf - item.gc,
      recentForm: item.recentForm.slice(-5), // últimos 5
    };
  });

  // Ordenamiento estricto
  leaderboardList.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts; // 1º Puntos
    if (b.dg !== a.dg) return b.dg - a.dg;     // 2º Diferencia de Goles
    if (b.gf !== a.gf) return b.gf - a.gf;     // 3º Goles a Favor
    if (b.pg !== a.pg) return b.pg - a.pg;     // 4º Partidos Ganados
    return a.player.name.localeCompare(b.player.name);
  });

  // Asignar posición y zona
  return leaderboardList.map((entry, index) => {
    const position = index + 1;
    const isTop8 = position <= 8;
    return {
      ...entry,
      position,
      zone: isTop8 ? 'MUNDIAL' : 'ELIMINADO',
    };
  });
}

/**
 * Obtiene los partidos pendientes que corresponden ÚNICAMENTE a las personas presentes en la casa
 */
export function getAvailableMatchesForPresent(matches, presentPlayerIds) {
  const presentSet = new Set(presentPlayerIds);

  return matches.filter((match) => {
    if (match.jugado) return false;
    // Ambos deben estar en la casa
    return presentSet.has(match.homePlayerId) && presentSet.has(match.awayPlayerId);
  });
}

/**
 * Calcula estadísticas globales del torneo
 */
export function getTournamentSummary(matches) {
  const total = matches.length; // 120
  const played = matches.filter((m) => m.jugado).length;
  const pending = total - played;
  const progressPercent = total > 0 ? Math.round((played / total) * 100) : 0;
  
  let totalGoals = 0;
  matches.forEach((m) => {
    if (m.jugado && m.golesLocal !== null && m.golesVisitante !== null) {
      totalGoals += m.golesLocal + m.golesVisitante;
    }
  });

  const avgGoals = played > 0 ? (totalGoals / played).toFixed(1) : '0.0';

  return {
    total,
    played,
    pending,
    progressPercent,
    totalGoals,
    avgGoals,
  };
}
