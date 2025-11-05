const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const app = express()
const port = process.env.PORT || 4000

// ============ MIDDLEWARE ============

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  credentials: true
}))
app.use(express.json({ limit: '10kb' }))

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`)
  })
  next()
})

// ============ DATA STORE ============

const users = new Map()
let candidates = [
  { id: '1', name: 'Alice Johnson', party: 'Blue Party', description: 'Education Advocate', votes: 0 },
  { id: '2', name: 'Bob Williams', party: 'Green Party', description: 'Environmental Leader', votes: 0 },
  { id: '3', name: 'Carol Martinez', party: 'Independent', description: 'Reform Candidate', votes: 0 }
]
const votes = new Map()
const sessions = new Map()

// ============ UTILITIES ============

const generateToken = (username) => {
  const random = crypto.randomBytes(16).toString('hex')
  return `tok_${username}_${random}`
}

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex')
}

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 30 && /^[a-zA-Z0-9_-]+$/.test(username)
}

const validatePassword = (password) => {
  return password && password.length >= 6 && password.length <= 128
}

// ============ MIDDLEWARE ============

// Auth middleware
const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required', code: 'NO_TOKEN' })
  }
  
  const session = sessions.get(token)
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token)
    return res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' })
  }
  
  req.user = session.user
  req.token = token
  next()
}

// Admin middleware (can be enhanced based on your needs)
const requireAdmin = (req, res, next) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Admin access required', code: 'FORBIDDEN' })
  }
  next()
}

// Input validation middleware
const validateBody = (schema) => (req, res, next) => {
  const errors = {}
  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field]
    
    if (rules.required && !value) {
      errors[field] = `${field} is required`
    } else if (value && rules.type === 'string' && typeof value !== 'string') {
      errors[field] = `${field} must be a string`
    } else if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`
    } else if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} must be at most ${rules.maxLength} characters`
    } else if (value && rules.validate && !rules.validate(value)) {
      errors[field] = rules.message || `${field} is invalid`
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors })
  }
  next()
}

// ============ ROUTES: AUTH ============

app.post('/register', validateBody({
  username: { required: true, type: 'string', minLength: 3, maxLength: 30, validate: validateUsername, message: 'Invalid username format' },
  password: { required: true, type: 'string', validate: validatePassword, message: 'Password must be 6-128 characters' },
  email: { required: false, type: 'string', validate: (v) => !v || validateEmail(v), message: 'Invalid email format' }
}), (req, res) => {
  const { username, password, email } = req.body
  
  if (users.has(username)) {
    return res.status(409).json({ error: 'Username already taken', code: 'USER_EXISTS' })
  }
  
  const hashedPassword = hashPassword(password)
  users.set(username, {
    username,
    password: hashedPassword,
    email: email || null,
    createdAt: new Date(),
    votedAt: null
  })
  
  const token = generateToken(username)
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  sessions.set(token, {
    user: { username },
    createdAt: Date.now(),
    expiresAt
  })
  
  console.log(`✓ User registered: ${username}`)
  res.status(201).json({
    success: true,
    token,
    expiresIn: expiresAt - Date.now(),
    user: { username, email: email || null }
  })
})

app.post('/login', validateBody({
  username: { required: true, type: 'string' },
  password: { required: true, type: 'string' }
}), (req, res) => {
  const { username, password } = req.body
  
  const user = users.get(username)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials', code: 'AUTH_FAILED' })
  }
  
  const hashedPassword = hashPassword(password)
  if (user.password !== hashedPassword) {
    return res.status(401).json({ error: 'Invalid credentials', code: 'AUTH_FAILED' })
  }
  
  const token = generateToken(username)
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000)
  sessions.set(token, {
    user: { username },
    createdAt: Date.now(),
    expiresAt
  })
  
  console.log(`✓ User logged in: ${username}`)
  res.json({
    success: true,
    token,
    expiresIn: expiresAt - Date.now(),
    user: { username, email: user.email }
  })
})

app.post('/logout', requireAuth, (req, res) => {
  sessions.delete(req.token)
  console.log(`✓ User logged out: ${req.user.username}`)
  res.json({ success: true })
})

// ============ ROUTES: CANDIDATES ============

app.get('/candidates', (req, res) => {
  const list = candidates.map(c => ({
    id: c.id,
    name: c.name,
    party: c.party,
    description: c.description,
    votes: c.votes
  }))
  res.json({ success: true, candidates: list })
})

// ============ ROUTES: VOTING ============

app.post('/vote', requireAuth, validateBody({
  candidateId: { required: true, type: 'string' }
}), (req, res) => {
  const { candidateId } = req.body
  const username = req.user.username
  
  // Check if candidate exists
  const candidate = candidates.find(c => c.id === candidateId)
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found', code: 'INVALID_CANDIDATE' })
  }
  
  // Check if user already voted
  if (votes.has(username)) {
    return res.status(400).json({ error: 'You have already voted', code: 'ALREADY_VOTED' })
  }
  
  // Record the vote
  votes.set(username, {
    candidateId,
    timestamp: new Date()
  })
  
  // Update candidate vote count
  const candIndex = candidates.findIndex(c => c.id === candidateId)
  if (candIndex !== -1) {
    candidates[candIndex].votes += 1
  }
  
  // Update user record
  const user = users.get(username)
  if (user) {
    user.votedAt = new Date()
  }
  
  console.log(`✓ Vote recorded: ${username} → Candidate ${candidateId}`)
  res.json({
    success: true,
    message: 'Vote recorded successfully',
    candidateName: candidate.name
  })
})

app.get('/vote/status', requireAuth, (req, res) => {
  const hasVoted = votes.has(req.user.username)
  res.json({
    success: true,
    hasVoted,
    votedAt: hasVoted ? votes.get(req.user.username).timestamp : null
  })
})

// ============ ROUTES: RESULTS ============

app.get('/results', (req, res) => {
  const totalVotes = votes.size
  
  const results = candidates.map(c => {
    const percentage = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(2) : 0
    return {
      id: c.id,
      name: c.name,
      party: c.party,
      votes: c.votes,
      percentage: parseFloat(percentage)
    }
  }).sort((a, b) => b.votes - a.votes)
  
  res.json({
    success: true,
    totalVotes,
    results,
    timestamp: new Date()
  })
})

app.get('/results/live', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  
  const totalVotes = votes.size
  const results = candidates.map(c => {
    const percentage = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(2) : 0
    return {
      id: c.id,
      name: c.name,
      votes: c.votes,
      percentage: parseFloat(percentage)
    }
  })
  
  res.json({
    success: true,
    totalVotes,
    results,
    timestamp: new Date().toISOString()
  })
})

// ============ ROUTES: ADMIN ============

app.post('/admin/candidates', requireAdmin, validateBody({
  name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
  party: { required: false, type: 'string', maxLength: 100 },
  description: { required: false, type: 'string', maxLength: 500 }
}), (req, res) => {
  const { name, party, description } = req.body
  
  const id = String(candidates.length + 1)
  const newCandidate = {
    id,
    name,
    party: party || 'Independent',
    description: description || '',
    votes: 0
  }
  
  candidates.push(newCandidate)
  console.log(`✓ Candidate added: ${name}`)
  
  res.status(201).json({
    success: true,
    candidate: newCandidate
  })
})

app.get('/admin/stats', requireAdmin, (req, res) => {
  const totalUsers = users.size
  const totalVotes = votes.size
  const votedUsers = Array.from(users.values()).filter(u => u.votedAt).length
  const topCandidate = candidates.reduce((max, c) => c.votes > max.votes ? c : max, candidates[0])
  
  res.json({
    success: true,
    stats: {
      totalUsers,
      totalVotes,
      votedUsers,
      votingRate: totalUsers > 0 ? ((votedUsers / totalUsers) * 100).toFixed(2) : 0,
      topCandidate: topCandidate.name,
      topVotes: topCandidate.votes,
      candidateCount: candidates.length
    },
    timestamp: new Date()
  })
})

app.post('/admin/reset-votes', requireAdmin, (req, res) => {
  votes.clear()
  candidates.forEach(c => c.votes = 0)
  users.forEach(u => u.votedAt = null)
  
  console.log('✓ All votes reset')
  res.json({ success: true, message: 'All votes have been reset' })
})

// ============ ERROR HANDLING ============

app.use((err, req, res, next) => {
  console.error(`✗ Error: ${err.message}`)
  res.status(500).json({
    error: 'Internal server error',
    code: 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  })
})

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  })
})

// ============ START SERVER ============

app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════╗
║     VoteHub Backend Server Started      ║
╚════════════════════════════════════════╝
  
  Server: http://localhost:${port}
  Environment: ${process.env.NODE_ENV || 'development'}
  Admin Key Required: ${process.env.ADMIN_KEY ? 'Yes' : 'No (set ADMIN_KEY env var)'}
  
  Available Routes:
    POST   /register              - Create new user
    POST   /login                 - Login user
    POST   /logout                - Logout user
    GET    /candidates            - Get all candidates
    POST   /vote                  - Vote for candidate
    GET    /vote/status           - Check voting status
    GET    /results               - Get election results
    GET    /results/live          - Get live results
    GET    /admin/stats           - Get admin statistics
    POST   /admin/candidates      - Add new candidate
    POST   /admin/reset-votes     - Reset all votes
  `)
})

module.exports = app