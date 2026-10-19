import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';

/**
 * MODAL DE CONFIRMACIÓN CON ESTILO GAMING
 * ============================================================
 * Reemplaza a window.confirm() con un modal integrado al diseño
 * oscuro del torneo (idéntico a AdminPinModal y GoogleProfileModal).
 * ============================================================
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  details,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger' | 'warning' | 'info' | 'success'
  icon: CustomIcon,
}) {
  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Estilos visuales según variante
  const variantConfig = {
    danger: {
      badgeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-danger-glow',
      detailsBox: 'bg-rose-500/5 border-rose-500/20 text-rose-300/90',
      detailsIconColor: 'text-rose-400',
      confirmBtn:
        'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border-rose-500/60 shadow-danger-glow',
      defaultIcon: AlertTriangle,
    },
    warning: {
      badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-gold-glow',
      detailsBox: 'bg-amber-500/5 border-amber-500/20 text-amber-300/90',
      detailsIconColor: 'text-amber-400',
      confirmBtn:
        'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black border-amber-400/60 shadow-gold-glow',
      defaultIcon: AlertCircle,
    },
    info: {
      badgeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-400 shadow-blue-glow',
      detailsBox: 'bg-sky-500/5 border-sky-500/20 text-sky-300/90',
      detailsIconColor: 'text-sky-400',
      confirmBtn:
        'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-bold border-sky-400/60 shadow-blue-glow',
      defaultIcon: Info,
    },
    success: {
      badgeBg: 'bg-fifa-neon/15 border-fifa-neon/40 text-fifa-neon shadow-neon-glow',
      detailsBox: 'bg-fifa-neon/5 border-fifa-neon/20 text-emerald-300/90',
      detailsIconColor: 'text-fifa-neon',
      confirmBtn:
        'bg-gradient-to-r from-fifa-emerald to-fifa-neon hover:brightness-110 text-slate-950 font-black border-fifa-neon/60 shadow-neon-glow',
      defaultIcon: CheckCircle2,
    },
  };

  const config = variantConfig[variant] || variantConfig.danger;
  const IconComponent = CustomIcon || config.defaultIcon;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl p-6 transition-all duration-200">
        {/* Botón Cerrar (X) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ícono de cabecera con Badge brillante */}
        <div className="text-center space-y-4">
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto transition-transform ${config.badgeBg}`}
          >
            <IconComponent className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-black text-white font-gaming tracking-wide uppercase leading-tight">
              {title}
            </h2>
            {message && (
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Caja opcional de detalles o advertencia */}
          {details && (
            <div
              className={`p-3.5 rounded-xl border text-left text-xs space-y-1.5 ${config.detailsBox}`}
            >
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 shrink-0 ${config.detailsIconColor}`} />
                <div className="leading-snug">
                  {typeof details === 'string' ? details : details}
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition active:scale-[0.98]"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center justify-center gap-2 active:scale-[0.98] ${config.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
