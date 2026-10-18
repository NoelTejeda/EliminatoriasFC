/**
 * UTILIDADES, CÁLCULOS ESTRICTOS DE LIGA Y MOTOR DE ANALÍTICA AVANZADA
 * ====================================================================
 * Incluye:
 * 1. Tabla de posiciones oficial en tiempo real (calculateLeaderboard)
 * 2. Filtro inteligente por asistencia en casa (getAvailableMatchesForPresent)
 * 3. Resumen ejecutivo del torneo (getTournamentSummary)
 * 4. Motor de Analítica Profunda por Jugador + Atributos EA FC + Récord de Carrera
 * 5. Analítica Global del Torneo (Goles por Fecha, Local vs Visita, Premios)
 * 6. Comparador Cara a Cara (Head-to-Head / H2H)
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
      cleanSheets: 0,
      recentForm: [], // W, D, L
    });
  });

  // Procesar solo los partidos que ya fueron jugados
  const playedMatches = matches.filter(
    (m) => m.jugado && m.golesLocal !== null && m.golesVisitante !== null
  );

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

    if (match.golesVisitante === 0) home.cleanSheets += 1;
    if (match.golesLocal === 0) away.cleanSheets += 1;

    if (match.golesLocal > match.golesVisitante) {
      home.pg += 1;
      home.pts += 3;
      home.recentForm.push('W');

      away.pp += 1;
      away.recentForm.push('L');
    } else if (match.golesLocal < match.golesVisitante) {
      away.pg += 1;
      away.pts += 3;
      away.recentForm.push('W');

      home.pp += 1;
      home.recentForm.push('L');
    } else {
      home.pe += 1;
      home.pts += 1;
      home.recentForm.push('D');

      away.pe += 1;
      away.pts += 1;
      away.recentForm.push('D');
    }
  });

  // Calcular diferencia de goles, efectividad y racha de últimos 5
  const leaderboardList = Array.from(statsMap.values()).map((item) => {
    const winRate = item.pj > 0 ? Math.round((item.pg / item.pj) * 100) : 0;
    const pointsEfficiency =
      item.pj > 0 ? Math.round((item.pts / (item.pj * 3)) * 100) : 0;

    return {
      ...item,
      dg: item.gf - item.gc,
      winRate,
      pointsEfficiency,
      recentForm: item.recentForm.slice(-5),
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
    return presentSet.has(match.homePlayerId) && presentSet.has(match.awayPlayerId);
  });
}

/**
 * Calcula estadísticas globales rápidas del torneo para la cabecera
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

/**
 * Genera una clave única de carrera para un jugador:
 * Prioriza el UID de Google si está vinculado; de lo contrario usa su nombre normalizado.
 */
export function getPlayerCareerKey(player) {
  if (!player) return 'unknown';
  if (player.uid) return `uid_${player.uid}`;
  return `name_${String(player.name || '').trim().toLowerCase()}`;
}

/**
 * Restringe un valor dentro de un rango [min, max]
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

/**
 * MOTOR DE ANALÍTICA PROFUNDA POR JUGADOR
 * Calcula desglose táctico, progresión por jornada, atributos estilo EA FC (0-99)
 * y combina sus estadísticas actuales con el historial de carrera guardado en la nube.
 */
