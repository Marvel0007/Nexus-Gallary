import React, { useState, useEffect, useCallback } from 'react';

/**
 * PhotoModal Component
 * Full-featured inspection lightbox with:
 * - Slideshow Carousel navigation (Previous / Next / Auto-play)
 * - Cyberpunk Visual Filters Matrix (Normal, Cyber Neon, Noir, High Contrast, Vintage)
 * - Direct image file download
 * - Copy image link
 * - Keyboard shortcuts (Left/Right arrows, Space for slideshow, Esc to close)
 */
export const PhotoModal = ({
  photo,
  allPhotos = [],
  isFavourite,
  onToggleFavourite,
  onClose,
  onNavigate,
  onNotify,
}) => {
  const [activeFilter, setActiveFilter] = useState('normal');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Find current index in photo list
  const currentIndex = allPhotos.findIndex((p) => p.id === photo?.id);
  const hasMultiple = allPhotos.length > 1;

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    const nextIndex = (currentIndex + 1) % allPhotos.length;
    onNavigate(allPhotos[nextIndex]);
  }, [allPhotos, currentIndex, hasMultiple, onNavigate]);

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    const prevIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
    onNavigate(allPhotos[prevIndex]);
  }, [allPhotos, currentIndex, hasMultiple, onNavigate]);

  // Slideshow Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  // Direct File Download
  const handleDownload = async () => {
    if (!photo) return;
    try {
      setIsDownloading(true);
      if (onNotify) {
        onNotify({
          title: 'DOWNLOADING',
          message: `Initiating high-res stream for #${photo.id}...`,
        });
      }

      const response = await fetch(`https://picsum.photos/id/${photo.id}/1600/1200`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `nexus-photo-${photo.id}-${photo.author.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      if (onNotify) {
        onNotify({
          title: 'DOWNLOAD COMPLETE',
          message: `Photo #${photo.id} saved to device.`,
        });
      }
    } catch (err) {
      console.error('Download failed:', err);
      if (onNotify) {
        onNotify({
          title: 'DOWNLOAD FAILED',
          message: 'Unable to stream full file. Opening source instead.',
        });
      }
      window.open(photo.download_url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!photo) return null;

  // Filter styles
  const filterStyles = {
    normal: '',
    cyberpunk: 'contrast-125 saturate-150 hue-rotate-320',
    noir: 'grayscale contrast-125',
    contrast: 'contrast-150 brightness-95',
    vintage: 'sepia contrast-110 saturate-90',
  }[activeFilter] || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo by ${photo.author}`}
    >
      <div
        className="relative max-w-5xl w-full max-h-[94vh] flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 shadow-[0_0_60px_rgba(220,38,38,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="font-mono text-xs sm:text-sm font-bold text-zinc-100 tracking-wide">
              TRANSMISSION #{photo.id}
            </h2>
            {currentIndex !== -1 && (
              <span className="hidden sm:inline font-mono text-[11px] text-zinc-500">
                [{currentIndex + 1} OF {allPhotos.length}]
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-play Slideshow button */}
            {hasMultiple && (
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                title="Toggle Slideshow (Spacebar)"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition cursor-pointer ${
                  isAutoPlaying
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {isAutoPlaying ? (
                  <>
                    <span className="h-2 w-2 rounded-sm bg-white" />
                    PAUSE
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    SLIDESHOW
                  </>
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal (Esc)"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-red-600 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image Content Container with Carousel Arrows */}
        <div className="relative flex-1 overflow-hidden bg-black flex items-center justify-center p-2 min-h-[320px] sm:min-h-[440px]">
          {/* Previous Arrow */}
          {hasMultiple && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo (Left arrow)"
              className="absolute left-4 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-950/70 text-zinc-400 hover:text-white hover:bg-red-600 border border-zinc-800 transition backdrop-blur-md cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* High-Res Image with Live Cyber Filter */}
          <img
            key={photo.id}
            src={`https://picsum.photos/id/${photo.id}/1200/900`}
            alt={`High resolution photography by ${photo.author}`}
            className={`max-h-[62vh] w-auto max-w-full rounded-lg object-contain shadow-2xl transition-all duration-300 ${filterStyles}`}
          />

          {/* Next Arrow */}
          {hasMultiple && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo (Right arrow)"
              className="absolute right-4 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-950/70 text-zinc-400 hover:text-white hover:bg-red-600 border border-zinc-800 transition backdrop-blur-md cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Cyber Visual Effect Filter Toolbar */}
        <div className="px-5 py-2.5 bg-zinc-900/90 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">
              VISUAL MATRIX:
            </span>
            <div className="inline-flex rounded-lg bg-zinc-950 p-0.5 border border-zinc-800">
              {[
                { id: 'normal', label: 'NORMAL' },
                { id: 'cyberpunk', label: 'CYBER' },
                { id: 'noir', label: 'NOIR' },
                { id: 'contrast', label: 'CONTRAST' },
                { id: 'vintage', label: 'VINTAGE' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-zinc-500 text-[11px] hidden md:block">
            Use <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">←</kbd> <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">→</kbd> to navigate, <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">Space</kbd> for slideshow
          </div>
        </div>

        {/* Footer Details & Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-zinc-800/80 bg-zinc-900/70">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-red-500 font-semibold">
              AUTHOR / PHOTOGRAPHER
            </p>
            <p className="text-base font-semibold text-zinc-100">
              {photo.author}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            {/* Toggle Favourite Button */}
            <button
              type="button"
              onClick={() => onToggleFavourite(photo.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-semibold tracking-wider transition cursor-pointer
                ${
                  isFavourite
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill={isFavourite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={isFavourite ? '0' : '2'}
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {isFavourite ? 'FAVOURITED' : 'FAVOURITE'}
            </button>

            {/* Direct File Download */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700 font-mono text-xs font-semibold transition cursor-pointer disabled:opacity-60"
              title="Download full resolution photo file"
            >
              {isDownloading ? (
                <div className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              DOWNLOAD
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={() => {
                const link = `https://picsum.photos/id/${photo.id}/1200/900`;
                navigator.clipboard.writeText(link);
                if (onNotify) {
                  onNotify({
                    title: 'LINK COPIED',
                    message: `Direct link to #${photo.id} copied to clipboard!`,
                  });
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 font-mono text-xs font-semibold transition cursor-pointer"
              title="Copy high-res image link to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              COPY LINK
            </button>

            {/* Direct High-Res External Link */}
            <a
              href={photo.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700 font-mono text-xs font-semibold transition"
              title="Open full resolution in new tab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              SOURCE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
