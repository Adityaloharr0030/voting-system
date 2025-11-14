// admin.js
import { getItem, setItem, LS_KEYS } from './storage.js';
import { resetCandidates } from './candidates.js';

export function isAdmin() {
  const admin = getItem(LS_KEYS.ADMIN, null);
  const session = getItem(LS_KEYS.SESSION, null);
  return admin && session && admin.userId === session.userId && admin.isAdmin;
}

export function setAdmin(userId) {
  setItem(LS_KEYS.ADMIN, { userId, isAdmin: true });
}

export function resetElection(preserveUsers = true) {
  resetCandidates();
  setItem(LS_KEYS.VOTES, []);
  if (!preserveUsers) setItem(LS_KEYS.USERS, []);
}
