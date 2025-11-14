// api/vote.js — Vercel serverless function for voting
let votes = [];

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { candidateId, userId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }
    // In-memory mock: accept any vote
    votes.push({ userId: userId || 'anonymous', candidateId, timestamp: Date.now() });
    res.status(200).json({ success: true, message: 'Vote recorded successfully' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
