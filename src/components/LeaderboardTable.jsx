import React from 'react';
import { Trophy, ShieldAlert, Award, Sparkles, Check, HelpCircle } from 'lucide-react';

export function LeaderboardTable({ leaderboard, presentPlayerIds, onSelectPlayerFilter }) {
  const presentSet = new Set(presentPlayerIds);

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

      {/* Tabla Responsiva */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-900/60">
              <th className="py-3 px-3 text-center w-12">POS</th>
              <th className="py-3 px-4">JUGADOR</th>
              <th className="py-3 px-3 text-center w-12" title="Partidos Jugados (Máximo 15)">PJ</th>
              <th className="py-3 px-3 text-center w-12" title="Partidos Ganados">PG</th>
              <th className="py-3 px-3 text-center w-12" title="Partidos Empatados">PE</th>
              <th className="py-3 px-3 text-center w-12" title="Partidos Perdidos">PP</th>
              <th className="py-3 px-3 text-center w-12" title="Goles a Favor">GF</th>
              <th className="py-3 px-3 text-center w-12" title="Goles en Contra">GC</th>
              <th className="py-3 px-3 text-center w-14" title="Diferencia de Goles (GF - GC)">DG</th>
              <th className="py-3 px-4 text-center w-16 bg-slate-800/80 text-fifa-neon" title="Puntos Oficiales">PTS</th>
              <th className="py-3 px-3 text-center hidden md:table-cell w-28">FORMA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {leaderboard.map((row, index) => {
              const isTop8 = row.position <= 8;
              const isFirst = row.position === 1;
              const isCutLine = row.position === 8;
              const isPresentInHouse = presentSet.has(row.player.id);

              return (
                <React.Fragment key={row.player.id}>
                  <tr
                    className={`transition-colors duration-150 ${
                      isTop8
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
                        {/* Avatar */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                          style={{
                            backgroundColor: row.player.color,
                            color: '#080c14',
                          }}
                        >
                          {row.player.name.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Nombre y equipo */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm hover:text-fifa-neon cursor-pointer"
                              onClick={() => onSelectPlayerFilter && onSelectPlayerFilter(row.player.id)}
                            >
                              {row.player.name}
                            </span>

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
                    <td className="py-3 px-3 text-center text-slate-300 font-semibold">{row.pj}</td>
                    <td className="py-3 px-3 text-center text-emerald-400 font-semibold">{row.pg}</td>
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{row.pe}</td>
                    <td className="py-3 px-3 text-center text-rose-400 font-medium">{row.pp}</td>

                    {/* Goles */}
                    <td className="py-3 px-3 text-center text-slate-300 font-medium">{row.gf}</td>
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{row.gc}</td>

                    {/* Diferencia de Goles */}
                    <td className="py-3 px-3 text-center font-bold">
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
                    <td className="py-3 px-4 text-center bg-slate-900/80 font-black text-sm text-white font-gaming">
                      <span className={isTop8 ? 'text-fifa-neon text-base' : 'text-slate-200'}>
                        {row.pts}
                      </span>
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
                  </tr>

                  {/* LÍNEA DE CORTE VISUAL OBLIGATORIA ENTRE PUESTO 8 Y 9 */}
                  {isCutLine && (
                    <tr className="bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-rose-950/60 border-y-2 border-fifa-neon/80">
                      <td colSpan={11} className="py-2.5 px-4 text-center">
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
          <span>Cada participante disputa exactamente 15 partidos (1 contra cada uno de los 15 rivales).</span>
        </div>
        <div className="text-slate-400">
          PG: 3 pts · PE: 1 pto · PP: 0 pts
        </div>
      </div>
    </div>
  );
}
