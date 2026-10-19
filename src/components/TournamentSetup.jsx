import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Trash2,
  Trophy,
  RotateCcw,
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Link2,
  LogIn,
  Lock,
  PlayCircle,
  Crown,
} from 'lucide-react';
import { getPlayerHonors } from '../utils/tournamentCalculations';
import { ConfirmModal } from './ConfirmModal';

// Paleta de colores distintivos gaming para asignar a los avatares
const AVATAR_COLORS = [
  '#00f59b', '#38bdf8', '#f43f5e', '#fbbf24',
  '#a855f7', '#ef4444', '#06b6d4', '#eab308',
  '#3b82f6', '#ec4899', '#94a3b8', '#facc15',
  '#f97316', '#0ea5e9', '#dc2626', '#8b5cf6',
];

export function TournamentSetup({
  players = [],
  careerHistory = {},
  isAdmin = false,
  currentUser = null,
  myLinkedPlayer = null,
  onAddPlayer,
  onSelfRegisterGoogle,
  onClaimPlayerProfile,
  onRemovePlayer,
  onLoadDefaultPlayers,
  onLoadDemoTournament,
  onConfirmTournament,
  onResetTournament,
  onOpenGoogleModal,
  onOpenAdminModal,
}) {
  const [playerName, setPlayerName] = useState('');
  const [playerTeam, setPlayerTeam] = useState('');
  const [googleNickname, setGoogleNickname] = useState('');
  const [googleTeam, setGoogleTeam] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (currentUser && !googleNickname) {
      setGoogleNickname(currentUser.displayName?.split(' ')[0] || '');
    }
  }, [currentUser, googleNickname]);

  const MAX_PLAYERS = 16;
  const isFull = players.length >= MAX_PLAYERS;
  const canConfirm = players.length === MAX_PLAYERS;
  const remainingSlots = MAX_PLAYERS - players.length;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = playerName.trim();
    const trimmedTeam = playerTeam.trim();

    if (!trimmedName || !trimmedTeam) {
      setErrorMessage('Por favor ingresa tanto el Nombre como el Equipo del participante.');
      return;
    }

    if (isFull) {
      setErrorMessage('Ya se ha alcanzado el límite máximo de 16 jugadores.');
      return;
    }

    const isDuplicate = players.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage(`El participante "${trimmedName}" ya está registrado.`);
      return;
    }

    const colorIndex = players.length % AVATAR_COLORS.length;
    const assignedColor = AVATAR_COLORS[colorIndex];

    const newPlayer = {
      id: `p${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      tag: trimmedName.substring(0, 4).toUpperCase(),
      favoriteTeam: trimmedTeam,
      color: assignedColor,
      authType: 'manual',
      uid: null,
      email: null,
      photoURL: null,
    };

    onAddPlayer(newPlayer);
    setPlayerName('');
    setPlayerTeam('');
  };

  const handleGoogleSelfRegister = async (e) => {
    e.preventDefault();
    if (!onSelfRegisterGoogle) return;
    const ok = await onSelfRegisterGoogle(googleNickname, googleTeam);
    if (ok) {
      setGoogleTeam('');
    }
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  return (
    <div className="space-y-6">

      {/* ════════════════════════════════════════════════════════════════
          BLOQUE A: INSCRIPCIÓN RÁPIDA CON GOOGLE (PARA TODOS LOS JUGADORES)
         ════════════════════════════════════════════════════════════════ */}
      <div className="glass-panel rounded-2xl p-5 border border-sky-500/30 shadow-xl relative overflow-hidden bg-gradient-to-r from-sky-950/30 via-slate-900/90 to-slate-950">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40">
                NUEVO · REGISTRO HÍBRIDO GOOGLE + MANUAL
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white font-gaming">
              {myLinkedPlayer
                ? `¡YA ESTÁS INSCRITO COMO ${myLinkedPlayer.name.toUpperCase()} (${myLinkedPlayer.favoriteTeam.toUpperCase()})!`
                : '¿VAS A JUGAR EL TORNEO? INSCRÍBETE CON TU CUENTA DE GOOGLE'}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              {myLinkedPlayer
                ? 'Tu perfil de Google está vinculado. Todas tus victorias, goles, vallas invictas y tu Carta Pro EA FC se guardarán automáticamente en tu historial.'
                : 'Cada participante puede conectar su cuenta de Google para auto-inscribirse o reclamar su nombre si el administrador ya lo anotó manualmente.'}
            </p>
          </div>

          {/* Acción derecha según estado de sesión Google */}
          {!currentUser ? (
            <button
              type="button"
              onClick={onOpenGoogleModal}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm font-gaming uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition shrink-0"
            >
              <LogIn className="w-4 h-4 text-sky-600" />
              <span>Conectar Google para Inscribirme</span>
            </button>
          ) : !myLinkedPlayer && !isFull ? (
            <form
              onSubmit={handleGoogleSelfRegister}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto"
            >
              <input
                type="text"
                required
                placeholder="Tu Apodo"
                value={googleNickname}
                onChange={(e) => setGoogleNickname(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-fifa-neon sm:w-36"
              />
              <input
                type="text"
                required
                placeholder="Tu Equipo (ej. Arsenal)"
                value={googleTeam}
                onChange={(e) => setGoogleTeam(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-fifa-neon sm:w-48"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-fifa-emerald to-fifa-neon text-slate-950 font-black text-xs font-gaming uppercase tracking-wider shadow-neon-glow hover:brightness-110 transition shrink-0"
              >
                + Inscribirme con Google
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={onOpenGoogleModal}
              className="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center gap-2 transition shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 text-fifa-neon" />
              <span>Gestionar Mi Perfil Google</span>
            </button>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BLOQUE B: FORMULARIO MANUAL DEL ADMINISTRADOR (SOLO SI ES ADMIN)
         ════════════════════════════════════════════════════════════════ */}
      {isAdmin ? (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-fifa-dark">
          <div className="absolute top-0 left-1/4 w-96 h-28 bg-fifa-neon/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-fifa-neon/15 text-fifa-neon border border-fifa-neon/30">
                  <UserPlus className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-fifa-neon">
                  CONTROL MANUAL DEL ADMINISTRADOR
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-gaming mt-1 tracking-tight">
                REGISTRO MANUAL DE PARTICIPANTES
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Agrega manualmente a cualquier amigo que no pueda registrarse con Google. Ellos podrán reclamar su perfil más adelante si lo desean.
              </p>
            </div>

            {/* Botones de Carga Rápida para el Admin */}
            <div className="flex flex-wrap items-center gap-2">
              {onLoadDefaultPlayers && players.length === 0 && (
                <button
                  type="button"
                  onClick={onLoadDefaultPlayers}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-fifa-neon" />
                  <span>Cargar 16 Amigos Base</span>
                </button>
              )}

              {onLoadDemoTournament && (
                <button
                  type="button"
                  onClick={onLoadDemoTournament}
                  className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Cargar Demo (28 Partidos y Gráficos)</span>
                </button>
              )}

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner">
                <Users className="w-5 h-5 text-fifa-neon" />
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Cupos
                  </div>
                  <div className="text-base font-black text-white font-gaming">
                    <span className={canConfirm ? 'text-fifa-neon' : 'text-slate-100'}>
                      {players.length}
                    </span>
                    <span className="text-xs text-slate-500 font-normal"> / {MAX_PLAYERS}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario Manual */}
          <form onSubmit={handleAddSubmit} className="mt-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Nombre del Jugador (Manual) <span className="text-fifa-neon">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Noel, Jorge, Carlos..."
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isFull}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fifa-neon focus:border-transparent transition disabled:opacity-50"
                />
              </div>

              <div className="md:col-span-5 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Equipo Seleccionado <span className="text-fifa-neon">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Real Madrid, Manchester City..."
                  value={playerTeam}
                  onChange={(e) => {
                    setPlayerTeam(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isFull}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fifa-neon focus:border-transparent transition disabled:opacity-50"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={!playerName.trim() || !playerTeam.trim() || isFull}
                  className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm font-gaming uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 bg-gradient-to-r from-fifa-emerald to-fifa-neon text-slate-950 hover:brightness-110 shadow-neon-glow"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Agregar</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                {isFull ? (
                  <strong className="text-fifa-neon">
                    ¡Cupo completo! Ya están registrados los 16 participantes.
                  </strong>
                ) : (
                  <>
                    Faltan <strong className="text-slate-200">{remainingSlots}</strong> participante
                    {remainingSlots === 1 ? '' : 's'} para generar el fixture oficial.
                  </>
                )}
              </span>
              <span className="text-[11px] text-slate-500">
                Soporta mezcla de jugadores Google y manuales
              </span>
            </div>
          </form>
        </div>
      ) : (
        /* Banner informativo si no es Admin */
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            El administrador del torneo también puede inscribir participantes manualmente o iniciar el fixture cuando se completen los 16 cupos.
          </span>
          {onOpenAdminModal && (
            <button
              type="button"
              onClick={onOpenAdminModal}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 shrink-0 transition"
            >
              <Lock className="w-3.5 h-3.5 text-fifa-gold" />
              <span>Soy el Administrador</span>
            </button>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          BLOQUE C: LISTA EN VIVO DE LOS 16 CUPOS (GOOGLE + MANUALES)
         ════════════════════════════════════════════════════════════════ */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white font-gaming flex items-center gap-2">
              PARTICIPANTES CONFIRMADOS ({players.length} / {MAX_PLAYERS})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Los jugadores con insignia <span className="text-sky-400 font-semibold">Google ✓</span> tienen su cuenta vinculada. Los manuales pueden ser reclamados con un clic.
            </p>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 my-4">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300 font-gaming">
              No hay jugadores registrados todavía
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Inscríbete con tu cuenta de Google arriba o, si eres el administrador, regístralos manualmente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 my-4">
            {players.map((player, index) => {
              const isGoogleLinked = Boolean(player.uid);
              const isMine = currentUser && player.uid === currentUser.uid;
              const canDelete = isAdmin || isMine;
              const canClaimThis =
                currentUser && !myLinkedPlayer && !isGoogleLinked && onClaimPlayerProfile;
              const honors = getPlayerHonors(player, careerHistory);

              return (
                <div
                  key={player.id}
                  className={`relative p-4 rounded-xl border transition-all duration-200 group overflow-hidden ${
                    honors.isReigningChampion
                      ? 'border-fifa-gold/80 bg-gradient-to-b from-amber-950/30 to-slate-900/90 shadow-gold-glow'
                      : isMine
                      ? 'border-fifa-neon/60 bg-fifa-neon/5 shadow-neon-glow'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{
                      backgroundColor: honors.isReigningChampion
                        ? '#fbbf24'
                        : player.color || '#10b981',
                    }}
                  />

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black font-gaming px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        #{index + 1}
                      </span>
                      {honors.isReigningChampion && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-slate-950 flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" />
                          <span>CAMPEÓN VIGENTE</span>
                        </span>
                      )}
                      {isGoogleLinked ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          {isMine ? '★ TÚ (Google)' : 'Google ✓'}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          Manual
                        </span>
                      )}
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onRemovePlayer(player.id)}
                        title={`Eliminar a ${player.name}`}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Avatar / Foto Google y Datos */}
                  <div className="flex items-center gap-3 mt-3">
                    {player.photoURL ? (
                      <img
                        src={player.photoURL}
                        alt={player.name}
                        className="w-10 h-10 rounded-xl object-cover border border-sky-400/50 shrink-0 shadow-md"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-slate-950 text-sm shrink-0 shadow-md"
                        style={{ backgroundColor: player.color || '#10b981' }}
                      >
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-white font-gaming truncate tracking-tight">
                          {player.name}
                        </span>
                        {honors.titlesWon > 0 && (
                          <span
                            title={`${honors.titlesWon}x Campeón del Mundo`}
                            className="text-xs text-fifa-gold font-black shrink-0"
                          >
                            {'⭐'.repeat(Math.min(5, honors.titlesWon))}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-fifa-emerald flex items-center gap-1 mt-0.5 truncate">
                        <Shield className="w-3 h-3 shrink-0" />
                        <span className="truncate">{player.favoriteTeam}</span>
                      </div>
                    </div>
                  </div>

                  {/* Insignias históricas de Mundiales */}
                  {(honors.worldCupQualifications > 0 || honors.titlesWon > 0) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>🌐 Top 8 Mundial: <strong className="text-white">{honors.worldCupQualifications}x</strong></span>
                      {honors.titlesWon > 0 && (
                        <span className="text-fifa-gold font-bold">
                          🏆 {honors.titlesWon} {honors.titlesWon === 1 ? 'Título' : 'Títulos'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Botón rápido para reclamar si fue creado manualmente */}
                  {canClaimThis && (
                    <button
                      type="button"
                      onClick={() => onClaimPlayerProfile(player.id)}
                      className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>Soy yo · Vincular mi Google</span>
                    </button>
                  )}
                </div>
              );
            })}

            {/* Espacios vacíos sugeridos para visualizar los 16 cupos */}
            {Array.from({ length: remainingSlots }).map((_, slotIdx) => (
              <div
                key={`empty-slot-${slotIdx}`}
                className="p-4 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/30 flex items-center justify-center text-slate-600 text-xs min-h-[96px]"
              >
                <span className="font-gaming font-semibold">
                  Cupo #{players.length + slotIdx + 1} libre
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BLOQUE D: PANEL DE INICIO DEL TORNEO (EXCLUSIVO ADMIN)
         ════════════════════════════════════════════════════════════════ */}
      {isAdmin && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <Trophy className="w-5 h-5 text-fifa-gold" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-gaming uppercase tracking-wider">
                Control de Inicio del Torneo
              </div>
              <p className="text-[11px] text-slate-400">
                {canConfirm
                  ? '¡Listo! Los 16 participantes están cargados. Puedes generar el fixture oficial.'
                  : `Se requieren exactamente 16 participantes (tienes ${players.length}).`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetClick}
              className="flex-1 sm:flex-initial px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-rose-950/60 hover:border-rose-700 text-slate-300 hover:text-rose-200 text-xs font-bold font-gaming uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reiniciar Lista</span>
            </button>

            <button
              type="button"
              disabled={!canConfirm}
              onClick={onConfirmTournament}
              className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-black text-xs sm:text-sm font-gaming uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
                canConfirm
                  ? 'bg-gradient-to-r from-fifa-emerald via-fifa-neon to-fifa-emerald text-slate-950 shadow-neon-glow hover:brightness-110 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Confirmar Participantes y Generar Fixture</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación para reiniciar lista de registro */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => onResetTournament(true)}
        title="¿Reiniciar Lista de Registro?"
        message="¿Estás seguro de que deseas reiniciar la lista de registro actual?"
        details="Los récords históricos de carrera de todos los participantes se conservarán."
        confirmText="Reiniciar Lista"
        cancelText="Cancelar"
        variant="danger"
        icon={RotateCcw}
      />

    </div>
  );
}
