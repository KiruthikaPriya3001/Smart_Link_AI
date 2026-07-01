import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { User, Mail, Calendar, ShieldAlert, LogOut, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const response = await api.get('/analytics/user/summary');
        if (response.data.success) {
          setSummary(response.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStats();
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully. Goodbye!');
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-450 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-650" />
        <span className="text-sm font-semibold">Retrieving account metrics...</span>
      </div>
    );
  }

  const { totalLinks = 0, totalClicks = 0 } = summary?.counters || {};

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Account Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          Manage your credentials and view account summary stats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: Profile Details */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-lg font-black shadow-md shadow-brand-500/25">
              {getInitials(user?.name)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{user?.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4.5 h-4.5 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Account Holder</span>
                <span className="font-semibold text-slate-800 dark:text-slate-250 mt-0.5">{user?.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4.5 h-4.5 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Primary Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-250 mt-0.5">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4.5 h-4.5 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Joined Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-250 mt-0.5">
                  {user?.createdAt ? formatDate(user.createdAt) : formatDate(new Date())}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-450">
              <ShieldCheck className="w-4 h-4" />
              <span>Session Secure (JWT Enabled)</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-all"
            >
              <LogOut className="w-4.5 h-4.5" />
              Logout Session
            </button>
          </div>
        </div>

        {/* Right Card: Quick summary aggregates */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col justify-between relative overflow-hidden shadow-lg">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-brand-500/15 rounded-full blur-2xl" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <BarChart2 className="w-4 h-4 text-brand-400 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usage Stats</h4>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Shortlinks Created</span>
                <p className="text-2xl font-black text-white leading-none mt-1">{totalLinks}</p>
              </div>
              
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Aggregated Clicks</span>
                <p className="text-2xl font-black text-brand-400 leading-none mt-1">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-[10px] text-slate-500 font-semibold leading-relaxed border-t border-slate-800 pt-3">
            Your limits are currently unrestricted for the duration of the hackathon evaluation.
          </div>
        </div>

      </div>

    </div>
  );
}
