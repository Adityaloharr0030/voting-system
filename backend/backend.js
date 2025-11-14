// Simple backend placeholder - if you need to run a Node backend
// Note: this repository now primarily runs as a frontend-only app.
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ status: 'Backend placeholder running' });
});

app.listen(port, () => console.log(`Backend placeholder listening on ${port}`));