export function calculatePlayerDeepAnalytics(
  playerId,
  players = [],
  matches = [],
  leaderboard = [],
  careerHistory = {}
) {
  const player = players.find((p) => p.id === playerId) || players[0];
  if (!player) return null;

  const standingRow = leaderboard.find((r) => r.player.id === player.id) || {
    position: '-',
    zone: 'PENDIENTE',
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    dg: 0,
    pts: 0,
    cleanSheets: 0,
    recentForm: [],
  };

  // Filtrar todos los partidos donde participa el jugador, ordenados por jornada
  const playerMatches = matches
    .filter((m) => m.homePlayerId === player.id || m.awayPlayerId === player.id)
    .sort((a, b) => a.round - b.round);

  const homeStats = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
  const awayStats = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };

  let cleanSheets = 0;
  let failedToScore = 0;
  let biggestWin = null;
  let biggestLoss = null;
  let currentWinStreak = 0;
  let bestWinStreak = 0;
  let currentUnbeatenStreak = 0;
  let bestUnbeatenStreak = 0;

  let cumulativePts = 0;
  let cumulativeGF = 0;
  let cumulativeGC = 0;

  const progression = [];

  playerMatches.forEach((m) => {
    const isHome = m.homePlayerId === player.id;
    const rivalId = isHome ? m.awayPlayerId : m.homePlayerId;
    const rivalName = isHome ? m.awayPlayerName : m.homePlayerName;
    const rivalTeam = isHome ? m.awayTeam : m.homeTeam;

    if (!m.jugado || m.golesLocal === null || m.golesVisitante === null) {
      return;
    }

    const myGoals = isHome ? m.golesLocal : m.golesVisitante;
    const rivalGoals = isHome ? m.golesVisitante : m.golesLocal;
    const goalDiff = myGoals - rivalGoals;

    let result = 'D';
    let pointsEarned = 1;
    if (myGoals > rivalGoals) {
      result = 'W';
      pointsEarned = 3;
    } else if (myGoals < rivalGoals) {
      result = 'L';
      pointsEarned = 0;
    }

    // Actualizar estadísticas Local / Visitante
    const targetSplit = isHome ? homeStats : awayStats;
    targetSplit.pj += 1;
    targetSplit.gf += myGoals;
    targetSplit.gc += rivalGoals;
    targetSplit.pts += pointsEarned;
    if (result === 'W') targetSplit.pg += 1;
    else if (result === 'D') targetSplit.pe += 1;
    else targetSplit.pp += 1;

    // Vallas invictas y partidos sin marcar
    if (rivalGoals === 0) cleanSheets += 1;
    if (myGoals === 0) failedToScore += 1;

    // Mayor victoria y peor derrota
    if (result === 'W') {
      if (
        !biggestWin ||
        goalDiff > biggestWin.goalDiff ||
        (goalDiff === biggestWin.goalDiff && myGoals > biggestWin.myGoals)
      ) {
        biggestWin = {
          matchId: m.id,
          round: m.round,
          rivalName,
          rivalTeam,
          myGoals,
          rivalGoals,
          goalDiff,
          scoreText: `${myGoals} - ${rivalGoals}`,
        };
      }
    } else if (result === 'L') {
      const lossMargin = rivalGoals - myGoals;
      if (
        !biggestLoss ||
        lossMargin > biggestLoss.lossMargin ||
        (lossMargin === biggestLoss.lossMargin && rivalGoals > biggestLoss.rivalGoals)
      ) {
        biggestLoss = {
          matchId: m.id,
          round: m.round,
          rivalName,
          rivalTeam,
          myGoals,
          rivalGoals,
          lossMargin,
          scoreText: `${myGoals} - ${rivalGoals}`,
        };
      }
    }

    // Rachas
    if (result === 'W') {
      currentWinStreak += 1;
      currentUnbeatenStreak += 1;
      if (currentWinStreak > bestWinStreak) bestWinStreak = currentWinStreak;
      if (currentUnbeatenStreak > bestUnbeatenStreak)
        bestUnbeatenStreak = currentUnbeatenStreak;
    } else if (result === 'D') {
      currentWinStreak = 0;
      currentUnbeatenStreak += 1;
      if (currentUnbeatenStreak > bestUnbeatenStreak)
        bestUnbeatenStreak = currentUnbeatenStreak;
    } else {
      currentWinStreak = 0;
      currentUnbeatenStreak = 0;
    }

    // Acumulados cronológicos
    cumulativePts += pointsEarned;
    cumulativeGF += myGoals;
    cumulativeGC += rivalGoals;

    progression.push({
      matchIndex: progression.length + 1,
      matchId: m.id,
      round: m.round,
      isHome,
      rivalId,
      rivalName,
      rivalTeam,
      myGoals,
      rivalGoals,
      result,
      pointsEarned,
      cumulativePts,
      cumulativeGF,
      cumulativeGC,
      cumulativeDG: cumulativeGF - cumulativeGC,
    });
  });

  const pj = standingRow.pj;
  const pg = standingRow.pg;
  const pe = standingRow.pe;
  const pp = standingRow.pp;
  const gf = standingRow.gf;
  const gc = standingRow.gc;
  const dg = standingRow.dg;
  const pts = standingRow.pts;

  const winRate = pj > 0 ? Math.round((pg / pj) * 100) : 0;
  const drawRate = pj > 0 ? Math.round((pe / pj) * 100) : 0;
  const lossRate = pj > 0 ? Math.round((pp / pj) * 100) : 0;
  const pointsEfficiency = pj > 0 ? Math.round((pts / (pj * 3)) * 100) : 0;

  const goalsForPerMatch = pj > 0 ? Number((gf / pj).toFixed(2)) : 0;
  const goalsAgainstPerMatch = pj > 0 ? Number((gc / pj).toFixed(2)) : 0;

  // ── CÁLCULO DE ATRIBUTOS ESTILO CARTA EA FC (60 a 99) ──
  const ataScore =
    pj > 0 ? clamp(55 + goalsForPerMatch * 14 + (pg / pj) * 8, 50, 99) : 70;
  const defScore =
    pj > 0
      ? clamp(88 - goalsAgainstPerMatch * 11 + (cleanSheets / pj) * 16, 48, 99)
      : 70;
  const efeScore = pj > 0 ? clamp(50 + pointsEfficiency * 0.48, 48, 99) : 70;

  // Forma reciente sobre últimos 5 partidos
  const recentForm = standingRow.recentForm || [];
  const recentPts = recentForm.reduce(
    (acc, r) => acc + (r === 'W' ? 3 : r === 'D' ? 1 : 0),
    0
  );
  const maxRecentPts = Math.max(1, recentForm.length * 3);
  const forScore =
    recentForm.length > 0
      ? clamp(52 + (recentPts / maxRecentPts) * 46, 48, 99)
      : 70;

  const locEff =
    homeStats.pj > 0 ? (homeStats.pts / (homeStats.pj * 3)) * 100 : 50;
  const visEff =
    awayStats.pj > 0 ? (awayStats.pts / (awayStats.pj * 3)) * 100 : 50;

  const locScore =
    homeStats.pj > 0 ? clamp(52 + locEff * 0.45, 48, 99) : 70;
  const visScore =
    awayStats.pj > 0 ? clamp(52 + visEff * 0.45, 48, 99) : 70;

  const ovr = clamp(
    ataScore * 0.22 +
      defScore * 0.2 +
      efeScore * 0.26 +
      forScore * 0.14 +
      locScore * 0.09 +
      visScore * 0.09,
    55,
    99
  );

  const attributes = {
    OVR: ovr,
    ATA: ataScore,
    DEF: defScore,
    EFE: efeScore,
    FOR: forScore,
    LOC: locScore,
    VIS: visScore,
  };

  // ── COMBINACIÓN CON HISTORIAL DE CARRERA (MULTI-TORNEO) ──
  const careerKey = getPlayerCareerKey(player);
  const nameFallbackKey = `name_${String(player.name || '').trim().toLowerCase()}`;
  const savedCareer =
    careerHistory[careerKey] || careerHistory[nameFallbackKey] || {
      tournamentsPlayed: 0,
      titlesWon: 0,
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

  const careerTotals = {
    tournamentsPlayed: (savedCareer.tournamentsPlayed || 0) + (pj > 0 ? 1 : 0),
    titlesWon: savedCareer.titlesWon || 0,
    isReigningChampion: Boolean(savedCareer.isReigningChampion),
    runnerUpCount: savedCareer.runnerUpCount || 0,
    worldCupQualifications:
      (savedCareer.worldCupQualifications || 0) +
      (standingRow.position <= 8 && pj > 0 && !savedCareer._currentWCQualifiedCounted ? 1 : 0),
    pj: (savedCareer.pj || 0) + pj,
    pg: (savedCareer.pg || 0) + pg,
    pe: (savedCareer.pe || 0) + pe,
    pp: (savedCareer.pp || 0) + pp,
    gf: (savedCareer.gf || 0) + gf,
    gc: (savedCareer.gc || 0) + gc,
    dg: (savedCareer.gf || 0) + gf - ((savedCareer.gc || 0) + gc),
    pts: (savedCareer.pts || 0) + pts,
    cleanSheets: (savedCareer.cleanSheets || 0) + cleanSheets,
    archivedOnly: savedCareer,
  };

  careerTotals.winRate =
    careerTotals.pj > 0
      ? Math.round((careerTotals.pg / careerTotals.pj) * 100)
      : 0;

  const qualificationMath = calculateTop8QualificationStatus(player.id, leaderboard);

  return {
    player,
    position: standingRow.position,
    zone: standingRow.zone,
    pj,
    pg,
    pe,
    pp,
    gf,
    gc,
    dg,
    pts,
    winRate,
    drawRate,
    lossRate,
    pointsEfficiency,
    goalsForPerMatch,
    goalsAgainstPerMatch,
    cleanSheets,
    failedToScore,
    biggestWin,
    biggestLoss,
    currentWinStreak,
    bestWinStreak,
    currentUnbeatenStreak,
    bestUnbeatenStreak,
    recentForm,
    homeStats,
    awayStats,
    progression,
    attributes,
    careerTotals,
    qualificationMath,
  };
}

