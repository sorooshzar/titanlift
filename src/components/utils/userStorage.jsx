/**
 * User-scoped localStorage utility.
 * All keys are prefixed with the current user's ID so data never leaks between accounts.
 * Falls back to anonymous prefix if user is unknown (should not happen in normal flow).
 */

let _userId = null;

export function initUserStorage(userId) {
  _userId = userId || "anon";
}

export function clearUserStorage(userId) {
  // Remove all keys scoped to this user
  const prefix = `u:${userId || _userId}:`;
  Object.keys(localStorage)
    .filter(k => k.startsWith(prefix))
    .forEach(k => localStorage.removeItem(k));
  _userId = null;
}

function key(k) {
  return `u:${_userId || "anon"}:${k}`;
}

export const userStorage = {
  getItem(k) { return localStorage.getItem(key(k)); },
  setItem(k, v) { localStorage.setItem(key(k), v); },
  removeItem(k) { localStorage.removeItem(key(k)); },
};