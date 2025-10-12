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
