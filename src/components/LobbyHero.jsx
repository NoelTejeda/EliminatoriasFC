import React from 'react';
import {
  Trophy,
  Shield,
  Gamepad2,
  Lock,
  Sparkles,
  Users,
  Swords,
  ChevronRight,
  LogOut,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export function LobbyHero({
  onLoginGoogle,
  onOpenAdminModal,
  authLoading = false,
  currentUser = null,
  isPendingApproval = false,
  onRequestAccess,
  onLogoutUser,
  adminEmail = 'noelati@gmail.com',
}) {
  // Enviar automáticamente la solicitud al organizador en cuanto se detecta la sesión en espera
  React.useEffect(() => {
    if (isPendingApproval && currentUser && onRequestAccess) {
      onRequestAccess(currentUser);
    }
  }, [isPendingApproval, currentUser, onRequestAccess]);
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 overflow-hidden">
      {/* ── LUCES DE FONDO AMBIENTALES ── */}
      <div className="absolute top-1/4 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-fifa-neon/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-900/50 rounded-full blur-2xl pointer-events-none" />

      {/* Contenedor centralizado y adaptativo */}
      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-6 sm:space-y-8">

        {/* ── BADGE SUPERIOR DE TEMPORADA ── */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-fifa-neon/40 shadow-neon-glow backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-fifa-neon animate-pulse" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-fifa-neon font-gaming">
            TEMPORADA OFICIAL 2026 · ELIMINATORIAS AL MUNDIAL
          </span>
          <span className="hidden sm:inline-block text-slate-600">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-300">
            <Gamepad2 className="w-3.5 h-3.5 text-sky-400" /> PS4 & PS5
          </span>
        </div>

        {/* ── TÍTULO PRINCIPAL DE IMPACTO ── */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white font-gaming uppercase drop-shadow-lg">
            RANKING <span className="text-transparent bg-clip-text bg-gradient-to-r from-fifa-neon via-emerald-400 to-sky-400">EA SPORTS</span>
          </h1>
          <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed">
            Plataforma oficial de competición y seguimiento en tiempo real. 16 jugadores de élite disputando 120 partidos por la gloria y la clasificación directa al Mundial.
          </p>
        </div>

        {/* ── 3 MÉTRICAS RÁPIDAS (RESPONSIVE EN MÓVIL) ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-lg">
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-xs font-bold uppercase mb-0.5">
              <Users className="w-3 h-3 text-fifa-neon" />
              <span>Liga</span>
            </div>
            <span className="text-lg sm:text-2xl font-black text-white font-gaming">16</span>
            <span className="text-[9px] sm:text-[11px] text-slate-400">Jugadores</span>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-xs font-bold uppercase mb-0.5">
              <Swords className="w-3 h-3 text-sky-400" />
              <span>Fixture</span>
            </div>
            <span className="text-lg sm:text-2xl font-black text-white font-gaming">120</span>
            <span className="text-[9px] sm:text-[11px] text-slate-400">Partidos</span>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-xs font-bold uppercase mb-0.5">
              <Trophy className="w-3 h-3 text-fifa-gold" />
              <span>Fase Final</span>
            </div>
            <span className="text-lg sm:text-2xl font-black text-fifa-gold font-gaming">Mundial</span>
            <span className="text-[9px] sm:text-[11px] text-slate-400">Top 8 Clave</span>
          </div>
        </div>

        {/* ── SECCIÓN CENTRAL: TARJETA DE ACCESO O ESTADO PENDIENTE ── */}
        <div className="w-full max-w-md mx-auto">
          {isPendingApproval && currentUser ? (
            /* ── CASO A: LOGUEADO PERO AÚN NO AUTORIZADO (SALA DE ESPERA ELEGANTE) ── */
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl backdrop-blur-md text-left space-y-4">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black">
                    {currentUser.displayName?.[0] || 'J'}
                  </div>
                )}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Cuenta en Revisión
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {currentUser.displayName}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Solicitud Enviada en Tiempo Real</span>
                </div>
                <p className="leading-relaxed text-[11px] sm:text-xs text-slate-300">
                  Tu solicitud ya le apareció en pantalla a <strong className="text-white">Noel</strong>. En cuanto él presione <strong className="text-fifa-neon">"Aprobar"</strong> en su panel, tu pantalla se actualizará automáticamente y entrarás al torneo.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-amber-500/20 text-[10px] text-amber-300/80">
                  <span>Estado: Esperando clic de aprobación</span>
                  <button
                    onClick={() => onRequestAccess && onRequestAccess(currentUser)}
                    className="underline text-sky-400 hover:text-sky-300 font-bold"
                  >
                    Reenviar aviso
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={onLogoutUser}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cambiar de Cuenta</span>
                </button>
                <button
                  onClick={onOpenAdminModal}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-700 hover:border-fifa-neon/50 text-slate-300 text-xs font-semibold transition"
                >
                  <Lock className="w-3.5 h-3.5 text-fifa-neon" />
                  <span>¿Eres el Admin?</span>
                </button>
              </div>
            </div>
          ) : (
            /* ── CASO B: VISITANTE NO LOGUEADO (TARJETA DE ENTRADA OFICIAL) ── */
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-5 relative group hover:border-fifa-neon/40 transition duration-300">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-fifa-neon">
                  <ShieldCheck className="w-4 h-4 text-fifa-neon" />
                  <span>Acceso de Competidores</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-gaming">
                  Ingresa para ver el Torneo
                </h2>
                <p className="text-xs text-slate-400">
                  Solo los participantes autorizados y el organizador tienen acceso a las tablas y fixtures.
                </p>
              </div>

              {/* Botón principal: Iniciar con Google */}
              <button
                onClick={onLoginGoogle}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg hover:shadow-neon-glow hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50"
              >
                {/* SVG Oficial de Google */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{authLoading ? 'Conectando...' : 'Continuar con Google'}</span>
              </button>

              {/* Separador */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-800" />
                <span className="absolute px-3 bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  O si eres organizador
                </span>
              </div>

              {/* Botón secundario: Admin con PIN */}
              <button
                onClick={onOpenAdminModal}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-fifa-neon/40 text-slate-300 hover:text-fifa-neon font-semibold text-xs transition duration-200"
              >
                <Lock className="w-3.5 h-3.5 text-fifa-neon" />
                <span>Acceso de Administrador con PIN</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 ml-auto" />
              </button>
            </div>
          )}
        </div>

        {/* ── PIE DE SEGURIDAD Y PRIVACIDAD ── */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-fifa-neon/70" />
            <span>rankingeasports.com · Acceso Protegido</span>
          </div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span>Google Firebase Realtime Sync</span>
        </div>

      </div>
    </div>
  );
}
