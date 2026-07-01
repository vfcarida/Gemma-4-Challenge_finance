/**
 * StorageService handles resilient state persistence.
 * Rationale: Abstracting local storage prevents UI crashes due to quota limits
 * or corrupted JSON, ensuring a robust Production Scale architecture.
 */

const STORAGE_KEY = 'gemmafin_state';

export const StorageService = {
  /**
   * Safely loads and parses state from local storage.
   * @returns {Object|null} The parsed state or null if parsing fails or state is empty.
   */
  loadState: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
        return null;
      }
      // Schema validation/type protection to prevent corrupted state injections
      if (parsed.messages !== undefined && !Array.isArray(parsed.messages)) {
        return null;
      }
      if (parsed.expenses !== undefined && !Array.isArray(parsed.expenses)) {
        return null;
      }
      if (parsed.income !== undefined && !Array.isArray(parsed.income)) {
        return null;
      }
      if (parsed.balance !== undefined && typeof parsed.balance !== 'number') {
        return null;
      }
      if (parsed.demoPhase !== undefined && typeof parsed.demoPhase !== 'string') {
        return null;
      }
      return parsed;
    } catch (error) {
      console.warn('[StorageService] Failed to parse state. Returning null.', error);
      return null;
    }
  },

  /**
   * Safely serializes and saves state to local storage.
   * @param {Object} state - The state object to save.
   */
  saveState: (state) => {
    try {
      if (state === undefined || state === null) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('[StorageService] Quota exceeded or serialization failed.', error);
    }
  },

  clearState: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[StorageService] Failed to clear state.', error);
    }
  }
};