/**
 * CALCULADORA MATEMÁTICA DE CLASIFICACIÓN AL TOP 8 (ZONA MUNDIAL)
 * Determina cuántos puntos le faltan a un jugador para alcanzar/superar la línea del 8º puesto,
 * cuántos puntos le faltan para el umbral proyectado de clasificación (15 jornadas)
 * y si ya está matemáticamente clasificado o eliminado.
 */
export function calculateTop8QualificationStatus(playerId, leaderboard = []) {
  const totalMatchesPerPlayer = Math.max(1, (leaderboard.length || 16) - 1); // 15 jornadas
  const row = leaderboard.find((r) => r.player.id === playerId);
  const row8 = leaderboard[7] || { pts: 0, dg: 0, pj: 0, player: { name: '8º Puesto' } };
  const row9 = leaderboard[8] || { pts: 0, dg: 0, pj: 0, player: { name: '9º Puesto' } };

  if (!row) {
    return {
      isTop8: false,
      matchesLeft: totalMatchesPerPlayer,
      pointsRemaining: totalMatchesPerPlayer * 3,
      maxPossiblePts: totalMatchesPerPlayer * 3,
      cutoff8thPts: row8.pts,
      cutoff8thDG: row8.dg,
      challenger9thPts: row9.pts,
      ptsToEqual8th: 0,
      ptsToOvertake8th: 0,
      winsNeededForCurrent8th: 0,
      cushionOver9th: 0,
      projectedCutoffPts: 21,
      ptsNeededForProjected: 21,
      ptsToClinchMath: totalMatchesPerPlayer * 3,
      isClinchedMathematically: false,
      isEliminatedMathematically: false,
      shortBadgeText: 'Faltan 21 pts (Est.)',
      detailedSummary: 'Torneo por iniciar (umbral estimado: 21 pts en 15 fechas).',
      statusType: 'neutral',
    };
  }

  const isTop8 = row.position <= 8;
  const matchesLeft = Math.max(0, totalMatchesPerPlayer - row.pj);
  const pointsRemaining = matchesLeft * 3;
  const maxPossiblePts = row.pts + pointsRemaining;

  // Máximo puntaje posible de cada uno de los otros 15 jugadores
  const othersMaxPts = leaderboard
    .filter((r) => r.player.id !== playerId)
    .map((r) => r.pts + Math.max(0, totalMatchesPerPlayer - r.pj) * 3)
    .sort((a, b) => b - a);

  const othersCurrentPts = leaderboard
    .filter((r) => r.player.id !== playerId)
    .map((r) => r.pts)
    .sort((a, b) => b - a);

  // El 8º rival con mayor techo de puntos marca la barrera de clasificación matemática
  const eighthHighestOtherMaxPts = othersMaxPts[7] ?? 0;
  // El 8º rival con mayor puntaje actual marca la barrera de eliminación matemática
  const eighthHighestOtherCurrentPts = othersCurrentPts[7] ?? 0;

  // Clasificado matemáticamente si ni siquiera 8 rivales ganando todo pueden alcanzar sus puntos actuales
  const isClinchedMathematically =
    row.pj > 0 && isTop8 && row.pts > eighthHighestOtherMaxPts;

  // Eliminado matemáticamente si aun ganando todo lo que le queda no alcanza los puntos actuales del 8º rival
  const isEliminatedMathematically =
    maxPossiblePts < eighthHighestOtherCurrentPts ||
    (matchesLeft === 0 && !isTop8);

  // Puntos necesarios para alcanzar/superar la línea ACTUAL del 8º puesto
  let ptsToEqual8th = 0;
  let ptsToOvertake8th = 0;
  if (!isTop8) {
    ptsToEqual8th = Math.max(0, row8.pts - row.pts);
    // Si tiene mejor diferencia de goles que el 8º, igualarlo en puntos le basta; si no, necesita +1 pt
    ptsToOvertake8th =
      row.dg > row8.dg ? ptsToEqual8th : ptsToEqual8th + 1;
  }

  const winsNeededForCurrent8th = Math.ceil(ptsToOvertake8th / 3);
  const cushionOver9th = isTop8 ? Math.max(0, row.pts - row9.pts) : 0;

  // Proyección realista de cierre del 8º puesto tras las 15 jornadas
  // Históricamente en liga de 16 a 1 vuelta (15 PJ), el corte del 8º puesto cierra entre 20 y 22 pts.
  const paceProjected8th =
    row8.pj >= 3
      ? Math.round((row8.pts / row8.pj) * totalMatchesPerPlayer)
      : 21;
  const projectedCutoffPts = clamp(
    Math.max(row8.pts, paceProjected8th),
    Math.max(row8.pts, 19),
    26
  );
  const ptsNeededForProjected = Math.max(0, projectedCutoffPts - row.pts);

  // Puntos que le faltan para sellar clasificación matemática absoluta sin depender de nadie
  const ptsToClinchMath = isClinchedMathematically
    ? 0
    : Math.max(0, eighthHighestOtherMaxPts + 1 - row.pts);

  // Texto corto para la tabla de posiciones y resumen detallado para el Hub
  let shortBadgeText = '';
  let detailedSummary = '';
  let statusType = 'neutral'; // 'clinched' | 'safe' | 'borderline' | 'chasing' | 'danger' | 'eliminated'

  if (isClinchedMathematically) {
    shortBadgeText = '✅ CLASIFICADO MAT.';
    detailedSummary = `¡Clasificado matemáticamente al Mundial! Ningún rival fuera del Top 8 puede alcanzarlo.`;
    statusType = 'clinched';
  } else if (isEliminatedMathematically) {
    shortBadgeText = '❌ SIN OPCIONES MAT.';
    detailedSummary = `Eliminado matemáticamente: su techo máximo es ${maxPossiblePts} pts y el corte actual del 8º ya exige más.`;
    statusType = 'eliminated';
  } else if (isTop8) {
    if (cushionOver9th >= 4) {
      shortBadgeText = `Adentro (+${cushionOver9th} s/9º) · Meta: +${ptsNeededForProjected} pts`;
      detailedSummary = `En Zona Mundial (#${row.position}) con +${cushionOver9th} pts de ventaja sobre el 9º (${row9.player.name}). Necesita ~${ptsNeededForProjected} pts más en ${matchesLeft} PJ para llegar al corte proyectado (${projectedCutoffPts} pts).`;
      statusType = 'safe';
    } else {
      shortBadgeText = `En corte (+${cushionOver9th} s/9º) · Meta: +${ptsNeededForProjected} pts`;
      detailedSummary = `Dentro del Top 8 (#${row.position}), pero con solo +${cushionOver9th} pts sobre el 9º (${row9.player.name}). Necesita sumar ~${ptsNeededForProjected} pts de ${pointsRemaining} en juego para asegurar el pase.`;
      statusType = 'borderline';
    }
  } else {
    // Fuera del Top 8 (Puestos 9 al 16)
    if (ptsToOvertake8th > pointsRemaining) {
      shortBadgeText = '❌ SIN OPCIONES MAT.';
      detailedSummary = `Necesita ${ptsToOvertake8th} pts para superar al 8º pero solo le quedan ${pointsRemaining} pts en disputa.`;
      statusType = 'eliminated';
    } else if (ptsToEqual8th === 0) {
      shortBadgeText = `Empatado con 8º · Falta +1 pt (o DG)`;
      detailedSummary = `Tiene los mismos puntos (${row.pts}) que el 8º (${row8.player.name}), pero está fuera por Diferencia de Goles (${row.dg} vs ${row8.dg}). Necesita +1 pt para superarlo hoy y ~${ptsNeededForProjected} pts para el corte final.`;
      statusType = 'chasing';
    } else {
      const canReachProjected = ptsNeededForProjected <= pointsRemaining;
      shortBadgeText = `Faltan +${ptsToOvertake8th} pts p/8º (Meta: +${ptsNeededForProjected})`;
      detailedSummary = `A ${ptsToEqual8th} pts de igualar y ${ptsToOvertake8th} pts de superar al 8º actual (${row8.player.name}, ${row8.pts} pts). Le quedan ${matchesLeft} partidos (${pointsRemaining} pts posibles)${
        canReachProjected
          ? ` y necesita ~${ptsNeededForProjected} pts para alcanzar el corte proyectado de ${projectedCutoffPts} pts.`
          : `, por lo que depende de que los de arriba pierdan puntos.`
      }`;
      statusType = ptsToOvertake8th <= 3 ? 'chasing' : 'danger';
    }
  }

  return {
    isTop8,
    matchesLeft,
    pointsRemaining,
    maxPossiblePts,
    cutoff8thPts: row8.pts,
    cutoff8thDG: row8.dg,
    cutoff8thName: row8.player?.name || '8º Puesto',
    challenger9thPts: row9.pts,
    challenger9thName: row9.player?.name || '9º Puesto',
    ptsToEqual8th,
    ptsToOvertake8th,
    winsNeededForCurrent8th,
    cushionOver9th,
    projectedCutoffPts,
    ptsNeededForProjected,
    ptsToClinchMath,
    isClinchedMathematically,
    isEliminatedMathematically,
    shortBadgeText,
    detailedSummary,
    statusType,
  };
}

