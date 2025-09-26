'use client';

import { FaFile, FaDatabase, FaGlobe, FaEnvelope, FaShieldAlt, FaChartBar, FaCog } from 'react-icons/fa';
import { ReactNode, useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link'; // Import Link

// --- TYPE DEFINITIONS ---
interface StatsData {
  diskUsage: { used: number; total: number };
  bandwidth: { used: number; total: number };
  databases: { used: number; total: number };
  domains: { used: number; total: number };
  emailAccounts: { used: number; total: number };
}

// --- HELPER COMPONENTS ---
const Section = ({ title, children }: { title: string, children: ReactNode }) => (
  <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 mb-8">
    <h2 className="text-xl font-bold text-gray-300 border-b border-gray-700 pb-3 mb-6">{title}</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {children}
    </div>
  </div>
);

const FeatureIcon = ({ icon, label, href = "#" }: { icon: ReactNode, label: string, href?: string }) => (
  <a href={href} className="flex flex-col items-center justify-center text-center text-gray-400 hover:text-cyan-400 transition-colors duration-200">
    <div className="text-4xl mb-2">{icon}</div>
    <span className="text-sm font-medium">{label}</span>
  </a>
);

// --- MAIN DASHBOARD COMPONENT ---
export default function UserDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/stats', {
          headers: { 'x-api-key': 'bsp-agent-secret-key-c4a5b6d7e8f9' }
        });
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to connect to the agent. Is it running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800/80 p-6 hidden md:block flex-shrink-0">
        <div className="text-2xl font-bold text-cyan-400 mb-8">BoostonServer Panel</div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Statistics</h3>
        <div className="space-y-3 text-sm text-gray-400">
          {loading && <div>Loading stats...</div>}
          {error && <div className="text-red-400">{error}</div>}
          {stats && (
            <ul>
              <li><span className="font-bold">Disk Usage:</span> {stats.diskUsage.used} / {stats.diskUsage.total} GB</li>
              <li><span className="font-bold">Bandwidth:</span> {stats.bandwidth.used} / {stats.bandwidth.total} GB</li>
              <li><span className="font-bold">Databases:</span> {stats.databases.used} / {stats.databases.total}</li>
              <li><span className="font-bold">Domains:</span> {stats.domains.used} / {stats.domains.total}</li>
              <li><span className="font-bold">Email Accounts:</span> {stats.emailAccounts.used} / {stats.emailAccounts.total}</li>
            </ul>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-200 mb-8">Welcome, User!</h1>
        <Section title="FILES">
          <Link href="/files">
            <FeatureIcon icon={<FaFile />} label="File Manager" />
          </Link>
          <FeatureIcon icon={<FaChartBar />} label="Disk Usage" />
        </Section>
        <Section title="DATABASES">
          <FeatureIcon icon={<FaDatabase />} label="MySQL Databases" />
          <FeatureIcon icon={<FaCog />} label="MySQL Wizard" />
        </Section>
        <Section title="DOMAINS">
          <FeatureIcon icon={<FaGlobe />} label="Domains" />
          <FeatureIcon icon={<FaCog />} label="Zone Editor" />
        </Section>
        <Section title="EMAIL">
          <FeatureIcon icon={<FaEnvelope />} label="Email Accounts" />
          <FeatureIcon icon={<FaCog />} label="Forwarders" />
        </Section>
        <Section title="SECURITY">
          <FeatureIcon icon={<FaShieldAlt />} label="SSL/TLS Status" />
        </Section>
      </main>
    </div>
  );
}