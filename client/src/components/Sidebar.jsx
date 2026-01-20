// ... imports ...
import { LayoutDashboard, BarChart2, Bell, Settings, ShieldAlert, Cpu, Activity, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const Sidebar = () => {
    const location = useLocation();
    const isMobile = window.innerWidth <= 768;
    const [isConnected, setIsConnected] = useState(false);
    const [lastSeen, setLastSeen] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            // Use window.location.port to determine backend endpoint
            // If served from 5000 (app), use relative path. If 5173 (dev), use 5000.
            const port = window.location.port === '5173' ? '5000' : window.location.port;
            const baseUrl = window.location.port === '5173' ? 'http://localhost:5000' : '';

            try {
                const res = await fetch(`${baseUrl}/api/stats`);
                const data = await res.json();
                if (data.lastHeartbeat) {
                    const diff = Date.now() - data.lastHeartbeat;
                    // Consider connected if data seen in last 10 minutes
                    if (diff < 10 * 60 * 1000) {
                        setIsConnected(true);
                        setLastSeen(data.lastHeartbeat);
                    } else {
                        setIsConnected(false); // Stale
                    }
                }
            } catch (e) { console.error("Status Poll Error", e); }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    // ... navItems ...
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: BarChart2, label: 'Analytics', path: '/analytics' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <>
            <div className="glass sidebar-container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 0',
                zIndex: 50,
            }}>
                <div className="hide-on-mobile" style={{ marginBottom: '40px', color: 'var(--color-critical)' }}>
                    <ShieldAlert size={36} strokeWidth={1.5} />
                </div>

                <nav className="nav-menu" style={{
                    display: 'flex',
                    gap: '24px',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1 // Push bottom status down
                }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={item.label}
                                style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
                            >
                                <div
                                    style={{
                                        position: 'relative',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        color: isActive ? 'var(--color-accent)' : 'var(--text-muted)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                borderRadius: '12px',
                                                background: 'rgba(51, 204, 255, 0.1)',
                                                boxShadow: '0 0 20px rgba(51, 204, 255, 0.15)'
                                            }}
                                        />
                                    )}
                                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Status Indicator (Desktop Only) */}
                <div className="hide-on-mobile mb-6 flex flex-col items-center gap-2 group relative">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>

                    {/* Tooltip */}
                    <div className="absolute left-14 bg-black border border-white/10 p-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {isConnected ? 'Wazuh: Active' : 'Wazuh: Waiting'}
                    </div>
                </div>

            </div>

            <style>{`
        .sidebar-container {
            width: 80px;
            height: 100vh;
            border-right: 1px solid var(--border-color);
        }
        .nav-menu {
            flex-direction: column;
        }

        @media (max-width: 768px) {
            .sidebar-container {
                width: 100%;
                height: 70px;
                flex-direction: row;
                justify-content: space-around;
                border-right: none;
                border-top: 1px solid var(--border-color);
                box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
                padding: 0;
            }
            .nav-menu {
                flex-direction: row;
                width: 100%;
                justify-content: space-around;
            }
            .hide-on-mobile {
                 display: none;
            }
        }
      `}</style>
        </>
    );
};

export default Sidebar;