/**
 * ANALÍTICA GLOBAL DEL TORNEO
 * Calcula líderes estadísticos, distribución Local/Empate/Visita y goles por jornada (Fechas 1-15)
 */
export function calculateTournamentGlobalAnalytics(
  players = [],
  matches = [],
  leaderboard = []
) {
  const playedMatches = matches.filter(
    (m) => m.jugado && m.golesLocal !== null && m.golesVisitante !== null
  );

  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  let homeGoals = 0;
  let awayGoals = 0;

  let biggestBlowout = null;
  let mostGoalsMatch = null;

  playedMatches.forEach((m) => {
    homeGoals += m.golesLocal;
    awayGoals += m.golesVisitante;
    const totalMatchGoals = m.golesLocal + m.golesVisitante;
    const diff = Math.abs(m.golesLocal - m.golesVisitante);

    if (m.golesLocal > m.golesVisitante) homeWins += 1;
    else if (m.golesLocal < m.golesVisitante) awayWins += 1;
    else draws += 1;

    if (
      diff > 0 &&
      (!biggestBlowout ||
        diff > biggestBlowout.diff ||
        (diff === biggestBlowout.diff && totalMatchGoals > biggestBlowout.totalGoals))
    ) {
      const winnerName =
        m.golesLocal > m.golesVisitante ? m.homePlayerName : m.awayPlayerName;
      const loserName =
        m.golesLocal > m.golesVisitante ? m.awayPlayerName : m.homePlayerName;
      biggestBlowout = {
        match: m,
        diff,
        totalGoals: totalMatchGoals,
        winnerName,
        loserName,
        scoreText: `${m.homePlayerName} ${m.golesLocal} - ${m.golesVisitante} ${m.awayPlayerName}`,
      };
    }

    if (!mostGoalsMatch || totalMatchGoals > mostGoalsMatch.totalGoals) {
      mostGoalsMatch = {
        match: m,
        totalGoals: totalMatchGoals,
        scoreText: `${m.homePlayerName} ${m.golesLocal} - ${m.golesVisitante} ${m.awayPlayerName}`,
      };
    }
  });

  const totalPlayed = playedMatches.length;
  const homeWinPct = totalPlayed > 0 ? Math.round((homeWins / totalPlayed) * 100) : 0;
  const drawPct = totalPlayed > 0 ? Math.round((draws / totalPlayed) * 100) : 0;
  const awayWinPct =
    totalPlayed > 0 ? Math.max(0, 100 - homeWinPct - drawPct) : 0;

  // Estadísticas por Jornada (Fechas 1 a 15)
  const roundsData = Array.from({ length: 15 }, (_, idx) => {
    const roundNum = idx + 1;
    const roundMatches = matches.filter((m) => m.round === roundNum);
    const roundPlayed = roundMatches.filter(
      (m) => m.jugado && m.golesLocal !== null && m.golesVisitante !== null
    );
    const roundGoals = roundPlayed.reduce(
      (sum, m) => sum + m.golesLocal + m.golesVisitante,
      0
    );

    return {
      round: roundNum,
      totalMatches: roundMatches.length || 8,
      playedCount: roundPlayed.length,
      totalGoals: roundGoals,
      avgGoals:
        roundPlayed.length > 0
          ? Number((roundGoals / roundPlayed.length).toFixed(1))
          : 0,
    };
  });

  // Premios Individuales (Awards)
  const activeStandings = leaderboard.filter((r) => r.pj > 0);

  const goldenBoot =
    activeStandings.length > 0
      ? [...activeStandings].sort((a, b) => {
          if (b.gf !== a.gf) return b.gf - a.gf;
          return a.pj - b.pj; // menos partidos jugados desempata
        })[0]
      : null;

  const goldenGlove =
    activeStandings.length > 0
      ? [...activeStandings].sort((a, b) => {
          const avgA = a.gc / a.pj;
          const avgB = b.gc / b.pj;
          if (avgA !== avgB) return avgA - avgB;
          if (b.cleanSheets !== a.cleanSheets) return b.cleanSheets - a.cleanSheets;
          return b.pj - a.pj;
        })[0]
      : null;

  const mvpLeader = activeStandings.length > 0 ? activeStandings[0] : null;

  // Ranking ofensivo y defensivo para gráficos de barras
  const topScorersList = [...leaderboard]
    .sort((a, b) => b.gf - a.gf || b.dg - a.dg)
    .slice(0, 8);

  const bestDefenseList = [...leaderboard]
    .filter((r) => r.pj > 0)
    .sort((a, b) => a.gc / a.pj - b.gc / b.pj || b.cleanSheets - a.cleanSheets)
    .slice(0, 8);

  return {
    totalPlayed,
    homeWins,
    draws,
    awayWins,
    homeWinPct,
    drawPct,
    awayWinPct,
    homeGoals,
    awayGoals,
    biggestBlowout,
    mostGoalsMatch,
    roundsData,
    goldenBoot,
    goldenGlove,
    mvpLeader,
    topScorersList,
    bestDefenseList,
  };
}

