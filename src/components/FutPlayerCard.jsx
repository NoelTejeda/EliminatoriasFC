import React, { useState, useEffect } from 'react';
import { Shield, Crown, Plus, Link2, Palette } from 'lucide-react';
import { resolvePlayerPhotoURL } from '../utils/tournamentCalculations';

/**
 * Determina la posición táctica según atributos del jugador
 */
function getTacticalPosition(player, attributes) {
  if (player?.preferredPosition) return player.preferredPosition;
  if (player?.position && typeof player.position === 'string' && player.position.length <= 4) {
    return player.position.toUpperCase();
  }
  if (!attributes) return 'DC';

  const { ATA = 70, DEF = 70, EFE = 70, FOR = 70, VIS = 70, LOC = 70 } = attributes;

  if (ATA >= 80 && EFE >= 75) return 'DC';
  if (DEF >= 75 && DEF >= ATA) return 'DFC';
  if (ATA >= 75 && (LOC >= 75 || VIS >= 75)) return 'EI';
  if (FOR >= 75 && DEF >= 65) return 'MCD';
  if (EFE >= 75 && ATA >= 70) return 'MCO';
  if (DEF >= 68) return 'MC';
  return 'DC';
}

/**
 * COMPONENTE: FutPlayerCard (Estilo Oficial EA Sports FC Ultimate Team)
 * Construcción robusta y profesional en CSS puro, garantizando renderizado perfecto,
 * marco dorado metálico, fondos de mármol/negro/neón y legibilidad impecable.
 */
