import React from 'react';
import { Users, CheckCircle2, Circle, UserCheck, Flame, Sparkles } from 'lucide-react';

export function AttendancePanel({
  players,
  presentPlayerIds,
  onTogglePlayer,
  onSelectAll,
  onClearAll,
  onRandomSelect,
  availableMatchesCount,
  totalPendingMatches,
  readOnly = false,
}) {
  const presentCount = presentPlayerIds.length;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Luz decorativa */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-fifa-neon/5 blur-2xl pointer-events-none" />

      {/* Cabecera del Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-fifa-neon/15 text-fifa-neon">
              <UserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-wide font-gaming flex items-center gap-2">
              PANEL DE ASISTENCIA DIARIA (QUIÉNES ESTÁN EN LA CASA)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {readOnly
              ? 'Vista en vivo de los participantes presentes hoy en la casa y partidos listos para disputarse.'
              : 'Marca a los amigos que vinieron hoy. El fixture filtrará de inmediato los partidos pendientes entre ellos sin omitir ni repetir ningún cruce.'}
          </p>
        </div>

        {/* Botones de acción rápida (solo visibles para Admin) */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={onSelectAll}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Marcar Todos (16)
            </button>
            <button
              onClick={onClearAll}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            >
              Desmarcar Todos
            </button>
            <button
              onClick={() => onRandomSelect(8)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-fifa-neon border border-fifa-neon/30 transition"
            >
              <Sparkles className="w-3 h-3" />
              <span>Simular 8 en Casa</span>
            </button>
          </div>
        )}
      </div>

      {/* Métrica Destacada del Filtro de Partidos */}
      <div className="mt-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Tarjeta de Disponibles Hoy */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
          availableMatchesCount > 0
            ? 'bg-fifa-neon/10 border-fifa-neon/40 shadow-neon-glow'
            : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
              availableMatchesCount > 0 ? 'bg-fifa-neon text-slate-950 font-black' : 'bg-slate-800 text-slate-500'
            }`}>
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Partidos Listos Para Jugar Hoy
              </div>
              <div className="text-2xl font-black text-white font-gaming flex items-baseline gap-1.5">
                <span className={availableMatchesCount > 0 ? 'text-fifa-neon' : 'text-slate-400'}>
                  {availableMatchesCount}
                </span>
                <span className="text-xs font-normal text-slate-400">partidos disponibles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de Jugadores Presentes */}
        <div className="p-3.5 rounded-xl border bg-slate-900/60 border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Jugadores en la Casa
              </div>
              <div className="text-2xl font-black text-white font-gaming flex items-baseline gap-1.5">
                <span className="text-sky-400">{presentCount}</span>
                <span className="text-xs font-normal text-slate-400">de 16 participantes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de Integridad de Fixture */}
        <div className="p-3.5 rounded-xl border bg-slate-900/60 border-slate-800 sm:col-span-2 lg:col-span-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-fifa-emerald flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Garantía de Integridad
              </div>
              <div className="text-xs font-medium text-slate-300">
                {totalPendingMatches} partidos pendientes en total. Cero duplicados.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matriz de Pills de los 16 Jugadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {players.map((player) => {
          const isPresent = presentPlayerIds.includes(player.id);

          return (
            <button
              key={player.id}
              onClick={() => !readOnly && onTogglePlayer(player.id)}
              type="button"
              disabled={readOnly}
              className={`relative flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all duration-200 ${
                readOnly ? 'cursor-default' : 'cursor-pointer'
              } ${
                isPresent
                  ? 'bg-slate-800/90 border-fifa-neon/50 text-white shadow-sm ring-1 ring-fifa-neon/40'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              {/* Avatar con inicial o foto Google */}
              {player.photoURL ? (
                <img
                  src={player.photoURL}
                  alt={player.name}
                  className={`w-7 h-7 rounded-lg object-cover shrink-0 ${
                    isPresent ? 'opacity-100' : 'opacity-40 grayscale'
                  }`}
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-transform"
                  style={{
                    backgroundColor: isPresent ? player.color : '#1e293b',
                    color: isPresent ? '#080c14' : '#64748b',
                  }}
                >
                  {player.name.substring(0, 2).toUpperCase()}
                </div>
              )}

              {/* Nombre y equipo */}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate leading-tight flex items-center justify-between">
                  <span className={isPresent ? 'text-white' : 'text-slate-400'}>{player.name}</span>
                  {isPresent ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-fifa-neon shrink-0 ml-1" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-1" />
                  )}
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">
                  {player.favoriteTeam}
                </div>
              </div>

              {/* Indicador de estado */}
              {isPresent && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-fifa-neon rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Aviso si hay menos de 2 presentes */}
      {presentCount < 2 && (
        <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center gap-2">
          <span>⚠️ Se requieren al menos 2 personas presentes para poder disputar partidos hoy.</span>
        </div>
      )}
    </div>
  );
}