/**
 * COMPARADOR CARA A CARA (HEAD-TO-HEAD) ENTRE DOS JUGADORES
 */
export function calculateHeadToHead(
  playerAId,
  playerBId,
  players = [],
  matches = [],
  leaderboard = [],
  careerHistory = {}
) {
  const analyticsA = calculatePlayerDeepAnalytics(
    playerAId,
    players,
    matches,
    leaderboard,
    careerHistory
  );
  const analyticsB = calculatePlayerDeepAnalytics(
    playerBId,
    players,
    matches,
    leaderboard,
    careerHistory
  );

  const directMatch = matches.find(
    (m) =>
      (m.homePlayerId === playerAId && m.awayPlayerId === playerBId) ||
      (m.homePlayerId === playerBId && m.awayPlayerId === playerAId)
  );

  return {
    playerA: analyticsA,
    playerB: analyticsB,
    directMatch,
  };
}

/**
 * OBTIENE EL PALMARÉS E INSIGNIAS HISTÓRICAS DE UN JUGADOR
 * Busca tanto por UID de Google como por nombre normalizado para que el
 * distintivo de Campeón Vigente (👑), Estrellas (⭐) y Clasificaciones Top 8 (🌐)
 * se muestre siempre, incluso al iniciar una nueva eliminatoria.
 */
