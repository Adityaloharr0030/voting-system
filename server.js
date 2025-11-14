const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Basic routes
app.get('/api/candidates', (req, res) => {
    const candidates = [
        { id: 1, name: 'John Doe', party: 'Party A' },
        { id: 2, name: 'Jane Smith', party: 'Party B' }
    ];
    res.json(candidates);
});

app.post('/api/vote', (req, res) => {
    const { candidateId, voterId } = req.body;
    // Add voting logic here
    res.json({ success: true, message: 'Vote recorded successfully' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
