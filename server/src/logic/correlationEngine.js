const { calculateRiskScore } = require('./riskScoring');
const { isNoise } = require('./noiseFilter');
const { generateExplanation } = require('./explainability');
const { v4: uuidv4 } = require('uuid');

class CorrelationEngine {
    constructor() {
        this.incidents = new Map(); // Key: grouping_hash, Value: Incident Object
        this.windowSizeMs = 5 * 60 * 1000; // 5 minutes
        this.processedCount = 0;
        this.reducedCount = 0;
        this.lastHeartbeat = null;
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

        if (incident && (now - incident.lastSeen < this.windowSizeMs)) {
            // Update existing incident
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

        // 3. Explanation & AI Agent
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
    }
}

module.exports = new CorrelationEngine();
