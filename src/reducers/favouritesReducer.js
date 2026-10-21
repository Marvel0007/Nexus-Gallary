/**
 * Favourites Reducer
 * 
 * Manages the state of favourited photo IDs using useReducer.
 * Persists the favourites list in localStorage so selections remain intact across page refreshes.
 */

export const STORAGE_KEY = 'cyber_gallery_favourites';

// Action types
export const FAVOURITES_ACTIONS = {
  TOGGLE_FAVOURITE: 'TOGGLE_FAVOURITE',
  CLEAR_FAVOURITES: 'CLEAR_FAVOURITES',
  SET_FAVOURITES: 'SET_FAVOURITES',
  ADD_MANY: 'ADD_MANY',
};

/**
 * Helper function to retrieve stored favourites from localStorage safely.
 */
export const getInitialFavourites = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load favourites from localStorage:', error);
    return [];
  }
};

/**
 * Favourites Reducer function
 * 
 * @param {Array<string>} state - Array of favourited photo IDs
 * @param {Object} action - Action object containing { type, payload }
 * @returns {Array<string>} - Updated array of favourite photo IDs
 */
export const favouritesReducer = (state, action) => {
  switch (action.type) {
    case FAVOURITES_ACTIONS.TOGGLE_FAVOURITE: {
      const photoId = action.payload;
      const isAlreadyFavourite = state.includes(photoId);

      // If already favourited -> remove it; otherwise -> add it
      const updatedFavourites = isAlreadyFavourite
        ? state.filter((id) => id !== photoId)
        : [...state, photoId];

      // Synchronize with localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavourites));
      } catch (error) {
        console.error('Failed to persist favourites to localStorage:', error);
      }

      return updatedFavourites;
    }

    case FAVOURITES_ACTIONS.ADD_MANY: {
      const newIds = action.payload || [];
      const merged = Array.from(new Set([...state, ...newIds]));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (error) {
        console.error('Failed to persist favourites to localStorage:', error);
      }
      return merged;
    }

    case FAVOURITES_ACTIONS.SET_FAVOURITES: {
      const newList = action.payload || [];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      } catch (error) {
        console.error('Failed to persist favourites to localStorage:', error);
      }
      return newList;
    }

    case FAVOURITES_ACTIONS.CLEAR_FAVOURITES: {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear favourites from localStorage:', error);
      }
      return [];
    }

    default:
      return state;
  }
};
