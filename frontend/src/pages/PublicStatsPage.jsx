import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip 
} from 'recharts';
import { MousePointerClick, Globe, Calendar, Link2, HelpCircle } from 'lucide-react';

export default function PublicStatsPage() {
  const { shortCode } = useParams();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const response = await axios.get(`/api/url/stats/${shortCode}`);
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Link analytics could not be found.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicStats();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute w-8 h-8 rounded-full border-4 border-slate-200 dark:border-slate-800" />
          <div className="absolute w-8 h-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
        </div>
        <span className="text-sm font-semibold">Retrieving statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg">
          <HelpCircle className="w-12 h-12 text-slate-350 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Stats Unavailable</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {error}
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { originalUrl, totalClicks, trends = [], countries = [] } = stats;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Brand Header */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 text-center">
        <div className="p-1.5 rounded-lg bg-brand-600 text-white">
          <Link2 className="w-4 h-4 rotate-45" />
        </div>
        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
          SmartLink<span className="text-brand-500">AI</span> Public Stats Page
        </span>
      </div>

      {/* URL Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 transition-all">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
            REDIRECT LINK: /{shortCode}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
            {originalUrl}
          </h2>
        </div>
      </div>

      {/* Clicks counter card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Redirect Click Volume</span>
          <p className="text-4xl font-black text-brand-600 dark:text-brand-400 tracking-tight">
            {totalClicks.toLocaleString()}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
          <MousePointerClick className="w-6 h-6" />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Click Trend (Recharts AreaChart) */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Traffic Timeline (Last 30 Days)</h3>
          </div>
          
          <div className="h-60 w-full">
            {trends.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                No click events logged yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPublicClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', borderColor: '#1e293b', color: 'white', borderRadius: '12px', fontSize: '10px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPublicClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Locations list */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <Globe className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Top Geographies</h3>
          </div>
          
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {countries.length === 0 ? (
              <div className="text-slate-400 text-xs py-4 text-center">No location logs available.</div>
            ) : (
              countries.map((c, idx) => {
                const maxVal = countries[0]?.clicks || 1;
                const percent = Math.round((c.clicks / maxVal) * 100);

                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">{c.name}</span>
                      <span className="font-bold font-mono text-[10px]">{c.clicks} clicks</span>
                    </div>
                    <div className="w-full bg-slate-50 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-600 h-full rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
