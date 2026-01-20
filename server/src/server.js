const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const alertRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Wazuh alerts can be large

// Health Check
app.get('/api/health', (req, res) => {
    res.send('Wazuh SOC Alert Noise Killer API is running...');
});

// System Info (IP Detection)
const os = require('os');
app.get('/api/system/info', (req, res) => {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const k in interfaces) {
        for (const k2 in interfaces[k]) {
            const address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push({ name: k, ip: address.address });
            }
        }
    }
    res.json({ ips: addresses });
});

// API Routes
// API Routes
app.use('/api', alertRoutes);

// Serve Static Frontend (Production)
const path = require('path');
const CLIENT_BUILD_PATH = path.join(__dirname, '../public');

app.use(express.static(CLIENT_BUILD_PATH));

// Explicit Root Route (No Cache)
app.get('/', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

// React Router Catch-All
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Endpoint: http://0.0.0.0:${PORT}/api/alerts`);

    // Auto-open browser on Windows
    if (process.platform === 'win32') {
        const { exec } = require('child_process');
        exec(`start http://localhost:${PORT}`);
    }
});
