import React, { useState, useReducer, useRef, useEffect, useCallback } from 'react';
import { useFetchPhotos } from './hooks/useFetchPhotos';
import {
  favouritesReducer,
  getInitialFavourites,
  FAVOURITES_ACTIONS,
} from './reducers/favouritesReducer';
import { GalleryGrid } from './components/GalleryGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { PhotoModal } from './components/PhotoModal';
import { Toast } from './components/Toast';

export default function App() {
  // 1. Fetch Photos from Picsum Photos API with pagination
  const {
    photos,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useFetchPhotos(28);

  // 2. Manage Favourites with useReducer + localStorage persistence
  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    [],
    getInitialFavourites
  );

  // 3. User Interface & Display States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterView, setFilterView] = useState('all'); // 'all' | 'favourites'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'author-asc' | 'author-desc' | 'id-asc' | 'id-desc'
  const [gridDensity, setGridDensity] = useState('standard'); // 'compact' | 'standard' | 'cinematic'
  const [toast, setToast] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [accentTheme, setAccentTheme] = useState('crimson'); // 'crimson' | 'cyan' | 'emerald' | 'purple'

  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Toast dispatcher helper
  const showToast = useCallback((toastData) => {
    setToast(toastData);
  }, []);

  // Track scroll position for Back-to-Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // '/' to focus search
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '?' && !selectedPhoto) {
        setShowShortcutsModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedPhoto]);

  // Favourites actions with Toast HUD feedback
  const handleToggleFavourite = (photoId) => {
    const isAlreadyFavourited = favourites.includes(photoId);
    dispatch({
      type: FAVOURITES_ACTIONS.TOGGLE_FAVOURITE,
      payload: photoId,
    });

    if (isAlreadyFavourited) {
      showToast({
        title: 'BOOKMARK REMOVED',
        message: `Transmission #${photoId} removed from favourites.`,
      });
    } else {
      showToast({
        title: 'BOOKMARK SAVED',
        message: `Transmission #${photoId} stored in persistent memory.`,
      });
    }
  };

  const handleClearFavourites = () => {
    if (window.confirm('Are you sure you want to clear all your saved favourites?')) {
      dispatch({ type: FAVOURITES_ACTIONS.CLEAR_FAVOURITES });
      showToast({
        title: 'MEMORY PURGED',
        message: 'All favourite bookmarks cleared.',
      });
    }
  };

  // Bulk bookmark all currently filtered photos
  const handleBookmarkAllFiltered = () => {
    const idsToBookmark = displayedPhotos.map((p) => p.id);
    dispatch({
      type: FAVOURITES_ACTIONS.ADD_MANY,
      payload: idsToBookmark,
    });
    showToast({
      title: 'BULK BOOKMARK COMPLETE',
      message: `Added ${idsToBookmark.length} transmissions to persistent memory.`,
    });
  };

  // Export Favourites as JSON file
  const handleExportFavourites = () => {
    if (favourites.length === 0) {
      showToast({
        title: 'EXPORT EMPTY',
        message: 'No favourites to export yet. Bookmark some photos first.',
      });
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({
        app: 'NEXUS_GALLERY',
        version: '1.2.0',
        exportedAt: new Date().toISOString(),
        favourites,
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexus-gallery-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast({
      title: 'EXPORT SUCCESS',
      message: `Exported ${favourites.length} bookmarks to JSON file.`,
    });
  };

  // Import Favourites from JSON file
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        const importedIds = Array.isArray(parsed) ? parsed : parsed.favourites;
        if (Array.isArray(importedIds)) {
          dispatch({
            type: FAVOURITES_ACTIONS.ADD_MANY,
            payload: importedIds.map(String),
          });
          showToast({
            title: 'IMPORT SUCCESSFUL',
            message: `Restored ${importedIds.length} bookmarks from backup.`,
          });
        } else {
          throw new Error('Invalid JSON format');
        }
      } catch (err) {
        console.error(err);
        showToast({
          title: 'IMPORT FAILED',
          message: 'Could not read JSON backup file. Ensure valid schema.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. Photo filtering & sorting logic
  let displayedPhotos = [...photos];

  // Filter by Favourites tab if active
  if (filterView === 'favourites') {
    displayedPhotos = displayedPhotos.filter((photo) => favourites.includes(photo.id));
  }

  // Filter by author name search query
  const cleanQuery = searchQuery.trim().toLowerCase();
  if (cleanQuery) {
    displayedPhotos = displayedPhotos.filter((photo) =>
      photo.author.toLowerCase().includes(cleanQuery)
    );
  }

  // Apply Sorting
  switch (sortBy) {
    case 'author-asc':
      displayedPhotos.sort((a, b) => a.author.localeCompare(b.author));
      break;
    case 'author-desc':
      displayedPhotos.sort((a, b) => b.author.localeCompare(a.author));
      break;
    case 'id-asc':
      displayedPhotos.sort((a, b) => Number(a.id) - Number(b.id));
      break;
    case 'id-desc':
      displayedPhotos.sort((a, b) => Number(b.id) - Number(a.id));
      break;
    case 'default':
    default:
      // maintain API feed order
      break;
  }

  // Cyber theme accents
  const themeColors = {
    crimson: {
      line: 'from-transparent via-red-600 to-transparent shadow-[0_0_15px_#ef4444]',
      text: 'text-red-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]',
      badge: 'border-red-600/30 text-red-400 bg-red-950/40',
      dot: 'bg-red-500',
    },
    cyan: {
      line: 'from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_#06b6d4]',
      text: 'text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]',
      badge: 'border-cyan-600/30 text-cyan-400 bg-cyan-950/40',
      dot: 'bg-cyan-500',
    },
    emerald: {
      line: 'from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_#10b981]',
      text: 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]',
      badge: 'border-emerald-600/30 text-emerald-400 bg-emerald-950/40',
      dot: 'bg-emerald-500',
    },
    purple: {
      line: 'from-transparent via-purple-600 to-transparent shadow-[0_0_15px_#9333ea]',
      text: 'text-purple-400 drop-shadow-[0_0_20px_rgba(147,51,234,0.8)]',
      badge: 'border-purple-600/30 text-purple-400 bg-purple-950/40',
      dot: 'bg-purple-500',
    },
  }[accentTheme] || {};

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Cyber Glow Line */}
      <div className={`h-1 w-full bg-gradient-to-r ${themeColors.line}`} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/80 pb-6">
            <div>
              {/* Badge & Theme Selector */}
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded border text-[11px] font-mono tracking-widest ${themeColors.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full animate-ping ${themeColors.dot}`} />
                  SYSTEM // OPERATIONAL
                </div>

                {/* Accent Theme Switcher */}
                <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-[11px] font-mono">
                  <span className="text-zinc-500 px-1 text-[10px]">THEME:</span>
                  {[
                    { id: 'crimson', bg: 'bg-red-500', label: 'RED' },
                    { id: 'cyan', bg: 'bg-cyan-400', label: 'CYAN' },
                    { id: 'emerald', bg: 'bg-emerald-500', label: 'MATRIX' },
                    { id: 'purple', bg: 'bg-purple-500', label: 'TOKYO' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAccentTheme(t.id)}
                      title={`Switch to ${t.label} Theme`}
                      className={`h-4 w-4 rounded-full ${t.bg} transition-all cursor-pointer ${
                        accentTheme === t.id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-['Orbitron',sans-serif]">
                NEXUS <span className={themeColors.text}>//</span> GALLERY
              </h1>
              <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-xl">
                High-fidelity cyber visual feed with full keyboard support, slideshow auto-play, live visual filters matrix, and persistent memory.
              </p>
            </div>

            {/* Quick Metrics & Backup Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 text-center shadow-inner">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                  LOADED
                </span>
                <span className="font-mono text-base font-bold text-zinc-200">
                  {photos.length}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 text-center shadow-inner">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-red-400">
                  SAVED
                </span>
                <span className="font-mono text-base font-bold text-red-500">
                  {favourites.length}
                </span>
              </div>

              {/* Shortcuts trigger */}
              <button
                type="button"
                onClick={() => setShowShortcutsModal(true)}
                title="View Keyboard Shortcuts (?)"
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition cursor-pointer"
              >
                <kbd className="font-mono text-xs font-bold">?</kbd>
              </button>
            </div>
          </div>

          {/* Controls Bar: Search & Primary Filters */}
          <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photographer name... (Press / to focus)"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
              />

              {/* Clear search button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Tabs & Backup / Bulk Actions */}
            <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
              <div className="inline-flex rounded-xl bg-zinc-900/90 p-1 border border-zinc-800">
                {/* All Photos Tab */}
                <button
                  type="button"
                  onClick={() => setFilterView('all')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider transition cursor-pointer
                    ${
                      filterView === 'all'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                  ALL FEED
                  <span className="rounded bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300">
                    {photos.length}
                  </span>
                </button>

                {/* Favourites Only Tab */}
                <button
                  type="button"
                  onClick={() => setFilterView('favourites')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider transition cursor-pointer
                    ${
                      filterView === 'favourites'
                        ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill={filterView === 'favourites' ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  FAVOURITES
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] ${
                      filterView === 'favourites' ? 'bg-red-800 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {favourites.length}
                  </span>
                </button>
              </div>

              {/* Favourites specific tools */}
              {filterView === 'favourites' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExportFavourites}
                    title="Export favourites as JSON backup"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 font-mono text-xs transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    EXPORT
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Import favourites from JSON backup"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 font-mono text-xs transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    IMPORT
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />

                  {favourites.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearFavourites}
                      title="Clear all saved favourite photos"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-900/60 bg-red-950/40 text-red-400 hover:bg-red-900/40 hover:text-red-300 font-mono text-xs transition cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      PURGE
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Controls: Sorting, Bulk Actions, Grid Density */}
          <div className="mt-4 pt-3 border-t border-zinc-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Sorting & Bulk Bookmark */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-mono uppercase text-zinc-500 text-[11px] font-semibold">
                  SORT:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1 font-mono text-xs focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="default">Default Feed</option>
                  <option value="author-asc">Author (A → Z)</option>
                  <option value="author-desc">Author (Z → A)</option>
                  <option value="id-asc">ID (Ascending)</option>
                  <option value="id-desc">ID (Descending)</option>
                </select>
              </div>

              {/* Bookmark all displayed */}
              {displayedPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={handleBookmarkAllFiltered}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 font-mono text-[11px] transition cursor-pointer"
                  title="Bookmark all currently visible photos"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  BOOKMARK DISPLAYED ({displayedPhotos.length})
                </button>
              )}
            </div>

            {/* Right: Grid Density Switcher */}
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase text-zinc-500 text-[11px] font-semibold hidden sm:inline">
                VIEW:
              </span>
              <div className="inline-flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setGridDensity('compact')}
                  title="Compact Grid (6 Columns)"
                  className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                    gridDensity === 'compact'
                      ? 'bg-zinc-800 text-red-400 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  COMPACT
                </button>
                <button
                  type="button"
                  onClick={() => setGridDensity('standard')}
                  title="Standard Grid (4 Columns)"
                  className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                    gridDensity === 'standard'
                      ? 'bg-zinc-800 text-red-400 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  STANDARD
                </button>
                <button
                  type="button"
                  onClick={() => setGridDensity('cinematic')}
                  title="Cinematic Wide (2 Columns)"
                  className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                    gridDensity === 'cinematic'
                      ? 'bg-zinc-800 text-red-400 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  CINEMATIC
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Status info line */}
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>
              DISPLAYING {displayedPhotos.length} OF {filterView === 'favourites' ? favourites.length : photos.length} TRANSMISSIONS
            </span>
            {searchQuery && (
              <span className="text-red-400">
                FILTER: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1">
          {/* Loading State */}
          {loading && <LoadingSpinner />}

          {/* Error State with Retry Button */}
          {!loading && error && (
            <ErrorMessage message={error} onRetry={refetch} />
          )}

          {/* Success / Loaded Grid */}
          {!loading && !error && (
            <>
              {/* Special Empty State for Favourites Tab */}
              {filterView === 'favourites' && favourites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40">
                  <div className="h-14 w-14 rounded-full bg-red-950/30 border border-red-600/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-200">
                    NO FAVOURITES BOOKMARKED YET
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                    Switch to &quot;ALL FEED&quot; and click the heart icon on any photo card to bookmark it here. You can also import a JSON backup file!
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFilterView('all')}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white font-mono text-xs font-semibold uppercase tracking-wider hover:bg-red-500 transition shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
                    >
                      EXPLORE ALL TRANSMISSIONS
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-xs font-semibold uppercase tracking-wider hover:bg-zinc-700 transition cursor-pointer"
                    >
                      RESTORE BACKUP
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <GalleryGrid
                    photos={displayedPhotos}
                    favourites={favourites}
                    onToggleFavourite={handleToggleFavourite}
                    onSelectPhoto={setSelectedPhoto}
                    gridDensity={gridDensity}
                  />

                  {/* Load More Button (Shown in All Feed view when not actively filtered by author) */}
                  {filterView === 'all' && !searchQuery && hasMore && (
                    <div className="mt-14 flex flex-col items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs uppercase tracking-widest font-bold shadow-lg transition-all hover:border-red-600 hover:text-white hover:shadow-[0_0_25px_rgba(239,68,68,0.35)] active:scale-95 disabled:opacity-60 cursor-pointer"
                      >
                        {loadingMore ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                            <span>BUFFERING NEXT DATA CHUNK...</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            <span>TRANSMIT NEXT BATCH (+28 PHOTOS)</span>
                          </>
                        )}
                      </button>
                      <span className="text-[11px] font-mono text-zinc-600">
                        CONTINUOUS PICSUM ARCHIVE STREAM
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* High Resolution Inspection Lightbox Modal with Carousel Navigation */}
        {selectedPhoto && (
          <PhotoModal
            photo={selectedPhoto}
            allPhotos={displayedPhotos}
            isFavourite={favourites.includes(selectedPhoto.id)}
            onToggleFavourite={handleToggleFavourite}
            onClose={() => setSelectedPhoto(null)}
            onNavigate={(newPhoto) => setSelectedPhoto(newPhoto)}
            onNotify={showToast}
          />
        )}

        {/* Keyboard Shortcuts Modal */}
        {showShortcutsModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowShortcutsModal(false)}
          >
            <div
              className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  KEYBOARD SHORTCUTS MATRIX
                </h3>
                <button
                  type="button"
                  onClick={() => setShowShortcutsModal(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">Focus Photographer Search</span>
                  <kbd className="bg-zinc-800 text-red-400 px-2 py-0.5 rounded font-bold">/</kbd>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">Close Lightbox Modal</span>
                  <kbd className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">Esc</kbd>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">Previous Photo (in modal)</span>
                  <kbd className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">←</kbd>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">Next Photo (in modal)</span>
                  <kbd className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">→</kbd>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">Toggle Slideshow</span>
                  <kbd className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">Space</kbd>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">Toggle Shortcuts Panel</span>
                  <kbd className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">?</kbd>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="mt-6 w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs uppercase tracking-wider transition"
              >
                DISMISS
              </button>
            </div>
          </div>
        )}

        {/* Cyberpunk HUD Toast Notifications */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Floating Back to Top Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] backdrop-blur-md transition-all cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Picsum Photos V2 API Linked (Total loaded: {photos.length})</span>
          </div>

          <div>
            Built with React 19 + Tailwind CSS + useReducer
          </div>

          <div className="text-zinc-600">
            NEXUS // VER 1.5.0
          </div>
        </footer>
      </div>
    </div>
  );
}
