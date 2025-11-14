const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 8000;
const bindHost = process.env.HOST || '0.0.0.0'; // listen on all interfaces by default

const root = path.resolve(__dirname);
app.use(express.static(root));
app.get('/', (req, res) => res.sendFile(path.join(root, 'index.html')));

const server = app.listen(port, bindHost, () => {
  console.log(`Static server running on http://${bindHost}:${port}`);
  // print friendly URLs for localhost and detected network interfaces
  console.log(`Local: http://localhost:${port}`);
  try {
    const os = require('os');
    const nets = os.networkInterfaces();
    Object.keys(nets).forEach(name => {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`Network: http://${net.address}:${port}`);
        }
      }
    });
  } catch (e) {
    // ignore
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
