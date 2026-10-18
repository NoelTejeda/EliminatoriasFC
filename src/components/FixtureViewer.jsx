import React, { useState } from 'react';
import {
  Calendar,
  Flame,
  User,
  Grid3X3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';

export function FixtureViewer({
  matches,
  players,
  presentPlayerIds,
  suggestedMatchesToday,
  activeMatchId,
  onSelectActiveMatch,
  onResetMatch,
  selectedPlayerId,
  onSelectPlayerId,
  readOnly = false,
}) {
  const [activeTab, setActiveTab] = useState('sugeridos'); // 'sugeridos' | 'todos' | 'jugador' | 'matriz'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'jugados' | 'pendientes'
  const [roundFilter, setRoundFilter] = useState('todas'); // 'todas' | 1..15

  const presentSet = new Set(presentPlayerIds);

  // Filtro de Todos los Partidos
  const filteredAllMatches = matches.filter((m) => {
    // Filtro de estado
    if (statusFilter === 'jugados' && !m.jugado) return false;
    if (statusFilter === 'pendientes' && m.jugado) return false;

    // Filtro de fecha
    if (roundFilter !== 'todas' && m.round !== parseInt(roundFilter, 10)) return false;

    // Filtro de búsqueda por texto
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchText = `${m.homePlayerName} ${m.awayPlayerName} ${m.homeTeam} ${m.awayTeam} ${m.id}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  // Datos para vista por jugador
  const currentPlayer = players.find((p) => p.id === (selectedPlayerId || players[0]?.id)) || players[0];
  const playerMatches = matches.filter(
    (m) => m.homePlayerId === currentPlayer.id || m.awayPlayerId === currentPlayer.id
  );

  const playerStats = {
    total: playerMatches.length, // siempre 15
    played: playerMatches.filter((m) => m.jugado).length,
    pending: playerMatches.filter((m) => !m.jugado).length,
    won: playerMatches.filter((m) => {
      if (!m.jugado) return false;
      return m.homePlayerId === currentPlayer.id
        ? m.golesLocal > m.golesVisitante
        : m.golesVisitante > m.golesLocal;
    }).length,
    drawn: playerMatches.filter((m) => {
      if (!m.jugado) return false;
      return m.golesLocal === m.golesVisitante;
    }).length,
    lost: playerMatches.filter((m) => {
      if (!m.jugado) return false;
      return m.homePlayerId === currentPlayer.id
        ? m.golesLocal < m.golesVisitante
        : m.golesVisitante < m.golesLocal;
    }).length,
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-2xl relative">
      
      {/* Selector de Pestañas Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-black text-white tracking-wide font-gaming flex items-center gap-2">
            MÓDULO DE CONTROL Y VALIDACIÓN DE FIXTURE
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualización exhaustiva de los 120 partidos: sugeridos de hoy, listado completo, ficha por jugador y matriz.
          </p>
        </div>

        {/* Botones de Pestaña */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('sugeridos')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sugeridos'
                ? 'bg-fifa-neon text-slate-950 shadow-neon-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Sugeridos Hoy</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'sugeridos' ? 'bg-slate-950 text-fifa-neon' : 'bg-slate-800 text-slate-300'
            }`}>
              {suggestedMatchesToday.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('todos')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'todos'
                ? 'bg-fifa-neon text-slate-950 shadow-neon-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Todos los Partidos (120)</span>
          </button>

          <button
            onClick={() => setActiveTab('jugador')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'jugador'
                ? 'bg-fifa-neon text-slate-950 shadow-neon-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Ver por Jugador</span>
          </button>

          <button
            onClick={() => setActiveTab('matriz')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'matriz'
                ? 'bg-fifa-neon text-slate-950 shadow-neon-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Matriz 16x16</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO 1: PARTIDOS SUGERIDOS HOY */}
      {activeTab === 'sugeridos' && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-300">
              Mostrando partidos pendientes donde <strong className="text-fifa-neon">AMBOS participantes están marcados como presentes hoy</strong> en la casa.
            </span>
            <span className="text-fifa-neon font-bold">
              {suggestedMatchesToday.length} enfrentamientos disponibles
            </span>
          </div>

          {suggestedMatchesToday.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/20">
              <Flame className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-300 font-gaming">
                No hay partidos disponibles entre los presentes
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Todos los partidos entre los amigos que están en la casa ya fueron jugados, o no hay suficientes jugadores marcados.
                Selecciona a más amigos en el panel superior.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestedMatchesToday.map((match) => {
                const isActive = match.id === activeMatchId;

                return (
                  <div
                    key={match.id}
                    className={`p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? 'bg-fifa-neon/10 border-fifa-neon shadow-neon-glow'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {match.id} · Fecha {match.round}
                      </span>
                      <span className="text-fifa-neon flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-fifa-neon animate-pulse" />
                        Ambos en casa
                      </span>
                    </div>

                    {/* Duelo */}
                    <div className="space-y-2 my-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-fifa-neon" />
                          {match.homePlayerName}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {match.homeTeam}
                        </span>
                      </div>
                      <div className="text-center text-[10px] font-black tracking-widest text-slate-500 uppercase">
                        VS
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-400" />
                          {match.awayPlayerName}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {match.awayTeam}
                        </span>
                      </div>
                    </div>

                    {/* Botón para cargar en marcador (solo Admin) */}
                    {!readOnly && (
                      <button
                        onClick={() => {
                          onSelectActiveMatch(match.id);
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold font-gaming uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                          isActive
                            ? 'bg-fifa-neon text-slate-950 font-black'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isActive ? 'Cargado en Marcador' : 'Jugar / Cargar Resultado'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO 2: TODOS LOS PARTIDOS (120) */}
      {activeTab === 'todos' && (
        <div className="mt-5 space-y-4">
          
          {/* Barra de Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            {/* Buscador */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar jugador o equipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-fifa-neon"
              />
            </div>

            {/* Filtro Estado */}
            <div className="sm:col-span-4 flex items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('todos')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  statusFilter === 'todos'
                    ? 'bg-fifa-neon text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Todos (120)
              </button>
              <button
                onClick={() => setStatusFilter('jugados')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  statusFilter === 'jugados'
                    ? 'bg-fifa-emerald text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Jugados
              </button>
              <button
                onClick={() => setStatusFilter('pendientes')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  statusFilter === 'pendientes'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Pendientes
              </button>
            </div>

            {/* Filtro Fecha */}
            <div className="sm:col-span-3">
              <select
                aria-label="Filtrar por jornada"
                value={roundFilter}
                onChange={(e) => setRoundFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-fifa-neon"
              >
                <option value="todas">Todas las Jornadas (1-15)</option>
                {Array.from({ length: 15 }, (_, i) => i + 1).map((r) => (
                  <option key={r} value={r}>
                    Fecha {r} (8 partidos)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Listado de Partidos */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredAllMatches.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No se encontraron partidos con los filtros seleccionados.
              </div>
            ) : (
              filteredAllMatches.map((m) => {
                const bothPresent = presentSet.has(m.homePlayerId) && presentSet.has(m.awayPlayerId);

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition ${
                      m.jugado
                        ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        : bothPresent
                        ? 'bg-fifa-neon/5 border-fifa-neon/30 hover:border-fifa-neon/60'
                        : 'bg-slate-900/20 border-slate-850 opacity-80'
                    }`}
                  >
                    {/* Badge de ID y Fecha */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                        {m.id}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Fecha {m.round}
                      </span>
                    </div>

                    {/* Duelo y Marcador */}
                    <div className="flex items-center justify-center flex-1 gap-4 font-gaming">
                      {/* Local */}
                      <div className="text-right flex-1 truncate">
                        <span className="text-sm font-bold text-white">{m.homePlayerName}</span>
                        <div className="text-[10px] text-slate-400 truncate">{m.homeTeam}</div>
                      </div>

                      {/* Score o VS */}
                      <div className="min-w-[80px] text-center">
                        {m.jugado ? (
                          <div className="flex items-center justify-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                            <span className="text-base font-black text-white">{m.golesLocal}</span>
                            <span className="text-slate-500 text-xs">-</span>
                            <span className="text-base font-black text-white">{m.golesVisitante}</span>
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold">
                            VS
                          </div>
                        )}
                      </div>

                      {/* Visita */}
                      <div className="text-left flex-1 truncate">
                        <span className="text-sm font-bold text-white">{m.awayPlayerName}</span>
                        <div className="text-[10px] text-slate-400 truncate">{m.awayTeam}</div>
                      </div>
                    </div>

                    {/* Estado y Acciones */}
                    <div className="flex items-center justify-end gap-2 text-xs">
                      {m.jugado ? (
                        <>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            FINALIZADO
                          </span>
                          {!readOnly && (
                            <button
                              onClick={() => onResetMatch(m.id)}
                              title="Reabrir partido para corregir marcador"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {bothPresent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-fifa-neon/20 text-fifa-neon border border-fifa-neon/40">
                              En Casa
                            </span>
                          )}
                          {!readOnly && (
                            <button
                              onClick={() => {
                                onSelectActiveMatch(m.id);
                                window.scrollTo({ top: 120, behavior: 'smooth' });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-fifa-neon/15 hover:bg-fifa-neon text-fifa-neon hover:text-slate-950 font-bold text-xs transition flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Cargar</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CONTENIDO 3: VER POR JUGADOR */}
      {activeTab === 'jugador' && (
        <div className="mt-5 space-y-4">
          
          {/* Selector de Jugador */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-slate-950 text-sm shadow-md"
                style={{ backgroundColor: currentPlayer.color }}
              >
                {currentPlayer.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  SELECCIONAR JUGADOR
                </span>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Seleccionar participante"
                    value={currentPlayer.id}
                    onChange={(e) => onSelectPlayerId(e.target.value)}
                    className="text-base font-black font-gaming bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1 focus:ring-1 focus:ring-fifa-neon focus:outline-none"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.favoriteTeam})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Resumen de sus 15 partidos */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
                <span className="text-slate-400">Jugados: </span>
                <strong className="text-white">{playerStats.played} / 15</strong>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span>{playerStats.won}V</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <span>{playerStats.drawn}E</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <span>{playerStats.lost}D</span>
              </div>
            </div>
          </div>

          {/* Lista de sus 15 partidos individuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {playerMatches.map((m) => {
              const isHome = m.homePlayerId === currentPlayer.id;
              const rivalName = isHome ? m.awayPlayerName : m.homePlayerName;
              const rivalTeam = isHome ? m.awayTeam : m.homeTeam;
              const rivalId = isHome ? m.awayPlayerId : m.homePlayerId;
              const rivalInHouse = presentSet.has(rivalId);

              let outcome = 'PENDIENTE';
              let outcomeColor = 'bg-slate-800 text-slate-400 border-slate-700';

              if (m.jugado) {
                const myGoals = isHome ? m.golesLocal : m.golesVisitante;
                const rivalGoals = isHome ? m.golesVisitante : m.golesLocal;

                if (myGoals > rivalGoals) {
                  outcome = 'VICTORIA';
                  outcomeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                } else if (myGoals < rivalGoals) {
                  outcome = 'DERROTA';
                  outcomeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
                } else {
                  outcome = 'EMPATE';
                  outcomeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                }
              }

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between gap-3"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-semibold">
                      {m.id} · Fecha {m.round} · {isHome ? 'Local' : 'Visitante'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${outcomeColor}`}>
                      {outcome}
                    </span>
                  </div>

                  {/* Rival y Marcador */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">vs Rival:</div>
                      <div className="text-sm font-bold text-white font-gaming">{rivalName}</div>
                      <div className="text-[10px] text-slate-400">{rivalTeam}</div>
                    </div>

                    <div className="text-right">
                      {m.jugado ? (
                        <div className="text-base font-black font-gaming text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                          {isHome ? `${m.golesLocal} - ${m.golesVisitante}` : `${m.golesVisitante} - ${m.golesLocal}`}
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          {rivalInHouse && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-fifa-neon/20 text-fifa-neon border border-fifa-neon/40">
                              ¡Rival en casa!
                            </span>
                          )}
                          {!readOnly && (
                            <button
                              onClick={() => {
                                onSelectActiveMatch(m.id);
                                window.scrollTo({ top: 120, behavior: 'smooth' });
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                            >
                              Jugar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENIDO 4: MATRIZ DE CRUCES 16x16 */}
      {activeTab === 'matriz' && (
        <div className="mt-5 space-y-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <strong>Matriz Cruzada de Validación:</strong> Cada celda representa el enfrentamiento entre la fila (Local) y la columna (Visitante).
            Comprueba visualmente que los 120 partidos existen de manera estricta y sin huecos ni duplicados.
          </div>

          <div className="overflow-x-auto">
            <table className="border-collapse text-[10px] text-center min-w-[800px] w-full">
              <thead>
                <tr>
                  <th className="p-1.5 bg-slate-950 border border-slate-800 text-slate-500 font-mono">L \ V</th>
                  {players.map((p) => (
                    <th key={p.id} className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold truncate max-w-[50px]">
                      {p.name.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((rowPlayer) => (
                  <tr key={rowPlayer.id}>
                    <td className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-left truncate max-w-[60px]">
                      {rowPlayer.name.substring(0, 4)}
                    </td>
                    {players.map((colPlayer) => {
                      if (rowPlayer.id === colPlayer.id) {
                        return (
                          <td key={colPlayer.id} className="p-1.5 bg-slate-950/80 border border-slate-800 text-slate-700">
                            ✕
                          </td>
                        );
                      }

                      // Buscar si existe el partido donde rowPlayer es Local y colPlayer es Visitante
                      // o viceversa en round robin único (120 partidos)
                      const directMatch = matches.find(
                        (m) => m.homePlayerId === rowPlayer.id && m.awayPlayerId === colPlayer.id
                      );

                      const reverseMatch = matches.find(
                        (m) => m.homePlayerId === colPlayer.id && m.awayPlayerId === rowPlayer.id
                      );

                      const match = directMatch || reverseMatch;

                      if (!match) {
                        return (
                          <td key={colPlayer.id} className="p-1 border border-slate-800 bg-red-950/20 text-red-500">
                            ?
                          </td>
                        );
                      }

                      if (directMatch) {
                        return (
                          <td
                            key={colPlayer.id}
                            className={`p-1 border border-slate-800 cursor-pointer transition ${
                              match.jugado
                                ? 'bg-emerald-500/15 text-emerald-300 font-bold hover:bg-emerald-500/25'
                                : 'bg-slate-900/40 text-slate-500 hover:bg-slate-800'
                            }`}
                            onClick={() => {
                              onSelectActiveMatch(match.id);
                              window.scrollTo({ top: 120, behavior: 'smooth' });
                            }}
                            title={`${match.homePlayerName} vs ${match.awayPlayerName} (F${match.round})`}
                          >
                            {match.jugado ? `${match.golesLocal}-${match.golesVisitante}` : 'PEN'}
                          </td>
                        );
                      } else {
                        // En el cruce inverso reflejado
                        return (
                          <td
                            key={colPlayer.id}
                            className={`p-1 border border-slate-800 opacity-60 text-slate-400 ${
                              match.jugado ? 'bg-slate-900/70' : 'bg-slate-950/40'
                            }`}
                            title={`Cruce disputado con localía invertida (${match.homePlayerName} vs ${match.awayPlayerName})`}
                          >
                            {match.jugado ? `${match.golesVisitante}-${match.golesLocal}` : '•'}
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