export function FutPlayerCard({
  player,
  attributes = { OVR: 75, ATA: 75, DEF: 75, EFE: 75, FOR: 75, LOC: 75, VIS: 75 },
  playerAnalytics = {},
  careerTotals = {},
  careerHistory = {},
  currentUser = null,
  onOpenGoogleModal,
  defaultTheme = 'marble-gold',
}) {
  const [theme, setTheme] = useState(defaultTheme);
  const [imgError, setImgError] = useState(false);

  const photoURL = resolvePlayerPhotoURL(player, careerHistory, currentUser);

  useEffect(() => {
    setImgError(false);
  }, [photoURL, player?.id]);

  const hasPhoto = Boolean(photoURL && !imgError);
  const positionCode = getTacticalPosition(player, attributes);
  const isChampion = Boolean(careerTotals?.isReigningChampion || careerTotals?.titlesWon > 0);

  const isMarble = theme === 'marble-gold';
  const isTotw = theme === 'totw-black';
  const isNeon = theme === 'cyber-neon';

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[290px]">
      {/* Selector de estilo de carta */}
      <div className="mb-3 flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-bold text-slate-400 shrink-0">
        <Palette className="w-3.5 h-3.5 ml-1 text-amber-400" />
        <button
          type="button"
          onClick={() => setTheme('marble-gold')}
          className={`px-2.5 py-0.5 rounded-lg transition ${
            isMarble
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow'
              : 'hover:text-white'
          }`}
        >
          Icon Mármol
        </button>
        <button
          type="button"
          onClick={() => setTheme('totw-black')}
          className={`px-2.5 py-0.5 rounded-lg transition ${
            isTotw
              ? 'bg-amber-400/25 text-amber-300 border border-amber-400/40 font-black'
              : 'hover:text-white'
          }`}
        >
          Negro y Oro
        </button>
        <button
          type="button"
          onClick={() => setTheme('cyber-neon')}
          className={`px-2.5 py-0.5 rounded-lg transition ${
            isNeon
              ? 'bg-emerald-500/20 text-fifa-neon border border-fifa-neon/40 font-black'
              : 'hover:text-white'
          }`}
        >
          Neón Pro
        </button>
      </div>

      {/* MARCO EXTERIOR METÁLICO DORADO ESTILO ESCUDO FC */}
      <div
        className={`w-[275px] rounded-t-[28px] rounded-b-[44px] p-[3.5px] shadow-2xl relative transition-all duration-300 ${
          isNeon
            ? 'bg-gradient-to-b from-emerald-300 via-emerald-500 to-teal-800 shadow-emerald-900/40'
            : isTotw
            ? 'bg-gradient-to-b from-amber-200 via-amber-500 to-amber-900 shadow-amber-950/50'
            : 'bg-gradient-to-b from-[#fef08a] via-[#eab308] to-[#92400e] shadow-amber-950/40'
        }`}
      >
        {/* CORONA DE CAMPEÓN */}
        {isChampion && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950 border border-amber-400 text-[10px] font-black text-amber-400 flex items-center gap-1 shadow-md z-30">
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>CAMPEÓN</span>
          </div>
        )}

        {/* CONTENEDOR INTERIOR DE LA CARTA */}
        <div
          className={`w-full rounded-t-[25px] rounded-b-[41px] p-4 flex flex-col justify-between min-h-[395px] relative overflow-hidden ${
            isMarble
              ? 'bg-gradient-to-b from-[#ffffff] via-[#f1f5f9] to-[#e2e8f0] text-slate-900'
              : isTotw
              ? 'bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#030712] text-white'
              : 'bg-gradient-to-b from-[#064e3b] via-[#062e24] to-[#021812] text-white'
          }`}
        >
          {/* DECORACIÓN GEOMÉTRICA DE FONDO (RAYOS DORADOS CHEVRON) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
            <div
              className={`absolute top-1/4 -left-10 w-72 h-72 rotate-45 border-4 ${
                isMarble
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : isNeon
                  ? 'border-emerald-400/20 bg-emerald-400/5'
                  : 'border-amber-400/20 bg-amber-400/5'
              }`}
            />
          </div>

          {/* 1. SECCIÓN SUPERIOR: OVR + POSICIÓN (IZQUIERDA) Y FOTO / SILUETA (DERECHA) */}
          <div className="flex items-start justify-between relative z-10">
            {/* LADO IZQUIERDO: OVR + POS + LIGA */}
            <div className="flex flex-col items-center pt-1">
              <div
                className={`text-5xl font-black font-gaming leading-[0.85] tracking-tighter ${
                  isMarble
                    ? 'text-slate-950'
                    : isNeon
                    ? 'text-fifa-neon'
                    : 'text-amber-300'
                }`}
                style={{
                  textShadow: isMarble
                    ? '0 1px 2px rgba(255,255,255,0.9)'
                    : '0 0 12px rgba(0,245,155,0.3)',
                }}
              >
                {attributes.OVR}
              </div>

              <div
                className={`text-lg font-black font-gaming uppercase tracking-wider mt-1 ${
                  isMarble ? 'text-slate-900' : isNeon ? 'text-white' : 'text-amber-200'
                }`}
              >
                {positionCode}
              </div>

              <div
                className={`w-6 h-[1.5px] my-1 ${
                  isMarble ? 'bg-amber-600/50' : 'bg-slate-700'
                }`}
              />

              {playerAnalytics?.position && (
                <div
                  className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-tight ${
                    isMarble
                      ? 'bg-amber-400/30 border border-amber-600/40 text-amber-950'
                      : 'bg-slate-950/90 border border-slate-700 text-amber-400'
                  }`}
                >
                  #{playerAnalytics.position} LIGA
                </div>
              )}

              <span className={`text-[11px] mt-1 opacity-70 ${isMarble ? 'text-amber-800' : 'text-amber-400'}`}>
                ⚽
              </span>
            </div>

            {/* LADO DERECHO: FOTO REAL O SILUETA */}
            <div className="relative flex justify-center items-end w-32 h-32 shrink-0">
              {hasPhoto ? (
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-lg bg-slate-950">
                  <img
                    src={photoURL}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-top select-none"
                  />
                  <div
                    title="Foto verificada"
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-slate-950 border border-amber-400 flex items-center justify-center text-[9px] text-amber-400 shadow"
                  >
                    ✓
                  </div>
                </div>
              ) : (
                <div
                  onClick={onOpenGoogleModal}
                  role="button"
                  tabIndex={0}
                  title={`Vincular foto de ${player.name}`}
                  className="relative w-28 h-28 rounded-2xl flex flex-col items-center justify-center cursor-pointer group/avatar border-2 border-dashed border-amber-500/40 hover:border-amber-400 transition bg-slate-950/20"
                >
                  <svg
                    viewBox="0 0 120 135"
                    className={`w-20 h-20 transition transform group-hover/avatar:scale-105 ${
                      isMarble ? 'text-slate-700' : 'text-slate-600'
                    }`}
                    fill="currentColor"
                  >
                    <circle cx="60" cy="38" r="26" />
                    <path d="M 22 135 C 22 95, 42 78, 60 78 C 78 78, 98 95, 98 135 Z" />
                  </svg>

                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white text-slate-900 border border-slate-900 flex items-center justify-center shadow transition transform group-hover/avatar:scale-110 group-hover/avatar:bg-amber-400">
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  <span className="absolute bottom-1.5 text-[10px] font-black tracking-widest text-white/90 uppercase bg-slate-950/70 px-1.5 py-0.5 rounded">
                    {player.name.substring(0, 2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. NOMBRE DEL JUGADOR */}
          <div className="text-center relative z-10 my-1">
            <div
              className={`text-xl font-black font-gaming uppercase tracking-[0.16em] truncate px-2 ${
                isMarble ? 'text-slate-950' : 'text-white'
              }`}
            >
              {player.name}
            </div>

            {/* Separador metálico */}
            <div className="flex items-center justify-center gap-1.5 my-1 px-4">
              <div
                className={`flex-1 h-[1.5px] ${
                  isMarble
                    ? 'bg-gradient-to-r from-transparent via-amber-600/60 to-amber-600/80'
                    : 'bg-gradient-to-r from-transparent via-amber-400/50 to-amber-400/80'
                }`}
              />
              <div
                className={`w-1.5 h-1.5 rotate-45 ${
                  isMarble ? 'bg-amber-600' : 'bg-amber-400'
                }`}
              />
              <div
                className={`flex-1 h-[1.5px] ${
                  isMarble
                    ? 'bg-gradient-to-l from-transparent via-amber-600/60 to-amber-600/80'
                    : 'bg-gradient-to-l from-transparent via-amber-400/50 to-amber-400/80'
                }`}
              />
            </div>
          </div>

          {/* 3. GRILLA DE 6 ATRIBUTOS (ATA, DEF, EFE, FOR, LOC, VIS) */}
          <div className="relative z-10">
            <div
              className={`grid grid-cols-6 text-center py-1.5 px-1 rounded-xl ${
                isMarble
                  ? 'bg-white/80 backdrop-blur-sm border border-slate-300 shadow-sm'
                  : 'bg-slate-950/80 border border-slate-800'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className={`text-[8.5px] font-black uppercase ${isMarble ? 'text-slate-600' : 'text-slate-400'}`}>
                  ATA
                </span>
                <span className={`text-sm font-black font-gaming leading-tight ${isMarble ? 'text-slate-950' : 'text-white'}`}>
                  {attributes.ATA}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className={`text-[8.5px] font-black uppercase ${isMarble ? 'text-slate-600' : 'text-slate-400'}`}>
                  DEF
                </span>
                <span className={`text-sm font-black font-gaming leading-tight ${isMarble ? 'text-slate-950' : 'text-white'}`}>
                  {attributes.DEF}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className={`text-[8.5px] font-black uppercase ${isMarble ? 'text-slate-600' : 'text-slate-400'}`}>
                  EFE
                </span>
                <span className={`text-sm font-black font-gaming leading-tight ${isMarble ? 'text-amber-700 font-extrabold' : 'text-fifa-neon'}`}>
                  {attributes.EFE}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className={`text-[8.5px] font-black uppercase ${isMarble ? 'text-slate-600' : 'text-slate-400'}`}>
                  FOR
                </span>
                <span className={`text-sm font-black font-gaming leading-tight ${isMarble ? 'text-slate-950' : 'text-white'}`}>
                  {attributes.FOR}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className={`text-[8.5px] font-black uppercase ${isMarble ? 'text-slate-600' : 'text-slate-400'}`}>
                  LOC
                </span>
                <span className={`text-sm font-black font-gaming leading-tight ${isMarble ? 'text-slate-950' : 'text-white'}`}>
                  {attributes.LOC}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className={`text-[8.5px] font-black uppercase ${isMarble ? 'text-slate-600' : 'text-slate-400'}`}>
                  VIS
                </span>
                <span className={`text-sm font-black font-gaming leading-tight ${isMarble ? 'text-slate-950' : 'text-white'}`}>
                  {attributes.VIS}
                </span>
              </div>
            </div>
          </div>

          {/* 4. PIE DE CARTA: BANDERA + EQUIPO FAVORITO */}
          <div className="flex items-center justify-center gap-2 pt-2 relative z-10">
            {/* Bandera Nacional */}
            <div
              title="Sede / Bandera"
              className="w-4 h-3 rounded-[2px] overflow-hidden shadow-sm flex flex-col border border-black/30 shrink-0"
            >
              <div className="h-1/3 bg-[#ffcc00]" />
              <div className="h-1/3 bg-[#00247d]" />
              <div className="h-1/3 bg-[#cf142b]" />
            </div>

            {/* Equipo Favorito */}
            <div
              title={`Equipo Favorito: ${player.favoriteTeam}`}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider max-w-[175px] shadow-sm ${
                isMarble
                  ? 'bg-amber-400/25 text-slate-950 border border-amber-600/40'
                  : 'bg-slate-950/90 text-amber-300 border border-amber-500/40'
              }`}
            >
              <Shield className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">{player.favoriteTeam}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón inferior para vincular foto de Google (separado limpiamente fuera de la tarjeta) */}
      {!hasPhoto && (
        <button
          type="button"
          onClick={onOpenGoogleModal}
          className="mt-3 text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Vincular foto con Google</span>
        </button>
      )}
    </div>
  );
}
