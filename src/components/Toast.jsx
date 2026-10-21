import React, { useEffect } from 'react';

/**
 * Toast HUD notification component
 * Displays status feedback alerts (e.g. photo saved, removed, copied, cleared)
 */
export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3200);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-short">
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-950/95 border border-red-600/80 shadow-[0_0_25px_rgba(239,68,68,0.35)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-950/80 border border-red-600/60 text-red-500">
            {toast.icon || (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-red-400 font-bold">
              {toast.title || 'SYSTEM NOTICE'}
            </p>
            <p className="text-xs text-zinc-200 mt-0.5">
              {toast.message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss toast notification"
          className="text-zinc-500 hover:text-white transition p-1 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};
