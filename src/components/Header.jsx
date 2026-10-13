import React from 'react';
import { Trophy, Gamepad2, RotateCcw, Users } from 'lucide-react';

export function Header({ summary, isTournamentStarted, playersCount, onResetTournament }) {
  const handleResetClick = () => {
    const confirmed = window.confirm(
      '¿Estás completamente seguro de que deseas reiniciar el torneo? Se borrarán todos los jugadores, equipos y partidos registrados.'
    );
    if (confirmed) {
      onResetTournament();
    }
  };

  return (
    <header className="relative overflow-hidden border-b border-fifa-border bg-[#0a0f1d]/90 backdrop-blur-md">
      {/* Luz ambiental sutil de fondo */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-fifa-neon/10 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Título y Logos */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-fifa-cardLight to-slate-900 border border-fifa-neon/40 shadow-neon-glow">
              <Trophy className="w-6 h-6 text-fifa-neon" />
              <span className="absolute -bottom-1 -right-1 text-[10px] font-black bg-slate-900 text-fifa-gold border border-fifa-gold/40 rounded px-1">
                PS4
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-fifa-neon/15 text-fifa-neon border border-fifa-neon/30 rounded">
                  EA FC · ROUND ROBIN COMPLETO
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Gamepad2 className="w-3.5 h-3.5 text-slate-400" /> 16 Participantes
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-gaming flex items-center gap-2">
                TORNEO ELIMINATORIAS AL MUNDIAL
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTournamentStarted ? (
                  <>120 partidos únicos · <span className="text-fifa-neon font-semibold">Top 8 clasifica al Mundial</span> · Puestos 9-16 eliminados</>
                ) : (
                  <>Fase de Configuración: Registra a los 16 amigos para comenzar el torneo</>
                )}
              </p>
            </div>
          </div>

          {/* Estadísticas de progreso y botones de acción */}
          <div className="flex flex-wrap items-center gap-3">
            {isTournamentStarted ? (
              /* Barra de progreso global si el torneo ya empezó */
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[200px]">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-medium">Progreso del Torneo</span>
                  <span className="text-fifa-neon font-bold">
                    {summary.played} / {summary.total} ({summary.progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fifa-emerald to-fifa-neon transition-all duration-500 rounded-full"
                    style={{ width: `${summary.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>{summary.totalGoals} goles ({summary.avgGoals} p/p)</span>
                  <span>{summary.pending} pendientes</span>
                </div>
              </div>
            ) : (
              /* Contador de jugadores en fase de configuración */
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[180px]">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-medium">Registro de Cupos</span>
                  <span className="text-fifa-neon font-bold">
                    {playersCount} / 16
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fifa-emerald to-fifa-neon transition-all duration-500 rounded-full"
                    style={{ width: `${(playersCount / 16) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {16 - playersCount === 0 ? '¡Listo para iniciar!' : `Faltan ${16 - playersCount} jugadores`}
                </div>
              </div>
            )}

            {/* Botón Reiniciar Todo Siempre Visible con Alerta */}
            <button
              onClick={handleResetClick}
              title="Borrar todos los datos y reiniciar el torneo"
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-rose-950/70 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reiniciar Todo</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
