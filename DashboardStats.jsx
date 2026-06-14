import React from 'react';
import { Link2, MousePointerClick, CalendarCheck, CalendarRange } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const { totalLinks = 0, activeLinks = 0, expiredLinks = 0, totalClicks = 0 } = stats || {};

  const cards = [
    {
      title: 'Total Short Links',
      value: totalLinks,
      icon: <Link2 className="w-5 h-5 text-indigo-600" />,
      gradient: 'stat-indigo',
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/40',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200/60 dark:border-indigo-900/30',
    },
    {
      title: 'Total Redirect Clicks',
      value: totalClicks.toLocaleString(),
      icon: <MousePointerClick className="w-5 h-5 text-emerald-600" />,
      gradient: 'stat-emerald',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200/60 dark:border-emerald-900/30',
    },
    {
      title: 'Active Link Channels',
      value: activeLinks,
      icon: <CalendarCheck className="w-5 h-5 text-sky-600" />,
      gradient: 'stat-sky',
      iconBg: 'bg-sky-100 dark:bg-sky-950/40',
      textColor: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200/60 dark:border-sky-900/30',
    },
    {
      title: 'Expired Channels',
      value: expiredLinks,
      icon: <CalendarRange className="w-5 h-5 text-rose-600" />,
      gradient: 'stat-rose',
      iconBg: 'bg-rose-100 dark:bg-rose-950/40',
      textColor: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200/60 dark:border-rose-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((c, idx) => (
        <div
          key={idx}
          className={`flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border ${c.border} shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in cursor-default group`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {c.title}
            </span>
            <div className={`p-2 rounded-xl ${c.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
              {c.icon}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.textColor}`}>
              {c.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
