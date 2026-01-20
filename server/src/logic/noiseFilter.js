/**
 * Noise Filter Logic
 * Determines if an alert should be suppressed immediately.
 */

const NOISE_RULES = [
    // Rule 1: Low level single event
    (alert) => {
        if (alert.rule?.level <= 3) return { isNoise: true, reason: 'Low severity rule (Level <= 3)' };
        return null;
    },
    // Rule 2: Specific noisy rules (examples)
    (alert) => {
        const noisyIds = ['5715', '1002']; // Example: SSH successful login (sometimes noise), etc.
        if (noisyIds.includes(alert.rule?.id)) return { isNoise: true, reason: 'Known noisy rule ID' };
        return null;
    }
];

function isNoise(alert, frequency = 1) {
    // 1. Check hardcoded logic
    for (const rule of NOISE_RULES) {
        const result = rule(alert);
        if (result && result.isNoise) return result;
    }

    // 2. Frequency check (if same low/mid alert fires 100 times, maybe noise? Or maybe attack?)
    // In this logic, we keep it simple: Very high frequency of LOW level is noise.
    if (frequency > 20 && alert.rule?.level < 6) {
        return { isNoise: true, reason: 'High frequency low-severity' };
    }

    return { isNoise: false, reason: null };
}

module.exports = { isNoise };
