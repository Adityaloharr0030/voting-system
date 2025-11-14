// api/candidates.js — Vercel serverless function for candidates endpoints
// Mock candidates data (will reset on each deployment)
let candidates = [
  { id: '1', name: 'Alice Johnson', party: 'Party A' },
  { id: '2', name: 'Bob Smith', party: 'Party B' },
  { id: '3', name: 'Carol White', party: 'Party C' }
];

module.exports = (req, res) => {
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
    res.status(200).json(candidates);
  } else if (req.method === 'POST') {
    // POST /api/candidates — add a new candidate
    const { name, party } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const id = Date.now().toString();
    const newCandidate = { id, name, party: party || '' };
    candidates.push(newCandidate);
    res.status(201).json(newCandidate);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
