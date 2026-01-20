import React from 'react';
import { motion } from 'framer-motion';

const RiskGauge = ({ score }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let color = 'var(--color-low)';
    if (score > 30) color = 'var(--color-medium)';
    if (score > 60) color = 'var(--color-high)';
    if (score > 80) color = 'var(--color-critical)';

    const isCritical = score > 75;

    return (
        <div className="relative flex items-center justify-center" style={{ width: '160px', height: '160px', minWidth: '160px', minHeight: '160px' }}>
            {/* Pulse Effect for Critical */}
            {isCritical && (
                <div className="absolute inset-0 rounded-full animate-pulse-critical"
                    style={{ border: `2px solid ${color}`, opacity: 0.5 }}></div>
            )}

            <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
                {/* Track */}
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="var(--bg-hover)"
                    strokeWidth="8"
                />
                {/* Progress */}
                <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeLinecap="butt"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold mono" style={{ color }}>{score}</span>
                <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold">Risk</span>
            </div>

            {/* Label */}
            <div className="absolute -bottom-8 w-full text-center">
                {score > 80 ? (
                    <span className="text-xs font-bold text-[var(--color-critical)] animate-pulse">LIKELY ATTACK</span>
                ) : score > 50 ? (
                    <span className="text-xs font-bold text-[var(--color-high)]">SUSPICIOUS</span>
                ) : (
                    <span className="text-xs font-bold text-[var(--text-muted)]">LOW NOISE</span>
                )}
            </div>
        </div>
    );
};

export default RiskGauge;