export function getPlayerHonors(player, careerHistory = {}) {
  if (!player || !careerHistory) {
    return {
      titlesWon: 0,
      isReigningChampion: false,
      worldCupQualifications: 0,
      runnerUpCount: 0,
      tournamentsPlayed: 0,
      photoURL: player?.photoURL || null,
    };
  }

  const uidKey = player.uid ? `uid_${player.uid}` : null;
  const nameKey = `name_${String(player.name || '').trim().toLowerCase()}`;

  const byUid = uidKey ? careerHistory[uidKey] : null;
  const byName = careerHistory[nameKey] || null;
  const record = byUid || byName || {};

  return {
    titlesWon: record.titlesWon || 0,
    isReigningChampion: Boolean(record.isReigningChampion),
    worldCupQualifications: record.worldCupQualifications || 0,
    runnerUpCount: record.runnerUpCount || 0,
    tournamentsPlayed: record.tournamentsPlayed || 0,
    photoURL: player.photoURL || byUid?.photoURL || byName?.photoURL || null,
  };
}

/**
 * RESUELVE LA FOTO DE PERFIL DE GOOGLE DE UN JUGADOR
 * Prioriza:
 * 1) player.photoURL guardado en el participante
 * 2) photoURL guardado en su historial permanente (careerHistory)
 * 3) Si el usuario actual tiene sesión iniciada en Google y su UID, email o nombre coincide con el jugador
 */
