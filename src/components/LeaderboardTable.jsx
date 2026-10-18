import React from 'react';
import { Trophy, HelpCircle, BarChart3, Crown, Target } from 'lucide-react';
import {
  getPlayerHonors,
  calculateTop8QualificationStatus,
} from '../utils/tournamentCalculations';

export function LeaderboardTable({
  leaderboard,
  presentPlayerIds,
  careerHistory = {},
  myLinkedPlayer,
  onSelectPlayerFilter,
}) {
  const presentSet = new Set(presentPlayerIds);

  const row8 = leaderboard[7] || null;
  const row9 = leaderboard[8] || null;
  const sampleMath =
    leaderboard.length > 0
      ? calculateTop8QualificationStatus(leaderboard[0].player.id, leaderboard)
      : null;

  const handleInspectPlayer = (playerId) => {
    if (onSelectPlayerFilter) {
      onSelectPlayerFilter(playerId);
      const analyticsSection = document.getElementById('analytics-hub-section');
      if (analyticsSection) {
        analyticsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Luz sutil de fondo */}
      <div className="absolute top-1/4 -left-10 w-48 h-48 bg-fifa-emerald/10 blur-3xl pointer-events-none" />

      {/* Cabecera de la Tabla */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-fifa-gold/15 text-fifa-gold">
              <Trophy className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white tracking-wide font-gaming flex items-center gap-2">
              TABLA DE POSICIONES EN TIEMPO REAL
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Criterio oficial: 1º Pts · 2º Dif. de Goles (DG) · 3º Goles a Favor (GF) · 4º Partidos Ganados (PG)
          </p>
        </div>

        {/* Leyenda de Zonas */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-fifa-emerald/10 border border-fifa-emerald/30 text-fifa-neon font-bold">
            <span className="w-2 h-2 rounded-full bg-fifa-neon" />
            <span>TOP 8: ZONA MUNDIAL</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>PUESTOS 9-16: ELIMINADOS</span>
          </div>
        </div>
      </div>

      {/* Termómetro de Corte Top 8 */}
      {row8 && row9 && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-900/75 border border-slate-800/90 rounded-xl p-3 text-xs">
          <div className="flex items-center justify-between sm:justify-start gap-2 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-fifa-neon" />
              Corte Actual #8 ({row8.player.name}):
            </span>
            <span className="font-black text-fifa-neon font-gaming">
              {row8.pts} PTS ({row8.dg >= 0 ? `+${row8.dg}` : row8.dg} DG)
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25">
            <span className="text-slate-400 font-semibold">
              Acechando #9 ({row9.player.name}):
            </span>
            <span className="font-black text-rose-300 font-gaming">
              {row9.pts} PTS ({row9.dg >= 0 ? `+${row9.dg}` : row9.dg} DG)
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25">
            <span className="text-slate-400 font-semibold">
              Corte Proyectado (15 Fechas):
            </span>
            <span className="font-black text-amber-300 font-gaming">
              ~{sampleMath?.projectedCutoffPts || 21} PTS para clasificar
            </span>
          </div>
        </div>
      )}

      {/* Tabla Responsiva */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[860px]">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-900/60">
              <th className="py-3 px-3 text-center w-12">POS</th>
              <th className="py-3 px-4">JUGADOR</th>
              <th className="py-3 px-2.5 text-center w-11" title="Partidos Jugados (Máximo 15)">PJ</th>
              <th className="py-3 px-2.5 text-center w-11" title="Partidos Ganados">PG</th>
              <th className="py-3 px-2.5 text-center w-11" title="Partidos Empatados">PE</th>
              <th className="py-3 px-2.5 text-center w-11" title="Partidos Perdidos">PP</th>
              <th className="py-3 px-2.5 text-center w-11" title="Goles a Favor">GF</th>
              <th className="py-3 px-2.5 text-center w-11" title="Goles en Contra">GC</th>
              <th className="py-3 px-2.5 text-center w-13" title="Diferencia de Goles (GF - GC)">DG</th>
              <th className="py-3 px-3 text-center w-15 bg-slate-800/80 text-fifa-neon" title="Puntos Oficiales">PTS</th>
              <th
                className="py-3 px-3 text-center w-44 text-amber-300"
                title="Cuántos puntos necesita para entrar al Top 8 hoy y para alcanzar el corte proyectado de 15 fechas"
              >
                META TOP 8 (PTS)
              </th>
              <th className="py-3 px-3 text-center hidden md:table-cell w-28">FORMA</th>
              <th className="py-3 px-3 text-center w-20">PERFIL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {leaderboard.map((row) => {
              const isTop8 = row.position <= 8;
              const isCutLine = row.position === 8;
              const isPresentInHouse = presentSet.has(row.player.id);
              const isMine = myLinkedPlayer && myLinkedPlayer.id === row.player.id;
              const honors = getPlayerHonors(row.player, careerHistory);
              const qualMath = calculateTop8QualificationStatus(row.player.id, leaderboard);

              return (
                <React.Fragment key={row.player.id}>
                  <tr
                    className={`transition-colors duration-150 ${
                      isMine
                        ? 'bg-sky-500/[0.08] hover:bg-sky-500/[0.14]'
                        : isTop8
                        ? 'bg-fifa-emerald/[0.04] hover:bg-fifa-emerald/[0.09]'
                        : 'bg-transparent hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Posición */}
                    <td className="py-3 px-3 text-center font-gaming">
                      <div className="flex items-center justify-center">
                        {row.position === 1 ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-gold-glow">
                            1
                          </div>
                        ) : row.position === 2 ? (
                          <div className="w-7 h-7 rounded-lg bg-slate-300 text-slate-950 font-black flex items-center justify-center">
                            2
                          </div>
                        ) : row.position === 3 ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-700 text-white font-black flex items-center justify-center">
                            3
                          </div>
                        ) : (
                          <span
                            className={`font-black text-sm ${
                              isTop8 ? 'text-fifa-neon' : 'text-slate-400'
                            }`}
                          >
                            {row.position}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Jugador con badges */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar con color asignado (estética de lujo intacta) */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-sm"
                          style={{
                            backgroundColor: row.player.color,
                            color: '#080c14',
                          }}
                        >
                          {row.player.name.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Nombre y equipo */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="font-bold text-white text-sm hover:text-fifa-neon cursor-pointer transition"
                              onClick={() => handleInspectPlayer(row.player.id)}
                            >
                              {row.player.name}
                            </span>

                            {honors.titlesWon > 0 && (
                              <span
                                title={`${honors.titlesWon}x Campeón del Mundo`}
                                className="text-xs text-fifa-gold font-black"
                              >
                                {'⭐'.repeat(Math.min(5, honors.titlesWon))}
                              </span>
                            )}

                            {honors.isReigningChampion && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-slate-950 flex items-center gap-0.5 shadow-sm">
                                <Crown className="w-2.5 h-2.5" />
                                CAMPEÓN VIGENTE
                              </span>
                            )}

                            {isMine && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-sky-500/20 text-sky-300 border border-sky-400/40">
                                ★ TÚ
                              </span>
                            )}

                            {row.player.uid && !isMine && (
                              <span
                                title="Cuenta Google vinculada"
                                className="px-1 py-0.5 rounded text-[8px] font-bold bg-slate-800 text-sky-400 border border-slate-700"
                              >
                                G✓
                              </span>
                            )}

                            {honors.worldCupQualifications > 0 && (
                              <span
                                title={`Ha clasificado ${honors.worldCupQualifications} veces al Mundial (Top 8)`}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800/90 text-amber-300 border border-amber-500/30"
                              >
                                🌐 {honors.worldCupQualifications}x Top 8
                              </span>
                            )}

                            {/* Badge En Casa */}
                            {isPresentInHouse && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-fifa-neon/20 text-fifa-neon border border-fifa-neon/40 flex items-center gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-fifa-neon animate-pulse" />
                                HOY
                              </span>
                            )}

                            {/* Badge Clasificado vs Eliminado */}
                            {isTop8 ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                [ZONA MUNDIAL]
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                                [ELIMINADO]
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {row.player.favoriteTeam}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Estadísticas de Partidos */}
                    <td className="py-3 px-2.5 text-center text-slate-300 font-semibold">{row.pj}</td>
                    <td className="py-3 px-2.5 text-center text-emerald-400 font-semibold">{row.pg}</td>
                    <td className="py-3 px-2.5 text-center text-slate-400 font-medium">{row.pe}</td>
                    <td className="py-3 px-2.5 text-center text-rose-400 font-medium">{row.pp}</td>

                    {/* Goles */}
                    <td className="py-3 px-2.5 text-center text-slate-300 font-medium">{row.gf}</td>
                    <td className="py-3 px-2.5 text-center text-slate-400 font-medium">{row.gc}</td>

                    {/* Diferencia de Goles */}
                    <td className="py-3 px-2.5 text-center font-bold">
                      <span
                        className={
                          row.dg > 0
                            ? 'text-fifa-neon'
                            : row.dg < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }
                      >
                        {row.dg > 0 ? `+${row.dg}` : row.dg}
                      </span>
                    </td>

                    {/* Puntos Oficiales */}
                    <td className="py-3 px-3 text-center bg-slate-900/80 font-black text-sm text-white font-gaming">
                      <span className={isTop8 ? 'text-fifa-neon text-base' : 'text-slate-200'}>
                        {row.pts}
                      </span>
                    </td>

                    {/* Calculadora Meta Top 8 */}
                    <td className="py-2.5 px-3 text-center" title={qualMath.detailedSummary}>
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        {qualMath.isClinchedMathematically ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-[10px]">
                            ✅ CLASIFICADO MAT.
                          </span>
                        ) : qualMath.isEliminatedMathematically ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-[10px]">
                            ❌ SIN OPCIONES MAT.
                          </span>
                        ) : isTop8 ? (
                          <>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                              Colchón +{qualMath.cushionOver9th} pt{qualMath.cushionOver9th === 1 ? '' : 's'} s/9º
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {qualMath.ptsNeededForProjected > 0
                                ? `Meta (~${qualMath.projectedCutoffPts}): faltan +${qualMath.ptsNeededForProjected} pts`
                                : `En meta proyectada (${qualMath.projectedCutoffPts}+ pts)`}
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] border ${
                                qualMath.ptsToOvertake8th <= 3
                                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                  : 'bg-rose-500/15 border-rose-500/35 text-rose-300'
                              }`}
                            >
                              {qualMath.ptsToEqual8th === 0
                                ? 'Empatado c/8º (+1 pt p/pasar)'
                                : `Faltan +${qualMath.ptsToOvertake8th} pts p/8º (${qualMath.winsNeededForCurrent8th}V)`}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Meta (~{qualMath.projectedCutoffPts}): faltan +{qualMath.ptsNeededForProjected} de {qualMath.pointsRemaining} pts
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Forma Reciente (Últimos 5) */}
                    <td className="py-3 px-3 text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {row.recentForm.length === 0 ? (
                          <span className="text-slate-600 text-[10px]">-</span>
                        ) : (
                          row.recentForm.map((result, rIdx) => (
                            <span
                              key={rIdx}
                              className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${
                                result === 'W'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : result === 'D'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              }`}
                            >
                              {result}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Botón rápido a Carta Pro & Gráficos */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleInspectPlayer(row.player.id)}
                        title={`Ver Carta Pro y gráficos de ${row.player.name}`}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-fifa-neon hover:text-slate-950 text-slate-300 font-bold text-[10px] inline-flex items-center gap-1 transition"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>Stats</span>
                      </button>
                    </td>
                  </tr>

                  {/* LÍNEA DE CORTE VISUAL OBLIGATORIA ENTRE PUESTO 8 Y 9 */}
                  {isCutLine && (
                    <tr className="bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-rose-950/60 border-y-2 border-fifa-neon/80">
                      <td colSpan={13} className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="h-px bg-gradient-to-r from-transparent via-fifa-neon to-transparent flex-1" />
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/90 border border-fifa-neon text-fifa-neon text-[11px] font-black uppercase tracking-wider font-gaming shadow-neon-glow">
                            <Trophy className="w-3.5 h-3.5" />
                            <span>LÍNEA DE CLASIFICACIÓN · SOLO EL TOP 8 AVANZA AL MUNDIAL</span>
                            <Trophy className="w-3.5 h-3.5" />
                          </div>
                          <div className="h-px bg-gradient-to-r from-transparent via-fifa-neon to-transparent flex-1" />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pie de tabla explicativo */}
      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Haz clic en cualquier jugador o en "Stats" para abrir su Carta Pro EA FC y curvas de rendimiento.</span>
        </div>
        <div className="text-slate-400">
          PG: 3 pts · PE: 1 pto · PP: 0 pts
        </div>
      </div>
    </div>
  );
}
