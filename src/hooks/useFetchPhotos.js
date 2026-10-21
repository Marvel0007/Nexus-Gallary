import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook: useFetchPhotos
 * Fetches photos from the Picsum Photos API with pagination and refetch support.
 * 
 * Returns:
 *  - photos: Array of photo objects [{ id, author, width, height, url, download_url }]
 *  - loading: Boolean indicating initial or reset loading state
 *  - loadingMore: Boolean indicating whether additional pages are currently being appended
 *  - error: String error message or null if fetch was successful
 *  - hasMore: Boolean indicating if additional photos are available to load
 *  - loadMore: () => Promise<void> - loads the next page of 30 photos
 *  - refetch: () => void - reloads page 1 from scratch
 */
export const useFetchPhotos = (itemsPerPage = 28) => {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Initial / Refresh fetch
  useEffect(() => {
    const controller = new AbortController();

    const fetchInitialPhotos = async () => {
      try {
        setLoading(true);
        setError(null);
        setPage(1);

        const response = await fetch(
          `https://picsum.photos/v2/list?page=1&limit=${itemsPerPage}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}: Failed to fetch photos.`);
        }

        const data = await response.json();
        setPhotos(data);
        setHasMore(data.length === itemsPerPage);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Network error occurred while fetching photos.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPhotos();

    return () => {
      controller.abort();
    };
  }, [itemsPerPage, reloadTrigger]);

  // Load next page and append to existing feed
  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const response = await fetch(
        `https://picsum.photos/v2/list?page=${nextPage}&limit=${itemsPerPage}`
      );

      if (!response.ok) {
        throw new Error(`Failed to load page ${nextPage}`);
      }

      const data = await response.json();

      if (data.length === 0) {
        setHasMore(false);
      } else {
        // Prevent duplicate IDs when appending
        setPhotos((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNewPhotos = data.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewPhotos];
        });
        setPage(nextPage);
        setHasMore(data.length === itemsPerPage);
      }
    } catch (err) {
      console.error('Failed to load more photos:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page, itemsPerPage]);

  const refetch = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  return { photos, loading, loadingMore, error, hasMore, loadMore, refetch };
};
