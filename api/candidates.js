// api/candidates.js — Vercel serverless function for candidates endpoints
import { promises as fs } from 'fs';
import path from 'path';

// In Vercel, we'll use KV or environment-based storage
// For now, use a simple in-memory mock (data won't persist across deploys)
let candidates = [
  { id: '1', name: 'Alice Johnson', party: 'Party A' },
  { id: '2', name: 'Bob Smith', party: 'Party B' },
  { id: '3', name: 'Carol White', party: 'Party C' }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // GET /api/candidates — return all candidates
    res.json(candidates);
  } else if (req.method === 'POST') {
    // POST /api/candidates — add a new candidate
    const { name, party } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const id = Date.now().toString();
    const newCandidate = { id, name, party: party || '' };
    candidates.push(newCandidate);
    res.json(newCandidate);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
