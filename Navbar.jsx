import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Link2, Menu, X, LayoutDashboard, PlusCircle, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/60 dark:border-slate-800/50 backdrop-blur-xl transition-all duration-200 shadow-sm shadow-brand-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform duration-200">
              <Link2 className="w-5 h-5 rotate-45" />
            </div>
            <span className="text-xl font-bold">
              <span className="bg-gradient-to-r from-slate-900 to-indigo-800 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">SmartLink</span><span className="gradient-text-brand font-extrabold">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-150 ${
                    isActive('/dashboard')
                      ? 'text-brand-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/create"
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-150 ${
                    isActive('/create')
                      ? 'text-brand-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Shorten Link
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-150 ${
                    isActive('/profile')
                      ? 'text-brand-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                {user && user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-150 ${
                      isActive('/admin')
                        ? 'text-brand-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <a
                href="#features"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Features
              </a>
            )}

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="glow-btn text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/10 px-4 py-2 rounded-xl transition-all duration-200"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5 text-brand-600" />
                Dashboard
              </Link>
              <Link
                to="/create"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <PlusCircle className="w-5 h-5 text-brand-600" />
                Shorten Link
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <User className="w-5 h-5 text-brand-600" />
                Profile
              </Link>
              {user && user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <ShieldCheck className="w-5 h-5 text-brand-600" />
                  Admin Panel
                </Link>
              )}
              <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2" />
              <div className="flex items-center justify-between px-3 py-1 text-slate-500">
                <span className="text-sm">Logged in as {user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="#features"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Features
              </a>
              <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2" />
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block text-center px-3 py-2.5 rounded-xl text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/10 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
