import React from 'react';
import { PhotoCard } from './PhotoCard';

/**
 * GalleryGrid Component
 * Renders photos in a fully responsive grid:
 * - Desktop (lg): 4 columns
 * - Tablet (md): 2 columns
 * - Mobile: 1 column
 * 
 * Props:
 * - photos: Array of photo items
 * - favourites: Array of favourite photo IDs
 * - onToggleFavourite: (id: string) => void
 */
export const GalleryGrid = ({
  photos,
  favourites,
  onToggleFavourite,
  onSelectPhoto,
  gridDensity = 'standard',
}) => {
  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40">
        <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="font-mono text-sm uppercase text-zinc-300 font-semibold tracking-wider">
          NO MATCHING IMAGES FOUND
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          Adjust your author search filter query to view other creators.
        </p>
      </div>
    );
  }

  // Density classes
  const gridClasses = {
    compact: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5',
    standard: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
    cinematic: 'grid grid-cols-1 md:grid-cols-2 gap-8',
  }[gridDensity] || 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';

  return (
    <div className={gridClasses} id="photo-gallery-grid">
      {photos.map((photo) => {
        const isFavourite = favourites.includes(photo.id);

        return (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isFavourite={isFavourite}
            onToggleFavourite={onToggleFavourite}
            onSelectPhoto={onSelectPhoto}
          />
        );
      })}
    </div>
  );
};
