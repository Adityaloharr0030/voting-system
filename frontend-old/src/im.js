// Consolidated frontend helper script for the non-React variant
// CONFIGURABLE ENDPOINTS
const API_BASE = 'https://your-n8n-domain.com/webhook'; // Update to real URL or use a build-time env variable

// Token management (localStorage for simplicity)
function setToken(token) { localStorage.setItem('sessionToken', token); }
function getToken() { return localStorage.getItem('sessionToken'); }
function clearToken() { localStorage.removeItem('sessionToken'); }

// Show notification
function notify(msg, type='info') {
  const container = document.getElementById('notification')
  if (!container) return console.warn('No #notification element')
  container.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`
  setTimeout(() => { container.innerHTML = ''; }, 3000)
}

// Registration/Login (placeholders - wire inputs before calling)
async function register({username, password, email}) {
  if (!username || !password) return notify('Username and password required', 'danger')
  try {
    const resp = await fetch(`${API_BASE}/register`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, password, email })
    })
    const data = await resp.json()
    if (resp.ok && data.token) { setToken(data.token); notify('Registered', 'success'); }
    else notify(data.error || 'Registration failed', 'danger')
  } catch (err) { console.error(err); notify('Network error', 'danger') }
}

async function login({username, password}) {
  if (!username || !password) return notify('Username and password required', 'danger')
  try {
    const resp = await fetch(`${API_BASE}/login`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, password })
    })
    const data = await resp.json()
    if (resp.ok && data.token) { setToken(data.token); notify('Logged in', 'success') }
    else notify(data.error || 'Login failed', 'danger')
  } catch (err) { console.error(err); notify('Network error', 'danger') }
}

// Fetch candidates & render (renderCandidates should be provided by the page)
async function fetchCandidates() {
  try {
    const resp = await fetch(`${API_BASE}/candidates`, { headers: { 'Authorization': 'Bearer ' + getToken() } })
    const data = await resp.json()
    if (typeof renderCandidates === 'function') renderCandidates(data)
  } catch (err) { console.error(err); notify('Failed to load candidates', 'danger') }
}

// Voting
async function vote(candidateId) {
  try {
    const resp = await fetch(`${API_BASE}/vote`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId })
    })
    const data = await resp.json()
    if (resp.ok && data.success) notify('Vote cast!', 'success')
    else notify(data.error || 'Vote failed', 'danger')
  } catch (err) { console.error(err); notify('Network error', 'danger') }
}

// Live results (Polling)
let resultsInterval = null
function startResultsPolling(intervalMs = 3000) {
  stopResultsPolling()
  resultsInterval = setInterval(async () => {
    try {
      const resp = await fetch(`${API_BASE}/results`)
      const data = await resp.json()
      if (typeof renderResults === 'function') renderResults(data)
    } catch (err) { console.error('poll error', err) }
  }, intervalMs)
}
function stopResultsPolling() { if (resultsInterval) { clearInterval(resultsInterval); resultsInterval = null } }

// Admin: Candidate CRUD
async function addCandidate(name) {
  if (!name) return notify('Name is required', 'danger')
  try {
    const resp = await fetch(`${API_BASE}/admin/candidates`, {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    const data = await resp.json()
    if (resp.ok && data.success) notify('Candidate added', 'success')
    else notify(data.error || 'Failed to add candidate', 'danger')
  } catch (err) { console.error(err); notify('Network error', 'danger') }
}

// Expose small API on window for legacy pages
window.VotingAPI = {
  setToken, getToken, clearToken,
  notify, register, login, fetchCandidates, vote, startResultsPolling, stopResultsPolling, addCandidate
}

// --- Tailwind renderers and wiring ---
function renderCandidates(candidates = [], hasVoted = false) {
  const grid = document.getElementById('candidate-grid')
  if (!grid) return
  grid.innerHTML = ''
  candidates.forEach(c => {
    const card = document.createElement('div')
    card.className = 'rounded-lg border shadow-sm p-4 flex flex-col'
    card.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold">
          ${c.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p class="font-medium">${c.name}</p>
          <p class="text-xs text-gray-500">ID: ${c.id}</p>
        </div>
      </div>
      <button ${hasVoted ? 'disabled' : ''}
        data-id="${c.id}"
        class="mt-4 inline-flex items-center justify-center rounded-lg ${hasVoted ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} px-4 py-2.5 text-white">
        ${hasVoted ? 'Already voted' : 'Vote'}
      </button>
    `
    grid.appendChild(card)
  })
  grid.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await vote(btn.getAttribute('data-id'))
      await fetchCandidates()
      await loadResults()
    })
  })
}

async function loadResults() {
  try {
    const resp = await fetch(`${API_BASE}/results`)
    const data = await resp.json()
    renderResults(data)
  } catch (err) { console.error(err); notify('Failed to load results', 'danger') }
}

