import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AlertCard from '../components/AlertCard';
import IncidentPanel from '../components/IncidentPanel';
import { RefreshCw, Activity, Layers, Shield, ChevronLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Dashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState('CRITICAL');
    const [stats, setStats] = useState({ processed: 0, reduced: 0, reductionRate: 0 });
    const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [incRes, statsRes] = await Promise.all([
                fetch('http://localhost:5000/api/incidents'),
                fetch('http://localhost:5000/api/stats')
            ]);
            const incData = await incRes.json();
            const statsData = await statsRes.json();

            setIncidents(incData);
            setStats(statsData);
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkNoise = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/incidents/${id}/action/noise`, { method: 'POST' });
            fetchData();
            if (window.innerWidth <= 768) setIsMobileDetailOpen(false); // Go back on mobile after action
        } catch (e) {
            console.error(e);
        }
    };

    const handleIncidentClick = (id) => {
        setSelectedId(id);
        setIsMobileDetailOpen(true);
    };

    const handleBackToFeed = () => {
        setIsMobileDetailOpen(false);
        setSelectedId(null);
    }

    const filteredIncidents = incidents.filter(i => {
        if (filter === 'ALL') return true;
        if (filter === 'CRITICAL') return i.riskBucket === 'CRITICAL';
        if (filter === 'HIGH') return i.riskBucket === 'HIGH' || i.riskBucket === 'MEDIUM';
        if (filter === 'NOISE') return i.riskBucket === 'NOISE';
        return false;
    });

    const selectedIncident = incidents.find(i => i.id === selectedId);

    return (
        <div className="dashboard-grid bg-[var(--bg-main)] text-[var(--text-primary)]">
            <div className="sidebar-area">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="content-area">

                {/* Header / KPI Row - Hidden on Mobile Detail View if needed, or kept simple */}
                <header className="glass hide-on-mobile" style={{
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    zIndex: 10,
                    justifyContent: 'space-between'
                }}>
                    <div className="flex items-center gap-3">
                        <Shield size={24} className="text-[var(--color-accent)]" />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>SOC Noise Killer</h2>
                    </div>

                    <div className="flex gap-6 text-xs">
                        <div className="flex flex-col items-end">
                            <span className="text-[var(--text-muted)] uppercase">Alerts</span>
                            <span className="mono font-bold text-lg">{stats.processed}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[var(--text-muted)] uppercase">Reduced</span>
                            <span className="mono font-bold text-lg text-[var(--color-accent)]">{stats.reductionRate}%</span>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content: Split View */}
                <div className="split-view relative">

                    {/* Left: Feed */}
                    <div className="list-pane">

                        {/* Mobile Header (Only visible on mobile) */}
                        <div className="flex md:hidden items-center justify-between p-4 border-b border-[var(--border-color)]">
                            <h2 className="font-bold text-lg">Incidents</h2>
                            <div className="text-xs text-[var(--color-accent)] font-mono">{stats.reductionRate}% Reduced</div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[var(--border-color)]">
                            {['CRITICAL', 'HIGH', 'NOISE'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        background: filter === tab ? 'rgba(255,255,255,0.03)' : 'transparent',
                                        border: 'none',
                                        color: filter === tab ? 'var(--color-accent)' : 'var(--text-secondary)',
                                        borderBottom: filter === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        letterSpacing: '0.05em',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <AnimatePresence>
                                {filteredIncidents.length === 0 ? (
                                    <div className="p-8 text-center text-[var(--text-muted)] flex flex-col items-center gap-2 mt-10">
                                        <Layers size={40} strokeWidth={1} style={{ opacity: 0.3 }} />
                                        <p>No incidents found</p>
                                    </div>
                                ) : (
                                    filteredIncidents.map(inc => (
                                        <AlertCard
                                            key={inc.id}
                                            incident={inc}
                                            isSelected={selectedId === inc.id}
                                            onClick={() => handleIncidentClick(inc.id)}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Detail (Slide over on mobile) */}
                    <div className={`detail-pane ${!isMobileDetailOpen ? 'hidden md:block' : ''}`}>

                        {/* Mobile Back Button */}
                        <div className="md:hidden flex items-center p-4 border-b border-[var(--border-color)]" onClick={handleBackToFeed}>
                            <ChevronLeft className="mr-2" /> <span className="font-bold">Back to Feed</span>
                        </div>

                        <IncidentPanel incident={selectedIncident} onMarkNoise={handleMarkNoise} />
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Dashboard;
