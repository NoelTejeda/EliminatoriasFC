import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function NotificationToast({ notification }) {
  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-bounce-subtle bg-slate-900/95 border border-slate-700">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-fifa-neon" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400" />}
      <span className="text-xs font-semibold text-white tracking-wide">
        {notification.message}
      </span>
    </div>
  );
}
