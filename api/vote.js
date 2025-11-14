// api/vote.js — Vercel serverless function// api/vote.js — Vercel serverless function for voting

let votes = [];let votes = [];



export default function handler(req, res) {module.exports = (req, res) => {

  res.setHeader('Access-Control-Allow-Origin', '*');  // Enable CORS

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Content-Type', 'application/json');  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {

    return res.status(200).end();  if (req.method === 'OPTIONS') {

  }    res.status(200).end();

    return;

  if (req.method === 'POST') {  }

    const { candidateId, userId } = req.body;

    if (!candidateId) {  if (req.method === 'POST') {

      return res.status(400).json({ error: 'candidateId required' });    const { candidateId, userId } = req.body;

    }    if (!candidateId) {

    votes.push({ userId: userId || 'anonymous', candidateId, timestamp: Date.now() });      return res.status(400).json({ error: 'candidateId is required' });

    return res.status(200).json({ success: true, message: 'Vote recorded' });    }

  }    // In-memory mock: accept any vote

    votes.push({ userId: userId || 'anonymous', candidateId, timestamp: Date.now() });

  res.status(405).json({ error: 'Method not allowed' });    res.status(200).json({ success: true, message: 'Vote recorded successfully' });

}  } else {

    res.status(405).json({ error: 'Method not allowed' });
  }
};
