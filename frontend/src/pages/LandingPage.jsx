import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Link2, Sparkles, BarChart3, QrCode, Lock, Zap, ArrowRight, 
  CheckCircle2, Globe, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: 'Instant Shortening',
      description: 'Convert long destination URLs into tiny, memorable codes in less than a second.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-indigo-500" />,
      title: 'AI Traffic Insights',
      description: 'Receive natural language summaries explaining user growth trends and peak activity hours.',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-emerald-500" />,
      title: 'Granular Analytics',
      description: 'Track browsers, operating systems, user devices, and geographical cities for every click.',
    },
    {
      icon: <QrCode className="w-5 h-5 text-sky-500" />,
      title: 'QR Code Generation',
      description: 'Instantly generate vector SVG and raster PNG QR codes for online and offline campaigns.',
    },
    {
      icon: <Lock className="w-5 h-5 text-rose-500" />,
      title: 'Secure Link Expiry',
      description: 'Schedule automatic link expiration limits relative to days or absolute calendar dates.',
    },
    {
      icon: <Globe className="w-5 h-5 text-violet-500" />,
      title: 'Custom Branding',
      description: 'Ditch the random shortcodes and define your own custom alias strings for high CTRs.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background Orbs */}
        <div className="orb w-[500px] h-[500px] bg-brand-400/20 dark:bg-brand-600/10 top-0 left-1/2 -translate-x-1/2 -translate-y-1/4" />
        <div className="orb w-72 h-72 bg-violet-400/15 dark:bg-violet-600/10 top-20 right-0" />
        <div className="orb w-64 h-64 bg-emerald-400/15 dark:bg-emerald-600/10 top-32 left-0" />
        
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in shadow-sm shadow-brand-200/50">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Hackathon Edition App
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none max-w-4xl gradient-text-hero">
          Intelligent URL Shortening
          <span className="block gradient-text-brand mt-2">Powered by Analytics</span>
        </h1>
        
        <p className="mt-6 text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
          SmartLink AI turns cluttered links into high-performing branded URLs. Track advanced user statistics, download QR codes, and receive instant AI insights on your target traffic.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          {user ? (
            <Link
              to="/dashboard"
              className="glow-btn inline-flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/25 text-base"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="glow-btn inline-flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/25 text-base w-full sm:w-auto justify-center"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-7 py-4 border border-brand-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 bg-white/70 dark:bg-slate-900/70 font-bold rounded-2xl text-base text-slate-700 dark:text-slate-300 transition-all w-full sm:w-auto shadow-sm"
              >
                Log in
              </Link>
            </>
          )}
        </div>

        {/* Hero mockup demo */}
        <div className="mt-16 border border-white/80 dark:border-slate-800 rounded-3xl p-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm shadow-2xl shadow-brand-500/10 max-w-4xl w-full animate-slide-up duration-500">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-slate-900 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center p-4">
            {/* Visual demo representation of dashboard */}
            <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 via-transparent to-violet-900/20" />
            
            <div className="z-10 bg-slate-900/90 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-4 backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] font-bold font-mono text-slate-400">smartlink.ai/resume</span>
              </div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-bold text-indigo-400 font-mono">ORIGINAL DESTINATION</span>
                <p className="text-xs text-slate-300 font-mono truncate">https://linkedin.com/in/kiruthika-priya-s-k-portfolio</p>
              </div>
              <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border border-slate-700/50">
                <div>
                  <span className="text-[9px] font-bold text-slate-500">SHORT LINK</span>
                  <p className="text-sm font-bold text-emerald-400 font-mono">smartlink.app/resume</p>
                </div>
                <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                <div className="p-2 bg-indigo-950/60 rounded-lg border border-indigo-900/40">
                  <span className="block text-slate-500">CLICKS</span>
                  <span className="font-extrabold text-indigo-300 text-xs">2,482</span>
                </div>
                <div className="p-2 bg-emerald-950/60 rounded-lg border border-emerald-900/40">
                  <span className="block text-slate-500">GEO LOC</span>
                  <span className="font-extrabold text-emerald-300 text-xs">US, IN, UK</span>
                </div>
                <div className="p-2 bg-amber-950/60 rounded-lg border border-amber-900/40">
                  <span className="block text-slate-500">DEVICE</span>
                  <span className="font-extrabold text-amber-300 text-xs">70% Mob</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white/60 dark:bg-slate-950/80 border-y border-white/80 dark:border-slate-900 backdrop-blur-sm transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-4">
              <BarChart3 className="w-3 h-3" /> Platform Features
            </div>
            <h2 className="text-3xl md:text-4xl font-black gradient-text-hero">
              Enterprise Grade Link Management
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Everything you need to publish, scale, and analyze links at lightning speeds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="feature-card p-6 rounded-2xl group"
              >
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 inline-block group-hover:scale-110 transition-transform duration-200 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 text-white relative overflow-hidden shadow-2xl shadow-brand-500/25">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-black tracking-tight">Ready to shorten your links?</h2>
            <p className="text-indigo-100 text-sm md:text-base leading-relaxed">
              Create an account now to start tracking click events, generating customized aliases, printing vector QR codes, and viewing your traffic through natural language AI insights.
            </p>
            <div className="pt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="glow-btn inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-slate-100 text-brand-700 font-bold rounded-2xl text-sm shadow-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 text-brand-600" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="glow-btn inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-indigo-50 text-brand-700 font-bold rounded-2xl text-sm shadow-lg"
                >
                  Create Account Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
