import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Settings as SettingsIcon, Server, Copy, Check, Trash2, Shield } from 'lucide-react';

const Settings = () => {
    const [ip, setIp] = useState('127.0.0.1');
    const [ipList, setIpList] = useState([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchIps = async () => {
            const baseUrl = window.location.port === '5173' ? 'http://localhost:5000' : '';
            try {
                const res = await fetch(`${baseUrl}/api/system/info`);
                const data = await res.json();
                if (data.ips && data.ips.length > 0) {
                    setIpList(data.ips);
                    // Try to pick a likely LAN IP (doesn't start with 172. or 10. if possible, or just first one)
                    setIp(data.ips[0].ip);
                }
            } catch (e) { console.error("Failed to fetch IPs", e); }
        };
        fetchIps();
    }, []);

    const configBlock = `
<integration>
  <name>custom-soc-tool</name>
  <hook_url>http://${ip}:5000/api/alerts</hook_url>
  <level>3</level>
  <alert_format>json</alert_format>
</integration>
  `.trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(configBlock);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePurge = async () => {
        if (confirm("Are you sure you want to PERMANENTLY delete all alert history?")) {
            try {
                const res = await fetch('http://localhost:5000/api/purge', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    alert('System purged successfully. Clean slate ready.');
                }
            } catch (e) {
                console.error(e);
                alert('Failed to purge data.');
            }
        }
    };

    return (
        <div className="dashboard-grid bg-[var(--bg-main)] text-[var(--text-primary)]">
            <div className="sidebar-area">
                <Sidebar />
            </div>

            <div className="content-area overflow-y-auto custom-scrollbar p-6 md:p-12 max-w-4xl">
                <header className="flex items-center gap-4 mb-8">
                    <SettingsIcon size={32} className="text-[var(--text-muted)]" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
                        <p className="text-[var(--text-secondary)] text-sm">Configure integrations and preferences</p>
                    </div>
                </header>

                {/* Wazuh Integration Section */}
                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield size={20} className="text-[var(--color-accent)]" />
                        <h2 className="text-lg font-bold">Wazuh Easy Connect</h2>
                    </div>

                    <div className="glass-card p-6 rounded-2xl">
                        <p className="mb-6 text-[var(--text-secondary)] text-sm">
                            To connect your Wazuh Manager, add this integration block to your <code className="text-[var(--color-accent)]">ossec.conf</code> file.
                        </p>

                        <div className="mb-4">
                            <label className="block text-xs uppercase font-bold text-[var(--text-muted)] mb-2">
                                Your PC / Server IP Address
                            </label>

                            {ipList.length > 0 ? (
                                <select
                                    value={ip}
                                    onChange={(e) => setIp(e.target.value)}
                                    className="w-full md:w-1/2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-white focus:border-[var(--color-accent)] outline-none transition-colors"
                                >
                                    {ipList.map((item, idx) => (
                                        <option key={idx} value={item.ip}>
                                            {item.ip} ({item.name})
                                        </option>
                                    ))}
                                    <option value="custom">Manual Input...</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={ip}
                                    onChange={(e) => setIp(e.target.value)}
                                    className="w-full md:w-1/2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-white focus:border-[var(--color-accent)] outline-none transition-colors"
                                    placeholder="e.g. 192.168.1.50"
                                />
                            )}

                            <p className="mt-2 text-xs text-[var(--text-muted)]">
                                Select the IP address reachable by your Wazuh Manager (usually Ethernet or Wi-Fi).
                            </p>
                        </div>

                        <div className="relative group">
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-xs font-bold transition-all"
                                >
                                    {copied ? <Check size={14} color="var(--color-low)" /> : <Copy size={14} />}
                                    {copied ? 'COPIED' : 'COPY XML'}
                                </button>
                            </div>
                            <pre className="p-6 rounded-xl bg-[#0d0e12] border border-[var(--border-color)] overflow-x-auto text-sm font-mono text-gray-300">
                                {configBlock}
                            </pre>
                        </div>
                    </div>
                </section>

                {/* Data Management */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Server size={20} className="text-[var(--text-secondary)]" />
                        <h2 className="text-lg font-bold">Data Management</h2>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">Purge Incidents</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Remove all current alerts and reset statistics.</p>
                            </div>
                            <button
                                onClick={handlePurge}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(255,51,102,0.1)] border border-[var(--color-critical)] text-[var(--color-critical)] hover:bg-[rgba(255,51,102,0.2)] transition-colors font-bold text-sm"
                            >
                                <Trash2 size={16} /> CLEAR DATA
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Settings;
