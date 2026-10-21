import React, { useState } from 'react';

/**
 * PhotoCard Component
 * Displays an individual photo item with author information,
 * smooth image load transition, error fallback, and favourite heart toggle.
 */
export const PhotoCard = ({ photo, isFavourite, onToggleFavourite, onSelectPhoto }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl bg-zinc-900/90 border border-zinc-800 
                 transition-all duration-300 ease-out 
                 hover:border-red-600/80 hover:shadow-[0_0_25px_rgba(220,38,38,0.28)] hover:-translate-y-1.5"
    >
      {/* Photo Image Container */}
      <div
        className="relative aspect-4/3 w-full overflow-hidden bg-zinc-950 cursor-pointer"
        onClick={() => {
          if (onSelectPhoto) onSelectPhoto(photo);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onSelectPhoto) onSelectPhoto(photo);
          }
        }}
        aria-label={`View photo by ${photo.author} in full resolution`}
      >
        {/* Shimmer skeleton while loading */}
        {!imageLoaded && !hasError && (
          <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
            <span className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
              DECODING #{photo.id}...
            </span>
          </div>
        )}

        {/* Fallback if image fails to load */}
        {hasError ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950 p-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500/80 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-mono text-[10px] text-zinc-500 uppercase">TRANSMISSION DEGRADED</p>
          </div>
        ) : (
          <img
            src={`https://picsum.photos/id/${photo.id}/600/450`}
            alt={`Photo by ${photo.author}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setHasError(true)}
            className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-108 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/20 opacity-80 pointer-events-none" />

        {/* Hover inspect hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 text-xs font-mono uppercase tracking-wider text-red-400 border border-red-500/50 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            INSPECT
          </span>
        </div>

        {/* Heart Icon Button (Top-Right Badge) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite(photo.id);
          }}
          aria-label={isFavourite ? `Remove ${photo.author}'s photo from favourites` : `Add ${photo.author}'s photo to favourites`}
          title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          className={`absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg backdrop-blur-md transition-all duration-200 cursor-pointer
            ${
              isFavourite
                ? 'bg-red-600/90 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)] scale-105'
                : 'bg-zinc-950/70 text-zinc-400 border border-zinc-700/60 hover:text-red-500 hover:border-red-500/80 hover:bg-zinc-900'
            }`}
        >
          {/* Heart SVG Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5 transition-transform active:scale-125"
            fill={isFavourite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={isFavourite ? '0' : '2'}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Transmission ID Chip (Top-Left) */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono tracking-wider text-zinc-400">
          #{photo.id}
        </div>
      </div>

      {/* Card Footer: Author Name & Details */}
      <div className="flex items-center justify-between p-4 bg-zinc-900/90">
        <div className="truncate pr-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500/90 font-mono">
            CREATOR
          </p>
          <h3
            className="truncate text-sm font-semibold text-zinc-100 group-hover:text-red-400 transition-colors"
            title={photo.author}
          >
            {photo.author}
          </h3>
        </div>

        {/* Status Indicator */}
        {isFavourite && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded bg-red-950/60 border border-red-600/50 px-2 py-0.5 text-[11px] font-medium text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            SAVED
          </span>
        )}
      </div>
    </div>
  );
};
