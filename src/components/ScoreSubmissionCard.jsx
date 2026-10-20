import React, { useState, useEffect } from 'react';
import { Gamepad2, Save, Shuffle, CheckCircle, Shield, Loader2 } from 'lucide-react';
import { resolvePlayerPhotoURL } from '../utils/tournamentCalculations';

/**
 * AVATAR ESTILO EA SPORTS FC PARA MARCADOR ACTIVO (MÓVIL Y DESKTOP)
 * Diseñado para lucir imponente en pantallas táctiles y escritorios aprovechando
 * todo el ancho de la tarjeta sin dejar espacios vacíos.
 * Muestra la foto de Google en gran formato con marco estilizado y resplandor temático,
 * o iniciales con escudo esports si aún no tiene foto vinculada.
 */
function MatchPlayerBadge({ playerName, photoURL, side = 'local', className = '' }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photoURL, playerName]);

  const showPhoto = Boolean(photoURL && !imgError);
  const initials = String(playerName || '').trim().substring(0, 2).toUpperCase() || 'FC';

  const isLocal = side === 'local';
  const accentBorder = isLocal
    ? 'border-fifa-neon/50 shadow-[0_0_25px_rgba(0,245,155,0.25)]'
    : 'border-sky-400/50 shadow-[0_0_25px_rgba(56,189,248,0.25)]';

  const glowBg = isLocal
    ? 'from-fifa-neon/20 via-slate-800 to-slate-900'
    : 'from-sky-500/20 via-slate-800 to-slate-900';

  const badgeRing = isLocal
    ? 'ring-1 ring-fifa-neon/30 group-hover:ring-fifa-neon/60'
    : 'ring-1 ring-sky-400/30 group-hover:ring-sky-400/60';

  return (
    <div
      className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl aspect-square shrink-0 overflow-hidden border-2 ${accentBorder} ${badgeRing} transition-all duration-300 ${className}`}
    >
      {/* Fondo con gradiente base */}
      <div className={`absolute inset-0 bg-gradient-to-br ${glowBg} -z-10`} />

      {showPhoto ? (
        <div className="relative w-full h-full">
          <img
            src={photoURL}
            alt={playerName}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center block select-none transform group-hover:scale-105 transition-transform duration-500"
          />
          {/* Viñeta degradada sutil inferior para acabado cinematográfico */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
          <span className="font-gaming font-black text-2xl sm:text-3xl text-white tracking-widest drop-shadow-md">
            {initials}
          </span>
          <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400/90 -mt-0.5">
            JUGADOR
          </span>
        </div>
      )}
    </div>
  );
}

export function ScoreSubmissionCard({
  activeMatch,
  availableMatches,
  allPendingMatches,
  players = [],
  careerHistory = {},
  currentUser = null,
  onSelectMatch,
  onSubmitResult,
}) {
  const [localGoals, setLocalGoals] = useState('0');
  const [awayGoals, setAwayGoals] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cuando cambia el partido activo, reiniciamos los goles o pre-llenamos si ya tenía
  useEffect(() => {
    if (activeMatch) {
      setLocalGoals(activeMatch.golesLocal !== null ? String(activeMatch.golesLocal) : '0');
      setAwayGoals(activeMatch.golesVisitante !== null ? String(activeMatch.golesVisitante) : '0');
    }
  }, [activeMatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeMatch || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmitResult(activeMatch.id, localGoals, awayGoals);
    } catch (err) {
      console.error('Error al guardar resultado oficial:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRandomSelect = () => {
    const pool = availableMatches.length > 0 ? availableMatches : allPendingMatches;
    if (pool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pool.length);
    onSelectMatch(pool[randomIndex].id);
  };

  if (!activeMatch) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Gamepad2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white font-gaming">No hay partido seleccionado</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          {availableMatches.length === 0
            ? 'No hay partidos pendientes disponibles con los jugadores presentes. Marca más jugadores en el Panel de Asistencia.'
            : 'Selecciona un partido sugerido de la lista inferior para cargar su resultado.'}
        </p>
      </div>
    );
  }

  const homePlayerObj = players.find((p) => p.id === activeMatch.homePlayerId) || {
    name: activeMatch.homePlayerName,
  };
  const awayPlayerObj = players.find((p) => p.id === activeMatch.awayPlayerId) || {
    name: activeMatch.awayPlayerName,
  };

  const homePhotoURL = resolvePlayerPhotoURL(homePlayerObj, careerHistory, currentUser);
  const awayPhotoURL = resolvePlayerPhotoURL(awayPlayerObj, careerHistory, currentUser);

  return (
    <div className="relative glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl overflow-hidden bg-gradient-to-b from-[#111827]/90 to-[#0c121e]/90">
      {/* Glow superior del HUD */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-fifa-neon/15 blur-2xl pointer-events-none" />

      {/* Encabezado del Módulo y Selector de Partido */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-fifa-neon/20 text-fifa-neon border border-fifa-neon/30">
            <Gamepad2 className="w-4 h-4" />
          </span>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-fifa-neon">
              MÓDULO DE CARGA EN VIVO
            </span>
            <h2 className="text-sm font-bold text-white font-gaming flex items-center gap-2">
              PARTIDO ACTIVO EN PS4 · {activeMatch.id} (FECHA {activeMatch.round})
            </h2>
          </div>
        </div>

        {/* Dropdown para alternar rápido entre partidos disponibles hoy */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <select
              aria-label="Seleccionar partido para cargar resultado"
              value={activeMatch.id}
              onChange={(e) => onSelectMatch(e.target.value)}
              className="w-full sm:w-auto text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-fifa-neon"
            >
              {availableMatches.length > 0 && (
                <optgroup label="Sugeridos Hoy (Ambos en casa)">
                  {availableMatches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id}: {m.homePlayerName} vs {m.awayPlayerName} (F{m.round})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Todos los Pendientes del Torneo">
                {allPendingMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id}: {m.homePlayerName} vs {m.awayPlayerName} (F{m.round})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            type="button"
            onClick={handleRandomSelect}
            title="Elegir al azar entre los partidos listos para hoy"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-fifa-neon border border-slate-700 transition"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Aleatorio</span>
          </button>
        </div>
      </div>

      {/* Marcador Estilo EA Sports FC */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          
          {/* Jugador Local */}
          <div className="md:col-span-4 h-full flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-fifa-neon/[0.05] border border-slate-800/80 hover:border-fifa-neon/30 shadow-lg relative overflow-hidden group transition-all duration-300">
            {/* Glow sutil en la esquina */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-fifa-neon/5 rounded-full blur-2xl pointer-events-none" />

            <div className="text-left min-w-0 flex-1 z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-fifa-neon/15 text-fifa-neon border border-fifa-neon/30 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-fifa-neon animate-pulse" />
                LOCAL
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-gaming tracking-tight truncate drop-shadow-sm">
                {activeMatch.homePlayerName}
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 mt-1">
                <Shield className="w-3.5 h-3.5 text-fifa-neon shrink-0" />
                <span className="truncate">{activeMatch.homeTeam}</span>
              </div>
            </div>

            <MatchPlayerBadge
              playerName={activeMatch.homePlayerName}
              photoURL={homePhotoURL}
              side="local"
              className="z-10"
            />
          </div>

          {/* Marcador Central (Goles + VS) */}
          <div className="md:col-span-3 flex items-center justify-center gap-3 py-1">
            {/* Input Goles Local */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLocalGoals((g) => String(Math.max(0, (parseInt(g, 10) || 0) - 1)))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold border border-slate-700 transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={localGoals}
                  onChange={(e) => setLocalGoals(e.target.value)}
                  className="w-16 h-14 text-center text-3xl font-black font-gaming bg-slate-950 border-2 border-slate-700 focus:border-fifa-neon text-white rounded-xl shadow-inner focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setLocalGoals((g) => String((parseInt(g, 10) || 0) + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold border border-slate-700 transition"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Goles Local</span>
            </div>

            {/* Separador VS */}
            <div className="flex flex-col items-center px-1">
              <div className="text-xs font-black px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 tracking-wider">
                VS
              </div>
            </div>

            {/* Input Goles Visitante */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAwayGoals((g) => String(Math.max(0, (parseInt(g, 10) || 0) - 1)))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold border border-slate-700 transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={awayGoals}
                  onChange={(e) => setAwayGoals(e.target.value)}
                  className="w-16 h-14 text-center text-3xl font-black font-gaming bg-slate-950 border-2 border-slate-700 focus:border-fifa-neon text-white rounded-xl shadow-inner focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setAwayGoals((g) => String((parseInt(g, 10) || 0) + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold border border-slate-700 transition"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Goles Visita</span>
            </div>
          </div>

          {/* Jugador Visitante */}
          <div className="md:col-span-4 h-full flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-500/[0.05] via-slate-900/70 to-slate-900/90 border border-slate-800/80 hover:border-sky-400/30 shadow-lg relative overflow-hidden group transition-all duration-300">
            {/* Glow sutil en la esquina */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* En desktop el avatar va a la izquierda (inner, junto al marcador), en móvil a la derecha */}
            <MatchPlayerBadge
              playerName={activeMatch.awayPlayerName}
              photoURL={awayPhotoURL}
              side="away"
              className="order-2 md:order-1 z-10"
            />

            <div className="order-1 md:order-2 text-left md:text-right min-w-0 flex-1 z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-400/30 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                VISITANTE
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-gaming tracking-tight truncate drop-shadow-sm">
                {activeMatch.awayPlayerName}
              </div>
              <div className="flex items-center gap-1.5 md:justify-end text-xs sm:text-sm font-semibold text-slate-300 mt-1">
                <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{activeMatch.awayTeam}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Botón de Guardar Resultado */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-fifa-neon" />
            <span>Al guardar, el partido sale de la cola de pendientes y se actualiza la tabla al instante.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-fifa-emerald via-fifa-neon to-fifa-emerald text-slate-950 font-black text-sm font-gaming tracking-wider uppercase shadow-neon-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>GUARDANDO...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>GUARDAR RESULTADO OFICIAL</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
