const express = require('express');
const router = express.Router();
const correlationEngine = require('../logic/correlationEngine');

// Ingest Alert (Wazuh format)
router.post('/alerts', (req, res) => {
    let alert = req.body;

    // --- WAZUH INTEGRATION NORMALIZATION ---
    // Wazuh standard integration often wraps the alert in { payload: { ... } } or { data: { ... } }
    if (alert.payload) {
        alert = alert.payload;
    } else if (alert.data) {
        alert = alert.data;
    }

    // Sometimes the 'payload' is a JSON string (depending on how the script sends it)
    if (typeof alert === 'string') {
        try {
            alert = JSON.parse(alert);
        } catch (e) {
            console.error("Failed to parse alert string payload", e);
            return res.status(400).json({ error: 'Invalid JSON string payload' });
        }
    }
    // ---------------------------------------

    // Basic validation
    if (!alert || !alert.rule || (!alert.agent && !alert.predecoder)) {
        console.warn("Received invalid alert structure:", JSON.stringify(req.body).substring(0, 200));
        return res.status(400).json({ error: 'Invalid Wazuh alert format' });
    }

    // Agent name normalization (sometimes it's agent.name, sometimes it's just raw log)
    if (!alert.agent) alert.agent = { name: "unknown-agent", id: "000" };

    const incident = correlationEngine.processAlert(alert);
    res.status(200).json({ status: 'processed', incidentId: incident.id });
});

// Get Incidents (Dashboard Feed)
router.get('/incidents', (req, res) => {
    const { type } = req.query; // 'CRITICAL', 'HIGH', 'NOISE', 'ALL'
    let incidents = correlationEngine.getIncidents();

    if (type && type !== 'ALL') {
        incidents = incidents.filter(i => i.riskBucket === type);
    }

    res.json(incidents);
});

// Get Stats
router.get('/stats', (req, res) => {
    res.json(correlationEngine.getStats());
});

// Manual Action: Mark as Noise
router.post('/incidents/:id/action/noise', (req, res) => {
    // In a real app, we'd update the DB. 
    // Here we just find it in memory and update.
    const id = req.params.id;
    const incidents = correlationEngine.incidents;

    // Inefficient search for Map values, but fine for prototype
    for (let [key, val] of incidents) {
        if (val.id === id) {
            val.riskBucket = 'NOISE';
            val.isNoise = true;
            val.explanation = "Manually marked as noise by analyst.";
            return res.json({ success: true, incident: val });
        }
    }
    res.status(404).json({ error: 'Incident not found' });
});

// Purge All Data
router.post('/purge', (req, res) => {
    correlationEngine.clear();
    res.json({ success: true, message: 'All incidents purged.' });
});

module.exports = router;
