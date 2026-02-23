import React from 'react';

export default function Toaster({ toasts = [], removeToast = () => {} }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className="bg-gray-800 text-white px-4 py-2 rounded shadow" role="status">
          <div className="flex items-start space-x-2">
            <div className="flex-1">{t.message}</div>
            <button aria-label={`Dismiss ${t.message}`} onClick={() => removeToast(t.id)} className="text-sm opacity-80">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
