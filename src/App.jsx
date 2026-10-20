import React, { useState } from 'react';
import { useAdminRole } from './hooks/useAdminRole';
import { useUserAuth } from './hooks/useUserAuth';
import { useTournament } from './hooks/useTournament';
import { Header } from './components/Header';
import { AdminPinModal } from './components/AdminPinModal';
import { GoogleProfileModal } from './components/GoogleProfileModal';
import { TournamentSetup } from './components/TournamentSetup';
import { AttendancePanel } from './components/AttendancePanel';
import { ScoreSubmissionCard } from './components/ScoreSubmissionCard';
import { LeaderboardTable } from './components/LeaderboardTable';
import { WorldCupModule } from './components/WorldCupModule';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { FixtureViewer } from './components/FixtureViewer';
import { NotificationToast } from './components/NotificationToast';
import { Eye, Users, Link2, BarChart3 } from 'lucide-react';

export function App() {
  // ── Autenticación de Admin (PIN) ──────────────────────────
  const { isAdmin, pinError, loginWithPin, logoutAdmin } = useAdminRole();

  // ── Autenticación de Jugador (Google Auth + Simulador) ───
  const {
    currentUser,
    authLoading,
    authError,
    loginWithGoogle,
    loginWithQuickProfile,
    logoutUser,
  } = useUserAuth();

  // ── Estado del Torneo con Firebase + Récords Híbridos ────
  const {
    players,
    matches,
    isTournamentStarted,
    presentPlayerIds,
    careerHistory,
    worldCup,
    activeMatch,
    activeMatchId,
    setActiveMatchId,
    myLinkedPlayer,
    leaderboard,
    suggestedMatchesToday,
    summary,
    globalAnalytics,
    notification,
    isFirebaseConnected,
    isSyncing,
    addPlayer,
    selfRegisterWithGoogle,
    claimPlayerProfile,
    unlinkPlayerProfile,
    removePlayer,
    loadDefaultPlayers,
    loadDemoTournamentWithResults,
    confirmAndGenerateFixture,
    resetEntireTournament,
    togglePlayerAttendance,
    selectAllAttendance,
    clearAllAttendance,
    setRandomAttendance,
    submitMatchResult,
    resetMatchResult,
    startWorldCupPhase,
    executeWorldCupDraw,
    confirmWorldCupGroups,
    submitWorldCupGroupMatch,
    advanceToWorldCupKnockout,
    submitWorldCupKnockoutMatch,
  } = useTournament(isAdmin, currentUser);

  // ── UI Local ──────────────────────────────────────────────
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [showRosterModal, setShowRosterModal] = useState(false);

  const allPendingMatches = matches.filter((m) => !m.jugado);

  const handleViewMyAnalytics = (playerId) => {
    setSelectedPlayerId(playerId);
    setTimeout(() => {
      const el = document.getElementById('analytics-hub-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-fifa-dark text-slate-100 flex flex-col font-sans pb-16">

      {/* ── CABECERA GLOBAL STICKY ── */}
      <Header
        summary={summary}
        isTournamentStarted={isTournamentStarted}
        playersCount={players.length}
        isAdmin={isAdmin}
        currentUser={currentUser}
        myLinkedPlayer={myLinkedPlayer}
        isFirebaseConnected={isFirebaseConnected}
        isSyncing={isSyncing}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
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

      {/* ── MODAL DE PERFIL GOOGLE & RECLAMO DE JUGADOR ── */}
      <GoogleProfileModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        currentUser={currentUser}
        authLoading={authLoading}
        authError={authError}
        onLoginGoogle={loginWithGoogle}
        onLoginQuickProfile={loginWithQuickProfile}
        onLogoutUser={logoutUser}
        players={players}
        myLinkedPlayer={myLinkedPlayer}
        isTournamentStarted={isTournamentStarted}
        onSelfRegister={selfRegisterWithGoogle}
        onClaimProfile={claimPlayerProfile}
        onUnlinkProfile={unlinkPlayerProfile}
        onViewMyAnalytics={isTournamentStarted ? handleViewMyAnalytics : null}
      />

      {/* ── BANNER MODO CONSULTA / VINCULACIÓN GOOGLE ── */}
      {!isAdmin && isTournamentStarted && (
        <div className="bg-slate-900/80 border-b border-slate-800 py-2 px-4 text-center text-xs text-slate-400 flex flex-wrap items-center justify-center gap-2">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span>
            Estás en <strong className="text-sky-300">Modo Consulta en Vivo</strong>.
          </span>
          {!myLinkedPlayer ? (
            <button
              onClick={() => setIsGoogleModalOpen(true)}
              className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold hover:bg-sky-500/30 transition flex items-center gap-1"
            >
              <Link2 className="w-3 h-3" />
              <span>Reclamar mi Jugador con Google</span>
            </button>
          ) : (
            <button
              onClick={() => handleViewMyAnalytics(myLinkedPlayer.id)}
              className="px-2 py-0.5 rounded bg-fifa-neon/15 border border-fifa-neon/40 text-fifa-neon font-bold hover:bg-fifa-neon/25 transition flex items-center gap-1"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Ver Mi Carta Pro ({myLinkedPlayer.name})</span>
            </button>
          )}
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="ml-1 text-[11px] underline text-slate-500 hover:text-fifa-neon transition"
          >
            ¿Eres el admin?
          </button>
        </div>
      )}

      {/* ── CONTENEDOR PRINCIPAL ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">

        {/* FASE 1: CONFIGURACIÓN HÍBRIDA Y REGISTRO (Google + Manual) */}
        {!isTournamentStarted ? (
          <section aria-label="Fase de Configuración Híbrida">
            <TournamentSetup
              players={players}
              careerHistory={careerHistory}
              isAdmin={isAdmin}
              currentUser={currentUser}
              myLinkedPlayer={myLinkedPlayer}
              onAddPlayer={addPlayer}
              onSelfRegisterGoogle={selfRegisterWithGoogle}
              onClaimPlayerProfile={claimPlayerProfile}
              onRemovePlayer={removePlayer}
              onLoadDefaultPlayers={loadDefaultPlayers}
              onLoadDemoTournament={loadDemoTournamentWithResults}
              onConfirmTournament={confirmAndGenerateFixture}
              onResetTournament={resetEntireTournament}
              onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
            />
          </section>
        ) : (
          /* FASE 2: TORNEO EN CURSO */
          <>
            {/* Barra de estado + vista rápida de participantes */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-fifa-neon animate-pulse" />
                <span className="font-bold text-white uppercase tracking-wider font-gaming">
                  TORNEO OFICIAL EN CURSO · {players.length} PARTICIPANTES · 120 PARTIDOS ÚNICOS
                </span>
                {myLinkedPlayer && (
                  <span className="px-2 py-0.5 rounded bg-fifa-neon/15 border border-fifa-neon/30 text-fifa-neon font-bold">
                    ★ Jugador Activo: {myLinkedPlayer.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!myLinkedPlayer && (
                  <button
                    onClick={() => setIsGoogleModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 font-bold transition"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Vincular mi Google</span>
                  </button>
                )}
                <button
                  onClick={() => setShowRosterModal(!showRosterModal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
                >
                  <Users className="w-3.5 h-3.5 text-fifa-neon" />
                  <span>{showRosterModal ? 'Ocultar participantes' : `Ver Participantes (${players.length})`}</span>
                </button>
              </div>
            </div>

            {/* Lista de participantes (expandible) */}
            {showRosterModal && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {players.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => handleViewMyAnalytics(p.id)}
                    className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-fifa-neon/50 cursor-pointer text-xs transition"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-white truncate">
                      <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-fifa-emerald truncate">{p.favoriteTeam}</span>
                      {p.uid && (
                        <span className="text-[8px] text-sky-400 font-bold">G✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Panel de Asistencia (admin = interactivo | consulta = solo lectura) */}
            <section aria-label="Panel de Asistencia">
              <AttendancePanel
                players={players}
                presentPlayerIds={presentPlayerIds}
                onTogglePlayer={isAdmin ? togglePlayerAttendance : () => { }}
                onSelectAll={isAdmin ? selectAllAttendance : () => { }}
                onClearAll={isAdmin ? clearAllAttendance : () => { }}
                onRandomSelect={isAdmin ? setRandomAttendance : () => { }}
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
                  players={players}
                  careerHistory={careerHistory}
                  currentUser={currentUser}
                  onSelectMatch={setActiveMatchId}
                  onSubmitResult={submitMatchResult}
                />
              </section>
            )}

            {/* Tabla de Posiciones (plegable, contraíble para enfatizar el Mundial) */}
            <section aria-label="Tabla de Posiciones">
              <LeaderboardTable
                leaderboard={leaderboard}
                presentPlayerIds={presentPlayerIds}
                careerHistory={careerHistory}
                myLinkedPlayer={myLinkedPlayer}
                onSelectPlayerFilter={setSelectedPlayerId}
                isWorldCupActive={Boolean(worldCup?.status && worldCup.status !== 'not_started')}
              />
            </section>

            {/* FASE FINAL COPA DEL MUNDO (TOP 8): SORTEO CABEZAS DE SERIE, GRUPOS A/B, SEMIS Y FINAL */}
            <section aria-label="Copa del Mundo Top 8">
              <WorldCupModule
                worldCup={worldCup}
                leaderboard={leaderboard}
                summary={summary}
                isAdmin={isAdmin}
                onStartWorldCupPhase={startWorldCupPhase}
                onExecuteDraw={executeWorldCupDraw}
                onConfirmGroups={confirmWorldCupGroups}
                onSubmitGroupMatch={submitWorldCupGroupMatch}
                onAdvanceToKnockout={advanceToWorldCupKnockout}
                onSubmitKnockoutMatch={submitWorldCupKnockoutMatch}
                onResetForNewEliminatoria={resetEntireTournament}
              />
            </section>

            {/* EA FC Analytics & Player Hub (Gráficos, Carta Pro, Cara a Cara y Récords) */}
            <section id="analytics-hub-section" aria-label="Centro de Estadísticas y Gráficos">
              <AnalyticsDashboard
                players={players}
                matches={matches}
                leaderboard={leaderboard}
                careerHistory={careerHistory}
                globalAnalytics={globalAnalytics}
                selectedPlayerId={selectedPlayerId || myLinkedPlayer?.id || players[0]?.id}
                onSelectPlayerId={setSelectedPlayerId}
                currentUser={currentUser}
                myLinkedPlayer={myLinkedPlayer}
                onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
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
                onSelectActiveMatch={isAdmin ? setActiveMatchId : () => { }}
                onResetMatch={isAdmin ? resetMatchResult : () => { }}
                selectedPlayerId={selectedPlayerId || myLinkedPlayer?.id || players[0]?.id}
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
              {isFirebaseConnected ? 'Sincronizado con Firebase ' : 'Modo sin conexión · Datos locales'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
