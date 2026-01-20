import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Shield, Activity, Zap } from 'lucide-react';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/incidents?type=ALL')
            .then(res => res.json())
            .then(incidents => {
                const distribution = [
                    { name: 'Critical', value: incidents.filter(i => i.riskBucket === 'CRITICAL').length, color: '#ff3366' },
                    { name: 'High', value: incidents.filter(i => i.riskBucket === 'HIGH').length, color: '#ff9900' },
                    { name: 'Medium', value: incidents.filter(i => i.riskBucket === 'MEDIUM').length, color: '#ffe600' },
                    { name: 'Noise', value: incidents.filter(i => i.riskBucket === 'NOISE').length, color: '#475569' },
                ];
                setData(distribution);
            });

        fetch('http://localhost:5000/api/stats')
            .then(res => res.json())
            .then(s => setStats(s));
    }, []);

    return (
        <div className="dashboard-grid bg-[var(--bg-main)] text-[var(--text-primary)]">
            <div className="sidebar-area">
                <Sidebar />
            </div>

            <div className="content-area overflow-y-auto custom-scrollbar p-6 md:p-12">
                <header className="flex items-center gap-4 mb-8">
                    <Activity size={32} className="text-[var(--color-accent)]" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">SOC Analytics</h1>
                        <p className="text-[var(--text-secondary)] text-sm">Real-time threat metrics</p>
                    </div>
                </header>

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="glass-card p-6 rounded-2xl flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h3 className="text-[var(--text-muted)] text-xs uppercase font-bold tracking-wider">Processed</h3>
                                <Zap size={16} className="text-[var(--text-muted)]" />
                            </div>
                            <p className="text-4xl font-mono font-bold text-white">{stats.processed}</p>
                            <div className="text-xs text-[var(--text-secondary)]">Total alerts ingested</div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h3 className="text-[var(--text-muted)] text-xs uppercase font-bold tracking-wider">Noise Reduction</h3>
                                <Shield size={16} className="text-[var(--color-accent)]" />
                            </div>
                            <p className="text-4xl font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{stats.reductionRate}%</p>
                            <div className="text-xs text-[var(--text-secondary)]">Alerts suppressed automatically</div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h3 className="text-[var(--text-muted)] text-xs uppercase font-bold tracking-wider">Incidents</h3>
                                <Activity size={16} className="text-[var(--color-high)]" />
                            </div>
                            <p className="text-4xl font-mono font-bold" style={{ color: 'var(--color-high)' }}>{stats.reduced}</p>
                            <div className="text-xs text-[var(--text-secondary)]">Actionable incidents created</div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card p-8 rounded-2xl h-[450px] flex flex-col">
                        <h3 className="mb-6 font-bold text-lg">Severity Distribution</h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        innerRadius={80}
                                        paddingAngle={5}
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0b10', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center flex-wrap gap-4 mt-4">
                            {data.map(d => (
                                <div key={d.name} className="flex items-center gap-2 text-xs font-mono uppercase">
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }}></div>
                                    {d.name} <span className="text-white font-bold">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-2xl h-[450px]">
                        <h3 className="mb-6 font-bold text-lg">Top Noisy Rules</h3>
                        <div className="text-[var(--text-muted)] flex flex-col items-center justify-center h-full gap-4">
                            <div className="animate-pulse bg-[var(--bg-hover)] w-16 h-16 rounded-full"></div>
                            <p>Waiting for more data...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
