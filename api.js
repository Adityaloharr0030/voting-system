// api.js — REST API for voting system
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(bodyParser.json());

// Storage helpers (use JSON files for demo)
const DATA_DIR = path.join(__dirname, 'server');
const USERS_FILE = path.join(DATA_DIR, 'db.json');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates.json');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// API: Auth
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  let users = readJson(USERS_FILE, []);
  if (users.some(u => u.email === email)) return res.status(400).json({ error: 'Email already registered' });
  const id = Date.now().toString();
  users.push({ id, name, email, password, hasVoted: false });
  writeJson(USERS_FILE, users);
  res.json({ id, name, email });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  let users = readJson(USERS_FILE, []);
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ id: user.id, name: user.name, email: user.email });
});

// API: Candidates
app.get('/api/candidates', (req, res) => {
  const candidates = readJson(CANDIDATES_FILE, []);
  res.json(candidates);
});

app.post('/api/candidates', (req, res) => {
  const { name } = req.body;
  let candidates = readJson(CANDIDATES_FILE, []);
  const id = Date.now().toString();
  candidates.push({ id, name });
  writeJson(CANDIDATES_FILE, candidates);
  res.json({ id, name });
});

app.delete('/api/candidates/:id', (req, res) => {
  let candidates = readJson(CANDIDATES_FILE, []);
  candidates = candidates.filter(c => c.id !== req.params.id);
  writeJson(CANDIDATES_FILE, candidates);
  res.json({ success: true });
});

// API: Voting
app.post('/api/vote', (req, res) => {
  const { userId, candidateId } = req.body;
  let users = readJson(USERS_FILE, []);
  let votes = readJson(VOTES_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(400).json({ error: 'User not found' });
  if (user.hasVoted) return res.status(400).json({ error: 'Already voted' });
  user.hasVoted = true;
  writeJson(USERS_FILE, users);
  votes.push({ userId, candidateId, ts: Date.now() });
  writeJson(VOTES_FILE, votes);
  res.json({ success: true });
});

// API: Results
app.get('/api/results', (req, res) => {
  const candidates = readJson(CANDIDATES_FILE, []);
  const votes = readJson(VOTES_FILE, []);
  const results = candidates.map(c => ({
    id: c.id,
    name: c.name,
    votes: votes.filter(v => v.candidateId === c.id).length
  }));
  res.json(results);
});

module.exports = app;