export function resolvePlayerPhotoURL(
  player,
  careerHistory = {},
  currentUser = null
) {
  if (!player) return null;
  if (player.photoURL) return player.photoURL;

  const uidKey = player.uid ? `uid_${player.uid}` : null;
  const normalizedPlayerName = String(player.name || '').trim().toLowerCase();
  const nameKey = `name_${normalizedPlayerName}`;

  if (uidKey && careerHistory?.[uidKey]?.photoURL) {
    return careerHistory[uidKey].photoURL;
  }
  if (careerHistory?.[nameKey]?.photoURL) {
    return careerHistory[nameKey].photoURL;
  }

  if (currentUser?.photoURL) {
    if (player.uid && player.uid === currentUser.uid) {
      return currentUser.photoURL;
    }
    if (
      player.email &&
      currentUser.email &&
      player.email.toLowerCase() === currentUser.email.toLowerCase()
    ) {
      return currentUser.photoURL;
    }
    const userDisplay = String(currentUser.displayName || '').trim().toLowerCase();
    const userFirstWord = userDisplay.split(/\s+/)[0] || '';
    const playerFirstWord = normalizedPlayerName.split(/\s+/)[0] || '';
    const emailPrefix = String(currentUser.email || '')
      .split('@')[0]
      .toLowerCase();

    if (
      normalizedPlayerName &&
      (userDisplay === normalizedPlayerName ||
        (playerFirstWord.length >= 3 && userFirstWord === playerFirstWord) ||
        (playerFirstWord.length >= 3 && emailPrefix.startsWith(playerFirstWord)))
    ) {
      return currentUser.photoURL;
    }
  }

  return null;
}

