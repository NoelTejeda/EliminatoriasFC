import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Sparkles,
  Shuffle,
  CheckCircle2,
  Swords,
  Crown,
  Star,
  Award,
  Play,
  Save,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { calculateWorldCupGroupStandings } from '../utils/tournamentCalculations';

/**
 * Tarjeta individual de partido para Fase de Grupos del Mundial
 */
function GroupMatchRow({ match, isAdmin, onSubmitScore }) {
  const [localG, setLocalG] = useState(
    match.golesLocal !== null ? String(match.golesLocal) : '0'
  );
  const [awayG, setAwayG] = useState(
    match.golesVisitante !== null ? String(match.golesVisitante) : '0'
  );
  const [isEditing, setIsEditing] = useState(!match.jugado);

  const handleSave = (e) => {
    e.preventDefault();
    onSubmitScore(match.id, localG, awayG);
    setIsEditing(false);
  };

  return (
    <div
      className={`p-3 rounded-xl border text-xs transition ${
        match.jugado
          ? 'bg-slate-900/70 border-slate-800'
          : 'bg-slate-950/90 border-slate-700/80'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
        <span className="font-mono font-bold text-slate-300">
          {match.id} · Fecha {match.round}
        </span>
        {match.jugado ? (
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
            FINALIZADO
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
            PENDIENTE
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* Local */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white truncate">{match.homePlayerName}</div>
          <div className="text-[10px] text-slate-400 truncate">{match.homeTeam}</div>
        </div>

        {/* Marcador o Inputs */}
        {isAdmin && (isEditing || !match.jugado) ? (
          <form onSubmit={handleSave} className="flex items-center gap-1.5 shrink-0">
            <input
              type="number"
              min="0"
              max="30"
              value={localG}
              onChange={(e) => setLocalG(e.target.value)}
              className="w-11 h-8 text-center font-black font-gaming text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-fifa-neon focus:outline-none"
            />
            <span className="text-slate-500 font-bold">-</span>
            <input
              type="number"
              min="0"
              max="30"
              value={awayG}
              onChange={(e) => setAwayG(e.target.value)}
              className="w-11 h-8 text-center font-black font-gaming text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-fifa-neon focus:outline-none"
            />
            <button
              type="submit"
              title="Guardar resultado"
              className="p-2 rounded-lg bg-fifa-neon text-slate-950 font-black hover:brightness-110 transition"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            {match.jugado ? (
              <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-black font-gaming text-sm text-white">
                {match.golesLocal} - {match.golesVisitante}
              </div>
            ) : (
              <div className="px-2 py-1 rounded bg-slate-900 text-slate-500 font-bold">
                VS
              </div>
            )}
            {isAdmin && match.jugado && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-[10px] text-slate-400 hover:text-fifa-neon underline"
              >
                Editar
              </button>
            )}
          </div>
        )}

        {/* Visitante */}
        <div className="flex-1 min-w-0 text-right">
          <div className="font-bold text-white truncate">{match.awayPlayerName}</div>
          <div className="text-[10px] text-slate-400 truncate">{match.awayTeam}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Tarjeta de Llave Eliminatoria (Semifinal, 3er Puesto y Gran Final)
 */
function KnockoutMatchCard({ match, isAdmin, onSubmitKnockout, isFinal = false }) {
  const [localG, setLocalG] = useState(
    match.golesLocal !== null ? String(match.golesLocal) : '0'
  );
  const [awayG, setAwayG] = useState(
    match.golesVisitante !== null ? String(match.golesVisitante) : '0'
  );
  const [penaltyWinnerId, setPenaltyWinnerId] = useState(
    match.penaltyWinnerId || ''
  );
  const [isEditing, setIsEditing] = useState(!match.jugado);

  const isReady = Boolean(match.homePlayer && match.awayPlayer);
  const isTied =
    isReady &&
    parseInt(localG, 10) === parseInt(awayG, 10) &&
    !isNaN(parseInt(localG, 10));

  const handleSave = (e) => {
    e.preventDefault();
    onSubmitKnockout(
      match.id,
      localG,
      awayG,
      isTied ? penaltyWinnerId : null
    );
    setIsEditing(false);
  };

  return (
    <div
      className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
        isFinal
          ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-fifa-gold/70 shadow-gold-glow'
          : 'bg-slate-900/80 border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <span
            className={`text-[10px] font-extrabold uppercase tracking-widest ${
              isFinal ? 'text-fifa-gold' : 'text-fifa-neon'
            }`}
          >
            {match.stage}
          </span>
          <div className="text-xs text-slate-400">{match.subtitle}</div>
        </div>
        {match.jugado && (
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
            FINALIZADO
          </span>
        )}
      </div>

      {!isReady ? (
        <div className="py-8 text-center text-xs text-slate-500 font-gaming">
          Esperando definición de las Semifinales...
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-11 gap-2 items-center">
            {/* Jugador 1 */}
            <div
              className={`col-span-4 p-3 rounded-xl border ${
                match.winnerPlayer?.id === match.homePlayer.id
                  ? 'bg-fifa-neon/15 border-fifa-neon/50'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="font-black text-white text-sm font-gaming truncate">
                {match.homePlayer.name}
              </div>
              <div className="text-[10px] text-fifa-emerald truncate">
                {match.homePlayer.favoriteTeam}
              </div>
            </div>

            {/* Marcador Central */}
            <div className="col-span-3 flex items-center justify-center gap-1.5">
              {isAdmin && (isEditing || !match.jugado) ? (
                <>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={localG}
                    onChange={(e) => setLocalG(e.target.value)}
                    className="w-12 h-10 text-center font-black font-gaming text-lg bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-fifa-neon focus:outline-none"
                  />
                  <span className="text-slate-500 font-bold text-xs">:</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={awayG}
                    onChange={(e) => setAwayG(e.target.value)}
                    className="w-12 h-10 text-center font-black font-gaming text-lg bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-fifa-neon focus:outline-none"
                  />
                </>
              ) : match.jugado ? (
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 font-black font-gaming text-lg text-white">
                  {match.golesLocal} - {match.golesVisitante}
                </div>
              ) : (
                <span className="text-xs font-black text-slate-500">VS</span>
              )}
            </div>

            {/* Jugador 2 */}
            <div
              className={`col-span-4 p-3 rounded-xl border text-right ${
                match.winnerPlayer?.id === match.awayPlayer.id
                  ? 'bg-fifa-neon/15 border-fifa-neon/50'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="font-black text-white text-sm font-gaming truncate">
                {match.awayPlayer.name}
              </div>
              <div className="text-[10px] text-sky-400 truncate">
                {match.awayPlayer.favoriteTeam}
              </div>
            </div>
          </div>

          {/* Selector de Ganador por Penales si hay empate */}
          {isAdmin && (isEditing || !match.jugado) && isTied && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
              <div className="font-bold text-amber-300">
                ⚽ Empate en tiempo reglamentario: ¿Quién gana por Penales / Gol de Oro?
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPenaltyWinnerId(match.homePlayer.id)}
                  className={`py-2 px-3 rounded-lg font-bold border transition ${
                    penaltyWinnerId === match.homePlayer.id
                      ? 'bg-fifa-neon text-slate-950 border-fifa-neon font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  Avanza {match.homePlayer.name}
                </button>
                <button
                  type="button"
                  onClick={() => setPenaltyWinnerId(match.awayPlayer.id)}
                  className={`py-2 px-3 rounded-lg font-bold border transition ${
                    penaltyWinnerId === match.awayPlayer.id
                      ? 'bg-fifa-neon text-slate-950 border-fifa-neon font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  Avanza {match.awayPlayer.name}
                </button>
              </div>
            </div>
          )}

          {/* Leyenda de ganador o botón guardar */}
          <div className="flex items-center justify-between pt-2">
            {match.winnerPlayer ? (
              <div className="text-xs font-bold text-fifa-neon flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-fifa-gold" />
                <span>
                  Ganador: {match.winnerPlayer.name}
                  {match.penaltyWinnerId ? ' (por penales)' : ''}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500">
                Eliminación directa a partido único
              </span>
            )}

            {isAdmin && (isEditing || !match.jugado) ? (
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl font-black text-xs font-gaming uppercase tracking-wider flex items-center gap-1.5 transition ${
                  isFinal
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-gold-glow'
                    : 'bg-fifa-neon text-slate-950 shadow-neon-glow'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isFinal ? 'Coronar Campeón' : 'Guardar Resultado'}</span>
              </button>
            ) : (
              isAdmin &&
              match.jugado && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Corregir marcador
                </button>
              )
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export function WorldCupModule({
  worldCup,
  leaderboard = [],
  summary,
  isAdmin = false,
  onStartWorldCupPhase,
  onExecuteDraw,
  onConfirmGroups,
  onSubmitGroupMatch,
  onAdvanceToKnockout,
  onSubmitKnockoutMatch,
  onResetForNewEliminatoria,
}) {
  const [isDrawingAnim, setIsDrawingAnim] = useState(false);
  // Estado para la ceremonia de sorteo con suspenso (A2 -> B2 -> A3 -> B3 -> A4 -> B4)
  const [activeTargetSlot, setActiveTargetSlot] = useState(null); // 'A2' | 'B2' | 'A3' | 'B3' | 'A4' | 'B4'
  const [rouletteCandidate, setRouletteCandidate] = useState(null);
  const [lastRevealedBall, setLastRevealedBall] = useState(null); // { slot: 'A2', player }

  const standingsA = useMemo(
    () =>
      calculateWorldCupGroupStandings(
        worldCup?.groupA || [],
        worldCup?.groupMatches || [],
        'A'
      ),
    [worldCup?.groupA, worldCup?.groupMatches]
  );

  const standingsB = useMemo(
    () =>
      calculateWorldCupGroupStandings(
        worldCup?.groupB || [],
        worldCup?.groupMatches || [],
        'B'
      ),
    [worldCup?.groupB, worldCup?.groupMatches]
  );

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Determina cuál es la siguiente casilla alternada por sortear: A2 -> B2 -> A3 -> B3 -> A4 -> B4
  const getNextPendingSlot = (grpA = [], grpB = []) => {
    const aLen = grpA.length;
    const bLen = grpB.length;
    if (aLen === 1 && bLen === 1) return { group: 'A', slotLabel: 'A2', index: 1 };
    if (aLen === 2 && bLen === 1) return { group: 'B', slotLabel: 'B2', index: 1 };
    if (aLen === 2 && bLen === 2) return { group: 'A', slotLabel: 'A3', index: 2 };
    if (aLen === 3 && bLen === 2) return { group: 'B', slotLabel: 'B3', index: 2 };
    if (aLen === 3 && bLen === 3) return { group: 'A', slotLabel: 'A4', index: 3 };
    if (aLen === 4 && bLen === 3) return { group: 'B', slotLabel: 'B4', index: 3 };
    return null;
  };

  /**
   * Sorteo Automático Completo con Suspenso:
   * Extrae bolilla por bolilla alternando: A2 -> B2 -> A3 -> B3 -> A4 -> B4
   */
  const handleFullSuspenseDraw = async () => {
    const qualified = worldCup?.qualifiedPlayers || [];
    if (qualified.length < 8 || isDrawingAnim) return;

    setIsDrawingAnim(true);
    setLastRevealedBall(null);

    const seed1 = qualified[0];
    const seed2 = qualified[1];
    const potPlayers = [...qualified.slice(2)]; // Puestos 3º al 8º

    // Mezclar bombo con Fisher-Yates
    for (let i = potPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [potPlayers[i], potPlayers[j]] = [potPlayers[j], potPlayers[i]];
    }

    let currentGroupA = [seed1];
    let currentGroupB = [seed2];

    // Reiniciar grupos a solo los cabezas de serie antes de sacar la primera bolilla
    await onExecuteDraw({
      groupA: currentGroupA,
      groupB: currentGroupB,
      silent: true,
    });

    const sequence = [
      { group: 'A', slotLabel: 'A2' },
      { group: 'B', slotLabel: 'B2' },
      { group: 'A', slotLabel: 'A3' },
      { group: 'B', slotLabel: 'B3' },
      { group: 'A', slotLabel: 'A4' },
      { group: 'B', slotLabel: 'B4' },
    ];

    for (let step = 0; step < sequence.length; step++) {
      const target = sequence[step];
      const chosenPlayer = potPlayers[step];
      const remainingInPot = potPlayers.slice(step);

      setActiveTargetSlot(target.slotLabel);
      setLastRevealedBall(null);

      // Efecto ruleta de suspenso durante ~1.8 segundos
      const spinCycles = 14;
      for (let c = 0; c < spinCycles; c++) {
        const randomPreview =
          remainingInPot[c % remainingInPot.length] || chosenPlayer;
        setRouletteCandidate(randomPreview);
        await sleep(125);
      }

      // ¡Bolilla extraída!
      setRouletteCandidate(null);
      if (target.group === 'A') {
        currentGroupA = [...currentGroupA, chosenPlayer];
      } else {
        currentGroupB = [...currentGroupB, chosenPlayer];
      }

      setLastRevealedBall({
        slot: target.slotLabel,
        group: target.group,
        player: chosenPlayer,
      });

      const isLast = step === sequence.length - 1;
      await onExecuteDraw({
        groupA: currentGroupA,
        groupB: currentGroupB,
        toastMessage: isLast
          ? '🎲 ¡Sorteo Oficial completado! Grupos A y B definidos.'
          : null,
      });

      // Pausa dramática para ver qué jugador cayó antes de pasar al otro grupo
      await sleep(isLast ? 900 : 1500);
    }

    setActiveTargetSlot(null);
    setIsDrawingAnim(false);
  };

  /**
   * Sacar 1 sola bolilla con suspenso (1 clic por turno: A2, luego B2, luego A3...)
   */
  const handleSingleStepDraw = async () => {
    const qualified = worldCup?.qualifiedPlayers || [];
    if (qualified.length < 8 || isDrawingAnim) return;

    const seed1 = qualified[0];
    const seed2 = qualified[1];

    let currentGroupA =
      worldCup.groupA?.length === 4 && worldCup.groupB?.length === 4
        ? [seed1]
        : [...(worldCup.groupA || [seed1])];
    let currentGroupB =
      worldCup.groupA?.length === 4 && worldCup.groupB?.length === 4
        ? [seed2]
        : [...(worldCup.groupB || [seed2])];

    const nextTarget = getNextPendingSlot(currentGroupA, currentGroupB);
    if (!nextTarget) return;

    const alreadyAssignedIds = new Set([
      ...currentGroupA.map((p) => p.id),
      ...currentGroupB.map((p) => p.id),
    ]);
    const remainingPot = qualified
      .slice(2)
      .filter((p) => !alreadyAssignedIds.has(p.id));

    if (remainingPot.length === 0) return;

    setIsDrawingAnim(true);
    setActiveTargetSlot(nextTarget.slotLabel);
    setLastRevealedBall(null);

    // Elegir al azar entre las bolillas que quedan en el bombo
    const randomIndex = Math.floor(Math.random() * remainingPot.length);
    const chosenPlayer = remainingPot[randomIndex];

    const spinCycles = 14;
    for (let c = 0; c < spinCycles; c++) {
      const preview = remainingPot[c % remainingPot.length] || chosenPlayer;
      setRouletteCandidate(preview);
      await sleep(125);
    }

    setRouletteCandidate(null);
    if (nextTarget.group === 'A') {
      currentGroupA = [...currentGroupA, chosenPlayer];
    } else {
      currentGroupB = [...currentGroupB, chosenPlayer];
    }

    setLastRevealedBall({
      slot: nextTarget.slotLabel,
      group: nextTarget.group,
      player: chosenPlayer,
    });

    const isAllDone =
      currentGroupA.length === 4 && currentGroupB.length === 4;

    await onExecuteDraw({
      groupA: currentGroupA,
      groupB: currentGroupB,
      toastMessage: isAllDone
        ? `🎱 ¡${chosenPlayer.name} va a ${nextTarget.slotLabel}! Grupos A y B completados.`
        : `🎱 ¡Bolilla ${nextTarget.slotLabel}: ${chosenPlayer.name} al Grupo ${nextTarget.group}!`,
    });

    setActiveTargetSlot(null);
    setIsDrawingAnim(false);
  };

  const nextSlotInfo = getNextPendingSlot(
    worldCup?.groupA || [],
    worldCup?.groupB || []
  );

  const top8Preview = leaderboard.slice(0, 8);
  const allGroupMatchesPlayed =
    worldCup?.groupMatches?.length === 12 &&
    worldCup.groupMatches.every((m) => m.jugado);

  return (
    <div className="glass-panel rounded-2xl p-6 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden bg-gradient-to-b from-amber-950/15 via-slate-900/95 to-slate-950">
      {/* Resplandor Dorado de Copa del Mundo */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-36 bg-amber-400/15 blur-3xl pointer-events-none" />

      {/* Cabecera Oficial de la Copa del Mundo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-gold-glow shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/40">
                FASE FINAL · TOP 8 CLASIFICADOS
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                Grupos A y B (Cabezas de Serie 1º y 2º) → Semifinales → Gran Final
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-gaming tracking-wide mt-0.5">
              COPA DEL MUNDO · DEFINICIÓN DEL CAMPEÓN
            </h2>
          </div>
        </div>

        {/* Estado actual de la Fase Mundial */}
        <div className="flex items-center gap-2">
          {worldCup.status === 'not_started' && isAdmin && (
            <button
              type="button"
              onClick={() => {
                if (summary.pending > 0) {
                  const ok = window.confirm(
                    `Aún quedan ${summary.pending} partidos pendientes en las Eliminatorias. ¿Deseas cerrar las Eliminatorias ahora y pasar al Sorteo del Mundial con el Top 8 actual?`
                  );
                  if (!ok) return;
                }
                onStartWorldCupPhase();
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 font-black text-xs sm:text-sm font-gaming uppercase tracking-wider shadow-gold-glow hover:brightness-110 transition flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Iniciar Sorteo del Mundial (Top 8)</span>
            </button>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ESTADO 0: AÚN EN ELIMINATORIAS (VISTA PREVIA DE CABEZAS DE SERIE)
         ════════════════════════════════════════════════════════════════ */}
      {worldCup.status === 'not_started' && (
        <div className="mt-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="text-slate-300">
              Al finalizar los 120 partidos de las Eliminatorias, los <strong className="text-fifa-neon">8 primeros clasificados</strong> avanzan al Mundial. El <strong className="text-amber-400">1º irá como Cabeza de Serie del Grupo A</strong> y el <strong className="text-sky-400">2º como Cabeza de Serie del Grupo B</strong>; los puestos 3º al 8º se sortearán en vivo.
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 shrink-0 font-mono">
              Restan {summary.pending} partidos de Eliminatoria
            </div>
          </div>

          {/* Vista previa rápida de los 8 que están clasificando hoy */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {top8Preview.map((row, idx) => {
              const isSeedA = idx === 0;
              const isSeedB = idx === 1;
              return (
                <div
                  key={row.player.id}
                  className={`p-3 rounded-xl border text-xs ${
                    isSeedA
                      ? 'bg-amber-500/10 border-amber-400/50'
                      : isSeedB
                      ? 'bg-sky-500/10 border-sky-400/50'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-black mb-1">
                    <span
                      className={
                        isSeedA
                          ? 'text-amber-400'
                          : isSeedB
                          ? 'text-sky-400'
                          : 'text-fifa-neon'
                      }
                    >
                      #{row.position}
                    </span>
                    <span className="text-slate-400">
                      {isSeedA
                        ? 'Líder Grp A'
                        : isSeedB
                        ? 'Líder Grp B'
                        : 'Bombo 3-8'}
                    </span>
                  </div>
                  <div className="font-black text-white font-gaming truncate">
                    {row.player.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {row.pts} pts ({row.dg >= 0 ? `+${row.dg}` : row.dg})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          ESTADO 1: GALA DE SORTEO DE GRUPOS A Y B (SUSPENSO ALTERNADO A y B)
         ════════════════════════════════════════════════════════════════ */}
      {worldCup.status === 'draw_pending' && (
        <div className="mt-5 space-y-5">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-amber-300 font-gaming uppercase">
                🎲 Gala de Sorteo Oficial con Suspenso (A2 → B2 → A3 → B3 → A4 → B4)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                <strong>Cabezas de Serie Fijos:</strong> El <strong>1º ({worldCup.qualifiedPlayers[0]?.name})</strong> lidera el Grupo A (<code className="text-amber-300">A1</code>) y el <strong>2º ({worldCup.qualifiedPlayers[1]?.name})</strong> lidera el Grupo B (<code className="text-sky-300">B1</code>). Las 6 bolillas del bombo se extraen alternando uno al Grupo A y uno al Grupo B.
              </p>
            </div>

            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Botón 1: Sacar 1 sola bolilla paso a paso */}
                {nextSlotInfo && (
                  <button
                    type="button"
                    onClick={handleSingleStepDraw}
                    disabled={isDrawingAnim}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-200 font-black text-xs font-gaming uppercase tracking-wider flex items-center gap-2 transition shadow-sm"
                  >
                    <Sparkles className={`w-4 h-4 ${isDrawingAnim ? 'animate-spin' : ''}`} />
                    <span>
                      Sacar Bolilla {nextSlotInfo.slotLabel} (Grupo {nextSlotInfo.group})
                    </span>
                  </button>
                )}

                {/* Botón 2: Sorteo Automático Completo con Suspenso */}
                <button
                  type="button"
                  onClick={handleFullSuspenseDraw}
                  disabled={isDrawingAnim}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-400/50 text-amber-300 font-black text-xs font-gaming uppercase tracking-wider flex items-center gap-2 transition"
                >
                  <Shuffle className={`w-4 h-4 ${isDrawingAnim ? 'animate-spin' : ''}`} />
                  <span>
                    {worldCup.groupA.length === 4 && worldCup.groupB.length === 4
                      ? 'Repetir Sorteo con Suspenso'
                      : 'Sorteo Automático con Suspenso'}
                  </span>
                </button>

                {/* Botón 3: Confirmar cuando ya están los 8 */}
                <button
                  type="button"
                  disabled={
                    isDrawingAnim ||
                    worldCup.groupA.length !== 4 ||
                    worldCup.groupB.length !== 4
                  }
                  onClick={onConfirmGroups}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fifa-emerald to-fifa-neon disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs font-gaming uppercase tracking-wider shadow-neon-glow transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Grupos e Iniciar Mundial</span>
                </button>
              </div>
            )}
          </div>

          {/* TÓMBOLA EN VIVO / ESCENARIO DE SUSPENSO */}
          {(activeTargetSlot || lastRevealedBall) && (
            <div
              className={`p-5 rounded-2xl border-2 text-center transition-all ${
                activeTargetSlot
                  ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-sky-950/60 border-amber-400 animate-pulse shadow-gold-glow'
                  : 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-fifa-neon shadow-neon-glow'
              }`}
            >
              {activeTargetSlot && rouletteCandidate ? (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-black uppercase tracking-widest text-amber-300 font-gaming">
                    🥁 REDOBLE DE TAMBORES · EXTRAYENDO BOLILLA PARA CASILLA {activeTargetSlot}...
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wider">
                    🎱 {rouletteCandidate.name}{' '}
                    <span className="text-sm text-slate-400 font-normal">
                      ({rouletteCandidate.favoriteTeam})
                    </span>
                  </div>
                </div>
              ) : lastRevealedBall ? (
                <div className="space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-widest text-fifa-neon font-gaming">
                    ✨ ¡BOLILLA OFICIAL EXTRAÍDA PARA {lastRevealedBall.slot} (GRUPO {lastRevealedBall.group})!
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide">
                    🏆 {lastRevealedBall.player.name}{' '}
                    <span className="text-base text-amber-300">
                      — {lastRevealedBall.player.favoriteTeam} (#{lastRevealedBall.player.qualifierRank})
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* BOMBO DE SORTEO (PUESTOS 3º AL 8º) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-wider text-slate-300 font-gaming">
                🎱 Bombo de Sorteo (Clasificados 3º al 8º)
              </span>
              <span className="text-[11px] text-slate-400">
                Orden de salida: <strong className="text-amber-300">A2</strong> → <strong className="text-sky-300">B2</strong> → <strong className="text-amber-300">A3</strong> → <strong className="text-sky-300">B3</strong> → <strong className="text-amber-300">A4</strong> → <strong className="text-sky-300">B4</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {(worldCup.qualifiedPlayers || []).slice(2).map((potPlayer) => {
                const inAIdx = (worldCup.groupA || []).findIndex(
                  (p) => p.id === potPlayer.id
                );
                const inBIdx = (worldCup.groupB || []).findIndex(
                  (p) => p.id === potPlayer.id
                );
                const assignedSlot =
                  inAIdx > 0
                    ? `A${inAIdx + 1}`
                    : inBIdx > 0
                    ? `B${inBIdx + 1}`
                    : null;
                const isSpinningHighlight =
                  activeTargetSlot && rouletteCandidate?.id === potPlayer.id;

                return (
                  <div
                    key={potPlayer.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isSpinningHighlight
                        ? 'bg-amber-400/25 border-amber-300 scale-[1.03] shadow-gold-glow'
                        : assignedSlot
                        ? 'bg-slate-900/40 border-slate-800/70 opacity-60'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400">#{potPlayer.qualifierRank}</span>
                      {assignedSlot ? (
                        <span
                          className={`px-1.5 py-0.5 rounded font-black ${
                            assignedSlot.startsWith('A')
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-sky-500/20 text-sky-300'
                          }`}
                        >
                          Fue a {assignedSlot}
                        </span>
                      ) : (
                        <span className="text-fifa-neon">En Bombo</span>
                      )}
                    </div>
                    <div className="font-black text-white font-gaming truncate mt-1">
                      {potPlayer.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {potPlayer.favoriteTeam}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cajas de Grupo A y Grupo B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* GRUPO A */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-base font-black text-amber-400 font-gaming">
                  GRUPO A
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Cabeza de Serie: #1 Eliminatoria
                </span>
              </div>

              <div className="space-y-2">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const p = worldCup.groupA[slotIdx];
                  const isSeed = slotIdx === 0;
                  const slotCode = `A${slotIdx + 1}`;
                  const isBeingDrawnNow = activeTargetSlot === slotCode;
                  const isJustRevealed = lastRevealedBall?.slot === slotCode;

                  return (
                    <div
                      key={slotIdx}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                        isBeingDrawnNow
                          ? 'bg-amber-500/20 border-2 border-amber-400 animate-pulse shadow-gold-glow'
                          : isJustRevealed
                          ? 'bg-emerald-500/20 border-2 border-fifa-neon shadow-neon-glow'
                          : p
                          ? isSeed
                            ? 'bg-amber-500/10 border-amber-400/50'
                            : 'bg-slate-950 border-slate-800'
                          : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg font-mono text-xs font-black flex items-center justify-center ${
                            isBeingDrawnNow
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {slotCode}
                        </span>
                        {isBeingDrawnNow && rouletteCandidate ? (
                          <div>
                            <div className="text-sm font-black text-amber-300 font-gaming">
                              🎲 Girando: {rouletteCandidate.name}...
                            </div>
                            <div className="text-[10px] text-slate-300">
                              Extrayendo bolilla para {slotCode}...
                            </div>
                          </div>
                        ) : p ? (
                          <div>
                            <div className="text-sm font-black text-white font-gaming flex items-center gap-2 flex-wrap">
                              <span>{p.name}</span>
                              {isSeed && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                                  CABEZA DE SERIE (#1)
                                </span>
                              )}
                              {isJustRevealed && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-fifa-neon text-slate-950 font-black">
                                  ✨ RECIÉN SORTEADO
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-fifa-emerald">
                              {p.favoriteTeam} · Clasificado #{p.qualifierRank}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs italic">
                            Esperando turno de sorteo ({slotCode})...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GRUPO B */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-sky-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-base font-black text-sky-400 font-gaming">
                  GRUPO B
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Cabeza de Serie: #2 Eliminatoria
                </span>
              </div>

              <div className="space-y-2">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const p = worldCup.groupB[slotIdx];
                  const isSeed = slotIdx === 0;
                  const slotCode = `B${slotIdx + 1}`;
                  const isBeingDrawnNow = activeTargetSlot === slotCode;
                  const isJustRevealed = lastRevealedBall?.slot === slotCode;

                  return (
                    <div
                      key={slotIdx}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                        isBeingDrawnNow
                          ? 'bg-sky-500/20 border-2 border-sky-400 animate-pulse'
                          : isJustRevealed
                          ? 'bg-emerald-500/20 border-2 border-fifa-neon shadow-neon-glow'
                          : p
                          ? isSeed
                            ? 'bg-sky-500/10 border-sky-400/50'
                            : 'bg-slate-950 border-slate-800'
                          : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg font-mono text-xs font-black flex items-center justify-center ${
                            isBeingDrawnNow
                              ? 'bg-sky-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {slotCode}
                        </span>
                        {isBeingDrawnNow && rouletteCandidate ? (
                          <div>
                            <div className="text-sm font-black text-sky-300 font-gaming">
                              🎲 Girando: {rouletteCandidate.name}...
                            </div>
                            <div className="text-[10px] text-slate-300">
                              Extrayendo bolilla para {slotCode}...
                            </div>
                          </div>
                        ) : p ? (
                          <div>
                            <div className="text-sm font-black text-white font-gaming flex items-center gap-2 flex-wrap">
                              <span>{p.name}</span>
                              {isSeed && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-400 text-slate-950 font-black">
                                  CABEZA DE SERIE (#2)
                                </span>
                              )}
                              {isJustRevealed && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-fifa-neon text-slate-950 font-black">
                                  ✨ RECIÉN SORTEADO
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-sky-400">
                              {p.favoriteTeam} · Clasificado #{p.qualifierRank}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs italic">
                            Esperando turno de sorteo ({slotCode})...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          ESTADO 2: FASE DE GRUPOS A Y B EN VIVO (TABLAS + 12 PARTIDOS)
         ════════════════════════════════════════════════════════════════ */}
      {(worldCup.status === 'group_stage' ||
        worldCup.status === 'knockout' ||
        worldCup.status === 'completed') && (
        <div className="mt-6 space-y-6">
          {/* Si ya estamos en Semis o Final, mostramos primero las Llaves Eliminatorias */}
          {(worldCup.status === 'knockout' || worldCup.status === 'completed') && (
            <div className="space-y-6 pb-6 border-b border-slate-800">
              {/* BANNER DE CORONACIÓN SI YA HAY CAMPEÓN DEL MUNDO */}
              {worldCup.status === 'completed' && worldCup.championPlayer && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-2 border-fifa-gold shadow-gold-glow text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest">
                    <Crown className="w-4 h-4" />
                    <span>¡CAMPEÓN OFICIAL DEL MUNDIAL!</span>
                    <Crown className="w-4 h-4" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white font-gaming tracking-wide">
                    ⭐ {worldCup.championPlayer.name.toUpperCase()} ⭐
                  </h3>
                  <p className="text-sm font-bold text-fifa-gold">
                    {worldCup.championPlayer.favoriteTeam} · Nuevo portador de la Corona de Campeón Vigente (👑) y Estrella Dorada (⭐)
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 pt-2">
                    {worldCup.runnerUpPlayer && (
                      <span>
                        🥈 Subcampeón: <strong>{worldCup.runnerUpPlayer.name}</strong>
                      </span>
                    )}
                    {worldCup.thirdPlacePlayer && (
                      <span>
                        🥉 Tercer Puesto: <strong>{worldCup.thirdPlacePlayer.name}</strong>
                      </span>
                    )}
                  </div>

                  {isAdmin && onResetForNewEliminatoria && (
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          const ok = window.confirm(
                            `¿Iniciar una nueva Eliminatoria? ${worldCup.championPlayer.name} conservará su insignia de Campeón Vigente (👑), su Estrella (⭐) y todos los jugadores conservarán su contador de clasificaciones al Top 8.`
                          );
                          if (ok) onResetForNewEliminatoria(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-fifa-gold text-fifa-gold font-black text-xs font-gaming uppercase tracking-wider transition inline-flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Archivar Torneo e Iniciar Nueva Eliminatoria (Conservar Distintivos)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Cuadro de Semifinales y Gran Final */}
              <div>
                <h3 className="text-base font-black text-white font-gaming uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Swords className="w-5 h-5 text-fifa-gold" />
                  <span>FASE ELIMINATORIA: SEMIFINALES Y GRAN FINAL</span>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {worldCup.knockoutMatches
                    .filter((m) => m.id === 'SF1' || m.id === 'SF2')
                    .map((m) => (
                      <KnockoutMatchCard
                        key={m.id}
                        match={m}
                        isAdmin={isAdmin}
                        onSubmitKnockout={onSubmitKnockoutMatch}
                      />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
                  {/* Gran Final (7 cols) */}
                  <div className="lg:col-span-7">
                    {worldCup.knockoutMatches
                      .filter((m) => m.id === 'FINAL')
                      .map((m) => (
                        <KnockoutMatchCard
                          key={m.id}
                          match={m}
                          isAdmin={isAdmin}
                          onSubmitKnockout={onSubmitKnockoutMatch}
                          isFinal={true}
                        />
                      ))}
                  </div>

                  {/* Tercer Puesto (5 cols) */}
                  <div className="lg:col-span-5">
                    {worldCup.knockoutMatches
                      .filter((m) => m.id === 'THIRD')
                      .map((m) => (
                        <KnockoutMatchCard
                          key={m.id}
                          match={m}
                          isAdmin={isAdmin}
                          onSubmitKnockout={onSubmitKnockoutMatch}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TABLAS Y PARTIDOS DE GRUPO A Y GRUPO B */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white font-gaming uppercase">
                  FASE DE GRUPOS DEL MUNDIAL (LOS 2 PRIMEROS DE CADA GRUPO AVANZAN A SEMIFINALES)
                </h3>
                <p className="text-xs text-slate-400">
                  Cruces de Semifinales: <strong>1º Grupo A vs 2º Grupo B</strong> y{' '}
                  <strong>1º Grupo B vs 2º Grupo A</strong>.
                </p>
              </div>

              {worldCup.status === 'group_stage' && isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (!allGroupMatchesPlayed) {
                      const ok = window.confirm(
                        'Aún faltan partidos por jugar en los Grupos A y B. ¿Deseas avanzar a Semifinales con las posiciones actuales?'
                      );
                      if (!ok) return;
                    }
                    onAdvanceToKnockout();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fifa-emerald to-fifa-neon text-slate-950 font-black text-xs font-gaming uppercase tracking-wider shadow-neon-glow hover:brightness-110 transition flex items-center gap-2 shrink-0"
                >
                  <Swords className="w-4 h-4" />
                  <span>Cerrar Grupos y Generar Semifinales</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* COLUMNA GRUPO A */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-amber-400 font-gaming">
                    TABLA GRUPO A
                  </span>
                  <span className="text-[10px] text-fifa-neon font-bold">
                    Top 2 → Semifinales
                  </span>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Jugador</th>
                      <th className="py-2 px-1 text-center">PJ</th>
                      <th className="py-2 px-1 text-center">GF</th>
                      <th className="py-2 px-1 text-center">GC</th>
                      <th className="py-2 px-1 text-center">DG</th>
                      <th className="py-2 px-2 text-center text-fifa-neon">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {standingsA.map((row) => (
                      <tr
                        key={row.player.id}
                        className={
                          row.qualifiedToSemis ? 'bg-fifa-emerald/[0.07]' : ''
                        }
                      >
                        <td className="py-2 px-2 font-black font-gaming">
                          <span
                            className={
                              row.qualifiedToSemis
                                ? 'text-fifa-neon'
                                : 'text-slate-500'
                            }
                          >
                            {row.position}º
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{row.player.name}</span>
                            {row.qualifiedToSemis && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-fifa-neon/20 text-fifa-neon border border-fifa-neon/40 font-black">
                                SEMIS
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {row.player.favoriteTeam}
                          </div>
                        </td>
                        <td className="py-2 px-1 text-center">{row.pj}</td>
                        <td className="py-2 px-1 text-center">{row.gf}</td>
                        <td className="py-2 px-1 text-center">{row.gc}</td>
                        <td className="py-2 px-1 text-center font-bold">
                          {row.dg > 0 ? `+${row.dg}` : row.dg}
                        </td>
                        <td className="py-2 px-2 text-center font-black text-fifa-neon font-gaming">
                          {row.pts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 6 Partidos del Grupo A */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Partidos del Grupo A (6 encuentros)
                  </div>
                  {worldCup.groupMatches
                    .filter((m) => m.group === 'A')
                    .map((m) => (
                      <GroupMatchRow
                        key={m.id}
                        match={m}
                        isAdmin={isAdmin}
                        onSubmitScore={onSubmitGroupMatch}
                      />
                    ))}
                </div>
              </div>

              {/* COLUMNA GRUPO B */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-sky-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-sky-400 font-gaming">
                    TABLA GRUPO B
                  </span>
                  <span className="text-[10px] text-fifa-neon font-bold">
                    Top 2 → Semifinales
                  </span>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Jugador</th>
                      <th className="py-2 px-1 text-center">PJ</th>
                      <th className="py-2 px-1 text-center">GF</th>
                      <th className="py-2 px-1 text-center">GC</th>
                      <th className="py-2 px-1 text-center">DG</th>
                      <th className="py-2 px-2 text-center text-fifa-neon">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {standingsB.map((row) => (
                      <tr
                        key={row.player.id}
                        className={
                          row.qualifiedToSemis ? 'bg-fifa-emerald/[0.07]' : ''
                        }
                      >
                        <td className="py-2 px-2 font-black font-gaming">
                          <span
                            className={
                              row.qualifiedToSemis
                                ? 'text-fifa-neon'
                                : 'text-slate-500'
                            }
                          >
                            {row.position}º
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{row.player.name}</span>
                            {row.qualifiedToSemis && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-fifa-neon/20 text-fifa-neon border border-fifa-neon/40 font-black">
                                SEMIS
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {row.player.favoriteTeam}
                          </div>
                        </td>
                        <td className="py-2 px-1 text-center">{row.pj}</td>
                        <td className="py-2 px-1 text-center">{row.gf}</td>
                        <td className="py-2 px-1 text-center">{row.gc}</td>
                        <td className="py-2 px-1 text-center font-bold">
                          {row.dg > 0 ? `+${row.dg}` : row.dg}
                        </td>
                        <td className="py-2 px-2 text-center font-black text-fifa-neon font-gaming">
                          {row.pts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 6 Partidos del Grupo B */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Partidos del Grupo B (6 encuentros)
                  </div>
                  {worldCup.groupMatches
                    .filter((m) => m.group === 'B')
                    .map((m) => (
                      <GroupMatchRow
                        key={m.id}
                        match={m}
                        isAdmin={isAdmin}
                        onSubmitScore={onSubmitGroupMatch}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
