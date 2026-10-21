import React, { useState } from 'react';
import { Shield, UserPlus, Trash2, Mail, CheckCircle2, X, Lock } from 'lucide-react';

export function WhitelistModal({
  isOpen,
  onClose,
  whitelist = [],
  onAddEmail,
  onRemoveEmail,
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
                Solo estos correos podrán consultar las tablas y la web
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

        {/* Contenido */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Formulario para agregar */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Autorizar nuevo correo de Google
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-fifa-neon text-slate-950 font-bold text-xs hover:bg-fifa-neon/90 transition shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Autorizar</span>
              </button>
            </div>
            {inputError && (
              <p className="text-[11px] text-rose-400">{inputError}</p>
            )}
          </form>

          {/* Lista de correos autorizados */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Correos con acceso permitido:</span>
              <span className="font-bold text-fifa-neon">
                {whitelist.length} autorizados
              </span>
            </div>

            <div className="space-y-1.5">
              {whitelist.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-500">
                  No hay correos registrados aún.
                </div>
              ) : (
                whitelist.map((email) => {
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
                })
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 leading-relaxed">
            💡 <strong>Nota:</strong> Los jugadores que ya tengan su perfil vinculado en el torneo también tienen acceso automático sin necesidad de agregarlos manualmente aquí.
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
