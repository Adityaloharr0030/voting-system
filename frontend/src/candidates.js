// candidates.js
import { getItem, setItem, LS_KEYS } from './storage.js';

export function getCandidates() { return getItem(LS_KEYS.CANDIDATES, []); }
export function addCandidate(name) {
  const candidates = getCandidates();
  const id = Date.now().toString();
  candidates.push({ id, name });
  setItem(LS_KEYS.CANDIDATES, candidates);
}
export function updateCandidate(id, name) {
  const candidates = getCandidates().map(c => c.id === id ? { ...c, name } : c);
  setItem(LS_KEYS.CANDIDATES, candidates);
}
export function deleteCandidate(id) {
  const candidates = getCandidates().filter(c => c.id !== id);
  setItem(LS_KEYS.CANDIDATES, candidates);
}
export function resetCandidates() { setItem(LS_KEYS.CANDIDATES, []); }
