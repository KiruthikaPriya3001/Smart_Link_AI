import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { 
  Users, Link2, MousePointerClick, ShieldCheck, 
  Cpu, HardDrive, Clock, Terminal, Activity, ArrowLeft 
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      showToast('Unauthorized access to Admin Panel.', 'error');
      navigate('/dashboard');
    }
  }, [user, navigate, showToast]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/metrics');
      if (response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load system metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800" />
          <div className="absolute w-10 h-10 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
        </div>
        <span className="text-sm font-semibold">Loading system metrics...</span>
      </div>
    );
  }

  const { totalUsers = 0, totalLinks = 0, totalClicks = 0, systemMetrics = {} } = metrics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-brand-600" />
            System Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time server metrics, database usage, and system resources.
          </p>
        </div>
        
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Usage Overview Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Users</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{totalUsers}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shortened Links</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{totalLinks}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <Link2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Redirect Clicks</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{totalClicks}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <MousePointerClick className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Detailed System Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hardware & Process Resources */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
            <Activity className="w-5 h-5 text-brand-655" />
            System Diagnostic Monitors
          </h3>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Server Uptime
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
                {formatUptime(systemMetrics.uptime)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-500" />
                Process Heap Usage
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
                {formatBytes(systemMetrics.processMemory)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-500" />
                System Free Memory
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
                {formatBytes(systemMetrics.freeMemory)} / {formatBytes(systemMetrics.totalMemory)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                Processor Cores
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
                {systemMetrics.cpuCount} Cores ({systemMetrics.platform})
              </span>
            </div>
          </div>
        </div>

        {/* Runtime Environment details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
            <Terminal className="w-5 h-5 text-brand-655" />
            Environment & Software Settings
          </h3>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">NodeJS Engine Version</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-850 font-semibold font-mono text-xs text-slate-700 dark:text-slate-350">
                {systemMetrics.nodeVersion}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Database Driver</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-850 font-semibold font-mono text-xs text-slate-700 dark:text-slate-350">
                Mongoose ORM
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Environment Node Env</span>
              <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 font-semibold font-mono text-xs text-emerald-700 dark:text-emerald-400 uppercase">
                Production-Ready
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">API Gateway Proxy</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-850 font-semibold font-mono text-xs text-slate-700 dark:text-slate-350">
                Express REST API
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
