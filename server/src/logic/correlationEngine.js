const { calculateRiskScore } = require('./riskScoring');
const { isNoise } = require('./noiseFilter');
const { generateExplanation } = require('./explainability');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/incidents.json');

/**
 * Correlation Engine (Simulated)
 * 
 * INTERVIEW NOTE: strictly speaking, this module currently performs "Intelligent Aggregation"
 * (grouping similar alerts from the same source) rather than full multi-source "Correlation".
 * True correlation would link an SSH login on Server A with a Firewall drop on Router B.
 * 
 * This engine reduces alert volume and adds context (Risk Scoring).
 */
class CorrelationEngine {
    constructor() {
        this.incidents = new Map(); // Key: grouping_hash, Value: Incident Object
        this.windowSizeMs = 5 * 60 * 1000; // 5 minutes
        this.processedCount = 0;
        this.reducedCount = 0;
        this.lastHeartbeat = null;

        // Load persisted data on startup
        this.load();

        // Auto-save every 5 seconds (to avoid blocking on high throughput)
        setInterval(() => this.save(), 5000);
    }

    /**
     * Ingest a new alert
     * @param {Object} alert 
     */
    processAlert(alert) {
        this.processedCount++;
        this.lastHeartbeat = Date.now();

        // 1. Create a grouping hash
        // Group by: RuleID + AgentName (Simpler for now, to catch "spammy agent")
        // OR Group by: RuleID (to catch "spammy rule across fleet")
        // We will try a hybrid approach:
        // Key = RuleID + AgentName (Specific Incident)
        // Check if we should merge into a broader incident later?
        // For this task: Group equal alerts from same agent.
        const hash = `${alert.rule.id}-${alert.agent.name}`;

        const now = Date.now();
        let incident = this.incidents.get(hash);

        // Check if incident exists and is within the active window
        if (incident && (now - incident.lastSeen < this.windowSizeMs)) {
            // Update existing incident (Aggregation)
            incident.count++;
            incident.lastSeen = now;
            incident.alerts.push(alert);
            this.reducedCount++;
        } else {
            // Create new incident
            // If previous incident existed but timed out, we overwrite/archive it. 
            // In a real DB we'd save the old one. Here we might just overwrite for the 'Live Feed' view, 
            // or better, generate a NEW ID so the old one stays in history (if we had a history store).
            // For this memory model: We will just effectively restart the window.

            incident = {
                id: uuidv4(),
                hash: hash,
                startTime: now,
                lastSeen: now,
                ruleId: alert.rule.id,
                ruleName: alert.rule.description,
                agentName: alert.agent.name,
                level: alert.rule.level,
                mitre: alert.mitre || {},
                count: 1,
                alerts: [alert],
                isNoise: false
            };
            this.incidents.set(hash, incident);
        }

        // Apply Logic
        this.enrichIncident(incident);

        return incident;
    }

    enrichIncident(incident) {
        // 1. Noise Filter
        const noiseCheck = isNoise(incident.alerts[0], incident.count);
        incident.isNoise = noiseCheck.isNoise;
        incident.noiseReason = noiseCheck.reason;

        // 2. Risk Scoring
        const riskResult = calculateRiskScore(incident.alerts[0], { groupedCount: incident.count });
        incident.riskScore = riskResult.score;
        incident.riskBucket = incident.isNoise ? 'NOISE' : riskResult.bucket;
        incident.riskReasons = riskResult.reasons;

        // 3. Automated Analysis & Advice (Heuristic Expert System)
        // Note: Renamed from "AI" to be accurate for interviews.
        const explResult = generateExplanation({
            ruleName: incident.ruleName,
            technique: incident.mitre.id ? incident.mitre.id[0] : null,
            affectedAssets: [incident.agentName],
            count: incident.count,
            riskBucket: incident.riskBucket
        });

        incident.explanation = explResult.text;
        incident.aiAdvice = explResult.advice;
    }

    getIncidents() {
        // Convert Map to Array
        return Array.from(this.incidents.values()).sort((a, b) => b.lastSeen - a.lastSeen);
    }

    getStats() {
        return {
            processed: this.processedCount,
            reduced: this.reducedCount,
            lastHeartbeat: this.lastHeartbeat,
            reductionRate: this.processedCount ? ((this.reducedCount / this.processedCount) * 100).toFixed(1) : 0
        };
    }

    clear() {
        this.incidents.clear();
        this.processedCount = 0;
        this.reducedCount = 0;
        this.lastHeartbeat = null;
        this.save();
    }

    save() {
        try {
            const data = {
                incidents: Array.from(this.incidents.entries()),
                processedCount: this.processedCount,
                reducedCount: this.reducedCount
            };
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error("Failed to save incidents:", e.message);
        }
    }

    load() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE);
                const data = JSON.parse(raw);
                this.incidents = new Map(data.incidents || []);
                this.processedCount = data.processedCount || 0;
                this.reducedCount = data.reducedCount || 0;
                console.log(`[Persistence] Loaded ${this.incidents.size} incidents from disk.`);
            }
        } catch (e) {
            console.error("Failed to load incidents:", e.message);
        }
    }
}

module.exports = new CorrelationEngine();
