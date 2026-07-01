import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Link2, LayoutDashboard, List, BarChart3, QrCode, 
  Folder, Tag, Heart, FileSpreadsheet, Globe, Settings, 
  Sparkles, Bell, Moon, Sun, Search, LogOut, ShieldCheck, 
  Menu, X, PlusCircle, User, MoreVertical
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function ConsoleLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const dropdownRef = useRef(null);

  // Close profile dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
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

  // Synchronize search query parameter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const currentParams = Object.fromEntries(searchParams.entries());
    if (searchVal.trim()) {
      setSearchParams({ ...currentParams, search: searchVal.trim(), tab: currentParams.tab || 'links' });
    } else {
      const { search, ...rest } = currentParams;
      setSearchParams(rest);
    }
  };

  const clearSearch = () => {
    setSearchVal('');
    const currentParams = Object.fromEntries(searchParams.entries());
    const { search, ...rest } = currentParams;
    setSearchParams(rest);
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const response = await api.post('/notifications/read');
      if (response.data.success) {
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to mark notifications read', error);
    }
  };

  const handleMarkOneRead = async (notificationId) => {
    try {
      const response = await api.post('/notifications/read', { notificationId });
      if (response.data.success) {
        setNotifications((prev) => prev.map((item) => item._id === notificationId ? { ...item, read: true } : item));
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to mark notification read', error);
    }
  };

  const activeTab = searchParams.get('tab') || 'overview';

  // Navigation Items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4.5 h-4.5" />, path: '/dashboard?tab=overview' },
    { id: 'links', label: 'My Links', icon: <List className="w-4.5 h-4.5" />, path: '/dashboard?tab=links' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4.5 h-4.5" />, path: '/dashboard?tab=analytics' },
    { id: 'qr', label: 'QR Center', icon: <QrCode className="w-4.5 h-4.5" />, path: '/dashboard?tab=qr' },
    { id: 'folders', label: 'Folders', icon: <Folder className="w-4.5 h-4.5" />, path: '/dashboard?tab=folders' },
    { id: 'tags', label: 'Tags', icon: <Tag className="w-4.5 h-4.5" />, path: '/dashboard?tab=tags' },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-4.5 h-4.5" />, path: '/dashboard?tab=favorites' },
    { id: 'bulk', label: 'Bulk Upload', icon: <FileSpreadsheet className="w-4.5 h-4.5" />, path: '/dashboard?tab=bulk' },
    { id: 'public-stats', label: 'Public Stats', icon: <Globe className="w-4.5 h-4.5" />, path: '/dashboard?tab=public-stats' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4.5 h-4.5" />, path: '/profile' }
  ];

  const handleTabChange = (itemId, path) => {
    setSidebarOpen(false);
    if (itemId === 'settings') {
      navigate('/profile');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Mobile Sidebar Toggle Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. Side Navigation Panel */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 transition-transform duration-300 md:static md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 dark:border-slate-850 px-6">
          <Link to="/dashboard?tab=overview" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25">
              <Link2 className="w-4.5 h-4.5 rotate-45" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                SmartLink <span className="text-brand-600">AI</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 block -mt-0.5 tracking-wide">
                Shorten • Track • Analyze
              </span>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="ml-auto p-1.5 rounded-lg md:hidden hover:bg-slate-50 text-slate-400"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="px-4 py-4.5">
          <Link
            to="/create"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 text-xs transition-all hover:scale-[1.01]"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Link
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isTabActive = item.id === 'settings' 
              ? location.pathname === '/profile' 
              : activeTab === item.id && location.pathname === '/dashboard';
              
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id, item.path)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isTabActive
                    ? 'bg-brand-50/50 dark:bg-brand-950/15 text-brand-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

      </aside>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-6 z-30">
          <div className="flex items-center gap-4 flex-1">
            {/* Hamburger for mobile */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg md:hidden hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Header Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center max-w-sm w-full relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by alias, url or tag..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-10 pr-12 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
              />
              {searchVal && (
                <button 
                  type="button" 
                  onClick={clearSearch}
                  className="absolute right-8 top-2.5 text-[10px] font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
              <span className="absolute right-3.5 top-2 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-400 bg-white dark:bg-slate-950 select-none">
                ⌘K
              </span>
            </form>
          </div>

          {/* Right Accessories */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 z-50 w-80 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-slide-up">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Notifications</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-slate-500">No notifications yet.</div>
                    ) : notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors ${notif.read ? 'opacity-70' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-[11px] font-medium leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-800 dark:text-slate-250 font-bold'}`}>
                              {notif.title}: {notif.message}
                            </p>
                            <span className="text-[9px] text-slate-400 font-semibold block mt-1">{new Date(notif.createdAt).toLocaleString()}</span>
                          </div>
                          {!notif.read && (
                            <button
                              onClick={() => handleMarkOneRead(notif._id)}
                              className="text-[10px] font-semibold text-brand-600 hover:text-brand-700"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer select-none"
              >
                {getInitials(user?.name)}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 z-50 w-56 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-slide-up">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{user?.email || ''}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
