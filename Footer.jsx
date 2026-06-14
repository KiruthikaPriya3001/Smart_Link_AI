import React from 'react';
import { Link2 } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950 backdrop-blur-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-sm">
              <Link2 className="w-3.5 h-3.5 rotate-45" />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              SmartLink<span className="gradient-text-brand">AI</span>
            </span>
          </div>

          {/* Copyright Info */}
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
            &copy; {currentYear} SmartLink AI &mdash; Intelligent URL Management
          </div>

          {/* Hackathon Link */}
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center md:text-right">
            This project is a part of a hackathon run by{' '}
            <a
              href="https://katomaran.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:underline hover:text-brand-700 font-semibold"
            >
              https://katomaran.com
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
