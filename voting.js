// voting.js
import { getItem, setItem, LS_KEYS } from './storage.js';

export function vote(candidateId) {
  const session = getItem(LS_KEYS.SESSION, null);
  if (!session) return { error: 'Not logged in' };
  const users = getItem(LS_KEYS.USERS, []);
  const user = users.find(u => u.id === session.userId);
  if (!user) return { error: 'User not found' };
  if (user.hasVoted) return { error: 'Already voted' };
  user.hasVoted = true;
  setItem(LS_KEYS.USERS, users);
  const votes = getItem(LS_KEYS.VOTES, []);
  votes.push({ userId: user.id, candidateId, ts: Date.now() });
  setItem(LS_KEYS.VOTES, votes);
  return { success: true };
}
