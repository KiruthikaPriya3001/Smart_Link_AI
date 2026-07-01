import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LabelList,
} from 'recharts';
import { Calendar, Monitor, Globe, BarChart2, Compass } from 'lucide-react';

// Color themes
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
const BROWSER_COLORS = {
  Chrome: '#3b82f6',
  Firefox: '#f97316',
  Safari: '#06b6d4',
  Edge: '#0ea5e9',
  Others: '#64748b',
};

export default function AnalyticsCharts({ data }) {
  const {
    trends = { daily: [], weekly: [], monthly: [] },
    devices = [],
    browsers = [],
    countries = [],
    cities = [],
  } = data || {};

  const [trendTab, setTrendTab] = useState('daily');

  const getTrendData = () => {
    if (trendTab === 'weekly') return trends.weekly;
    if (trendTab === 'monthly') return trends.monthly;
    return trends.daily;
  };

  const trendData = getTrendData();
  const trendStats = trendData.length > 0
    ? {
        min: Math.min(...trendData.map((item) => Number(item.clicks || 0))),
        max: Math.max(...trendData.map((item) => Number(item.clicks || 0))),
        total: trendData.reduce((sum, item) => sum + Number(item.clicks || 0), 0),
      }
    : null;

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    if (percent < 0.04) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700">
        {`${name} ${value}`}
      </text>
    );
  };

  // Helper to get browser pie chart values
  const getBrowserPieData = () => {
    // If empty
    if (!browsers || browsers.length === 0) return [];
    
    // Sort and take top 4, group rest into Others
    const sorted = [...browsers].sort((a, b) => b.value - a.value);
    if (sorted.length <= 4) return sorted;

    const top4 = sorted.slice(0, 4);
    const othersVal = sorted.slice(4).reduce((sum, item) => sum + item.value, 0);
    return [...top4, { name: 'Others', value: othersVal }];
  };

  const browserPieData = getBrowserPieData();

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-xl text-xs font-mono">
          <p className="font-semibold text-slate-400 mb-1">{label}</p>
          <p className="text-sm font-bold text-indigo-400">Clicks: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Click Trends Timeline Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Redirect Clicks Trend</h3>
            </div>
            {trendStats && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Range {trendStats.min}–{trendStats.max} clicks · Total {trendStats.total}
              </p>
            )}
          </div>
          {/* Tab switches */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
            {['daily', 'weekly', 'monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTrendTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  trendTab === tab
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          {trendData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm font-medium gap-2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30">
              <span className="font-semibold text-slate-600 dark:text-slate-300">No click activity yet</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Share the short link and the first clicks will appear here.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorClicks)" 
                />
                <LabelList dataKey="clicks" position="top" fill="#64748b" fontSize={10} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Device & Browser Side-by-Side Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Device Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
            <Monitor className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Device Breakdown</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {devices.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 text-center px-4">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No device data yet</span>
                <span className="text-xs text-slate-400 mt-1">The first traffic will break down by mobile, desktop, and tablet.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={renderPieLabel}
                    labelLine={false}
                  >
                    {devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} clicks`, 'Clicks']} />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Browser Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
            <Compass className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Browser Distribution</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {browserPieData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 text-center px-4">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No browser data yet</span>
                <span className="text-xs text-slate-400 mt-1">Browser stats will appear as soon as visitors open the link.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    labelLine={false}
                    label={renderPieLabel}
                    dataKey="value"
                  >
                    {browserPieData.map((entry, index) => {
                      const color = BROWSER_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length];
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} clicks`, 'Clicks']} />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 3. Geolocation Distributions (Top Countries / Top Cities) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
          <Globe className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-900 dark:text-white">Visitor Geolocation Insights</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Countries List */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Top Countries Distribution
            </h4>
            {countries.length === 0 ? (
              <div className="text-slate-400 text-sm py-4">No location logs registered yet.</div>
            ) : (
              <div className="space-y-3.5">
                {countries.slice(0, 5).map((c, idx) => {
                  const maxClicks = countries[0]?.clicks || 1;
                  const percent = Math.round((c.clicks / maxClicks) * 100);
                  
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-350">{c.name}</span>
                        <span className="font-bold font-mono text-xs">{c.clicks} clicks</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cities BarChart */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" />
              Top Cities Metrics
            </h4>
            <div className="h-48 w-full">
              {cities.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  No city logs registered.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cities.slice(0, 5)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value) => [`${value} clicks`, 'Clicks']} />
                    <Bar dataKey="clicks" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={28}>
                      <LabelList dataKey="clicks" position="top" fill="#64748b" fontSize={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
