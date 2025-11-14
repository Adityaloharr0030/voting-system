// api/results.js — Vercel serverless function for vote results
// In-memory mock results (will reset on each deployment)
const mockCandidates = [
  { id: '1', name: 'Alice Johnson' },
  { id: '2', name: 'Bob Smith' },
  { id: '3', name: 'Carol White' }
];

let votes = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return vote counts per candidate
    const results = mockCandidates.map(c => ({
      id: c.id,
      name: c.name,
      votes: votes.filter(v => v.candidateId === c.id).length
    }));
    res.json(results);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
