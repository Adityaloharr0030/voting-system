# VoteHub — Static demo

This repository includes a small, static frontend demo for a voting app (VoteHub). The demo stores data in your browser's LocalStorage so no backend is required to try it.

Files you can open in your browser (after serving the folder):
- `index.html` — voting page (requires login)
- `login.html` — login page
- `register.html` — new user registration
- `results.html` — live results chart (uses Chart.js CDN)
- `admin.html` — admin panel (requires the admin user)

Quick start (serve the folder locally)

PowerShell (recommended):

```powershell
# from the repo root
# Install a tiny static server if you don't have one (optional):
# npm i -g serve
# Then run (or use any static server / Live Server extension):
serve . -p 3000
```

Or use npx (no install):

```powershell
npx serve . -p 3000
```

Open http://localhost:3000/login.html in your browser.

Seeding demo data

To populate demo users and candidates run the seeder. In the browser console execute:

```js
import('./seed.js')
```

This creates three users:
- alice@example.com / password
- bob@example.com / password
- admin@example.com / adminpass (admin privileges)

After seeding you can log in using the above credentials. Optionally uncomment the line in `seed.js` that creates a session to be logged in automatically.

Notes & troubleshooting

- Data is stored in LocalStorage keys: `LS_USERS`, `LS_CANDIDATES`, `LS_VOTES`, `LS_SESSION`, `LS_ADMIN`.
- If pages appear blank, open DevTools (F12) → Console and share any errors; the app is intentionally module-free and works with plain static hosting.
- Password hashing in the demo is intentionally simple and NOT secure — this project is for demonstration only.

If you want me to run the static server here and verify the UI, tell me and I'll start it and open the key pages.
# Voting App (Vite + React)

This is a minimal Vite + React setup to run the Voting UI.

Quick start:

1. Install dependencies

```powershell
cd 'C:\Users\ADITYA\vs'
npm install
```

2. Run the dev server

```powershell
npm run dev
```

3. Open the URL shown by Vite (usually http://localhost:5173)

Notes:
- The API base URL is read from `VITE_API_BASE` in `.env`.
- `src/VotingApp.jsx` contains a small mock login button to set a token for quick testing.
- If you want a production build: `npm run build` and `npm run preview`.

Documentation:

- Full guide: `docs/ONLINE_VOTING_FRONTEND_WITH_N8N.md` — complete architecture, examples, and setup instructions for connecting the frontend to an n8n backend.
