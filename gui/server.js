const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname)); // serve index.html from this folder

// Traffic Light route
app.post('/change-light', async (req, res) => {
  const { exec } = require('child_process');

  // TEMP: ignore the status for now, just run the client
  exec(`node ../traffic-light/client.js`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ message: 'Traffic service failed' });
    }
    res.json({ message: stdout.trim().split('\n')[0] || 'Light updated.' });
  });
});

// Parking route
app.post('/check-parking', async (req, res) => {
  const { exec } = require('child_process');

  const location = req.body.location;

  exec(`node ../parking/client.js ${location}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ message: 'Parking service failed' });
    }

    const match = stdout.match(/Available spots at .+: (\d+)/);
    const available_spots = match ? parseInt(match[1]) : 0;
    res.json({ available_spots });
  });
});

// Transport route
app.post('/bus-update', async (req, res) => {
  const { exec } = require('child_process');

  const status = req.body.status;

  // runs the transport client with dynamic status (bus_id and location are fixed for demo)
  // wraps all args in quotes to support values with spaces like "On Time"
  exec(`node ../transport/client.js "E1" "Stop A" "${status}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ message: 'Transport service failed' });
    }

    res.json({ message: stdout.trim().split('\n')[0] });
  });
});

app.listen(PORT, () => {
  console.log(`GUI Server running on http://localhost:${PORT}`);
});
