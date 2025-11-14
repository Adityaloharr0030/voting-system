// storage.js
export const LS_KEYS = {
  USERS: 'LS_USERS',
  CANDIDATES: 'LS_CANDIDATES',
  VOTES: 'LS_VOTES',
  SESSION: 'LS_SESSION',
  ADMIN: 'LS_ADMIN'
};

function safeParse(val, fallback) {
  try { return JSON.parse(val) ?? fallback; } catch { return fallback; }
}

export function getItem(key, fallback) {
  return safeParse(localStorage.getItem(key), fallback);
}
export function setItem(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
export function removeItem(key) { localStorage.removeItem(key); }
export function clear() { localStorage.clear(); }
