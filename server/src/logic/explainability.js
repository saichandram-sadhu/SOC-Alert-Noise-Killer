/**
 * Explainability Generator
 * Generates natural language explanations and AI advice for SOC analysts.
 */

function generateExplanation(incident) {
    const { ruleName, description, technique, affectedAssets, count, riskBucket } = incident;

    // 1. Basic Narrative
    let explanation = `This incident triggered the rule "${ruleName || 'Unknown Rule'}" `;
    if (count > 1) {
        explanation += `and was observed ${count} times within a short time window. `;
    } else {
        explanation += `once. `;
    }

    if (riskBucket === 'CRITICAL') {
        explanation += `It is marked CRITICAL due to potential high impact. `;
    }

    // 2. AI Advice Logic (Heuristic based)
    const lowerRule = (ruleName || "").toLowerCase();
    let advice = {
        falsePositive: [],
        truePositive: []
    };

    // Common Scenarios
    if (lowerRule.includes('ssh') || lowerRule.includes('login') || lowerRule.includes('authentication')) {
        advice.falsePositive.push("User forgot password or capsule key.");
        advice.falsePositive.push("Admin script running scheduled task with wrong creds.");
        advice.truePositive.push("High frequency (10+ attempts) in < 1 minute.");
        advice.truePositive.push("Source IP is external or unknown geography.");
    } else if (lowerRule.includes('malware') || lowerRule.includes('trojan') || lowerRule.includes('virus')) {
        advice.falsePositive.push("Security scanner testing antivirus signatures.");
        advice.falsePositive.push("User downloaded a known safe 'hacktool' for testing.");
        advice.truePositive.push("File path is in a temporary or system directory (e.g., AppData, /tmp).");
        advice.truePositive.push("Process spawned a network connection immediately after.");
    } else if (lowerRule.includes('configuration') || lowerRule.includes('policy')) {
        advice.falsePositive.push("Authorized system update or patch.");
        advice.falsePositive.push("DevOps deployment pipeline changes.");
        advice.truePositive.push("Change happened outside of maintenance window.");
        advice.truePositive.push("Critical security control (Firewall/SELinux) disabled.");
    } else {
        // Generic fallbacks
        advice.falsePositive.push("Scheduled maintenance activity.");
        advice.falsePositive.push("Known harmless application behavior.");
        advice.truePositive.push("Activity is anomalous for this specific user/host.");
        advice.truePositive.push("Correlated with other alerts in the same timeframe.");
    }

    return {
        text: explanation,
        advice: advice
    };
}

module.exports = { generateExplanation };