function renderResults(results = []) {
  const list = document.getElementById('results-list')
  if (!list) return
  list.innerHTML = ''
  const max = Math.max(...results.map(r => r.votes || 0), 1)
  results.forEach(r => {
    const pct = Math.round((r.votes / max) * 100)
    const row = document.createElement('div')
    row.className = 'flex items-center gap-3'
    row.innerHTML = `
      <div class="w-40 shrink-0 font-medium">${r.name}</div>
      <div class="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div class="bg-blue-600 h-3" style="width:${pct}%"></div>
      </div>
      <div class="w-16 text-right text-sm text-gray-700">${r.votes}</div>
    `
    list.appendChild(row)
  })
  const el = document.getElementById('results-last-updated')
  if (el) el.textContent = 'Updated: ' + new Date().toLocaleTimeString()
}

function renderAdminCandidates(candidates = []) {
  const container = document.getElementById('admin-candidate-table')
  if (!container) return
  const table = document.createElement('table')
  table.className = 'min-w-full text-sm'
  table.innerHTML = `
    <thead class="bg-gray-50 text-gray-600">
      <tr>
        <th class="text-left font-medium px-3 py-2">ID</th>
        <th class="text-left font-medium px-3 py-2">Name</th>
        <th class="text-left font-medium px-3 py-2">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y">
      ${candidates.map(c => `
        <tr>
          <td class="px-3 py-2">${c.id}</td>
          <td class="px-3 py-2">${c.name}</td>
          <td class="px-3 py-2">
            <button data-id="${c.id}" class="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700">Remove</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `
  container.innerHTML = ''
  container.appendChild(table)
  container.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await removeCandidate(btn.getAttribute('data-id'))
      await loadAdmin()
    })
  })
}

// Minimal admin helpers
async function loadAdmin() {
  try {
    const resp = await fetch(`${API_BASE}/admin/candidates`, { headers: { 'Authorization': 'Bearer ' + getToken() } })
    const data = await resp.json()
    renderAdminCandidates(data || data.candidates || [])
  } catch (err) { console.error(err); notify('Failed to load admin list', 'danger') }
}

async function removeCandidate(id) {
  try {
    const resp = await fetch(`${API_BASE}/admin/candidates/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + getToken() } })
    const data = await resp.json()
    if (resp.ok && data.success) notify('Removed', 'success')
    else notify(data.error || 'Remove failed', 'danger')
  } catch (err) { console.error(err); notify('Failed to remove', 'danger') }
}

// Form handlers and navigation
function showSection(id) {
  ['auth-section','vote-section','results-section','admin-section'].forEach(sec => {
    const el = document.getElementById(sec)
    if (!el) return
    el.classList.toggle('hidden', sec !== id)
  })
}

function wireDom() {
  document.getElementById('nav-login')?.addEventListener('click', () => showSection('auth-section'))
  document.getElementById('nav-vote')?.addEventListener('click', () => { showSection('vote-section'); fetchCandidates(); })
  document.getElementById('nav-results')?.addEventListener('click', () => { showSection('results-section'); loadResults(); startResultsPolling() })
  document.getElementById('nav-admin')?.addEventListener('click', () => { showSection('admin-section'); loadAdmin() })

  // Login form
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const u = document.getElementById('login-username').value.trim()
    const p = document.getElementById('login-password').value
    toggleLoading('login', true)
    await login({ username: u, password: p })
    toggleLoading('login', false)
  })

  // Register form
  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const u = document.getElementById('reg-username').value.trim()
    const em = document.getElementById('reg-email').value.trim()
    const p = document.getElementById('reg-password').value
    toggleLoading('register', true)
    await register({ username: u, password: p, email: em })
    toggleLoading('register', false)
  })

  document.getElementById('refresh-candidates')?.addEventListener('click', () => fetchCandidates())

  document.getElementById('admin-add-candidate')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = document.getElementById('admin-candidate-name').value.trim()
    await addCandidate(name)
    document.getElementById('admin-candidate-name').value = ''
    await loadAdmin()
  })

  document.getElementById('admin-refresh')?.addEventListener('click', () => loadAdmin())
  document.getElementById('admin-download-report')?.addEventListener('click', () => { alert('Report download not implemented in mock') })
}

function toggleLoading(prefix, loading) {
  document.getElementById(`${prefix}-btn-text`)?.classList.toggle('hidden', loading)
  document.getElementById(`${prefix}-spinner`)?.classList.toggle('hidden', !loading)
}

// Initialize wiring on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  wireDom()
  // If a token exists, show the vote section
  if (getToken()) {
    showSection('vote-section')
    fetchCandidates()
    startResultsPolling()
  }
})

