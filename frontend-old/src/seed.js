// Demo seeder for VoteHub (browser-safe).
// Usage: open any page in the app and run `import('./seed.js')` in the browser console
// or add <script src="seed.js"></script> temporarily to a page and reload it once.
(function(){
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
    return h.toString();
  }

  const users = [
    { id: '1', name: 'Alice', email: 'alice@example.com', password: 'password' },
    { id: '2', name: 'Bob', email: 'bob@example.com', password: 'password' },
    { id: 'admin', name: 'Admin', email: 'admin@example.com', password: 'adminpass' }
  ].map(u => ({ id: u.id, name: u.name, email: u.email, passwordHash: hash(u.password), hasVoted: false }));

  localStorage.setItem('LS_USERS', JSON.stringify(users));
  localStorage.setItem('LS_ADMIN', JSON.stringify({ userId: 'admin', isAdmin: true }));
  localStorage.setItem('LS_CANDIDATES', JSON.stringify([
    { id: 'c1', name: 'Candidate 1' },
    { id: 'c2', name: 'Candidate 2' },
    { id: 'c3', name: 'Candidate 3' }
  ]));
  localStorage.setItem('LS_VOTES', JSON.stringify([]));
  // Convenience: set session for Admin so the admin.html can be opened directly if desired
  // Comment out the next line if you prefer to login manually after seeding
  // localStorage.setItem('LS_SESSION', JSON.stringify({ userId: 'admin', createdAt: Date.now() }));

  console.log('VoteHub demo data seeded. Admin: admin@example.com / adminpass');
  try {
    // In headless browsers (puppeteer) navigator.webdriver is true — avoid blocking alerts
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      // do not show alert when running automated tests
    } else {
      alert('Demo data seeded! Admin login: admin@example.com / adminpass');
    }
  } catch (e) {
    // ignore; some environments don't expose navigator
  }
})();
