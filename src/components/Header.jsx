import React from 'react';
import { Trophy, Gamepad2, Lock, Unlock, ShieldCheck, Wifi, WifiOff, Loader2 } from 'lucide-react';

export function Header({
  summary,
  isTournamentStarted,
  playersCount,
  isAdmin,
  isFirebaseConnected,
  isSyncing,
  onOpenAdminModal,
  onResetTournament,
}) {
  const handleResetClick = () => {
    if (!isAdmin) return;
    const confirmed = window.confirm(
      '¿Estás completamente seguro de que deseas reiniciar el torneo? Se borrarán todos los jugadores, equipos y partidos registrados.'
    );
    if (confirmed) onResetTournament();
  };

  return (
    <header className="relative overflow-hidden border-b border-slate-800 bg-[#0a0f1d]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Luces de ambiente */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-fifa-neon/10 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* Título */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-fifa-neon/40 shadow-neon-glow shrink-0">
              <Trophy className="w-6 h-6 text-fifa-neon" />
              <span className="absolute -bottom-1 -right-1 text-[10px] font-black bg-slate-900 text-fifa-gold border border-fifa-gold/40 rounded px-1">
                PS4
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-fifa-neon/15 text-fifa-neon border border-fifa-neon/30 rounded">
                  EA FC · ROUND ROBIN COMPLETO
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Gamepad2 className="w-3.5 h-3.5" /> 16 Participantes
                </span>
                {/* Badge de estado Firebase */}
                <span
                  className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    isFirebaseConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isSyncing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isFirebaseConnected ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  <span>{isSyncing ? 'Sincronizando...' : isFirebaseConnected ? 'En Línea' : 'Offline'}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-gaming">
                TORNEO ELIMINATORIAS AL MUNDIAL
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTournamentStarted
                  ? <>120 partidos únicos · <span className="text-fifa-neon font-semibold">Top 8 clasifica al Mundial</span> · Puestos 9-16 eliminados</>
                  : 'Fase de Configuración: Registra a los 16 amigos para comenzar el torneo'}
              </p>
            </div>
          </div>

          {/* Controles del lado derecho */}
          <div className="flex flex-wrap items-center gap-2.5">

            {/* Barra de Progreso (si el torneo empezó) */}
            {isTournamentStarted ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[190px]">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-medium">Progreso</span>
                  <span className="text-fifa-neon font-bold">
                    {summary.played} / {summary.total} ({summary.progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fifa-emerald to-fifa-neon transition-all duration-700 rounded-full"
                    style={{ width: `${summary.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>{summary.totalGoals} goles</span>
                  <span>{summary.pending} pendientes</span>
                </div>
              </div>
            ) : (
              /* Contador de cupos en configuración */
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[170px]">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-medium">Registro</span>
                  <span className="text-fifa-neon font-bold">{playersCount} / 16</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fifa-emerald to-fifa-neon transition-all duration-500 rounded-full"
                    style={{ width: `${(playersCount / 16) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {playersCount === 16 ? '¡Listo para iniciar!' : `Faltan ${16 - playersCount}`}
                </div>
              </div>
            )}

            {/* Reiniciar (solo si es Admin) */}
            {isAdmin && (
              <button
                onClick={handleResetClick}
                title="Borrar todos los datos y reiniciar el torneo"
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-rose-950/70 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 transition-colors"
              >
                <span>⟳</span>
                <span>Reiniciar Todo</span>
              </button>
            )}

            {/* Botón Admin / Candado */}
            <button
              onClick={onOpenAdminModal}
              title={isAdmin ? 'Modo Administrador activo' : 'Iniciar sesión como administrador'}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                isAdmin
                  ? 'bg-fifa-neon/15 border-fifa-neon/50 text-fifa-neon shadow-neon-glow hover:bg-fifa-neon/25'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Activo</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Administrar</span>
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
