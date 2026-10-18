import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  Trophy,
  Shield,
  Flame,
  Swords,
  User,
  Award,
  TrendingUp,
  CheckCircle2,
  Link2,
  Sparkles,
  Target,
  Activity,
  History,
} from 'lucide-react';
import {
  calculatePlayerDeepAnalytics,
  calculateHeadToHead,
  resolvePlayerPhotoURL,
} from '../utils/tournamentCalculations';

/**
 * AVATAR CUADRADO PARA CARTA PRO EA FC (MÓVIL Y DESKTOP)
 * Sustituye las iniciales (ej. "NO") por la foto de Google del jugador sin estirar
 * ni deformar el contenedor (`w-20 h-20 rounded-2xl aspect-square overflow-hidden`).
 */
function CardPlayerAvatar({ player, photoURL }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photoURL, player?.id]);

  const showPhoto = Boolean(photoURL && !imgError);

  return (
    <div
      className="w-20 h-20 rounded-2xl aspect-square shrink-0 overflow-hidden flex items-center justify-center text-2xl font-black text-slate-950 shadow-lg border-2 border-white/25 relative"
      style={{ backgroundColor: showPhoto ? '#0b1120' : player.color }}
    >
      {showPhoto ? (
        <img
          src={photoURL}
          alt={player.name}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center block select-none"
        />
      ) : (
        <span>{player.name.substring(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}

/**
 * GRÁFICO DE RADAR HEXAGONAL (SVG PURO)
 * Soporta 1 o 2 polígonos superpuestos (ideal para Ficha Individual y Comparador H2H)
 */
function HexRadarChart({ statsA, statsB = null, colorA = '#00f59b', colorB = '#38bdf8' }) {
  const axes = [
    { key: 'ATA', label: 'ATAQUE' },
    { key: 'EFE', label: 'EFECTIV.' },
    { key: 'LOC', label: 'LOCAL' },
    { key: 'DEF', label: 'DEFENSA' },
    { key: 'VIS', label: 'VISITA' },
    { key: 'FOR', label: 'FORMA' },
  ];

  const size = 240;
  const center = size / 2;
  const maxRadius = 82;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    const normalized = Math.max(0.15, Math.min(1, (value || 50) / 100));
    const r = normalized * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const buildPolygonPoints = (statsObj) => {
    if (!statsObj) return '';
    return axes
      .map((axis, idx) => {
        const pt = getCoordinates(idx, statsObj[axis.key] || 65);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ');
  };

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[250px] mx-auto select-none overflow-visible"
    >
      {/* Anillos concéntricos hexagonales */}
      {rings.map((ringScale, rIdx) => {
        const pts = axes
          .map((_, idx) => {
            const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
            const r = maxRadius * ringScale;
            return `${(center + r * Math.cos(angle)).toFixed(1)},${(
              center +
              r * Math.sin(angle)
            ).toFixed(1)}`;
          })
          .join(' ');
        return (
          <polygon
            key={rIdx}
            points={pts}
            fill="none"
            stroke="#1e293b"
            strokeWidth={ringScale === 1 ? '1.5' : '1'}
            strokeDasharray={ringScale < 1 ? '2 2' : undefined}
          />
        );
      })}

      {/* Ejes radiales */}
      {axes.map((axis, idx) => {
        const end = getCoordinates(idx, 100);
        return (
          <line
            key={axis.key}
            x1={center}
            y1={center}
            x2={end.x}
            y2={end.y}
            stroke="#1e293b"
            strokeWidth="1"
          />
        );
      })}

      {/* Polígono Jugador B (si estamos en modo H2H) */}
      {statsB && (
        <g>
          <polygon
            points={buildPolygonPoints(statsB)}
            fill={colorB}
            fillOpacity="0.22"
            stroke={colorB}
            strokeWidth="2.2"
          />
          {axes.map((axis, idx) => {
            const pt = getCoordinates(idx, statsB[axis.key]);
            return (
              <circle
                key={`b-${axis.key}`}
                cx={pt.x}
                cy={pt.y}
                r="3.2"
                fill={colorB}
              />
            );
          })}
        </g>
      )}

      {/* Polígono Jugador A */}
      {statsA && (
        <g>
          <polygon
            points={buildPolygonPoints(statsA)}
            fill={colorA}
            fillOpacity="0.28"
            stroke={colorA}
            strokeWidth="2.5"
          />
          {axes.map((axis, idx) => {
            const pt = getCoordinates(idx, statsA[axis.key]);
            return (
              <circle
                key={`a-${axis.key}`}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill="#080c14"
                stroke={colorA}
                strokeWidth="2"
              />
            );
          })}
        </g>
      )}

      {/* Etiquetas de cada vértice */}
      {axes.map((axis, idx) => {
        const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
        const labelRadius = maxRadius + 24;
        const lx = center + labelRadius * Math.cos(angle);
        const ly = center + labelRadius * Math.sin(angle);
        const valA = statsA ? statsA[axis.key] : '';
        return (
          <g key={`lbl-${axis.key}`}>
            <text
              x={lx}
              y={ly - 4}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-400 text-[8px] font-bold tracking-wider"
            >
              {axis.key}
            </text>
            <text
              x={lx}
              y={ly + 7}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white text-[10px] font-black"
            >
              {statsB ? `${valA}/${statsB[axis.key]}` : valA}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * GRÁFICO DE ANILLO / DONA (SVG) PARA VICTORIAS, EMPATES Y DERROTAS
 */
function WinDistributionDonut({ pg, pe, pp, pj, pointsEfficiency }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const wPct = pj > 0 ? pg / pj : 0;
  const dPct = pj > 0 ? pe / pj : 0;
  const lPct = pj > 0 ? pp / pj : 0;

  const wLen = wPct * circumference;
  const dLen = dPct * circumference;
  const lLen = lPct * circumference;

  return (
    <div className="flex items-center justify-center gap-5">
      <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
          />
          {pj > 0 && (
            <>
              {/* Victorias (Verde) */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                stroke="#00f59b"
                strokeWidth="12"
                strokeDasharray={`${wLen} ${circumference}`}
                strokeDashoffset={0}
              />
              {/* Empates (Ámbar) */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="12"
                strokeDasharray={`${dLen} ${circumference}`}
                strokeDashoffset={-wLen}
              />
              {/* Derrotas (Rosa) */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="12"
                strokeDasharray={`${lLen} ${circumference}`}
                strokeDashoffset={-(wLen + dLen)}
              />
            </>
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black text-white font-gaming leading-none">
            {pointsEfficiency}%
          </span>
          <span className="text-[9px] font-bold uppercase text-slate-400 mt-0.5">
            Efectividad
          </span>
        </div>
      </div>

      {/* Leyenda detallada */}
      <div className="space-y-2 text-xs flex-1">
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-fifa-neon" />
            Ganados
          </span>
          <span className="font-black text-white">
            {pg} ({pj > 0 ? Math.round(wPct * 100) : 0}%)
          </span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Empatados
          </span>
          <span className="font-black text-white">
            {pe} ({pj > 0 ? Math.round(dPct * 100) : 0}%)
          </span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <span className="flex items-center gap-1.5 text-rose-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Perdidos
          </span>
          <span className="font-black text-white">
            {pp} ({pj > 0 ? Math.round(lPct * 100) : 0}%)
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * GRÁFICO DE CURVA DE EVOLUCIÓN DE PUNTOS POR PARTIDO JUGADO (SVG)
 */
function PointsProgressionChart({ progression = [] }) {
  if (progression.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
        Aún no hay partidos jugados para graficar la curva de evolución.
      </div>
    );
  }

  const width = 460;
  const height = 150;
  const padX = 28;
  const padY = 22;

  const maxPts = Math.max(15, ...progression.map((p) => p.cumulativePts));
  const pointsWithZero = [{ matchIndex: 0, cumulativePts: 0, round: 0 }, ...progression];

  const getX = (idx) => {
    if (pointsWithZero.length <= 1) return padX;
    return (
      padX +
      (idx / (pointsWithZero.length - 1)) * (width - padX * 2)
    );
  };

  const getY = (pts) => {
    return height - padY - (pts / maxPts) * (height - padY * 2);
  };

  const polylinePoints = pointsWithZero
    .map((item, idx) => `${getX(idx).toFixed(1)},${getY(item.cumulativePts).toFixed(1)}`)
    .join(' ');

  const areaPoints = `${getX(0).toFixed(1)},${height - padY} ${polylinePoints} ${getX(
    pointsWithZero.length - 1
  ).toFixed(1)},${height - padY}`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[320px] h-40">
        <defs>
          <linearGradient id="neonAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f59b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00f59b" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Líneas guía horizontales */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = height - padY - ratio * (height - padY * 2);
          const val = Math.round(ratio * maxPts);
          return (
            <g key={idx}>
              <line
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
              <text
                x={padX - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-500 text-[9px] font-mono"
              >
                {val}p
              </text>
            </g>
          );
        })}

        {/* Área bajo la curva */}
        <polygon points={areaPoints} fill="url(#neonAreaGrad)" />

        {/* Línea de evolución */}
        <polyline
          fill="none"
          stroke="#00f59b"
          strokeWidth="2.5"
          points={polylinePoints}
        />

        {/* Puntos interactivos por partido */}
        {pointsWithZero.map((item, idx) => {
          if (idx === 0) return null;
          const cx = getX(idx);
          const cy = getY(item.cumulativePts);
          const dotColor =
            item.result === 'W'
              ? '#00f59b'
              : item.result === 'D'
              ? '#fbbf24'
              : '#f43f5e';

          return (
            <g key={item.matchId}>
              <circle
                cx={cx}
                cy={cy}
                r="4"
                fill={dotColor}
                stroke="#080c14"
                strokeWidth="1.5"
              >
                <title>
                  {`F${item.round} vs ${item.rivalName}: ${item.myGoals}-${item.rivalGoals} (${item.cumulativePts} pts)`}
                </title>
              </circle>
              <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                className="fill-white text-[9px] font-bold"
              >
                {item.cumulativePts}
              </text>
              <text
                x={cx}
                y={height - 6}
                textAnchor="middle"
                className="fill-slate-400 text-[8px]"
              >
                F{item.round}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function AnalyticsDashboard({
  players = [],
  matches = [],
  leaderboard = [],
  careerHistory = {},
  globalAnalytics,
  selectedPlayerId,
  onSelectPlayerId,
  currentUser,
  myLinkedPlayer,
  onOpenGoogleModal,
}) {
  const [activeView, setActiveView] = useState('perfil'); // 'perfil' | 'h2h' | 'global'
  const [comparePlayerBId, setComparePlayerBId] = useState(
    () => players[1]?.id || players[0]?.id || ''
  );

  const currentPlayerId =
    selectedPlayerId || myLinkedPlayer?.id || players[0]?.id || '';

  const playerAnalytics = useMemo(
    () =>
      calculatePlayerDeepAnalytics(
        currentPlayerId,
        players,
        matches,
        leaderboard,
        careerHistory
      ),
    [currentPlayerId, players, matches, leaderboard, careerHistory]
  );

  const effectivePlayerBId =
    comparePlayerBId && comparePlayerBId !== currentPlayerId
      ? comparePlayerBId
      : players.find((p) => p.id !== currentPlayerId)?.id || currentPlayerId;

  const h2hData = useMemo(
    () =>
      calculateHeadToHead(
        currentPlayerId,
        effectivePlayerBId,
        players,
        matches,
        leaderboard,
        careerHistory
      ),
    [currentPlayerId, effectivePlayerBId, players, matches, leaderboard, careerHistory]
  );

  if (!playerAnalytics) return null;

  const {
    player,
    attributes,
    careerTotals,
    progression,
    homeStats,
    awayStats,
    qualificationMath,
  } = playerAnalytics;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Glow ambiental */}
      <div className="absolute -top-12 right-1/3 w-80 h-36 bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Cabecera del Hub de Analítica */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white tracking-wide font-gaming flex items-center gap-2">
              EA FC ANALYTICS & PLAYER HUB (ESTADÍSTICAS Y GRÁFICOS)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Análisis táctico en tiempo real, Carta Pro EA FC, curvas de rendimiento, comparador Cara a Cara y récords históricos vinculados con Google.
          </p>
        </div>

        {/* Selector de Vistas del Hub */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveView('perfil')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'perfil'
                ? 'bg-fifa-neon text-slate-950 shadow-neon-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Carta Pro & Gráficos</span>
          </button>

          <button
            onClick={() => setActiveView('h2h')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'h2h'
                ? 'bg-sky-400 text-slate-950 shadow-blue-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Cara a Cara (VS)</span>
          </button>

          <button
            onClick={() => setActiveView('global')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'global'
                ? 'bg-amber-400 text-slate-950 shadow-gold-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Récords y Líderes del Torneo</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          VISTA 1: CARTA PRO EA FC & DASHBOARD INDIVIDUAL DEL JUGADOR
         ════════════════════════════════════════════════════════════════ */}
      {activeView === 'perfil' && (
        <div className="mt-5 space-y-5">
          {/* Barra superior de selección de jugador + estado de cuenta Google */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Analizando Jugador:
              </span>
              <select
                aria-label="Seleccionar jugador para análisis"
                value={player.id}
                onChange={(e) => onSelectPlayerId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-black font-gaming text-white focus:outline-none focus:border-fifa-neon"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.favoriteTeam}) {p.uid ? '✓ Google' : ''}
                  </option>
                ))}
              </select>

              {myLinkedPlayer && myLinkedPlayer.id !== player.id && (
                <button
                  type="button"
                  onClick={() => onSelectPlayerId(myLinkedPlayer.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-fifa-neon/15 border border-fifa-neon/40 text-fifa-neon text-xs font-bold hover:bg-fifa-neon/25 transition"
                >
                  Ir a Mi Perfil ({myLinkedPlayer.name})
                </button>
              )}
            </div>

            {/* Estado de vinculación Google de este jugador */}
            <div className="flex items-center gap-2 text-xs">
              {player.uid ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-fifa-neon" />
                  <span>Cuenta Google Vinculada ({player.email || 'Verificado'})</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenGoogleModal}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-bold flex items-center gap-1.5 transition"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>¿Eres {player.name}? Vincular con Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid Principal: Carta FUT + Radar + Dona + Curva de Evolución */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* COLUMNA IZQUIERDA (4 cols): CARTA PRO EA FC 26 */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 relative overflow-hidden">
              {/* Marco Estilo Carta FUT */}
              <div
                className={`w-full max-w-[270px] rounded-3xl p-5 border-2 relative overflow-hidden ${
                  careerTotals.isReigningChampion
                    ? 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 border-fifa-gold shadow-gold-glow'
                    : 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 border-fifa-neon/60 shadow-neon-glow'
                }`}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-fifa-neon/20 blur-2xl pointer-events-none" />

                {/* Insignia Superior si es Campeón Vigente o tiene Estrellas */}
                {(careerTotals.isReigningChampion || careerTotals.titlesWon > 0) && (
                  <div className="mb-2.5 flex items-center justify-between px-2.5 py-1 rounded-xl bg-amber-400/15 border border-amber-400/40 text-[10px] font-black text-fifa-gold">
                    <span>
                      {careerTotals.isReigningChampion ? '👑 CAMPEÓN VIGENTE' : '🏆 CAMPEÓN MUNDIAL'}
                    </span>
                    <span>{'⭐'.repeat(Math.min(5, careerTotals.titlesWon || 1))}</span>
                  </div>
                )}

                {/* Top de la Carta: OVR + Posición + Avatar */}
                <div className="flex items-start justify-between">
                  <div className="text-center">
                    <div className="text-4xl font-black text-fifa-neon font-gaming leading-none">
                      {attributes.OVR}
                    </div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300 mt-1">
                      MEDIA PRO
                    </div>
                    <div className="mt-2 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-black text-amber-400">
                      #{playerAnalytics.position} LIGA
                    </div>
                  </div>

                  {/* Foto de Google o Avatar Iniciales (sin estirar la forma) */}
                  <div className="relative shrink-0">
                    <CardPlayerAvatar
                      player={player}
                      photoURL={resolvePlayerPhotoURL(
                        player,
                        careerHistory,
                        currentUser
                      )}
                    />
                    {(player.uid ||
                      resolvePlayerPhotoURL(player, careerHistory, currentUser)) && (
                      <span
                        title="Verificado con Google"
                        className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-slate-950 border border-fifa-neon text-[9px] font-black text-fifa-neon shadow"
                      >
                        G✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Nombre y Equipo */}
                <div className="mt-4 text-center border-y border-slate-800/90 py-2.5">
                  <div className="text-xl font-black text-white font-gaming tracking-wide uppercase truncate">
                    {player.name}
                  </div>
                  <div className="text-xs font-bold text-fifa-emerald flex items-center justify-center gap-1 mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="truncate">{player.favoriteTeam}</span>
                  </div>
                </div>

                {/* 6 Atributos Estilo FUT */}
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs font-gaming">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">ATA</span>
                    <span className="font-black text-white text-sm">{attributes.ATA}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">DEF</span>
                    <span className="font-black text-white text-sm">{attributes.DEF}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">EFE</span>
                    <span className="font-black text-fifa-neon text-sm">{attributes.EFE}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">FOR</span>
                    <span className="font-black text-white text-sm">{attributes.FOR}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">LOC</span>
                    <span className="font-black text-white text-sm">{attributes.LOC}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">VIS</span>
                    <span className="font-black text-white text-sm">{attributes.VIS}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA CENTRAL (4 cols): RADAR TÁCTICO HEXAGONAL */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-fifa-neon flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>Radar Táctico de Atributos</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Polígono de rendimiento (0-99) calculado en tiempo real según goles, defensa y localía.
                </p>
              </div>

              <div className="my-2">
                <HexRadarChart statsA={attributes} colorA={player.color || '#00f59b'} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-2 border-t border-slate-800/80">
                <div className="p-1.5 rounded-lg bg-slate-950/70">
                  <div className="text-slate-400">Goles/PJ</div>
                  <div className="font-black text-fifa-neon text-sm">
                    {playerAnalytics.goalsForPerMatch}
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/70">
                  <div className="text-slate-400">En Contra/PJ</div>
                  <div className="font-black text-rose-400 text-sm">
                    {playerAnalytics.goalsAgainstPerMatch}
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/70">
                  <div className="text-slate-400">Valla Invicta</div>
                  <div className="font-black text-sky-400 text-sm">
                    {playerAnalytics.cleanSheets}
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA (4 cols): DISTRIBUCIÓN DE RESULTADOS Y RACHA */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>Distribución V / E / D y Efectividad</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Balance sobre {playerAnalytics.pj} de 15 partidos disputados ({playerAnalytics.pts} pts).
                </p>
              </div>

              <WinDistributionDonut
                pg={playerAnalytics.pg}
                pe={playerAnalytics.pe}
                pp={playerAnalytics.pp}
                pj={playerAnalytics.pj}
                pointsEfficiency={playerAnalytics.pointsEfficiency}
              />

              {/* Comparativa Local vs Visitante */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Rendimiento Local
                  </div>
                  <div className="text-sm font-black text-white mt-0.5 font-gaming">
                    {homeStats.pts} pts{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({homeStats.pg}V-{homeStats.pe}E-{homeStats.pp}D)
                    </span>
                  </div>
                  <div className="text-[10px] text-fifa-neon mt-0.5">
                    GF: {homeStats.gf} · GC: {homeStats.gc}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Rendimiento Visita
                  </div>
                  <div className="text-sm font-black text-white mt-0.5 font-gaming">
                    {awayStats.pts} pts{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({awayStats.pg}V-{awayStats.pe}E-{awayStats.pp}D)
                    </span>
                  </div>
                  <div className="text-[10px] text-sky-400 mt-0.5">
                    GF: {awayStats.gf} · GC: {awayStats.gc}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CALCULADORA DE CLASIFICACIÓN AL TOP 8 + DESGLOSE DE ATRIBUTOS EA FC */}
          {qualificationMath && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Panel Izquierdo (7 cols): ¿Cuántos puntos necesita para entrar / asegurar el Top 8? */}
              <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/75 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-gaming">
                      <Trophy className="w-4 h-4 text-fifa-gold" />
                      <span>Calculadora de Clasificación al Top 8 (Zona Mundial)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {qualificationMath.detailedSummary}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black font-gaming shrink-0 border ${
                      qualificationMath.isClinchedMathematically ||
                      qualificationMath.isTop8
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-fifa-neon'
                        : qualificationMath.isEliminatedMathematically
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {qualificationMath.shortBadgeText}
                  </span>
                </div>

                {/* 4 KPIs numéricos de clasificación */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Para Superar al #8 Hoy
                    </div>
                    <div className="text-base font-black font-gaming mt-0.5 text-white">
                      {qualificationMath.isTop8 ? (
                        <span className="text-fifa-neon">
                          Ya en Top 8 (+{qualificationMath.cushionOver9th} s/9º)
                        </span>
                      ) : (
                        <span className="text-amber-300">
                          +{qualificationMath.ptsToOvertake8th} PTS ({qualificationMath.winsNeededForCurrent8th}V)
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Corte #8: {qualificationMath.cutoff8thPts} pts ({qualificationMath.cutoff8thName})
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Meta Corte Final (15J)
                    </div>
                    <div className="text-base font-black font-gaming mt-0.5 text-amber-300">
                      {qualificationMath.ptsNeededForProjected > 0
                        ? `Faltan +${qualificationMath.ptsNeededForProjected} PTS`
                        : 'Meta Alcanzada ✓'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Umbral proyectado: ~{qualificationMath.projectedCutoffPts} pts
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Puntos en Disputa
                    </div>
                    <div className="text-base font-black font-gaming mt-0.5 text-sky-400">
                      {qualificationMath.pointsRemaining} PTS
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Quedan {qualificationMath.matchesLeft} de 15 partidos
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Techo Máximo Posible
                    </div>
                    <div className="text-base font-black font-gaming mt-0.5 text-fifa-neon">
                      {qualificationMath.maxPossiblePts} PTS
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Ganando todo lo restante
                    </div>
                  </div>
                </div>

                {/* Barra de progreso hacia el corte proyectado */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">
                      Progreso hacia la Zona Segura (~{qualificationMath.projectedCutoffPts} pts):{' '}
                      <strong className="text-fifa-neon">{playerAnalytics.pts} pts actuales</strong>
                    </span>
                    <span className="text-slate-400">
                      {Math.min(
                        100,
                        Math.round(
                          (playerAnalytics.pts /
                            Math.max(1, qualificationMath.projectedCutoffPts)) *
                            100
                        )
                      )}
                      % de la meta
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-fifa-emerald via-fifa-neon to-amber-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (playerAnalytics.pts /
                              Math.max(1, qualificationMath.projectedCutoffPts)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Panel Derecho (5 cols): ¿Cómo se calculan ATA, DEF, EFE, FOR, LOC, VIS y OVR? */}
              <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/75 border border-slate-800 space-y-2.5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 font-gaming">
                  <Target className="w-4 h-4" />
                  <span>¿Cómo se calculan los atributos de la Carta Pro (48–99)?</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90">
                    <div className="flex justify-between font-black text-white">
                      <span>ATA (Ataque)</span>
                      <span className="text-fifa-neon">{attributes.ATA}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Base 55 + (Goles/PJ × 14) + (% Victorias × 8)
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90">
                    <div className="flex justify-between font-black text-white">
                      <span>DEF (Defensa)</span>
                      <span className="text-fifa-neon">{attributes.DEF}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Base 88 − (GC/PJ × 11) + (% Vallas Invictas × 16)
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90">
                    <div className="flex justify-between font-black text-white">
                      <span>EFE (Efectividad)</span>
                      <span className="text-fifa-neon">{attributes.EFE}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Base 50 + (% de Puntos Ganados × 0.48)
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90">
                    <div className="flex justify-between font-black text-white">
                      <span>FOR (Forma 5 PJ)</span>
                      <span className="text-fifa-neon">{attributes.FOR}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Base 52 + (% Puntos en últimos 5 PJ × 46)
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90">
                    <div className="flex justify-between font-black text-white">
                      <span>LOC (Localía)</span>
                      <span className="text-fifa-neon">{attributes.LOC}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Base 52 + (% Efectividad de Local × 0.45)
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90">
                    <div className="flex justify-between font-black text-white">
                      <span>VIS (Visitante)</span>
                      <span className="text-fifa-neon">{attributes.VIS}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Base 52 + (% Efectividad de Visita × 0.45)
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <strong className="text-white">MEDIA PRO (OVR {attributes.OVR}):</strong>{' '}
                  Promedio ponderado: 26% EFE + 22% ATA + 20% DEF + 14% FOR + 9% LOC + 9% VIS.
                </div>
              </div>
            </div>
          )}

          {/* SEGUNDA FILA DE GRÁFICOS: CURVA DE PUNTOS + GOLES POR PARTIDO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Curva de Evolución de Puntos */}
            <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-fifa-neon flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Curva de Evolución de Puntos Acumulados</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Crecimiento jornada a jornada (Verde = Victoria, Ámbar = Empate, Rojo = Derrota).
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-black text-fifa-neon">
                  {playerAnalytics.pts} PTS
                </span>
              </div>

              <PointsProgressionChart progression={progression} />
            </div>

            {/* Gráfico de Barras: Goles a Favor vs Goles en Contra por Partido */}
            <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" />
                    <span>Goles Anotados vs Recibidos por Partido</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Comparativa ofensiva (verde) y defensiva (rojo) en cada duelo jugado.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-300">
                  <span className="text-fifa-neon">{playerAnalytics.gf} GF</span> ·{' '}
                  <span className="text-rose-400">{playerAnalytics.gc} GC</span>
                </div>
              </div>

              {progression.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  Sin partidos registrados todavía para mostrar barras de goles.
                </div>
              ) : (
                <div className="flex items-end gap-2.5 h-40 pt-4 pb-1 px-2 overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-950/50">
                  {progression.map((item) => {
                    const maxG = Math.max(
                      5,
                      ...progression.map((p) => Math.max(p.myGoals, p.rivalGoals))
                    );
                    const myHeight = Math.max(8, Math.round((item.myGoals / maxG) * 90));
                    const rivHeight = Math.max(
                      8,
                      Math.round((item.rivalGoals / maxG) * 90)
                    );

                    return (
                      <div
                        key={item.matchId}
                        className="flex flex-col items-center justify-end min-w-[44px] flex-1 h-full"
                        title={`Fecha ${item.round} vs ${item.rivalName}: ${item.myGoals} - ${item.rivalGoals}`}
                      >
                        <div className="flex items-end gap-1 h-24">
                          {/* Barra Goles a Favor */}
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-fifa-neon mb-0.5">
                              {item.myGoals}
                            </span>
                            <div
                              className="w-3.5 rounded-t bg-gradient-to-t from-emerald-600 to-fifa-neon transition-all"
                              style={{ height: `${myHeight}px` }}
                            />
                          </div>
                          {/* Barra Goles en Contra */}
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-rose-400 mb-0.5">
                              {item.rivalGoals}
                            </span>
                            <div
                              className="w-3.5 rounded-t bg-gradient-to-t from-rose-700 to-rose-400 transition-all"
                              style={{ height: `${rivHeight}px` }}
                            />
                          </div>
                        </div>
                        <div className="mt-1.5 text-[9px] font-bold text-slate-300 truncate max-w-[48px]">
                          {item.rivalName.substring(0, 5)}
                        </div>
                        <div className="text-[8px] text-slate-500">F{item.round}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* TERCERA FILA: RÉCORDS HISTÓRICOS DE CARRERA Y HITOS DEL JUGADOR */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-900/90 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-fifa-gold" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Récord Histórico de Carrera & Hitos de {player.name}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Acumulado histórico (Torneos anteriores + Torneo actual)
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Récord Histórico V-E-D
                </div>
                <div className="text-base font-black text-white font-gaming mt-1">
                  {careerTotals.pg}V - {careerTotals.pe}E - {careerTotals.pp}D
                </div>
                <div className="text-[10px] text-fifa-neon mt-0.5">
                  {careerTotals.pj} PJ Totales ({careerTotals.winRate}% Vic.)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Goles de Carrera
                </div>
                <div className="text-base font-black text-white font-gaming mt-1">
                  {careerTotals.gf} GF / {careerTotals.gc} GC
                </div>
                <div className="text-[10px] text-sky-400 mt-0.5">
                  Dif. Histórica: {careerTotals.dg >= 0 ? `+${careerTotals.dg}` : careerTotals.dg}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Mayor Victoria
                </div>
                <div className="text-base font-black text-emerald-400 font-gaming mt-1">
                  {playerAnalytics.biggestWin
                    ? `${playerAnalytics.biggestWin.scoreText}`
                    : 'Sin victorias aún'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {playerAnalytics.biggestWin
                    ? `vs ${playerAnalytics.biggestWin.rivalName} (F${playerAnalytics.biggestWin.round})`
                    : '-'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Peor Derrota
                </div>
                <div className="text-base font-black text-rose-400 font-gaming mt-1">
                  {playerAnalytics.biggestLoss
                    ? `${playerAnalytics.biggestLoss.scoreText}`
                    : 'Invicto 🎉'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {playerAnalytics.biggestLoss
                    ? `vs ${playerAnalytics.biggestLoss.rivalName} (F${playerAnalytics.biggestLoss.round})`
                    : '0 derrotas'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Mejor Racha
                </div>
                <div className="text-base font-black text-amber-400 font-gaming mt-1">
                  {playerAnalytics.bestWinStreak} Victorias
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {playerAnalytics.bestUnbeatenStreak} partidos sin perder
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Mundiales (Top 8) y Títulos
                </div>
                <div className="text-base font-black text-fifa-gold font-gaming mt-1">
                  🌐 {careerTotals.worldCupQualifications}x Top 8
                </div>
                <div className="text-[10px] text-amber-300 font-bold mt-0.5">
                  {careerTotals.titlesWon > 0
                    ? `⭐ ${careerTotals.titlesWon}x Campeón del Mundo`
                    : `${careerTotals.tournamentsPlayed} Eliminatorias jugadas`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          VISTA 2: COMPARADOR CARA A CARA (HEAD-TO-HEAD / VS)
         ════════════════════════════════════════════════════════════════ */}
      {activeView === 'h2h' && h2hData.playerA && h2hData.playerB && (
        <div className="mt-5 space-y-5">
          {/* Selectores de Jugador A vs Jugador B */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="md:col-span-5 flex items-center gap-3">
              <div className="w-3 h-8 rounded-full bg-fifa-neon shrink-0" />
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase text-fifa-neon">
                  Jugador 1 (Verde Neón)
                </label>
                <select
                  value={currentPlayerId}
                  onChange={(e) => onSelectPlayerId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-black font-gaming text-white focus:outline-none focus:border-fifa-neon"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.favoriteTeam})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-1 text-center font-black font-gaming text-slate-500 text-sm">
              VS
            </div>

            <div className="md:col-span-5 flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase text-sky-400">
                  Jugador 2 (Azul Cielo)
                </label>
                <select
                  value={effectivePlayerBId}
                  onChange={(e) => setComparePlayerBId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-black font-gaming text-white focus:outline-none focus:border-sky-400"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.favoriteTeam})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-3 h-8 rounded-full bg-sky-400 shrink-0" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Radar Superpuesto */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-white">
                Superposición Táctica de Atributos
              </div>
              <HexRadarChart
                statsA={h2hData.playerA.attributes}
                statsB={h2hData.playerB.attributes}
                colorA="#00f59b"
                colorB="#38bdf8"
              />
              <div className="flex items-center justify-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-fifa-neon">
                  <span className="w-2.5 h-2.5 rounded-full bg-fifa-neon" />
                  {h2hData.playerA.player.name} (OVR {h2hData.playerA.attributes.OVR})
                </span>
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  {h2hData.playerB.player.name} (OVR {h2hData.playerB.attributes.OVR})
                </span>
              </div>

              {/* Resultado del Duelo Directo en el Torneo */}
              {h2hData.directMatch && (
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Enfrentamiento Directo ({h2hData.directMatch.id} · Fecha{' '}
                    {h2hData.directMatch.round})
                  </div>
                  {h2hData.directMatch.jugado ? (
                    <div className="text-sm font-black text-white font-gaming">
                      {h2hData.directMatch.homePlayerName}{' '}
                      <span className="text-fifa-neon px-1.5">
                        {h2hData.directMatch.golesLocal} -{' '}
                        {h2hData.directMatch.golesVisitante}
                      </span>{' '}
                      {h2hData.directMatch.awayPlayerName}
                    </div>
                  ) : (
                    <div className="text-amber-400 font-bold">
                      Partido Pendiente ({h2hData.directMatch.homePlayerName} vs{' '}
                      {h2hData.directMatch.awayPlayerName})
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Barras Comparativas Lado a Lado */}
            <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-white mb-2">
                Comparativa Estadística Directa
              </div>

              {[
                {
                  label: 'Puntos Oficiales (PTS)',
                  valA: h2hData.playerA.pts,
                  valB: h2hData.playerB.pts,
                },
                {
                  label: 'Efectividad (%)',
                  valA: h2hData.playerA.pointsEfficiency,
                  valB: h2hData.playerB.pointsEfficiency,
                  suffix: '%',
                },
                {
                  label: 'Partidos Ganados (PG)',
                  valA: h2hData.playerA.pg,
                  valB: h2hData.playerB.pg,
                },
                {
                  label: 'Goles a Favor (GF)',
                  valA: h2hData.playerA.gf,
                  valB: h2hData.playerB.gf,
                },
                {
                  label: 'Promedio Goles / Partido',
                  valA: h2hData.playerA.goalsForPerMatch,
                  valB: h2hData.playerB.goalsForPerMatch,
                },
                {
                  label: 'Vallas Invictas (Arco en 0)',
                  valA: h2hData.playerA.cleanSheets,
                  valB: h2hData.playerB.cleanSheets,
                },
                {
                  label: 'Media General EA FC (OVR)',
                  valA: h2hData.playerA.attributes.OVR,
                  valB: h2hData.playerB.attributes.OVR,
                },
              ].map((row) => {
                const total = Math.max(1, Number(row.valA) + Number(row.valB));
                const pctA =
                  Number(row.valA) === 0 && Number(row.valB) === 0
                    ? 50
                    : Math.round((Number(row.valA) / total) * 100);
                const pctB = 100 - pctA;

                return (
                  <div key={row.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-fifa-neon">
                        {row.valA}
                        {row.suffix || ''}
                      </span>
                      <span className="text-slate-400 text-[11px]">{row.label}</span>
                      <span className="text-sky-400">
                        {row.valB}
                        {row.suffix || ''}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
                      <div
                        className="h-full bg-fifa-neon transition-all duration-300"
                        style={{ width: `${pctA}%` }}
                      />
                      <div
                        className="h-full bg-sky-400 transition-all duration-300"
                        style={{ width: `${pctB}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          VISTA 3: RÉCORDS Y LÍDERES GLOBALES DEL TORNEO
         ════════════════════════════════════════════════════════════════ */}
      {activeView === 'global' && globalAnalytics && (
        <div className="mt-5 space-y-5">
          {/* 4 Premios Oficiales del Torneo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Bota de Oro */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-slate-900/90 border border-amber-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                <span>👟 BOTA DE ORO (GOLEADOR)</span>
                <Award className="w-4 h-4" />
              </div>
              {globalAnalytics.goldenBoot ? (
                <div className="mt-2">
                  <div className="text-lg font-black text-white font-gaming">
                    {globalAnalytics.goldenBoot.player.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {globalAnalytics.goldenBoot.player.favoriteTeam}
                  </div>
                  <div className="mt-2 text-sm font-black text-amber-400">
                    {globalAnalytics.goldenBoot.gf} Goles{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      en {globalAnalytics.goldenBoot.pj} PJ
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-500">Sin goles registrados aún</div>
              )}
            </div>

            {/* Guante de Oro */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/10 to-slate-900/90 border border-sky-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                <span>🧤 MURO DEFENSIVO</span>
                <Shield className="w-4 h-4" />
              </div>
              {globalAnalytics.goldenGlove ? (
                <div className="mt-2">
                  <div className="text-lg font-black text-white font-gaming">
                    {globalAnalytics.goldenGlove.player.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {globalAnalytics.goldenGlove.player.favoriteTeam}
                  </div>
                  <div className="mt-2 text-sm font-black text-sky-400">
                    {globalAnalytics.goldenGlove.gc} GC{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      ({globalAnalytics.goldenGlove.cleanSheets} vallas invictas)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-500">Sin partidos jugados aún</div>
              )}
            </div>

            {/* Líder de Efectividad */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-slate-900/90 border border-emerald-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-fifa-neon">
                <span>👑 LÍDER DE ELIMINATORIAS</span>
                <Trophy className="w-4 h-4" />
              </div>
              {globalAnalytics.mvpLeader ? (
                <div className="mt-2">
                  <div className="text-lg font-black text-white font-gaming">
                    {globalAnalytics.mvpLeader.player.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {globalAnalytics.mvpLeader.player.favoriteTeam}
                  </div>
                  <div className="mt-2 text-sm font-black text-fifa-neon">
                    {globalAnalytics.mvpLeader.pts} PTS{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      ({globalAnalytics.mvpLeader.pointsEfficiency}% efectividad)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-500">Sin líder definido aún</div>
              )}
            </div>

            {/* Mayor Goleada */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-slate-900/90 border border-rose-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                <span>💥 MAYOR GOLEADA</span>
                <Flame className="w-4 h-4" />
              </div>
              {globalAnalytics.biggestBlowout ? (
                <div className="mt-2">
                  <div className="text-sm font-black text-white font-gaming truncate">
                    {globalAnalytics.biggestBlowout.scoreText}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Fecha {globalAnalytics.biggestBlowout.match.round} (Dif. +
                    {globalAnalytics.biggestBlowout.diff})
                  </div>
                  <div className="mt-2 text-xs font-bold text-rose-300">
                    Ganador: {globalAnalytics.biggestBlowout.winnerName}
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-500">Sin goleadas registradas</div>
              )}
            </div>
          </div>

          {/* Gráfico de Goles por Jornada (Fechas 1 a 15) + Distribución Local/Visita */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Goles por Jornada */}
            <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-fifa-neon">
                  Goles Totales por Jornada (Fechas 1 a 15)
                </div>
                <p className="text-[11px] text-slate-400">
                  Evolución goleadora de cada fecha del torneo Round Robin.
                </p>
              </div>

              <div className="flex items-end justify-between gap-1.5 h-40 pt-4 pb-1 px-2 border border-slate-800/80 rounded-xl bg-slate-950/50 overflow-x-auto">
                {globalAnalytics.roundsData.map((r) => {
                  const maxRoundGoals = Math.max(
                    10,
                    ...globalAnalytics.roundsData.map((d) => d.totalGoals)
                  );
                  const barHeight =
                    r.totalGoals > 0
                      ? Math.max(10, Math.round((r.totalGoals / maxRoundGoals) * 92))
                      : 4;

                  return (
                    <div
                      key={r.round}
                      className="flex flex-col items-center justify-end flex-1 min-w-[28px] h-full"
                      title={`Fecha ${r.round}: ${r.totalGoals} goles en ${r.playedCount}/8 partidos`}
                    >
                      <span className="text-[9px] font-black text-fifa-neon mb-1">
                        {r.totalGoals > 0 ? r.totalGoals : ''}
                      </span>
                      <div
                        className={`w-full max-w-[22px] rounded-t transition-all ${
                          r.totalGoals > 0
                            ? 'bg-gradient-to-t from-emerald-600 to-fifa-neon'
                            : 'bg-slate-800'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-[9px] font-bold text-slate-400 mt-1.5">
                        F{r.round}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Balance Local vs Empates vs Visitante */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-sky-400">
                  Tendencia Local vs Visitante
                </div>
                <p className="text-[11px] text-slate-400">
                  ¿Influye la localía en los {globalAnalytics.totalPlayed} partidos jugados?
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-full h-4 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
                  <div
                    className="h-full bg-fifa-neon"
                    style={{ width: `${globalAnalytics.homeWinPct}%` }}
                    title={`Victorias Local: ${globalAnalytics.homeWinPct}%`}
                  />
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${globalAnalytics.drawPct}%` }}
                    title={`Empates: ${globalAnalytics.drawPct}%`}
                  />
                  <div
                    className="h-full bg-sky-400"
                    style={{ width: `${globalAnalytics.awayWinPct}%` }}
                    title={`Victorias Visitante: ${globalAnalytics.awayWinPct}%`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-fifa-neon font-bold uppercase">
                      Gana Local
                    </div>
                    <div className="text-lg font-black text-white font-gaming">
                      {globalAnalytics.homeWins}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {globalAnalytics.homeWinPct}% ({globalAnalytics.homeGoals} goles)
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">
                      Empates
                    </div>
                    <div className="text-lg font-black text-white font-gaming">
                      {globalAnalytics.draws}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {globalAnalytics.drawPct}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-sky-400 font-bold uppercase">
                      Gana Visita
                    </div>
                    <div className="text-lg font-black text-white font-gaming">
                      {globalAnalytics.awayWins}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {globalAnalytics.awayWinPct}% ({globalAnalytics.awayGoals} goles)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
