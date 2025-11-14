// auth.js
import { getItem, setItem, removeItem, LS_KEYS } from './storage.js';

function hash(str) {
  let h = 0; for (let i = 0; i < str.length; i++) h = ((h<<5)-h)+str.charCodeAt(i); return h.toString();
}
function normalize(str) { return str.trim().toLowerCase(); }

export function register({ name, email, password }) {
  const users = getItem(LS_KEYS.USERS, []);
  if (users.some(u => normalize(u.email) === normalize(email))) return { error: 'Email already registered' };
  const id = Date.now().toString();
  const user = { id, name, email: normalize(email), passwordHash: hash(password), hasVoted: false };
  users.push(user); setItem(LS_KEYS.USERS, users);
  setItem(LS_KEYS.SESSION, { userId: id, createdAt: Date.now() });
  return { user };
}

export function login({ email, password }) {
  const users = getItem(LS_KEYS.USERS, []);
  const user = users.find(u => normalize(u.email) === normalize(email));
  if (!user) return { error: 'User not found' };
  if (user.passwordHash !== hash(password)) return { error: 'Wrong password' };
  setItem(LS_KEYS.SESSION, { userId: user.id, createdAt: Date.now() });
  return { user };
}

export function logout() { removeItem(LS_KEYS.SESSION); }
export function getSession() { return getItem(LS_KEYS.SESSION, null); }
