const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_URL = 'http://localhost:5000/api/alerts';
const TOTAL_ALERTS_TO_SEND = 50; // Batch size
const DELAY_MS = 200; // Speed of flood

// Realistic Data Pools
const AGENTS = ['web-srv-01', 'db-prod-02', 'workstation-hr-05', 'workstation-dev-09', 'backup-srv-01'];

const RULES = [
    { id: '5715', level: 3, description: 'SSHD authentication success', mitre: {} }, // Noise
    { id: '5710', level: 5, description: 'SSHD attempt to login to invalid user', mitre: { id: ['T1110'] } },
    { id: '5501', level: 12, description: 'PAM: User login failed', mitre: { id: ['T1110'] } },
    { id: '1002', level: 2, description: 'Unknown problem somewhere in the system.', mitre: {} },
    { id: '9001', level: 14, description: 'Mimikatz credential dumping detected', mitre: { id: ['T1003'] } }, // Critical
    { id: '9002', level: 10, description: 'PowerShell execution with encoded command', mitre: { id: ['T1059.001'] } }, // High
    { id: '9003', level: 13, description: 'Possible lateral movement via SMB', mitre: { id: ['T1021.002'] } } // Critical
];

const generateAlert = () => {
    // Pick random rule
    const rule = RULES[Math.floor(Math.random() * RULES.length)];
    // Pick random agent
    const agentName = AGENTS[Math.floor(Math.random() * AGENTS.length)];

    return {
        timestamp: new Date().toISOString(),
        rule: {
            id: rule.id,
            level: rule.level,
            description: rule.description,
            mitre: rule.mitre
        },
        agent: {
            id: '001',
            name: agentName,
            ip: '192.168.1.10'
        },
        src_ip: '10.0.0.50',
        id: uuidv4(),
        mitre: rule.mitre // Sometimes raw wazuh puts it here too
    };
};

const sendAlert = async () => {
    const alert = generateAlert();
    try {
        await axios.post(API_URL, alert);
        process.stdout.write('.'); // Progress dot
    } catch (e) {
        console.error('Error sending alert:', e.message);
    }
};

const runSimulation = async () => {
    console.log(`Starting simulation: Sending ${TOTAL_ALERTS_TO_SEND} alerts to ${API_URL}...`);

    for (let i = 0; i < TOTAL_ALERTS_TO_SEND; i++) {
        await sendAlert();
        await new Promise(r => setTimeout(r, DELAY_MS));
    }

    console.log('\nSimulation complete.');
};

runSimulation();
