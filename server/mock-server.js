const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Simple in-memory store (reset on restart)
const users = {}
let candidates = [
  { id: '1', name: 'Alice', party: 'Blue' },
  { id: '2', name: 'Bob', party: 'Green' },
  { id: '3', name: 'Carol', party: 'Independent' }
]
const votes = {}

// Helpers
function makeToken(username){ return `token-${username}-${Date.now()}` }

// Routes
app.post('/register', (req, res) => {
  const { username, password, email } = req.body
  if (!username || !password) return res.status(400).json({ error: 'username/password required' })
  if (users[username]) return res.status(400).json({ error: 'user exists' })
  users[username] = { username, password, email }
  const token = makeToken(username)
  return res.json({ token })
})

app.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'username/password required' })
  const u = users[username]
  if (!u || u.password !== password) return res.status(401).json({ error: 'invalid credentials' })
  const token = makeToken(username)
  return res.json({ token })
})

app.get('/candidates', (req, res) => {
  res.json(candidates)
})

app.post('/vote', (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '') || req.body.token
  if (!token) return res.status(401).json({ error: 'unauthenticated' })
  const { candidateId } = req.body
  if (!candidateId || !candidates.find(c => c.id === candidateId)) return res.status(400).json({ error: 'invalid candidate' })
  // simple one-vote-per-token
  if (votes[token]) return res.status(400).json({ error: 'already voted' })
  votes[token] = candidateId
  return res.json({ success: true })
})

app.get('/results', (req, res) => {
  const counts = {}
  candidates.forEach(c => counts[c.id] = 0)
  Object.values(votes).forEach(id => { counts[id] = (counts[id] || 0) + 1 })
  const out = candidates.map(c => ({ id: c.id, name: c.name, votes: counts[c.id] || 0 }))
  res.json(out)
})

app.post('/admin/candidates', (req, res) => {
  const { name, party } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  const id = String(candidates.length + 1)
  const cand = { id, name, party }
  candidates.push(cand)
  res.json({ success: true, candidate: cand })
})

app.listen(port, () => console.log(`Mock server listening on http://localhost:${port}`))
