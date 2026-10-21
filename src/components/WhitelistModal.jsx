import React, { useState } from 'react';
import {
  Shield,
  UserPlus,
  Trash2,
  Mail,
  CheckCircle2,
  X,
  Lock,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export function WhitelistModal({
  isOpen,
  onClose,
  whitelist = [],
  pendingRequests = [],
  onAddEmail,
  onRemoveEmail,
  onApproveRequest,
  onRejectRequest,
  adminEmail = 'noelati@gmail.com',
}) {
  const [newEmail, setNewEmail] = useState('');
  const [inputError, setInputError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    setInputError('');
    const trimmed = newEmail.trim().toLowerCase();

    if (!trimmed) {
      setInputError('Escribe un correo electrónico válido.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setInputError('El formato de correo no es válido.');
      return;
    }

    if (whitelist.map((em) => em.toLowerCase()).includes(trimmed)) {
      setInputError('Este correo ya está en la lista blanca.');
      return;
    }

    onAddEmail(trimmed);
    setNewEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fifa-neon/10 border border-fifa-neon/30 flex items-center justify-center text-fifa-neon">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-gaming">
                Gestión de Acceso & Lista Blanca
              </h3>
              <p className="text-xs text-slate-400">
                Control de competidores y espectadores autorizados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* ── SECCIÓN 1: SOLICITUDES PENDIENTES DE APROBACIÓN ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${pendingRequests.length > 0 ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-gaming">
                  Solicitudes Pendientes ({pendingRequests.length})
                </h4>
              </div>
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Esperando tu aprobación
                </span>
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-500">
                No hay compañeros esperando aprobación en este momento.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div
                    key={req.email}
                    className="p-3 rounded-xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
                  >
                    <div className="flex items-center gap-3 truncate">
                      {req.photoURL ? (
                        <img
                          src={req.photoURL}
                          alt={req.displayName}
                          className="w-9 h-9 rounded-full object-cover border border-amber-400 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
                          {req.displayName?.[0] || 'U'}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{req.displayName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {req.email}
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción rápida: Aprobar o Rechazar */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onApproveRequest(req.email)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-fifa-neon text-slate-950 font-bold text-xs hover:bg-fifa-neon/90 shadow-neon-glow transition"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Aprobar</span>
                      </button>
                      <button
                        onClick={() => onRejectRequest(req.email)}
                        title="Descartar solicitud"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800" />

          {/* ── SECCIÓN 2: FORMULARIO MANUAL ── */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              O autorizar correo manualmente
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setInputError('');
                  }}
                  placeholder="ejemplo@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-fifa-neon transition"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-fifa-neon border border-fifa-neon/40 font-bold text-xs transition shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Autorizar</span>
              </button>
            </div>
            {inputError && (
              <p className="text-[11px] text-rose-400">{inputError}</p>
            )}
          </form>

          {/* ── SECCIÓN 3: CORREOS AUTORIZADOS ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Correos con acceso activo:</span>
              <span className="font-bold text-fifa-neon">
                {whitelist.length} autorizados
              </span>
            </div>

            <div className="space-y-1.5">
              {whitelist.map((email) => {
                const isMainAdmin =
                  email.toLowerCase() === adminEmail.toLowerCase();
                return (
                  <div
                    key={email}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-fifa-neon shrink-0" />
                      <span className="text-white font-medium truncate">
                        {email}
                      </span>
                      {isMainAdmin && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-fifa-neon/15 text-fifa-neon border border-fifa-neon/30">
                          ADMIN MAESTRO
                        </span>
                      )}
                    </div>

                    {!isMainAdmin ? (
                      <button
                        onClick={() => onRemoveEmail(email)}
                        title="Revocar acceso"
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition shrink-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 leading-relaxed">
            💡 <strong>Nota:</strong> Cuando le das a <strong>"Aprobar"</strong>, tu compañero entra automáticamente a la página en vivo sin necesidad de recargar.
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
