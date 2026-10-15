import React, { useState, useEffect } from 'react';
import { Gamepad2, Save, Shuffle, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { shareMatchToWhatsApp } from '../utils/whatsappShare';

export function ScoreSubmissionCard({
  activeMatch,
  availableMatches,
  allPendingMatches,
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

  const saveResult = async (shouldShareWhatsApp = false) => {
    if (!activeMatch) return;

    setIsSubmitting(true);
    const parsedLocal = parseInt(localGoals, 10) || 0;
    const parsedAway = parseInt(awayGoals, 10) || 0;

    const success = await onSubmitResult(activeMatch.id, localGoals, awayGoals);
    setIsSubmitting(false);

    if (success && shouldShareWhatsApp) {
      shareMatchToWhatsApp({
        ...activeMatch,
        golesLocal: parsedLocal,
        golesVisitante: parsedAway,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveResult(false);
  };

  const handleSaveAndShare = (e) => {
    e.preventDefault();
    saveResult(true);
  };

  const handleDirectShare = () => {
    if (!activeMatch) return;
    shareMatchToWhatsApp({
      ...activeMatch,
      golesLocal: parseInt(localGoals, 10) || 0,
      golesVisitante: parseInt(awayGoals, 10) || 0,
    });
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
          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-3 p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-left md:text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                LOCAL
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-gaming tracking-tight">
                {activeMatch.homePlayerName}
              </div>
              <div className="flex items-center gap-1.5 md:justify-end text-xs text-fifa-neon mt-0.5">
                <Shield className="w-3 h-3" />
                <span>{activeMatch.homeTeam}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-black text-white text-base shadow-md">
              {activeMatch.homePlayerName.substring(0, 2).toUpperCase()}
            </div>
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
          <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3 p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-black text-white text-base shadow-md order-2 md:order-1">
              {activeMatch.awayPlayerName.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-right md:text-left order-1 md:order-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                VISITANTE
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-gaming tracking-tight">
                {activeMatch.awayPlayerName}
              </div>
              <div className="flex items-center gap-1.5 md:justify-start text-xs text-sky-400 mt-0.5">
                <Shield className="w-3 h-3" />
                <span>{activeMatch.awayTeam}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Botones de Guardar Resultado y WhatsApp */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-fifa-neon shrink-0" />
            <span>Al guardar, el partido sale de pendientes y se actualiza la tabla en vivo.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {activeMatch.jugado && (
              <button
                type="button"
                onClick={handleDirectShare}
                title="Compartir resultado actual por WhatsApp"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs font-gaming tracking-wide uppercase transition-all flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                <span>Re-enviar por WhatsApp</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs font-gaming tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5 text-fifa-neon" />
              <span>Guardar Solo</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndShare}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-[#25D366] to-emerald-600 text-slate-950 font-black text-xs font-gaming tracking-wider uppercase shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4 text-slate-950" />
              <span>Guardar y Compartir en WhatsApp</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
