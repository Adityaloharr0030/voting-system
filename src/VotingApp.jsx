import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'
// Enable mock mode by setting VITE_USE_MOCK=true or by explicitly setting VITE_API_BASE to 'mock' or ''
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || API_BASE === '' || API_BASE === 'mock'

// Mock data used when no API base is provided or mock mode is enabled
const MOCK_CANDIDATES = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Carol' }
]

function VotingApp() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [candidates, setCandidates] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const pollRef = useRef(null)

  useEffect(() => {
    if (token) fetchCandidates()
    // Start/stop polling for results when token changes
    if (token) startPolling()
    else stopPolling()
    return () => stopPolling()
  }, [token])

  // POLLING
  function startPolling() {
    if (pollRef.current) return
    pollRef.current = setInterval(() => fetchResults(), 3000)
  }
  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  // API helpers (use mock when API_BASE is empty)
  async function fetchCandidates() {
    setLoading(true)
    try {
      if (USE_MOCK) {
        // mock
        setCandidates(MOCK_CANDIDATES)
        return
      }
      const res = await axios.get(`${API_BASE}/candidates`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setCandidates(res.data || [])
    } catch (err) {
      console.error('fetchCandidates', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchResults() {
    try {
      if (USE_MOCK) {
        // derive mock results
        setResults(MOCK_CANDIDATES.map(c => ({ ...c, votes: Math.floor(Math.random() * 100) })))
        return
      }
      const res = await axios.get(`${API_BASE}/results`)
      setResults(res.data || [])
    } catch (err) {
      console.error('fetchResults', err)
    }
  }

  async function vote(candidateId) {
    try {
      if (USE_MOCK) {
        alert('Mock vote recorded for candidate ' + candidateId)
        return
      }
      const res = await axios.post(`${API_BASE}/vote`, { candidateId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data && res.data.success) alert('Vote cast!')
    } catch (err) {
      console.error('vote', err)
      alert('Vote failed')
    }
  }

  async function handleAuth(e) {
    e.preventDefault()
    try {
      if (USE_MOCK) {
        // Mock auth: accept any credentials and set a dummy token
        const t = 'mock-token-' + Date.now()
        localStorage.setItem('token', t)
        setToken(t)
        return
      }
      const url = mode === 'login' ? `${API_BASE}/login` : `${API_BASE}/register`
      const payload = mode === 'login' ? { username, password } : { username, password, email }
      const res = await axios.post(url, payload)
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token)
        setToken(res.data.token)
      } else {
        alert(res.data.error || 'Auth failed')
      }
    } catch (err) {
      console.error('auth', err)
      alert('Authentication error')
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setCandidates([])
    setResults([])
  }

  // UI
  return (
    <div>
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Voting System</h1>
        {token && <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Logout</button>}
      </header>

      {!token ? (
        <div className="card p-3 mb-4" style={{ maxWidth: 480 }}>
          <h4>{mode === 'login' ? 'Login' : 'Register'}</h4>
          <form onSubmit={handleAuth}>
            <div className="mb-2">
              <input className="form-control" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="mb-2">
              <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {mode === 'register' && (
              <div className="mb-2">
                <input type="email" className="form-control" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            )}
            <div className="d-flex gap-2">
              <button className="btn btn-primary" type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
              <button type="button" className="btn btn-link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create an account' : 'Have an account? Login'}</button>
            </div>
          </form>
          {USE_MOCK && <small className="text-muted">Running in mock mode (no API configured)</small>}
        </div>
      ) : (
        <div>
          <div className="row">
            <div className="col-md-6">
              <div className="card p-3 mb-3">
                <h4>Candidates</h4>
                {loading ? <p>Loading...</p> : candidates.length === 0 ? <p>No candidates.</p> : (
                  <ul className="list-group">
                    {candidates.map(c => (
                      <li key={c.id || c.name} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{c.name}</strong>
                          <div className="text-muted">{c.party || ''}</div>
                        </div>
                        <div>
                          <button className="btn btn-sm btn-success me-2" onClick={() => vote(c.id)}>Vote</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="card p-3 mb-3">
                <h4>Live Results</h4>
                {results.length === 0 ? <p>No results yet. Polling every 3s.</p> : (
                  <ul className="list-group">
                    {results.map(r => (
                      <li key={r.id || r.name} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <span>{r.name}</span>
                          <span className="badge bg-primary rounded-pill">{r.votes ?? 0}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VotingApp
