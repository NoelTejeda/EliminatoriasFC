/**
 * DATOS DE PRUEBA Y GENERADOR DE FIXTURE - TORNEO FIFA PS4
 * 16 Participantes - Formato Round Robin Completo (120 Partidos Únicos)
 */

export const INITIAL_PLAYERS = [
  { id: 'p1', name: 'Noel', tag: 'NOEL', favoriteTeam: 'Real Madrid', color: '#00f59b' },
  { id: 'p2', name: 'Jorge', tag: 'Jorge', favoriteTeam: 'Manchester City', color: '#38bdf8' },
  { id: 'p3', name: 'Armando', tag: 'Armando', favoriteTeam: 'Bayern Múnich', color: '#f43f5e' },
  { id: 'p4', name: 'Carlos', tag: 'Carlos', favoriteTeam: 'Arsenal', color: '#fbbf24' },
  { id: 'p5', name: 'Cesar', tag: 'Cesar', favoriteTeam: 'PSG', color: '#a855f7' },
  { id: 'p6', name: 'Diego M', tag: 'Diego M', favoriteTeam: 'Liverpool', color: '#ef4444' },
  { id: 'p7', name: 'Diego D', tag: 'Diego D', favoriteTeam: 'Inter de Milán', color: '#06b6d4' },
  { id: 'p8', name: 'Francisco', tag: 'Francisco', favoriteTeam: 'Barcelona', color: '#eab308' },
  { id: 'p9', name: 'Javi', tag: 'Javi', favoriteTeam: 'Chelsea', color: '#3b82f6' },
  { id: 'p10', name: 'Jose', tag: 'Jose', favoriteTeam: 'Atlético de Madrid', color: '#ec4899' },
  { id: 'p11', name: 'Josep', tag: 'Josep', favoriteTeam: 'Juventus', color: '#94a3b8' },
  { id: 'p12', name: 'Luis', tag: 'Luis', favoriteTeam: 'Borussia Dortmund', color: '#facc15' },
  { id: 'p13', name: 'Rafael', tag: 'Rafael', favoriteTeam: 'Milan', color: '#f97316' },
  { id: 'p14', name: 'Yair', tag: 'Yair', favoriteTeam: 'Napoli', color: '#0ea5e9' },
  { id: 'p15', name: 'Enyer', tag: 'Enyer', favoriteTeam: 'Bayer Leverkusen', color: '#dc2626' },
  { id: 'p16', name: 'Giorgio', tag: 'Giorgio', favoriteTeam: 'Aston Villa', color: '#8b5cf6' },
];

/**
 * Algoritmo del Círculo (Berger tables) para generar un Round Robin perfecto:
 * Con 16 participantes, se generan 15 jornadas (fechas) de 8 partidos cada una.
 * Total: 15 x 8 = 120 partidos únicos, donde cada jugador juega exactamente 15 partidos
 * (1 contra cada uno de los otros 15 rivales) sin ninguna repetición.
 */
export function generateCompleteFixture(playersList = INITIAL_PLAYERS) {
  const n = playersList.length; // 16
  const totalRounds = n - 1; // 15
  const matchesPerRound = n / 2; // 8

  // Arreglo de índices para rotar
  const indices = playersList.map((_, i) => i);
  const fixture = [];
  let matchCounter = 1;

  for (let round = 1; round <= totalRounds; round++) {
    for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex++) {
      const homeIdx = indices[matchIndex];
      const awayIdx = indices[n - 1 - matchIndex];

      const homePlayer = playersList[homeIdx];
      const awayPlayer = playersList[awayIdx];

      // Alternar localías según la fecha para mayor equidad
      const isAlternated = (round + matchIndex) % 2 === 1;
      const actualHome = isAlternated ? awayPlayer : homePlayer;
      const actualAway = isAlternated ? homePlayer : awayPlayer;

      const idString = `M${matchCounter.toString().padStart(3, '0')}`;

      fixture.push({
        id: idString,
        round,
        homePlayerId: actualHome.id,
        awayPlayerId: actualAway.id,
        homePlayerName: actualHome.name,
        awayPlayerName: actualAway.name,
        homeTeam: actualHome.favoriteTeam,
        awayTeam: actualAway.favoriteTeam,
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        playedAt: null,
      });

      matchCounter++;
    }

    // Rotar elementos manteniendo el primer índice fijo (Algoritmo de Berger)
    const fixed = indices[0];
    const rotating = indices.slice(1);
    const last = rotating.pop();
    indices.splice(0, indices.length, fixed, last, ...rotating);
  }

  return fixture;
}

/**
 * Resultados iniciales simulados para probar la tabla y el sistema
 * ~28 partidos ya jugados entre las primeras fechas para tener emoción y estadísticas
 */
export function getInitialFixtureWithMockResults() {
  const fixture = generateCompleteFixture(INITIAL_PLAYERS);

  // Resultados realistas simulados para los primeros 28 partidos
  const mockScores = [
    { id: 'M001', golesLocal: 3, golesVisitante: 1 },
    { id: 'M002', golesLocal: 2, golesVisitante: 2 },
    { id: 'M003', golesLocal: 1, golesVisitante: 0 },
    { id: 'M004', golesLocal: 4, golesVisitante: 2 },
    { id: 'M005', golesLocal: 0, golesVisitante: 1 },
    { id: 'M006', golesLocal: 3, golesVisitante: 3 },
    { id: 'M007', golesLocal: 2, golesVisitante: 0 },
    { id: 'M008', golesLocal: 1, golesVisitante: 2 },

    // Fecha 2
    { id: 'M009', golesLocal: 2, golesVisitante: 1 },
    { id: 'M010', golesLocal: 0, golesVisitante: 0 },
    { id: 'M011', golesLocal: 3, golesVisitante: 0 },
    { id: 'M012', golesLocal: 1, golesVisitante: 4 },
    { id: 'M013', golesLocal: 2, golesVisitante: 3 },
    { id: 'M014', golesLocal: 1, golesVisitante: 1 },
    { id: 'M015', golesLocal: 5, golesVisitante: 2 },
    { id: 'M016', golesLocal: 0, golesVisitante: 1 },

    // Fecha 3
    { id: 'M017', golesLocal: 2, golesVisitante: 0 },
    { id: 'M018', golesLocal: 1, golesVisitante: 3 },
    { id: 'M019', golesLocal: 4, golesVisitante: 1 },
    { id: 'M020', golesLocal: 2, golesVisitante: 2 },
    { id: 'M021', golesLocal: 0, golesVisitante: 2 },
    { id: 'M022', golesLocal: 3, golesVisitante: 1 },
    { id: 'M023', golesLocal: 1, golesVisitante: 0 },
    { id: 'M024', golesLocal: 2, golesVisitante: 4 },

    // Algunos de Fecha 4
    { id: 'M025', golesLocal: 3, golesVisitante: 2 },
    { id: 'M026', golesLocal: 1, golesVisitante: 1 },
    { id: 'M027', golesLocal: 0, golesVisitante: 3 },
    { id: 'M028', golesLocal: 2, golesVisitante: 1 },
  ];

  const scoreMap = new Map(mockScores.map(s => [s.id, s]));

  return fixture.map((match, idx) => {
    if (scoreMap.has(match.id)) {
      const score = scoreMap.get(match.id);
      return {
        ...match,
        jugado: true,
        golesLocal: score.golesLocal,
        golesVisitante: score.golesVisitante,
        playedAt: new Date(Date.now() - (30 - idx) * 3600000).toISOString(),
      };
    }
    return match;
  });
}
