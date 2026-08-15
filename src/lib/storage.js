// Drop-in replacement for the Claude-artifact-only `window.storage` API,
// backed by the browser's real localStorage so this runs standalone once
// deployed (Vercel, Render, etc). Keys are namespaced to avoid clashing
// with anything else that might use localStorage on the same origin.
const STORAGE_PREFIX = 'habit-sheet:';

export const storage = {
  async get(key) {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      return raw === null ? null : { key, value: raw };
    } catch (e) {
      return null;
    }
  },
  async set(key, value) {
    window.localStorage.setItem(STORAGE_PREFIX + key, value);
    return { key, value };
  },
};
