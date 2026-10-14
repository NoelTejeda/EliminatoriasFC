import React, { useState } from 'react';
import { useAdminRole } from './hooks/useAdminRole';
import { useTournament } from './hooks/useTournament';
import { Header } from './components/Header';
import { AdminPinModal } from './components/AdminPinModal';
import { TournamentSetup } from './components/TournamentSetup';
import { AttendancePanel } from './components/AttendancePanel';
import { ScoreSubmissionCard } from './components/ScoreSubmissionCard';
import { LeaderboardTable } from './components/LeaderboardTable';
import { FixtureViewer } from './components/FixtureViewer';
import { NotificationToast } from './components/NotificationToast';
import { Eye, Users, ShieldAlert } from 'lucide-react';

export function App() {
  // ── Autenticación de Admin (PIN) ──────────────────────────
  const { isAdmin, pinError, loginWithPin, logoutAdmin } = useAdminRole();

  // ── Estado del Torneo con Firebase ───────────────────────
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
    isFirebaseConnected,
    isSyncing,
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
  } = useTournament(isAdmin);

  // ── UI Local ──────────────────────────────────────────────
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [showRosterModal, setShowRosterModal] = useState(false);

  const allPendingMatches = matches.filter((m) => !m.jugado);

  return (
    <div className="min-h-screen bg-fifa-dark text-slate-100 flex flex-col font-sans pb-16">

      {/* ── CABECERA GLOBAL STICKY ── */}
      <Header
        summary={summary}
        isTournamentStarted={isTournamentStarted}
        playersCount={players.length}
        isAdmin={isAdmin}
        isFirebaseConnected={isFirebaseConnected}
        isSyncing={isSyncing}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onResetTournament={resetEntireTournament}
      />

      {/* ── MODAL DE PIN ADMIN ── */}
      <AdminPinModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginWithPin={loginWithPin}
        pinError={pinError}
        isAdmin={isAdmin}
        onLogout={logoutAdmin}
      />

      {/* ── BANNER MODO CONSULTA (cuando NO es admin y el torneo ya inició) ── */}
      {!isAdmin && isTournamentStarted && (
        <div className="bg-slate-900/80 border-b border-slate-800 py-2 px-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span>
            Estás en <strong className="text-sky-300">Modo Consulta (Solo Lectura)</strong>.
            Los resultados y la tabla se actualizan en tiempo real.
          </span>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="ml-2 text-[11px] underline text-slate-500 hover:text-fifa-neon transition"
          >
            ¿Eres el admin?
          </button>
        </div>
      )}

      {/* ── CONTENEDOR PRINCIPAL ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">

        {/* FASE 1: CONFIGURACIÓN Y REGISTRO (solo cuando el torneo no ha iniciado) */}
        {!isTournamentStarted ? (
          <section aria-label="Fase de Configuración">
            {/* Solo el admin puede registrar jugadores */}
            {isAdmin ? (
              <TournamentSetup
                players={players}
                onAddPlayer={addPlayer}
                onRemovePlayer={removePlayer}
                onConfirmTournament={confirmAndGenerateFixture}
                onResetTournament={resetEntireTournament}
              />
            ) : (
              /* Pantalla de espera para espectadores cuando el torneo no ha empezado */
              <div className="glass-panel rounded-2xl p-10 border border-slate-800 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8 text-slate-500" />
                </div>
                <h2 className="text-2xl font-black text-white font-gaming mb-2">
                  TORNEO AÚN NO INICIADO
                </h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
                  El administrador del torneo está configurando los participantes. 
                  Pronto podrás seguir la tabla de posiciones en tiempo real.
                </p>
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold transition"
                >
                  Acceder como Administrador
                </button>
              </div>
            )}
          </section>
        ) : (
          /* FASE 2: TORNEO EN CURSO */
          <>
            {/* Barra de estado + vista rápida de participantes */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-fifa-neon animate-pulse" />
                <span className="font-bold text-white uppercase tracking-wider font-gaming">
                  TORNEO OFICIAL EN CURSO · {players.length} PARTICIPANTES · 120 PARTIDOS ÚNICOS
                </span>
                {!isAdmin && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 font-semibold">
                    👁 MODO CONSULTA
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowRosterModal(!showRosterModal)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
              >
                <Users className="w-3.5 h-3.5 text-fifa-neon" />
                <span>{showRosterModal ? 'Ocultar participantes' : 'Ver Participantes (16)'}</span>
              </button>
            </div>

            {/* Lista de participantes (expandible) */}
            {showRosterModal && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {players.map((p, idx) => (
                  <div key={p.id} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-white truncate">
                      <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="truncate">{p.name}</span>
                    </div>
                    <div className="text-[10px] text-fifa-emerald truncate mt-0.5">{p.favoriteTeam}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Panel de Asistencia (admin = interactivo | consulta = solo lectura) */}
            <section aria-label="Panel de Asistencia">
              <AttendancePanel
                players={players}
                presentPlayerIds={presentPlayerIds}
                onTogglePlayer={isAdmin ? togglePlayerAttendance : () => {}}
                onSelectAll={isAdmin ? selectAllAttendance : () => {}}
                onClearAll={isAdmin ? clearAllAttendance : () => {}}
                onRandomSelect={isAdmin ? setRandomAttendance : () => {}}
                availableMatchesCount={suggestedMatchesToday.length}
                totalPendingMatches={summary.pending}
                readOnly={!isAdmin}
              />
            </section>

            {/* Módulo de Carga (solo visible para el admin) */}
            {isAdmin && (
              <section aria-label="Carga de Resultado Activo">
                <ScoreSubmissionCard
                  activeMatch={activeMatch}
                  availableMatches={suggestedMatchesToday}
                  allPendingMatches={allPendingMatches}
                  onSelectMatch={setActiveMatchId}
                  onSubmitResult={submitMatchResult}
                />
              </section>
            )}

            {/* Tabla de Posiciones (siempre visible) */}
            <section aria-label="Tabla de Posiciones">
              <LeaderboardTable
                leaderboard={leaderboard}
                presentPlayerIds={presentPlayerIds}
                onSelectPlayerFilter={setSelectedPlayerId}
              />
            </section>

            {/* Fixture Viewer (siempre visible) */}
            <section aria-label="Control de Fixture">
              <FixtureViewer
                matches={matches}
                players={players}
                presentPlayerIds={presentPlayerIds}
                suggestedMatchesToday={suggestedMatchesToday}
                activeMatchId={activeMatchId}
                onSelectActiveMatch={isAdmin ? setActiveMatchId : () => {}}
                onResetMatch={isAdmin ? resetMatchResult : () => {}}
                selectedPlayerId={selectedPlayerId || players[0]?.id}
                onSelectPlayerId={setSelectedPlayerId}
                readOnly={!isAdmin}
              />
            </section>
          </>
        )}
      </main>

      {/* Toast de notificaciones */}
      <NotificationToast notification={notification} />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fifa-neon" />
            <span className="font-semibold text-slate-400">Torneo Eliminatorias PS4 · FIFA Round Robin</span>
          </div>
          <div>16 Participantes · 15 Fechas · 120 Enfrentamientos · Top 8 Avanza al Mundial</div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-600">
              {isFirebaseConnected ? 'Sincronizado con Firebase (EliminatoriasFC)' : 'Modo sin conexión · Datos locales'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
