import React from 'react';

/**
 * ErrorMessage Component
 * Displays a sleek gaming warning / failure panel when the API request encounters an issue.
 */
export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="mx-auto my-12 max-w-lg rounded-xl border border-red-800/80 bg-red-950/30 p-6 text-center shadow-[0_0_30px_rgba(220,38,38,0.2)] backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-950/80 border border-red-600/60 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          stroke="currentColor"
          className="h-7 w-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <h3 className="mt-4 font-mono text-base font-bold uppercase tracking-wider text-red-400">
        FEED TRANSMISSION FAILED
      </h3>

      <p className="mt-2 text-sm text-zinc-300">
        {message || 'Unable to connect to Picsum server. Check your internet connection.'}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition hover:bg-red-500 active:scale-95 cursor-pointer font-mono"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          RETRY CONNECTION
        </button>
      )}
    </div>
  );
};
