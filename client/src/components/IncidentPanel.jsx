import React from 'react';
import { Shield, Clock, Map, CheckCircle, XCircle, AlertTriangle, Server, ArrowRight, Zap, Play, Database, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import RiskGauge from './RiskGauge';
import AttackTimeline from './AttackTimeline';

const IncidentPanel = ({ incident, onMarkNoise }) => {
    if (!incident) return (
        <div className="flex items-center justify-center h-full flex-col gap-4 text-[var(--text-muted)] animate-pulse">
            <div className="p-8 rounded-full bg-[var(--bg-hover)] border border-[var(--border-color)]">
                <Shield size={64} strokeWidth={0.5} style={{ opacity: 0.3 }} />
            </div>
            <p className="mono text-xs tracking-widest opacity-50">SYSTEM IDLE // SELECT SIGNAL</p>
        </div>
    );

    const {
        id, ruleName, explanation, riskScore, riskBucket,
        riskReasons, mitre, agentName, count, startTime, lastSeen, isNoise
    } = incident;

    const color =
        riskBucket === 'CRITICAL' ? 'var(--color-critical)' :
            riskBucket === 'HIGH' ? 'var(--color-high)' :
                riskBucket === 'MEDIUM' ? 'var(--color-medium)' : 'var(--color-noise)';

    // Enterprise "If Ignored" Logic (Mock)
    const outcome = riskBucket === 'CRITICAL' ? "Data Exfiltration or Ransomware Deployment" : "Potential Lateral Movement";

    return (
        <motion.div
            key={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col relative"
            style={{ padding: '0' }}
        >
            {/* Top Bar: Identity */}
            <header className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] backdrop-blur-md sticky top-0 z-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border`}
                            style={{ borderColor: color, color: color, background: `${color}10` }}>
                            {riskBucket} - L3
                        </span>
                        <span className="mono text-[var(--text-muted)] text-xs">INCIDENT-{id.substring(0, 8)}</span>
                    </div>
                    <h1 className="text-xl md:text-2xl text-white font-bold leading-tight tracking-tight shadow-black drop-shadow-lg">
                        {ruleName}
                    </h1>
                </div>
                {/* Actions Top Right */}
                {!isNoise && (
                    <div className="hidden md:flex gap-3">
                        <button onClick={() => onMarkNoise(id)} className="px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-secondary)] transition-colors rounded">
                            SUPPRESS
                        </button>
                        <button className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[#0099ee] text-black text-xs font-bold rounded flex items-center gap-2 shadow-[0_0_15px_-3px_var(--color-accent)]">
                            <Database size={14} /> INVESTIGATE
                        </button>
                    </div>
                )}
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                {/* High Density Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">

                    {/* Left: Visuals (Gauge + Timeline) */}
                    <div className="md:col-span-4 flex flex-col gap-6">
                        <div className="glass-card p-6 rounded flex flex-col items-center justify-center bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-main)]">
                            <RiskGauge score={riskScore} />
                        </div>

                        <div className="glass-card p-6 rounded flex-1">
                            <AttackTimeline incident={incident} />
                        </div>
                    </div>

                    {/* Right: Analysis & Context */}
                    <div className="md:col-span-8 flex flex-col gap-6">

                        {/* The Decisive Analysis */}
                        <div className="glass-card p-0 rounded overflow-hidden border-l-4" style={{ borderLeftColor: color }}>
                            <div className="p-3 bg-[var(--bg-hover)] border-b border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={14} className={riskScore > 70 ? "text-[var(--color-critical)] animate-pulse" : "text-[var(--color-accent)]"} fill="currentColor" />
                                    AI Threat Analysis
                                </span>
                                <span className="mono text-[10px] text-[var(--text-muted)]">CONFIDENCE: 92%</span>
                            </div>
                            <div className="p-5">
                                <p className="text-sm md:text-base leading-relaxed text-[var(--text-primary)]">
                                    {explanation}
                                </p>
                            </div>

                            {/* AI Hints */}
                            <div className="grid grid-cols-2 border-t border-[var(--border-color)]">
                                <div className="p-4 border-r border-[var(--border-color)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,51,102,0.05)] transition-colors">
                                    <h5 className="text-[10px] font-bold uppercase text-[var(--color-critical)] mb-2 flex items-center gap-2">
                                        <AlertTriangle size={12} /> Attack Indicators
                                    </h5>
                                    <ul className="space-y-1">
                                        {incident.aiAdvice?.truePositive?.map((tp, i) => (
                                            <li key={i} className="text-xs text-[var(--text-secondary)] flex gap-2">
                                                <span className="text-[var(--color-critical)]">•</span> {tp}
                                            </li>
                                        )) || <li className="text-xs text-[var(--text-muted)] italic">None detected</li>}
                                    </ul>
                                </div>
                                <div className="p-4 bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(51,204,255,0.05)] transition-colors">
                                    <h5 className="text-[10px] font-bold uppercase text-[var(--color-low)] mb-2 flex items-center gap-2">
                                        <CheckCircle size={12} /> False Positive Checks
                                    </h5>
                                    <ul className="space-y-1">
                                        {incident.aiAdvice?.falsePositive?.map((fp, i) => (
                                            <li key={i} className="text-xs text-[var(--text-secondary)] flex gap-2">
                                                <span className="text-[var(--color-low)]">•</span> {fp}
                                            </li>
                                        )) || <li className="text-xs text-[var(--text-muted)] italic">None detected</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Context Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-card p-4 rounded text-center hover:border-[var(--color-accent)] transition-colors cursor-default">
                                <div className="text-[10px] uppercase text-[var(--text-muted)] font-bold mb-1">Target Host</div>
                                <div className="text-sm mono text-[var(--color-accent)] flex justify-center items-center gap-2">
                                    <Server size={14} /> {agentName}
                                </div>
                            </div>
                            <div className="glass-card p-4 rounded text-center hover:border-[var(--color-accent)] transition-colors cursor-default">
                                <div className="text-[10px] uppercase text-[var(--text-muted)] font-bold mb-1">MITRE T-ID</div>
                                <div className="text-sm mono text-[var(--text-primary)] flex justify-center items-center gap-2">
                                    <Map size={14} /> {mitre?.id?.[0] || 'T-Unknown'}
                                </div>
                            </div>
                            <div className="glass-card p-4 rounded text-center hover:border-[var(--color-accent)] transition-colors cursor-default">
                                <div className="text-[10px] uppercase text-[var(--text-muted)] font-bold mb-1">Count</div>
                                <div className="text-sm mono text-[var(--text-primary)] flex justify-center items-center gap-2">
                                    # {count}
                                </div>
                            </div>
                            <div className="glass-card p-4 rounded text-center hover:border-[var(--color-accent)] transition-colors cursor-default">
                                <div className="text-[10px] uppercase text-[var(--text-muted)] font-bold mb-1">First Seen</div>
                                <div className="text-xs mono text-[var(--text-secondary)]">
                                    {new Date(startTime).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>

                        {/* "If Ignored" Section - The Analyst Mindset */}
                        {!isNoise && (
                            <div className="glass-card p-4 rounded border border-[var(--color-high)]/30 bg-[rgba(255,102,0,0.02)]">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 bg-[var(--color-high)]/10 rounded text-[var(--color-high)]">
                                        <Lock size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-[var(--color-high)] mb-1">Projected Impact If Ignored</h4>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            This alert pattern typically leads to <span className="text-[var(--text-primary)] font-bold">{outcome}</span>.
                                            Immediate isolation of {agentName} is recommended.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default IncidentPanel;
