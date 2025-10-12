const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const DB_FILE = path.join(__dirname, 'db.json')
function readDb() { try { return JSON.parse(fs.readFileSync(DB_FILE,'utf8')) } catch (e) { return { users: [], candidates: [], votes: [] } } }
function writeDb(d) { fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2), 'utf8') }

async function seed() {
  const db = readDb()
  db.users = db.users || []
  if (db.users.find(u => u.username === 'admin')) { console.log('admin exists'); return }
  const hashed = await bcrypt.hash('admin123', 10)
  const admin = { id: String(db.users.length + 1), username: 'admin', email: 'admin@example.com', password: hashed, role: 'admin', hasVoted: false }
  db.users.push(admin)
  writeDb(db)
  console.log('admin seeded: admin / admin123')
}

seed()
