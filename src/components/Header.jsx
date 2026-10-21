import React, { useState } from 'react';
import {
  Trophy,
  Gamepad2,
  Lock,
  ShieldCheck,
  Wifi,
  WifiOff,
  Loader2,
  UserCheck,
  LogIn,
  RotateCcw,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export function Header({
  summary,
  isTournamentStarted,
  playersCount,
  isAdmin,
  currentUser,
  myLinkedPlayer,
  isFirebaseConnected,
  isSyncing,
  whitelistCount = 0,
  pendingRequestsCount = 0,
  onOpenWhitelistModal,
  onOpenAdminModal,
  onOpenGoogleModal,
  onResetTournament,
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFactoryResetConfirm, setShowFactoryResetConfirm] = useState(false);

  const handleResetClick = () => {
    if (!isAdmin) return;
    setShowResetConfirm(true);
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
                  ? <>120 partidos únicos · <span className="text-fifa-neon font-semibold">Top 8 clasifica al Mundial</span> · Analítica & Récords en vivo</>
                  : 'Fase de Configuración Híbrida: Inscripción con Google o Registro Manual por Admin'}
              </p>
            </div>
          </div>

          {/* Controles del lado derecho */}
          <div className="flex flex-wrap items-center gap-2.5">

            {/* Barra de Progreso (si el torneo empezó) */}
            {isTournamentStarted ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[180px]">
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
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[165px]">
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

            {/* Botón de Cuenta Google / Perfil de Jugador */}
            <button
              onClick={onOpenGoogleModal}
              title={
                currentUser
                  ? `Conectado como ${currentUser.displayName}`
                  : 'Conectar con Google para inscribirte o reclamar tu perfil'
              }
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                currentUser
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-sky-500/50 hover:text-sky-300'
              }`}
            >
              {currentUser ? (
                <>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="w-5 h-5 rounded-full object-cover border border-sky-400"
                    />
                  ) : (
                    <UserCheck className="w-4 h-4 text-sky-400" />
                  )}
                  <div className="text-left leading-tight">
                    <div className="text-[11px] font-bold text-white truncate max-w-[110px]">
                      {myLinkedPlayer ? myLinkedPlayer.name : currentUser.displayName?.split(' ')[0]}
                    </div>
                    <div className="text-[9px] text-sky-400">
                      {myLinkedPlayer ? '✓ Perfil Vinculado' : 'Vincular Jugador'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-sky-400" />
                  <span>Conectar Google</span>
                </>
              )}
            </button>

            {/* Gestión de Lista Blanca (solo si es Admin) */}
            {isAdmin && (
              <button
                onClick={onOpenWhitelistModal}
                title={
                  pendingRequestsCount > 0
                    ? `¡Tienes ${pendingRequestsCount} solicitud(es) de acceso pendiente(s)!`
                    : 'Gestionar lista blanca de correos autorizados'
                }
                className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl border transition-colors ${
                  pendingRequestsCount > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-neon-glow animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 text-sky-300 border-slate-700 hover:border-sky-500/40'
                }`}
              >
                <Shield
                  className={`w-4 h-4 ${
                    pendingRequestsCount > 0 ? 'text-amber-400' : 'text-sky-400'
                  }`}
                />
                <span className="hidden sm:inline">Accesos</span>
                {pendingRequestsCount > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                    +{pendingRequestsCount}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 text-[10px]">
                    {whitelistCount}
                  </span>
                )}
              </button>
            )}

            {/* Reiniciar (solo si es Admin) */}
            {isAdmin && (
              <button
                onClick={handleResetClick}
                title="Reiniciar torneo actual conservando récords históricos"
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-rose-950/70 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 transition-colors"
              >
                <span>⟳</span>
                <span className="hidden sm:inline">Reiniciar</span>
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
                  <span className="hidden sm:inline">Admin</span>
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Modal 1: Reiniciar Torneo (Nueva Temporada conservando historiales) */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => onResetTournament(true)}
        title="¿Reiniciar Torneo Actual?"
        message="¿Deseas reiniciar el torneo actual para comenzar una nueva temporada?"
        details={
          <div className="space-y-2">
            <p>Los récords históricos de carrera (estrellas, copas ganadas y estadísticas acumuladas) se conservarán automáticamente.</p>
            <div className="pt-2 border-t border-rose-500/20 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  setShowFactoryResetConfirm(true);
                }}
                className="text-xs text-rose-400 underline hover:text-rose-300 font-bold"
              >
                ¿Quieres vaciar todo desde cero (Reinicio de Fábrica)?
              </button>
            </div>
          </div>
        }
        confirmText="Nueva Temporada"
        cancelText="Cancelar"
        variant="danger"
        icon={RotateCcw}
      />

      {/* Modal 2: Reinicio Total de Fábrica (0 Datos en Firestore y LocalStorage) */}
      <ConfirmModal
        isOpen={showFactoryResetConfirm}
        onClose={() => setShowFactoryResetConfirm(false)}
        onConfirm={() => onResetTournament(false)}
        title="¡Borrado Total de Fábrica!"
        message="Esta acción vaciará completamente los datos en la nube y en tu dispositivo."
        details="Se borrarán TODOS los jugadores, partidos, resultados, copas del mundo, estadísticas acumuladas y estrellas. La aplicación quedará exactamente como el primer día en 0 datos."
        confirmText="BORRAR TODO DEFINITIVAMENTE"
        cancelText="Cancelar"
        variant="danger"
        icon={AlertTriangle}
      />
    </header>
  );
}
