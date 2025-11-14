// api/index.js — Main Vercel serverless backend
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock data store (in-memory for demo)
let candidates = [
  { id: '1', name: 'Alice Johnson', party: 'Party A' },
  { id: '2', name: 'Bob Smith', party: 'Party B' },
  { id: '3', name: 'Carol White', party: 'Party C' }
];

let votes = [];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/candidates
app.get('/api/candidates', (req, res) => {
  res.json(candidates);
});

// POST /api/candidates
app.post('/api/candidates', (req, res) => {
  const { name, party } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const id = Date.now().toString();
  const newCandidate = { id, name, party: party || '' };
  candidates.push(newCandidate);
  res.status(201).json(newCandidate);
});

// POST /api/vote
app.post('/api/vote', (req, res) => {
  const { candidateId, userId } = req.body;
  if (!candidateId) return res.status(400).json({ error: 'candidateId required' });
  votes.push({ userId: userId || 'anonymous', candidateId, timestamp: Date.now() });
  res.json({ success: true, message: 'Vote recorded' });
});

// GET /api/results
app.get('/api/results', (req, res) => {
  const results = candidates.map(c => ({
    id: c.id,
    name: c.name,
    votes: votes.filter(v => v.candidateId === c.id).length
  }));
  res.json(results);
});

// Export for Vercel
module.exports = app;
