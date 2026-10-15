export const TOURNAMENT_URL = 'https://noeltejeda.github.io/EliminatoriasFC/';

/**
 * Genera el texto formateado para compartir un partido en WhatsApp
 */
export function buildMatchWhatsAppMessage(match) {
  const localGoals = match.golesLocal ?? 0;
  const awayGoals = match.golesVisitante ?? 0;

  let outcomeEmoji = '🤝 ¡Empate!';
  if (localGoals > awayGoals) {
    outcomeEmoji = `🏆 ¡Victoria para *${match.homePlayerName}*!`;
  } else if (awayGoals > localGoals) {
    outcomeEmoji = `🏆 ¡Victoria para *${match.awayPlayerName}*!`;
  }

  return `⚽ *¡RESULTADO OFICIAL - ELIMINATORIAS PS4!* ⚽
🏆 *Fecha ${match.round || 'Torneo'} · Partido ${match.id}*

🎮 *${match.homePlayerName}* (${match.homeTeam || 'Local'})  *${localGoals}*
🆚
🎮 *${match.awayPlayerName}* (${match.awayTeam || 'Visita'})  *${awayGoals}*

${outcomeEmoji}

📊 *Consulta la tabla de posiciones en vivo:*
${TOURNAMENT_URL}`;
}

/**
 * Abre la app o web de WhatsApp para compartir el resultado de un partido
 */
export function shareMatchToWhatsApp(match) {
  if (!match) return;
  const message = buildMatchWhatsAppMessage(match);
  const encoded = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Genera el texto formateado para compartir el Top 8 / Tabla de Posiciones
 */
export function buildLeaderboardWhatsAppMessage(leaderboard) {
  if (!leaderboard || leaderboard.length === 0) return '';

  const medals = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
  const top8 = leaderboard.slice(0, 8);

  const topLines = top8.map((row, idx) => {
    const medal = medals[idx] || `${idx + 1}º`;
    const dgPrefix = row.goalDifference > 0 ? '+' : '';
    return `${medal} *${row.name}* (${row.team}) · *${row.points} pts* (PJ: ${row.played}, DG: ${dgPrefix}${row.goalDifference})`;
  }).join('\n');

  return `📊 *TABLA DE POSICIONES - ELIMINATORIAS PS4* 📊
🌍 *ZONA DE CLASIFICACIÓN AL MUNDIAL (TOP 8):*

${topLines}

🔥 *Sigue todos los partidos y fixture completo:*
${TOURNAMENT_URL}`;
}

/**
 * Abre WhatsApp para compartir la tabla de posiciones actual
 */
export function shareLeaderboardToWhatsApp(leaderboard) {
  if (!leaderboard || leaderboard.length === 0) return;
  const message = buildLeaderboardWhatsAppMessage(leaderboard);
  const encoded = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
