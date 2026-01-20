/**
 * Risk Scoring Engine
 * Calculates a risk score (0-100) for an alert or incident.
 */

// Weights for different factors
const WEIGHTS = {
  RULE_LEVEL_MULTIPLIER: 6, // Level 15 * 6 = 90
  MITRE_CRITICAL_BONUS: 20, // Credential Access, Lateral Movement
  ASSET_SERVER_BONUS: 15,
  ASSET_WORKSTATION_BONUS: 5,
};

// MITRE Techniques that indicate high risk
const HIGH_RISK_TECHNIQUES = [
  'T1003', // Credential Dumping
  'T1110', // Brute Force
  'T1059', // Command and Scripting Interpreter
  'T1021', // Remote Services (Lateral Movement)
  'T1098', // Account Manipulation
  'T1543', // Create or Modify System Process
  'T1068', // Exploitation for Privilege Escalation
];

/**
 * Calculate Risk Score
 * @param {Object} alert - The raw alert object
 * @param {Object} context - Additional context (e.g., asset type, occurrence count)
 * @returns {Object} { score: number, bucket: string, reasons: string[] }
 */
function calculateRiskScore(alert, context = {}) {
  let score = 0;
  const reasons = [];

  // 1. Rule Level (Wazuh levels 0-15)
  // Level 12+ is usually critical in Wazuh.
  const level = alert.rule?.level || 1;
  const levelScore = level * WEIGHTS.RULE_LEVEL_MULTIPLIER;
  score += levelScore;
  reasons.push(`Base severity level ${level} (+${levelScore})`);

  // 2. MITRE Technique Analysis
  const mitreId = alert.mitre?.id?.[0] || alert.rule?.mitre?.id?.[0]; // Handle various JSON structures
  if (mitreId && HIGH_RISK_TECHNIQUES.some(t => mitreId.includes(t))) {
    score += WEIGHTS.MITRE_CRITICAL_BONUS;
    reasons.push(`High-risk MITRE Technique detected: ${mitreId} (+${WEIGHTS.MITRE_CRITICAL_BONUS})`);
  }

  // 3. Asset Importance
  // Simple heuristic: "srv" or "prod" in name -> Server.
  const agentName = (alert.agent?.name || '').toLowerCase();
  if (agentName.includes('srv') || agentName.includes('prod') || agentName.includes('db')) {
    score += WEIGHTS.ASSET_SERVER_BONUS;
    reasons.push(`Critical Asset (Server) (+${WEIGHTS.ASSET_SERVER_BONUS})`);
  } else {
    score += WEIGHTS.ASSET_WORKSTATION_BONUS;
  }

  // 4. Frequency / Context (if provided)
  if (context.groupedCount && context.groupedCount > 5) {
      score += 10;
      reasons.push(`High Frequency (${context.groupedCount} occurrences) (+10)`);
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Determine Bucket
  let bucket = 'NOISE';
  if (score >= 80) bucket = 'CRITICAL';
  else if (score >= 50) bucket = 'HIGH';
  else if (score >= 30) bucket = 'MEDIUM';

  return {
    score: Math.round(score),
    bucket,
    reasons
  };
}

module.exports = { calculateRiskScore, HIGH_RISK_TECHNIQUES };
