import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Link2,
  Unlink,
  LogOut,
  Sparkles,
  Shield,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  UserPlus,
} from 'lucide-react';

export function GoogleProfileModal({
  isOpen,
  onClose,
  currentUser,
  authLoading,
  authError,
  onLoginGoogle,
  onLoginQuickProfile,
  onLogoutUser,
  players = [],
  myLinkedPlayer,
  isTournamentStarted,
  onSelfRegister,
  onClaimProfile,
  onUnlinkProfile,
  onViewMyAnalytics,
}) {
  const [nickname, setNickname] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [showQuickMode, setShowQuickMode] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setNickname(currentUser.displayName?.split(' ')[0] || '');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const unlinkedPlayers = players.filter((p) => !p.uid);
  const canSelfRegister = !isTournamentStarted && players.length < 16 && !myLinkedPlayer;

  const handleSelfRegisterSubmit = async (e) => {
    e.preventDefault();
    const ok = await onSelfRegister(nickname, favoriteTeam);
    if (ok) {
      setFavoriteTeam('');
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClaimId) return;
    await onClaimProfile(selectedClaimId);
  };

  const handleQuickProfileSubmit = (e) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    onLoginQuickProfile(quickName, quickEmail);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Perfil de Jugador con Google"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl p-6 my-8">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
              IDENTIDAD HÍBRIDA & RÉCORDS EN LA NUBE
            </span>
            <h2 className="text-lg font-black text-white font-gaming">
              PERFIL DE JUGADOR (GOOGLE AUTH)
            </h2>
          </div>
        </div>

        {/* ESTADO 1: NO HA INICIADO SESIÓN */}
        {!currentUser ? (
          <div className="mt-5 space-y-5">
            <p className="text-xs text-slate-300 leading-relaxed">
              Conecta tu cuenta de <strong className="text-white">Google</strong> para inscribirte rápidamente al torneo o vincular tu jugador creado manualmente. Así guardarás tu historial de partidos ganados, goles, efectividad y tu <strong className="text-fifa-neon">Carta Pro EA FC</strong>.
            </p>

            {/* Botón Oficial Google Sign-In */}
            <button
              type="button"
              onClick={onLoginGoogle}
              disabled={authLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-lg transition active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{authLoading ? 'Conectando...' : 'Continuar con Google'}</span>
            </button>

            {/* Mensaje de error si Google Auth no está habilitado aún en Firebase Console */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
                {!showQuickMode && (
                  <button
                    type="button"
                    onClick={() => setShowQuickMode(true)}
                    className="text-fifa-neon underline font-bold text-xs"
                  >
                    Usar Simulador de Cuenta Google para probar ahora →
                  </button>
                )}
              </div>
            )}

            {/* Toggle para modo de prueba rápida local */}
            <div className="pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowQuickMode(!showQuickMode)}
                className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1.5 mx-auto transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {showQuickMode
                    ? 'Ocultar acceso rápido de prueba'
                    : '¿Probando en local o sin Google configurado? Simular cuenta aquí'}
                </span>
              </button>

              {showQuickMode && (
                <form
                  onSubmit={handleQuickProfileSubmit}
                  className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
                >
                  <div className="text-[11px] font-bold text-sky-300">
                    Acceso Rápido de Prueba (Simulador de Perfil Google)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Tu Nombre (ej. Noel)"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-fifa-neon"
                    />
                    <input
                      type="email"
                      placeholder="Correo (opcional)"
                      value={quickEmail}
                      onChange={(e) => setQuickEmail(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-fifa-neon"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs font-gaming uppercase tracking-wider transition"
                  >
                    Entrar con Perfil de Prueba
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* ESTADO 2: SESIÓN DE GOOGLE ACTIVA */
          <div className="mt-5 space-y-5">
            {/* Tarjeta de Cuenta Conectada */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-11 h-11 rounded-xl object-cover border border-fifa-neon/50 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-fifa-neon text-slate-950 font-black flex items-center justify-center text-sm shrink-0">
                    {currentUser.displayName?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm truncate">
                      {currentUser.displayName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {currentUser.isDemoAccount ? 'Perfil Local' : 'Google'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogoutUser}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>

            {/* SI YA TIENE UN JUGADOR VINCULADO */}
            {myLinkedPlayer ? (
              <div className="p-4 rounded-xl bg-fifa-neon/10 border border-fifa-neon/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-fifa-neon flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    JUGADOR VINCULADO OFICIALMENTE
                  </span>
                  <button
                    type="button"
                    onClick={() => onUnlinkProfile(myLinkedPlayer.id)}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                  >
                    <Unlink className="w-3 h-3" />
                    <span>Desvincular</span>
                  </button>
                </div>

                <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-slate-950 text-sm"
                      style={{ backgroundColor: myLinkedPlayer.color }}
                    >
                      {myLinkedPlayer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-black text-white font-gaming">
                        {myLinkedPlayer.name}
                      </div>
                      <div className="text-xs text-fifa-emerald flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>{myLinkedPlayer.favoriteTeam}</span>
                      </div>
                    </div>
                  </div>

                  {onViewMyAnalytics && (
                    <button
                      type="button"
                      onClick={() => {
                        onViewMyAnalytics(myLinkedPlayer.id);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-fifa-neon text-slate-950 font-black text-xs font-gaming uppercase tracking-wider flex items-center gap-1.5 shadow-neon-glow hover:brightness-110 transition"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Ver Mi Carta Pro</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* SI AÚN NO TIENE JUGADOR VINCULADO */
              <div className="space-y-4">
                {/* Opción A: Auto-inscribirse en Fase 1 */}
                {canSelfRegister && (
                  <form
                    onSubmit={handleSelfRegisterSubmit}
                    className="p-4 rounded-xl bg-fifa-neon/5 border border-fifa-neon/30 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-fifa-neon text-xs font-extrabold uppercase tracking-wider">
                      <UserPlus className="w-4 h-4" />
                      <span>Opción 1: Inscribirme como Nuevo Jugador ({players.length}/16)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      El torneo está en fase de registro. Elige tu apodo y club para ocupar uno de los cupos disponibles con tu cuenta de Google.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Tu Nombre / Apodo
                        </label>
                        <input
                          type="text"
                          required
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="Ej: Noel"
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-fifa-neon"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Tu Equipo Favorito
                        </label>
                        <input
                          type="text"
                          required
                          value={favoriteTeam}
                          onChange={(e) => setFavoriteTeam(e.target.value)}
                          placeholder="Ej: Real Madrid"
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-fifa-neon"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fifa-emerald to-fifa-neon text-slate-950 font-black text-xs font-gaming uppercase tracking-wider shadow-neon-glow hover:brightness-110 transition"
                    >
                      + Inscribirme al Torneo con Google
                    </button>
                  </form>
                )}

                {/* Opción B: Reclamar un jugador creado manualmente */}
                <form
                  onSubmit={handleClaimSubmit}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-extrabold uppercase tracking-wider">
                    <Link2 className="w-4 h-4" />
                    <span>
                      {canSelfRegister
                        ? 'Opción 2: Reclamar un Jugador Creado Manualmente'
                        : 'Vincular mi Google a un Jugador Existente ("Reclamar Perfil")'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    ¿El administrador ya te anotó manualmente en la lista? Selecciónate abajo para vincular tu cuenta de Google y conservar todas tus estadísticas.
                  </p>

                  {unlinkedPlayers.length === 0 ? (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500 text-center">
                      No hay jugadores manuales sin vincular en este momento.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <select
                        value={selectedClaimId}
                        onChange={(e) => setSelectedClaimId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
                      >
                        <option value="">-- Selecciona quién eres en la lista --</option>
                        {unlinkedPlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.favoriteTeam}) [Registro Manual]
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        disabled={!selectedClaimId}
                        className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs font-gaming uppercase tracking-wider transition"
                      >
                        Vincular y Reclamar este Jugador
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
