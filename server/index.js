require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const fs = require('fs')
const path = require('path')

const app = express()
const port = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET

app.use(cors())
app.use(express.json())

// Simple request logger to help debug static file requests
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Simple file-backed DB (server/db.json)
const DB_FILE = path.join(__dirname, 'db.json')
function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    return { users: [], candidates: [], votes: [] }
  }
}
function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8')
}

let dbData = readDb()
if (!Array.isArray(dbData.candidates) || dbData.candidates.length === 0) {
  dbData.candidates = dbData.candidates || []
  dbData.candidates.push({ id: '1', name: 'Alice', party: 'Blue' })
  dbData.candidates.push({ id: '2', name: 'Bob', party: 'Green' })
  dbData.candidates.push({ id: '3', name: 'Carol', party: 'Independent' })
  writeDb(dbData)
}

// Helpers
function generateToken(username) {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    const p = jwt.verify(token, JWT_SECRET)
    const db = readDb()
    const user = (db.users || []).find(u => u.username === p.username)
    if (!user) return res.status(401).json({ error: 'Invalid token' })
    req.username = p.username
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password, email } = req.body
  if (!username || !password) return res.status(400).json({ error: 'username/password required' })
  const db = readDb()
  db.users = db.users || []
  if (db.users.find(u => u.username === username)) return res.status(400).json({ error: 'user exists' })
  const hashed = await bcrypt.hash(password, 10)
  const user = { id: String(db.users.length + 1), username, email, password: hashed, role: 'voter', hasVoted: false }
  db.users.push(user)
  writeDb(db)
  const token = generateToken(username)
  res.json({ token })
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'username/password required' })
  const db = readDb()
  const user = (db.users || []).find(u => u.username === username)
  if (!user) return res.status(401).json({ error: 'invalid credentials' })
  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ error: 'invalid credentials' })
  const token = generateToken(username)
  res.json({ token })
})

app.get('/api/voting/candidates', async (req, res) => {
  const db = readDb()
  res.json(db.candidates || [])
})

app.post('/api/voting/vote', authMiddleware, async (req, res) => {
  const { candidateId } = req.body
  const db = readDb()
  db.candidates = db.candidates || []
  db.votes = db.votes || []
  if (!candidateId || !db.candidates.find(c => c.id === candidateId)) return res.status(400).json({ error: 'invalid candidate' })
  const user = (db.users || []).find(u => u.username === req.username)
  if (!user) return res.status(401).json({ error: 'invalid user' })
  if (user.hasVoted) return res.status(400).json({ error: 'already voted' })
  db.votes.push({ id: String(db.votes.length + 1), userId: user.id, candidateId, votedAt: new Date().toISOString() })
  user.hasVoted = true
  writeDb(db)
  res.json({ success: true })
})

app.get('/api/results', async (req, res) => {
  const db = readDb()
  const counts = {};
  (db.candidates || []).forEach(c => counts[c.id] = 0);
  (db.votes || []).forEach(v => { counts[v.candidateId] = (counts[v.candidateId] || 0) + 1 })
  const out = (db.candidates || []).map(c => ({ id: c.id, name: c.name, votes: counts[c.id] || 0 }))
  res.json(out)
})

// Admin: add candidate
app.post('/api/admin/candidates', authMiddleware, async (req, res) => {
  const db = readDb()
  const user = (db.users || []).find(u => u.username === req.username)
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'forbidden' })
  const { name, party } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  db.candidates = db.candidates || []
  const id = String(db.candidates.length + 1)
  const cand = { id, name, party }
  db.candidates.push(cand)
  writeDb(db)
  res.json({ success: true, candidate: cand })
})



// Debug endpoint for raw DB data (for data.html)
app.get('/api/debug/db', (req, res) => {
  const db = readDb();
  res.json(db);
});


// Serve static files from project root
app.use(express.static(path.join(__dirname, '..')));

// Redirect root URL to login page
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.listen(port, '0.0.0.0', () => console.log(`Backend running on http://0.0.0.0:${port} (http://localhost:${port})`))
