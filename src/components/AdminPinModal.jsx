/**
 * MODAL DE AUTENTICACIÓN DE ADMINISTRADOR
 * ============================================================
 * Modal con PIN de 4 dígitos que desbloquea el modo Admin.
 * Se abre desde el botón del candado en la cabecera.
 * ============================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, X, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function AdminPinModal({ isOpen, onClose, onLoginWithPin, pinError, isAdmin, onLogout }) {
  const [inputPin, setInputPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef(null);

  // Enfocar el input al abrir el modal
  useEffect(() => {
    if (isOpen && !isAdmin) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (isOpen) {
      setInputPin('');
      setShowPin(false);
    }
  }, [isOpen, isAdmin]);

  // Shake animation cuando el PIN es incorrecto
  useEffect(() => {
    if (pinError) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [pinError]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputPin.length < 1) return;
    onLoginWithPin(inputPin);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Autenticación de Administrador"
    >
      {/* Panel del Modal */}
      <div
        className={`relative w-full max-w-sm mx-4 rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl p-6 transition-transform ${
          isAnimating ? 'animate-shake' : ''
        }`}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ——— VISTA: SESIÓN ACTIVA ——— */}
        {isAdmin ? (
          <div className="text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-fifa-neon/15 border border-fifa-neon/40 flex items-center justify-center mx-auto shadow-neon-glow">
              <ShieldCheck className="w-7 h-7 text-fifa-neon" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-gaming tracking-wide">
                MODO ADMINISTRADOR ACTIVO
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tienes acceso completo a los controles del torneo en este dispositivo.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-fifa-neon/5 border border-fifa-neon/20 text-left text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2 text-fifa-neon font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Permisos activos en esta sesión:</span>
              </div>
              <ul className="ml-5 space-y-0.5 text-slate-400 list-disc">
                <li>Registrar y gestionar jugadores</li>
                <li>Marcar asistencia diaria</li>
                <li>Cargar y editar resultados de partidos</li>
                <li>Reiniciar el torneo completo</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="flex-1 py-2.5 rounded-xl bg-rose-900/50 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 text-sm font-bold border border-rose-800/60 transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        ) : (
          /* ——— VISTA: INGRESAR PIN ——— */
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-fifa-gold" />
              </div>
              <h2 className="text-xl font-black text-white font-gaming tracking-wide">
                ACCESO ADMINISTRADOR
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingresa el PIN para desbloquear los controles del torneo en este dispositivo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input de PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  PIN de Administrador
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type={showPin ? 'text' : 'password'}
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    placeholder="Ingresa tu PIN..."
                    maxLength={10}
                    className={`w-full px-4 py-3 pr-11 bg-slate-950 border rounded-xl text-base text-white text-center tracking-[0.4em] placeholder-slate-600 focus:outline-none focus:ring-2 transition font-gaming ${
                      pinError
                        ? 'border-rose-500 focus:ring-rose-500/50'
                        : 'border-slate-700 focus:ring-fifa-neon/50 focus:border-fifa-neon'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mensaje de error de PIN */}
              {pinError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Botón Desbloquear */}
              <button
                type="submit"
                disabled={!inputPin.trim()}
                className="w-full py-3 rounded-xl font-black text-sm font-gaming uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-fifa-emerald to-fifa-neon text-slate-950 hover:brightness-110 active:scale-[0.98] shadow-neon-glow"
              >
                <Unlock className="w-4 h-4" />
                <span>Desbloquear Torneo</span>
              </button>
            </form>

            <p className="text-center text-[11px] text-slate-600">
              El modo consulta (solo lectura) está activo por defecto para todos los participantes.
            </p>
          </div>
        )}
      </div>

      {/* Keyframe para shake animation (definida via CSS global) */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