/**
 * GENERA LOS 12 PARTIDOS DE LA FASE DE GRUPOS DEL MUNDIAL (GRUPOS A Y B)
 * Cada grupo tiene 4 clasificados -> 3 fechas de 2 partidos = 6 partidos por grupo.
 */
export function generateWorldCupGroupMatches(groupA = [], groupB = []) {
  const buildGroupSchedule = (groupPlayers, groupLetter) => {
    if (groupPlayers.length < 4) return [];
    const [p1, p2, p3, p4] = groupPlayers;

    // 3 fechas clásicas de grupo FIFA de 4 equipos:
    // Fecha 1: 1 vs 4, 2 vs 3
    // Fecha 2: 1 vs 3, 4 vs 2
    // Fecha 3: 1 vs 2, 3 vs 4
    const pairings = [
      { round: 1, home: p1, away: p4 },
      { round: 1, home: p2, away: p3 },
      { round: 2, home: p1, away: p3 },
      { round: 2, home: p4, away: p2 },
      { round: 3, home: p1, away: p2 },
      { round: 3, home: p3, away: p4 },
    ];

    return pairings.map((pair, idx) => ({
      id: `G${groupLetter}${idx + 1}`,
      group: groupLetter,
      round: pair.round,
      homePlayerId: pair.home.id,
      awayPlayerId: pair.away.id,
      homePlayerName: pair.home.name,
      awayPlayerName: pair.away.name,
      homeTeam: pair.home.favoriteTeam,
      awayTeam: pair.away.favoriteTeam,
      homeColor: pair.home.color,
      awayColor: pair.away.color,
      jugado: false,
      golesLocal: null,
      golesVisitante: null,
      playedAt: null,
    }));
  };

  return [
    ...buildGroupSchedule(groupA, 'A'),
    ...buildGroupSchedule(groupB, 'B'),
  ];
}

/**
 * CALCULA LA TABLA DE POSICIONES DE UN GRUPO DEL MUNDIAL (GRUPO A O GRUPO B)
 * Los 2 primeros clasifican a Semifinales (1ºA vs 2ºB y 1ºB vs 2ºA).
 * En caso de igualdad total en PTS, DG, GF y PG, desempata la mejor posición
 * obtenida en las Eliminatorias (qualifierRank).
 */
export function calculateWorldCupGroupStandings(groupPlayers = [], groupMatches = [], groupLetter = 'A') {
  const statsMap = new Map();

  groupPlayers.forEach((p) => {
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
    });
  });

  const relevantMatches = groupMatches.filter(
    (m) =>
      m.group === groupLetter &&
      m.jugado &&
      m.golesLocal !== null &&
      m.golesVisitante !== null
  );

  relevantMatches.forEach((m) => {
    const home = statsMap.get(m.homePlayerId);
    const away = statsMap.get(m.awayPlayerId);
    if (!home || !away) return;

    home.pj += 1;
    away.pj += 1;
    home.gf += m.golesLocal;
    home.gc += m.golesVisitante;
    away.gf += m.golesVisitante;
    away.gc += m.golesLocal;

    if (m.golesLocal > m.golesVisitante) {
      home.pg += 1;
      home.pts += 3;
      away.pp += 1;
    } else if (m.golesLocal < m.golesVisitante) {
      away.pg += 1;
      away.pts += 3;
      home.pp += 1;
    } else {
      home.pe += 1;
      home.pts += 1;
      away.pe += 1;
      away.pts += 1;
    }
  });

  const list = Array.from(statsMap.values()).map((item) => ({
    ...item,
    dg: item.gf - item.gc,
  }));

  list.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (b.pg !== a.pg) return b.pg - a.pg;
    // Desempate deportivo: mejor puesto en la tabla de Eliminatorias (seed)
    return (a.player.qualifierRank || 99) - (b.player.qualifierRank || 99);
  });

  return list.map((entry, idx) => ({
    ...entry,
    position: idx + 1,
    qualifiedToSemis: idx < 2,
  }));
}

