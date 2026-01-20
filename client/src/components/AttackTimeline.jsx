import React from 'react';
import { Play, Shield, Terminal, Globe } from 'lucide-react';

const AttackTimeline = ({ incident }) => {
    // Mock timeline generation logic based on incident data
    // In a real app, this would come from the Correlation Engine's 'events' array

    const steps = [
        {
            time: new Date(incident.startTime).toLocaleTimeString(),
            icon: Globe,
            title: "Initial Access",
            desc: `Traffic detected from external source to ${incident.agentName}`
        },
        {
            time: new Date(incident.startTime + 2000).toLocaleTimeString(),
            icon: Terminal,
            title: "Execution",
            desc: `${incident.ruleName} triggered ${incident.count} times`
        },
        {
            time: incident.lastSeen ? new Date(incident.lastSeen).toLocaleTimeString() : "Now",
            icon: Shield,
            title: "Defense Triggered",
            desc: `SOC Alert created with Risk Score ${incident.riskScore}`
        }
    ];

    return (
        <div className="w-full">
            <h4 className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mb-4">Attack Story</h4>
            <div className="relative pl-4 border-l border-[var(--border-color)] space-y-8">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                        {/* Dot */}
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[var(--bg-main)] border border-[var(--color-accent)]"></div>

                        <div className="flex items-start gap-3">
                            <div className="mt-1 text-[var(--color-accent)] opacity-80">
                                <step.icon size={16} />
                            </div>
                            <div>
                                <span className="mono text-[var(--color-accent)] text-xs block mb-1 opacity-70">{step.time}</span>
                                <h5 className="font-bold text-sm text-[var(--text-primary)]">{step.title}</h5>
                                <p className="text-xs text-[var(--text-secondary)] mt-1">{step.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttackTimeline;
