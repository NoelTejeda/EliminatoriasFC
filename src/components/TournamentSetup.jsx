import React, { useState } from 'react';
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
} from 'lucide-react';

// Paleta de colores distintivos gaming para asignar a los avatares
const AVATAR_COLORS = [
  '#00f59b', '#38bdf8', '#f43f5e', '#fbbf24',
  '#a855f7', '#ef4444', '#06b6d4', '#eab308',
  '#3b82f6', '#ec4899', '#94a3b8', '#facc15',
  '#f97316', '#0ea5e9', '#dc2626', '#8b5cf6',
];

export function TournamentSetup({
  players = [],
  onAddPlayer,
  onRemovePlayer,
  onConfirmTournament,
  onResetTournament,
}) {
  const [playerName, setPlayerName] = useState('');
  const [playerTeam, setPlayerTeam] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

    // Validar nombre duplicado
    const isDuplicate = players.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage(`El participante "${trimmedName}" ya está registrado.`);
      return;
    }

    // Asignar color dinámico
    const colorIndex = players.length % AVATAR_COLORS.length;
    const assignedColor = AVATAR_COLORS[colorIndex];

    const newPlayer = {
      id: `p${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      tag: trimmedName.substring(0, 4).toUpperCase(),
      favoriteTeam: trimmedTeam,
      color: assignedColor,
    };

    onAddPlayer(newPlayer);
    setPlayerName('');
    setPlayerTeam('');
  };

  const handleResetClick = () => {
    const confirmed = window.confirm(
      '¿Estás completamente seguro de que deseas reiniciar el torneo? Se borrarán todos los jugadores, equipos y partidos registrados.'
    );
    if (confirmed) {
      onResetTournament();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Formulario de Agregado de Jugador (Panel Destacado Superior) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-fifa-dark">
        {/* Luz de acento sutil */}
        <div className="absolute top-0 left-1/4 w-96 h-28 bg-fifa-neon/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-fifa-neon/15 text-fifa-neon border border-fifa-neon/30">
                <UserPlus className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-fifa-neon">
                FASE DE CONFIGURACIÓN Y REGISTRO
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-gaming mt-1 tracking-tight">
              REGISTRO DE PARTICIPANTES DEL TORNEO
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingresa a cada jugador con su equipo para conformar la liga oficial de 16 personas.
            </p>
          </div>

          {/* Badge Contador Visual de Progreso */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
              <div className="w-10 h-10 rounded-lg bg-fifa-neon/10 border border-fifa-neon/30 text-fifa-neon flex items-center justify-center font-black">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Jugadores Agregados
                </div>
                <div className="text-lg font-black text-white font-gaming flex items-baseline gap-1">
                  <span className={canConfirm ? 'text-fifa-neon' : 'text-slate-100'}>
                    {players.length}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">/ {MAX_PLAYERS}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs y Botón de Agregado */}
        <form onSubmit={handleAddSubmit} className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* Input: Nombre del Jugador */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Nombre del Jugador <span className="text-fifa-neon">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej: Noel, Jorge, Carlos..."
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isFull}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fifa-neon focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                />
              </div>
            </div>

            {/* Input: Equipo Seleccionado */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Equipo Seleccionado <span className="text-fifa-neon">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej: Real Madrid, Manchester City, Francia..."
                  value={playerTeam}
                  onChange={(e) => {
                    setPlayerTeam(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isFull}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fifa-neon focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                />
              </div>
            </div>

            {/* Botón Principal: + Agregar Jugador */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={!playerName.trim() || !playerTeam.trim() || isFull}
                className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm font-gaming uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-fifa-emerald to-fifa-neon text-slate-950 hover:brightness-110 active:scale-[0.98] shadow-neon-glow"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Agregar Jugador</span>
              </button>
            </div>

          </div>

          {/* Mensaje de Error si falla validación */}
          {errorMessage && (
            <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Estado de cupos */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>
              {isFull ? (
                <strong className="text-fifa-neon">¡Cupo completo! Ya están registrados los 16 participantes.</strong>
              ) : (
                <>Faltan <strong className="text-slate-200">{remainingSlots}</strong> participante{remainingSlots === 1 ? '' : 's'} para poder generar el fixture oficial.</>
              )}
            </span>
            <span className="text-[11px] text-slate-500">Ambos campos son obligatorios</span>
          </div>
        </form>
      </div>

      {/* 2. Lista de Jugadores Registrados */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white font-gaming flex items-center gap-2">
              PARTICIPANTES CONFIRMADOS ({players.length} / {MAX_PLAYERS})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Revisa la lista antes de generar el fixture. Puedes eliminar y corregir si te equivocaste en algún nombre.
            </p>
          </div>
        </div>

        {/* Grilla de Tarjetas */}
        {players.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 my-4">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300 font-gaming">
              No hay jugadores registrados todavía
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Utiliza el formulario superior para registrar manualmente a cada uno de los 16 amigos que jugarán el torneo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 my-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="relative p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all duration-200 group overflow-hidden"
              >
                {/* Borde decorativo superior con el color del jugador */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: player.color || '#10b981' }}
                />

                <div className="flex items-start justify-between gap-2">
                  {/* Número de registro */}
                  <span className="text-[10px] font-black font-gaming px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    #{index + 1}
                  </span>

                  {/* Botón de eliminar jugador */}
                  <button
                    type="button"
                    onClick={() => onRemovePlayer(player.id)}
                    title={`Eliminar a ${player.name}`}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition opacity-80 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Avatar y Datos */}
                <div className="flex items-center gap-3 mt-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-slate-950 text-sm shrink-0 shadow-md"
                    style={{ backgroundColor: player.color || '#10b981' }}
                  >
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-black text-white font-gaming truncate tracking-tight">
                      {player.name}
                    </div>
                    <div className="text-xs font-semibold text-fifa-emerald flex items-center gap-1 mt-0.5 truncate">
                      <Shield className="w-3 h-3 shrink-0" />
                      <span className="truncate">{player.favoriteTeam}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Espacios vacíos sugeridos para visualizar los 16 cupos */}
            {Array.from({ length: remainingSlots }).map((_, slotIdx) => (
              <div
                key={`empty-slot-${slotIdx}`}
                className="p-4 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/30 flex items-center justify-center text-slate-600 text-xs min-h-[92px]"
              >
                <span className="font-gaming font-semibold">
                  Cupo #{players.length + slotIdx + 1} libre
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Panel de Control del Torneo (Acciones Globales) */}
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
          
          {/* Botón: Reiniciar Todo (con alerta de confirmación obligatoria) */}
          <button
            type="button"
            onClick={handleResetClick}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-rose-950/60 hover:border-rose-700 text-slate-300 hover:text-rose-200 text-xs font-bold font-gaming uppercase tracking-wider transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reiniciar Todo</span>
          </button>

          {/* Botón Principal: Confirmar Participantes y Generar Fixture */}
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

    </div>
  );
}
