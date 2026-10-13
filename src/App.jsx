import React, { useState } from 'react';
import { useTournament } from './hooks/useTournament';
import { Header } from './components/Header';
import { TournamentSetup } from './components/TournamentSetup';
import { AttendancePanel } from './components/AttendancePanel';
import { ScoreSubmissionCard } from './components/ScoreSubmissionCard';
import { LeaderboardTable } from './components/LeaderboardTable';
import { FixtureViewer } from './components/FixtureViewer';
import { NotificationToast } from './components/NotificationToast';
import { Users, Trophy } from 'lucide-react';

export function App() {
  const {
    players,
    matches,
    isTournamentStarted,
    presentPlayerIds,
    activeMatch,
    activeMatchId,
    setActiveMatchId,
    leaderboard,
    suggestedMatchesToday,
    summary,
    notification,
    addPlayer,
    removePlayer,
    confirmAndGenerateFixture,
    resetEntireTournament,
    togglePlayerAttendance,
    selectAllAttendance,
    clearAllAttendance,
    setRandomAttendance,
    submitMatchResult,
    resetMatchResult,
  } = useTournament();

  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id || null);
  const [showRosterModal, setShowRosterModal] = useState(false);

  // Filtrar pendientes totales
  const allPendingMatches = matches.filter((m) => !m.jugado);

  const handleSelectPlayerFromLeaderboard = (playerId) => {
    setSelectedPlayerId(playerId);
  };

  return (
    <div className="min-h-screen bg-fifa-dark text-slate-100 flex flex-col font-sans pb-16">
      {/* 1. Cabecera Global con progreso y botón permanente 'Reiniciar Todo' */}
      <Header
        summary={summary}
        isTournamentStarted={isTournamentStarted}
        playersCount={players.length}
        onResetTournament={resetEntireTournament}
      />

      {/* Contenedor Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        
        {/* FASE 1: CONFIGURACIÓN Y REGISTRO (SI NO HA INICIADO EL TORNEO) */}
        {!isTournamentStarted ? (
          <section aria-label="Fase de Configuración">
            <TournamentSetup
              players={players}
              onAddPlayer={addPlayer}
              onRemovePlayer={removePlayer}
              onConfirmTournament={confirmAndGenerateFixture}
              onResetTournament={resetEntireTournament}
            />
          </section>
        ) : (
          /* FASE 2: TORNEO EN CURSO */
          <>
            {/* Barra de estado del torneo en curso */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-fifa-neon animate-pulse" />
                <span className="font-bold text-white uppercase tracking-wider font-gaming">
                  TORNEO OFICIAL EN CURSO · 16 PARTICIPANTES · 120 PARTIDOS ÚNICOS
                </span>
              </div>
              <button
                onClick={() => setShowRosterModal(!showRosterModal)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
              >
                <Users className="w-3.5 h-3.5 text-fifa-neon" />
                <span>{showRosterModal ? 'Ocultar Lista de Participantes' : 'Ver Participantes (16)'}</span>
              </button>
            </div>

            {/* Modal / Vista rápida de lista de participantes */}
            {showRosterModal && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {players.map((p, idx) => (
                  <div key={p.id} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-white truncate">
                      <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                      <span className="truncate">{p.name}</span>
                    </div>
                    <div className="text-[10px] text-fifa-emerald truncate mt-0.5">
                      {p.favoriteTeam}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Panel de Asistencia Diaria (Filtro por personas presentes en la casa) */}
            <section aria-label="Panel de Asistencia">
              <AttendancePanel
                players={players}
                presentPlayerIds={presentPlayerIds}
                onTogglePlayer={togglePlayerAttendance}
                onSelectAll={selectAllAttendance}
                onClearAll={clearAllAttendance}
                onRandomSelect={setRandomAttendance}
                availableMatchesCount={suggestedMatchesToday.length}
                totalPendingMatches={summary.pending}
              />
            </section>

            {/* 3. Módulo de Carga de Resultado (Partido Activo en PS4) */}
            <section aria-label="Carga de Resultado Activo">
              <ScoreSubmissionCard
                activeMatch={activeMatch}
                availableMatches={suggestedMatchesToday}
                allPendingMatches={allPendingMatches}
                onSelectMatch={setActiveMatchId}
                onSubmitResult={submitMatchResult}
              />
            </section>

            {/* 4. Grid de Tabla de Posiciones y Fixture */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Tabla de Posiciones en Tiempo Real (Leaderboard) con Línea de Corte Top 8 */}
              <section className="xl:col-span-12" aria-label="Tabla de Posiciones">
                <LeaderboardTable
                  leaderboard={leaderboard}
                  presentPlayerIds={presentPlayerIds}
                  onSelectPlayerFilter={handleSelectPlayerFromLeaderboard}
                />
              </section>

              {/* Módulo de Control y Validación de Fixture (120 Partidos) */}
              <section className="xl:col-span-12" aria-label="Control de Fixture">
                <FixtureViewer
                  matches={matches}
                  players={players}
                  presentPlayerIds={presentPlayerIds}
                  suggestedMatchesToday={suggestedMatchesToday}
                  activeMatchId={activeMatchId}
                  onSelectActiveMatch={setActiveMatchId}
                  onResetMatch={resetMatchResult}
                  selectedPlayerId={selectedPlayerId || players[0]?.id}
                  onSelectPlayerId={setSelectedPlayerId}
                />
              </section>

            </div>
          </>
        )}

      </main>

      {/* 5. Notificación Toast flotante */}
      <NotificationToast notification={notification} />

      {/* 6. Footer con especificaciones */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fifa-neon" />
            <span className="font-semibold text-slate-400">Torneo Eliminatorias PS4 · FIFA Round Robin</span>
          </div>
          <div>
            16 Participantes · 15 Fechas · 120 Enfrentamientos Totales · Top 8 Avanza al Mundial
          </div>
          <div className="text-[11px] text-slate-600">
            Los datos persisten automáticamente en tu navegador
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
