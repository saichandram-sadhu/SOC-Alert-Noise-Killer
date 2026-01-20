import React from 'react';
import { Server, Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AlertCard = ({ incident, isSelected, onClick }) => {
    const { ruleName, riskScore, riskBucket, count, agentName, lastSeen, isNoise } = incident;

    const getSeverityColor = (bucket) => {
        switch (bucket) {
            case 'CRITICAL': return 'var(--color-critical)';
            case 'HIGH': return 'var(--color-high)';
            case 'MEDIUM': return 'var(--color-medium)';
            case 'NOISE': return 'var(--color-noise)';
            default: return 'var(--color-low)';
        }
    };

    const color = getSeverityColor(riskBucket);
    const isCritical = riskBucket === 'CRITICAL';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
            onClick={onClick}
            style={{
                padding: '20px',
                borderBottom: '1px solid var(--border-color)',
                borderLeft: isSelected ? `4px solid ${color}` : '4px solid transparent',
                background: isSelected
                    ? `linear-gradient(90deg, ${color}11 0%, transparent 100%)` // Hex with opacity
                    : 'transparent',
                cursor: 'pointer',
                position: 'relative',
                opacity: isNoise ? 0.5 : 1
            }}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="mono" style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: isCritical ? '#fff' : 'var(--text-primary)',
                    lineHeight: '1.4',
                    marginBottom: '4px'
                }}>
                    {ruleName || "Unknown Alert"}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{
                        color: color,
                        fontWeight: '800',
                        fontSize: '1rem',
                        textShadow: isCritical ? `0 0 10px ${color}` : 'none'
                    }}>
                        {riskScore}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-1.5" title="Agent">
                    <Server size={13} strokeWidth={1.5} />
                    <span className="mono">{agentName}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Event Count">
                    <Activity size={13} strokeWidth={1.5} />
                    <span className="mono">{count}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Last Seen">
                    <Clock size={13} strokeWidth={1.5} />
                    <span className="mono">{new Date(lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Subtle bottom highlight */}
            {isCritical && !isNoise && (
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
                    background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
                    opacity: 0.5
                }} />
            )}
        </motion.div>
    );
};

export default AlertCard;
