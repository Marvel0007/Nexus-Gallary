import React from 'react';

/**
 * LoadingSpinner Component
 * Displays a futuristic red cyber loader while photos are being fetched.
 */
export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      {/* Dual Rotating Cyber Ring */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute h-16 w-16 rounded-full border-2 border-red-900/30 border-t-red-600 animate-spin" />
        <div className="absolute h-10 w-10 rounded-full border-2 border-zinc-800 border-b-red-500 animate-[spin_1.5s_linear_infinite_reverse]" />
        <div className="h-2 w-2 rounded-full bg-red-600 shadow-[0_0_10px_#ef4444] animate-ping" />
      </div>

      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-red-500 font-semibold">
        [ SYSTEM BUFFERING ]
      </p>
      <p className="mt-1 text-sm text-zinc-400">
        Fetching high-resolution data from Picsum API...
      </p>
    </div>
  );
};
