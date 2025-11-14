// api/candidates.js — Vercel serverless function
let candidates = [
  { id: '1', name: 'Alice Johnson', party: 'Party A' },
  { id: '2', name: 'Bob Smith', party: 'Party B' },
  { id: '3', name: 'Carol White', party: 'Party C' }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(candidates);
  }

  if (req.method === 'POST') {
    const { name, party } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }
    const newCandidate = { id: Date.now().toString(), name, party: party || '' };
    candidates.push(newCandidate);
    return res.status(201).json(newCandidate);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
