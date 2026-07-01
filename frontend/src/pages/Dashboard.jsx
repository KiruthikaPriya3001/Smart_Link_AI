import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import UrlTable from '../components/UrlTable';
import { getShortUrl } from '../utils/url';
import BulkShortener from '../components/BulkShortener';
import QrCodeGenerator from '../components/QrCodeGenerator';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { 
  Sparkles, List, FileSpreadsheet, PlusCircle, 
  CheckCircle2, Folder, FolderPlus, Trash2, X, Plus,
  Link2, MousePointerClick, Globe, BarChart3, QrCode, Heart, Tag,
  Settings, ArrowRight, Monitor, Compass, AlertCircle, Copy, Check,
  Edit3, Calendar, ShieldCheck, Star, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';

const DONUT_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // State Management
  const [summary, setSummary] = useState(null);
  const [recentUrls, setRecentUrls] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Expiration/Filter Specific States for secondary views
  const [selectedFolderId, setSelectedFolderId] = useState('all');
  const [selectedTagId, setSelectedTagId] = useState('all');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [folderActionLoading, setFolderActionLoading] = useState(false);
  const [tagActionLoading, setTagActionLoading] = useState(false);

  // Standalone QR Center states
  const [qrInputUrl, setQrInputUrl] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);

  // Analytics tab selection state
  const [selectedAnalyticsUrlId, setSelectedAnalyticsUrlId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Recent links list modal triggers
  const [selectedQrUrl, setSelectedQrUrl] = useState(null);
  const [editUrlObj, setEditUrlObj] = useState(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editRemoveExpiry, setEditRemoveExpiry] = useState(false);
  const [editFolderId, setEditFolderId] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [editIsPublicAnalytics, setEditIsPublicAnalytics] = useState(false);
  const [deleteUrlId, setDeleteUrlId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Modal selector resource lists
  const [modalFolders, setModalFolders] = useState([]);
  const [modalTags, setModalTags] = useState([]);

  // Fetch Dashboard Stats and aggregates
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics/user/summary');
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load dashboard statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Recent Short URLs
  const fetchRecentUrls = async () => {
    setRecentLoading(true);
    try {
      const response = await api.get('/url/all', { params: { page: 1, limit: 5 } });
      if (response.data.success) {
        setRecentUrls(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecentLoading(false);
    }
  };

  // Fetch folders and tags
  const fetchFoldersAndTags = async () => {
    try {
      const [fRes, tRes] = await Promise.all([
        api.get('/folders'),
        api.get('/tags')
      ]);
      setFolders(fRes.data.data);
      setTags(tRes.data.data);
    } catch (err) {
      console.error('Failed to load resources:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchRecentUrls();
    fetchFoldersAndTags();
  }, [refreshKey]);

  // Fetch selected link analytics for the detailed Analytics view
  useEffect(() => {
    if (activeTab === 'analytics' && selectedAnalyticsUrlId) {
      const fetchLinkAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
          const response = await api.get(`/analytics/${selectedAnalyticsUrlId}`);
          if (response.data.success) {
            setAnalyticsData(response.data.data);
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to retrieve analytics details.', 'error');
        } finally {
          setAnalyticsLoading(false);
        }
      };
      fetchLinkAnalytics();
    }
  }, [activeTab, selectedAnalyticsUrlId]);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Folder Actions
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setFolderActionLoading(true);
    try {
      const response = await api.post('/folders', { name: newFolderName.trim() });
      if (response.data.success) {
        showToast('Folder created successfully!');
        setNewFolderName('');
        setShowFolderModal(false);
        fetchFoldersAndTags();
        triggerRefresh();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating folder', 'error');
    } finally {
      setFolderActionLoading(false);
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this folder? Your links will not be deleted.')) return;

    try {
      const response = await api.delete(`/folders/${id}`);
      if (response.data.success) {
        showToast('Folder deleted.');
        if (selectedFolderId === id) setSelectedFolderId('all');
        fetchFoldersAndTags();
        triggerRefresh();
      }
    } catch (err) {
      showToast('Failed to delete folder.', 'error');
    }
  };

  // Tag Actions
  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setTagActionLoading(true);
    try {
      const response = await api.post('/tags', { name: newTagName.trim(), color: newTagColor });
      if (response.data.success) {
        showToast('Tag created successfully!');
        setNewTagName('');
        setShowTagModal(false);
        fetchFoldersAndTags();
        triggerRefresh();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating tag', 'error');
    } finally {
      setTagActionLoading(false);
    }
  };

  const handleDeleteTag = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this tag? Your links will remain intact.')) return;

    try {
      await api.delete(`/tags/${id}`);
      showToast('Tag deleted.');
      if (selectedTagId === id) setSelectedTagId('all');
      fetchFoldersAndTags();
      triggerRefresh();
    } catch (err) {
      showToast('Failed to delete tag.', 'error');
    }
  };

  // Edit Link submit inside Dashboard overview
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editOriginalUrl) return;

    setActionLoading(true);
    try {
      const response = await api.put(`/url/${editUrlObj._id}`, {
        originalUrl: editOriginalUrl,
        expiryDate: editExpiryDate || null,
        removeExpiry: editRemoveExpiry || (!editExpiryDate),
        folderId: editFolderId || null,
        tags: editTags,
        isPublicAnalytics: editIsPublicAnalytics,
      });

      if (response.data.success) {
        showToast('Link updated successfully!');
        setEditUrlObj(null);
        fetchRecentUrls();
        triggerRefresh();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating link', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete link submit inside Dashboard overview
  const handleDeleteSubmit = async () => {
    if (!deleteUrlId) return;

    setActionLoading(true);
    try {
      const response = await api.delete(`/url/${deleteUrlId}`);
      if (response.data.success) {
        showToast('Link permanently deleted.');
        setDeleteUrlId(null);
        fetchRecentUrls();
        triggerRefresh();
      }
    } catch (err) {
      showToast('Failed to delete URL.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Copy shortened link helper
  const handleCopy = (code, id) => {
    const shortUrl = getShortUrl(code);

    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    showToast('Short link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditModal = async (url) => {
    setEditUrlObj(url);
    setEditOriginalUrl(url.originalUrl);
    setEditExpiryDate(url.expiryDate ? new Date(url.expiryDate).toISOString().split('T')[0] : '');
    setEditRemoveExpiry(false);
    setEditFolderId(url.folderId?._id || url.folderId || '');
    setEditTags(url.tags?.map(t => t._id || t) || []);
    setEditIsPublicAnalytics(url.isPublicAnalytics || false);

    try {
      const [fRes, tRes] = await Promise.all([
        api.get('/folders'),
        api.get('/tags')
      ]);
      setModalFolders(fRes.data.data);
      setModalTags(tRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Domain Favicon detector
  const getDomainIcon = (urlStr) => {
    try {
      const hostname = new URL(urlStr).hostname.toLowerCase();
      // Google Favicon API
      return (
        <img 
          src={`https://www.google.com/s2/favicons?sz=32&domain=${hostname}`} 
          alt="domain-icon"
          className="w-4.5 h-4.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white"
          onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%2394a3b8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'/%3E%3C/svg%3E"; }}
        />
      );
    } catch (e) {
      return <Link2 className="w-4 h-4 text-slate-400 rotate-45" />;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statsGrowth = {
    links: { percent: '', desc: 'from live data' },
    clicks: { percent: '', desc: 'from live data' },
    visitors: { percent: '', desc: 'from live data' },
    avg: { percent: '', desc: 'from live data' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      
      {/* Dynamic Tab Views Rendering */}

      {/* ─── TAB: OVERVIEW (Mockup layout) ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dashboard Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Overview 👋
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                Welcome back, {user?.name?.split(' ')[0] || 'Kiruthika'}! Here's what's happening with your links.
              </p>
            </div>
            
            {/* Filter Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm cursor-pointer select-none">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Last 7 days</span>
            </div>
          </div>

          {/* Top Counters Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Links */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Links</span>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-brand-600 dark:text-brand-400">
                  <Link2 className="w-4 h-4 rotate-45" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {summary?.counters?.totalLinks || 0}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                  <span className="text-slate-500">{statsGrowth.links.percent}</span>
                  <span className="text-slate-400">{statsGrowth.links.desc}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Clicks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Clicks</span>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {summary?.counters?.totalClicks?.toLocaleString() || 0}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                  <span className="text-slate-500">{statsGrowth.clicks.percent}</span>
                  <span className="text-slate-400">{statsGrowth.clicks.desc}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Unique Visitors */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Unique Visitors</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {summary?.counters?.uniqueVisitors?.toLocaleString() || 0}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                  <span className="text-slate-500">{statsGrowth.visitors.percent}</span>
                  <span className="text-slate-400">{statsGrowth.visitors.desc}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Average Clicks / Link */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg. Clicks / Link</span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {summary?.counters?.totalLinks 
                    ? (summary.counters.totalClicks / summary.counters.totalLinks).toFixed(2) 
                    : "0.00"}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                  <span className="text-slate-500">{statsGrowth.avg.percent}</span>
                  <span className="text-slate-400">{statsGrowth.avg.desc}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Core Analytics Grid Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Section: Recent Links & Quick cards */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Recent Links list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Recent Links</h3>
                  <button 
                    onClick={() => setSearchParams({ tab: 'links' })}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                  >
                    View All Links <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {recentLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <RefreshSpinner />
                    <span className="text-xs font-semibold">Loading recent links...</span>
                  </div>
                ) : recentUrls.length === 0 ? (
                  <div className="p-10 text-center text-slate-450">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-350 mb-2" />
                    <p className="text-sm font-semibold">No URLs generated yet.</p>
                    <Link to="/create" className="text-xs text-brand-600 font-bold hover:underline mt-1 block">Shorten your first link</Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-b border-slate-150 dark:border-slate-800/85 font-black uppercase text-[10px] tracking-wider">
                          <th className="p-4 pl-6">Original URL</th>
                          <th className="p-4">Short Link</th>
                          <th className="p-4">Clicks</th>
                          <th className="p-4">Created</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {recentUrls.map((url) => {
                          const isExpired = url.expiryDate && new Date() > new Date(url.expiryDate);
                          const shortSlug = url.customAlias || url.shortCode;
                          const displayShortUrl = getShortUrl(shortSlug);
                          
                          return (
                            <tr key={url._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-350 transition-colors">
                              <td className="p-4 pl-6 max-w-[200px] truncate">
                                <div className="flex items-center gap-2">
                                  {getDomainIcon(url.originalUrl)}
                                  <div className="truncate">
                                    <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="font-mono font-medium hover:underline hover:text-indigo-500">{url.originalUrl}</a>
                                    {/* Folder name tag */}
                                    {url.folderId && (
                                      <span className="block text-[9px] font-bold text-indigo-500 uppercase tracking-wide mt-0.5">
                                        #{url.folderId.name || 'Folder'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-mono font-semibold text-brand-600 dark:text-indigo-400 text-xs">
                                <div className="flex items-center gap-1">
                                  <span>/{shortSlug}</span>
                                  <button
                                    onClick={() => handleCopy(shortSlug, url._id)}
                                    className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                                  >
                                    {copiedId === url._id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 font-bold font-mono">
                                {url.clickCount || 0}
                              </td>
                              <td className="p-4 text-slate-450 font-mono">
                                {new Date(url.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="p-4">
                                {isExpired ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-50 dark:bg-rose-950/35 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/35 uppercase">Expired</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/35 uppercase">Active</span>
                                )}
                              </td>
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => navigate(`/analytics/${url._id}`)}
                                    className="p-1.5 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                                    title="Analytics View"
                                  >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setSelectedQrUrl(displayShortUrl)}
                                    className="p-1.5 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                                    title="QR Code Box"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openEditModal(url)}
                                    className="p-1.5 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                                    title="Edit link"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteUrlId(url._id)}
                                    className="p-1.5 border border-slate-100 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-rose-500"
                                    title="Delete link"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom Quick-Access Callout Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                
                {/* Card 1: AI Link Insights */}
                <div 
                  onClick={() => setSearchParams({ tab: 'analytics' })}
                  className="bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100/60 dark:border-purple-900/30 p-5 rounded-2xl cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all group flex flex-col justify-between min-h-[140px]"
                >
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-xl w-fit">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">AI Link Insights</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Get AI-powered insights for your links.</p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 group-hover:underline flex items-center gap-1 mt-2">
                    Analyze Now <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Card 2: QR Code Center */}
                <div 
                  onClick={() => setSearchParams({ tab: 'qr' })}
                  className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/30 p-5 rounded-2xl cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all group flex flex-col justify-between min-h-[140px]"
                >
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl w-fit">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">QR Code Center</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Generate and download QR codes.</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 group-hover:underline flex items-center gap-1 mt-2">
                    Open QR Center <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Card 3: Bulk Upload */}
                <div 
                  onClick={() => setSearchParams({ tab: 'bulk' })}
                  className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/60 dark:border-amber-900/30 p-5 rounded-2xl cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all group flex flex-col justify-between min-h-[140px]"
                >
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl w-fit">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Bulk Upload</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Upload CSV and shorten in bulk.</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 group-hover:underline flex items-center gap-1 mt-2">
                    Upload CSV <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Card 4: Public Stats Page */}
                <div 
                  onClick={() => setSearchParams({ tab: 'public-stats' })}
                  className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/60 dark:border-blue-900/30 p-5 rounded-2xl cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all group flex flex-col justify-between min-h-[140px]"
                >
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl w-fit">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Public Stats Page</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Share analytics publicly.</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 group-hover:underline flex items-center gap-1 mt-2">
                    Create Public Page <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

              </div>

            </div>

            {/* Right Section: Clicks Over Time & Geolocations Donut charts */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Chart 1: Clicks Over Time */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Clicks Over Time</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-500">Daily</span>
                </div>
                
                <div className="h-44 w-full">
                  {!summary?.dailyTrend || summary.dailyTrend.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-semibold rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 px-3 text-center">
                      <span className="text-slate-600 dark:text-slate-300">No click trends yet</span>
                      <span className="text-[11px] text-slate-500 mt-1">Your first clicks will appear here as a daily trend.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={summary.dailyTrend} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={8} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={8} tickLine={false} allowDecimals={false} />
                        <Tooltip formatter={(value) => [`${value} Clicks`, 'Clicks']} />
                        <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} fill="url(#clicksGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 2: Top Countries Donut */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Top Countries</h4>
                </div>

                <div className="flex flex-col items-center">
                  <div className="h-36 w-full">
                    {!summary?.topCountries || summary.topCountries.length === 0 ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-semibold rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 px-3 text-center">
                        <span className="text-slate-600 dark:text-slate-300">No geolocation data yet</span>
                        <span className="text-[11px] text-slate-500 mt-1">Top countries will populate after visitors use the short link.</span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={summary.topCountries.map((c) => ({ name: c.name, value: c.clicks }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={52}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {summary.topCountries.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} Clicks`, 'Clicks']} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  
                  {/* Legend list with custom percentages */}
                  {summary?.topCountries && summary.topCountries.length > 0 && (
                    <div className="w-full space-y-2 mt-4">
                      {summary.topCountries.map((c, idx) => {
                        const totalClicksSum = summary.topCountries.reduce((sum, item) => sum + item.clicks, 0) || 1;
                        const pct = ((c.clicks / totalClicksSum) * 100).toFixed(1);
                        return (
                          <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-650 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                              <span>{c.name}</span>
                            </div>
                            <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Chart 3: Top Devices Donut */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Top Devices</h4>
                </div>

                <div className="flex flex-col items-center">
                  <div className="h-36 w-full">
                    {!summary?.devices || summary.devices.length === 0 ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-semibold rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 px-3 text-center">
                        <span className="text-slate-600 dark:text-slate-300">No device breakdown yet</span>
                        <span className="text-[11px] text-slate-500 mt-1">Mobile and desktop traffic will show up once the link is scanned.</span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={summary.devices}
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={52}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {summary.devices.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={DONUT_COLORS[(idx + 2) % DONUT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} Clicks`, 'Clicks']} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  
                  {/* Legend list */}
                  {summary?.devices && summary.devices.length > 0 && (
                    <div className="w-full space-y-2 mt-4">
                      {summary.devices.map((d, idx) => {
                        const totalClicksSum = summary.devices.reduce((sum, item) => sum + item.value, 0) || 1;
                        const pct = ((d.value / totalClicksSum) * 100).toFixed(1);
                        return (
                          <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-650 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[(idx + 2) % DONUT_COLORS.length] }} />
                              <span>{d.name}</span>
                            </div>
                            <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ─── TAB: LINKS (Full list console) ─── */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">My Shortlinks</h1>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Browse, query, search, and manage all your shortened links.</p>
            </div>
          </div>
          <UrlTable refreshKey={refreshKey} onUrlDeleted={triggerRefresh} />
        </div>
      )}

      {/* ─── TAB: ANALYTICS (Specific link charts & coach reports) ─── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">AI Link Analytics</h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Drill down into specific visitor behaviors and read natural AI coach recommendations.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Select Shortlink to Analyze</label>
              <select
                value={selectedAnalyticsUrlId}
                onChange={(e) => setSelectedAnalyticsUrlId(e.target.value)}
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Choose one of your links --</option>
                {recentUrls.map((u) => (
                  <option key={u._id} value={u._id}>
                    /{u.customAlias || u.shortCode} → {u.originalUrl.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            {analyticsLoading && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshSpinner />
                <span className="text-xs font-semibold">Retrieving charts and AI insights...</span>
              </div>
            )}

            {!selectedAnalyticsUrlId && !analyticsLoading && (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-slate-400 max-w-md mx-auto">
                <Info className="w-8 h-8 mx-auto text-slate-350 mb-2" />
                <p className="text-xs font-semibold">Select a shortlink from the dropdown above to render detailed geo mappings, browser ratios, and AI summaries.</p>
              </div>
            )}

            {selectedAnalyticsUrlId && analyticsData && !analyticsLoading && (
              <div className="space-y-6 pt-4 animate-fade-in">
                {/* AI insights Coach summary box */}
                {analyticsData.insights && analyticsData.insights.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-slate-950 dark:to-indigo-950/10 border border-indigo-150/40 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                    <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider mb-3">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      AI Insights & Campaign Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {analyticsData.insights.map((ins, insIdx) => (
                        <li key={insIdx} className="text-xs font-medium text-slate-650 dark:text-slate-400 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expiry Recommendation */}
                {analyticsData.smartExpiry && (
                  <div className="bg-amber-50/40 dark:bg-amber-950/15 border border-amber-200/50 dark:border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-650 dark:text-slate-400 flex items-center gap-3">
                    <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Smart Expiry Tip: </span>
                      {analyticsData.smartExpiry.recommendation}
                    </div>
                  </div>
                )}

                {/* Recharts widgets */}
                <AnalyticsCharts data={analyticsData} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB: QR CENTER (Vector svg and png builder) ─── */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">QR Code Center</h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Generate vector SVG and high-resolution PNG QR codes for any campaign link.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Input Settings Panel */}
            <div className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-850 dark:text-slate-200">Configure QR Link</h3>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Target URL to encode</label>
                <input
                  type="url"
                  placeholder="https://example.com/campaign-page"
                  value={qrInputUrl}
                  onChange={(e) => {
                    setQrInputUrl(e.target.value);
                    setQrGenerated(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
                />
              </div>

              <button
                onClick={() => {
                  if (qrInputUrl.trim()) setQrGenerated(true);
                  else showToast('Please enter a valid URL.', 'error');
                }}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Generate QR Code
              </button>
            </div>

            {/* Live QR Output Generator */}
            <div className="md:col-span-6 flex justify-center">
              {qrGenerated && qrInputUrl.trim() ? (
                <QrCodeGenerator value={qrInputUrl.trim()} title="Custom QR Code" />
              ) : (
                <div className="border border-dashed border-slate-200 dark:border-slate-850 rounded-3xl p-8 text-center text-slate-400 w-full min-h-[300px] flex flex-col items-center justify-center bg-white dark:bg-slate-900">
                  <QrCode className="w-8 h-8 text-slate-350 mb-2 animate-pulse" />
                  <p className="text-xs font-semibold">QR Code Live Preview</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto">
                    Type a link on the left and click generate to render vector downloads.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── TAB: FOLDERS (Productivity view) ─── */}
      {activeTab === 'folders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Folders list */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-indigo-500" />
                Productivity Folders
              </h3>
              <button 
                onClick={() => setShowFolderModal(true)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolderId('all')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedFolderId === 'all'
                    ? 'bg-brand-50/50 dark:bg-brand-950/15 text-brand-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  All Folders combined
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-500">
                  {summary?.counters?.totalLinks || 0}
                </span>
              </button>

              {folders.map((f) => (
                <button
                  key={f._id}
                  onClick={() => setSelectedFolderId(f._id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold group transition-all ${
                    selectedFolderId === f._id
                      ? 'bg-brand-50/50 dark:bg-brand-950/15 text-brand-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate pr-2">
                    <Folder className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{f.name}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-500">
                      {f.urlCount}
                    </span>
                    <button
                      onClick={(e) => handleDeleteFolder(f._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </button>
              ))}

              {folders.length === 0 && (
                <p className="text-[10px] text-slate-450 py-4 text-center">No folders. Group links to boost productivity.</p>
              )}
            </div>
          </div>

          {/* Right: URL table filtering */}
          <div className="lg:col-span-8 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-2">
              <h3 className="font-black text-sm text-slate-850 dark:text-slate-200">
                Folder: {selectedFolderId === 'all' ? 'All Links' : folders.find(f => f._id === selectedFolderId)?.name || 'General'}
              </h3>
            </div>
            <UrlTable refreshKey={refreshKey} onUrlDeleted={triggerRefresh} selectedFolderId={selectedFolderId} />
          </div>

        </div>
      )}

      {/* ─── TAB: TAGS (Descriptive labels) ─── */}
      {activeTab === 'tags' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Tags list */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-500" />
                Descriptive Tags
              </h3>
              <button 
                onClick={() => setShowTagModal(true)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedTagId('all')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTagId === 'all'
                    ? 'bg-brand-50/50 dark:bg-brand-950/15 text-brand-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  All Tags combined
                </span>
              </button>

              {tags.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTagId(t._id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold group transition-all ${
                    selectedTagId === t._id
                      ? 'bg-brand-50/50 dark:bg-brand-950/15 text-brand-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate pr-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="truncate uppercase">{t.name}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleDeleteTag(t._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </button>
              ))}

              {tags.length === 0 && (
                <p className="text-[10px] text-slate-450 py-4 text-center">No tags created yet.</p>
              )}
            </div>
          </div>

          {/* Right: URL table filtering */}
          <div className="lg:col-span-8 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-2">
              <h3 className="font-black text-sm text-slate-850 dark:text-slate-200">
                Tag: {selectedTagId === 'all' ? 'All Links' : tags.find(t => t._id === selectedTagId)?.name.toUpperCase() || 'General'}
              </h3>
            </div>
            <UrlTable refreshKey={refreshKey} onUrlDeleted={triggerRefresh} selectedTagId={selectedTagId} />
          </div>

        </div>
      )}

      {/* ─── TAB: FAVORITES ─── */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Favorited Links</h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Quickly access and audit your most important shortened channels.</p>
          </div>
          <UrlTable refreshKey={refreshKey} onUrlDeleted={triggerRefresh} isFavoriteProp={true} />
        </div>
      )}

      {/* ─── TAB: BULK UPLOAD ─── */}
      {activeTab === 'bulk' && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Bulk URL Shortener</h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Upload a CSV database of URLs to shorten them instantly in a single batch.</p>
          </div>
          <BulkShortener onComplete={triggerRefresh} />
        </div>
      )}

      {/* ─── TAB: PUBLIC STATS CONFIG ─── */}
      {activeTab === 'public-stats' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Public Stats Config</h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Manage and verify stats pages that have been configured for public view.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-200">Public Pages list</h3>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentUrls.filter(u => u.isPublicAnalytics).map((url) => {
                const shortSlug = url.customAlias || url.shortCode;
                const statsUrl = `${getPublicBaseUrl()}/stats/${shortSlug}`;
                
                return (
                  <div key={url._id} className="py-4.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-250">/{shortSlug}</span>
                      <p className="text-[10px] text-slate-450 font-mono truncate max-w-xs md:max-w-md">{url.originalUrl}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <a 
                        href={statsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold text-slate-650 dark:text-slate-300"
                      >
                        Visit Page
                      </a>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(statsUrl);
                          showToast('Public link copied!');
                        }}
                        className="px-3.5 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Link
                      </button>
                    </div>
                  </div>
                );
              })}

              {recentUrls.filter(u => u.isPublicAnalytics).length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  No public statistics pages are active. Enable "Make Analytics Publicly Viewable" inside URL creation or URL editing.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODALS ─── */}

      {/* 1. Add Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="w-4.5 h-4.5 text-indigo-500" />
                Create New Folder
              </h3>
              <button onClick={() => setShowFolderModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Folder Name</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Q3 Campaigns"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowFolderModal(false)} className="px-4 py-2 border border-slate-205 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={folderActionLoading} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold">{folderActionLoading ? 'Creating...' : 'Create Folder'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4.5 h-4.5 text-indigo-500" />
                Create New Tag
              </h3>
              <button onClick={() => setShowTagModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTag} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tag Label Name</label>
                <input
                  type="text"
                  required
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. SOCIAL"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tag Color</label>
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-slate-200 dark:border-slate-800"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowTagModal(false)} className="px-4 py-2 border border-slate-205 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={tagActionLoading} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold">{tagActionLoading ? 'Creating...' : 'Create Tag'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. QR Code View Modal (Recent table) */}
      {selectedQrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-slate-900 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl p-4 border border-slate-200 dark:border-slate-800 animate-slide-up">
            <button onClick={() => setSelectedQrUrl(null)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-100 text-slate-550">
              <X className="w-4 h-4" />
            </button>
            <div className="pt-4">
              <QrCodeGenerator value={selectedQrUrl} title="Link Code" />
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Link Modal (Recent table) */}
      {editUrlObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-955 max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-slide-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4.5 h-4.5 text-indigo-500" />
                Edit Destination URL
              </h3>
              <button onClick={() => setEditUrlObj(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Target Destination URL</label>
                <input
                  type="url"
                  required
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none text-sm font-mono"
                />
              </div>

              {/* Folder Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5 text-slate-450" /> Assign Folder
                </label>
                <select
                  value={editFolderId}
                  onChange={(e) => setEditFolderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-700 dark:text-slate-350"
                >
                  <option value="">No Folder (General)</option>
                  {modalFolders.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-450" /> Link Tags
                </label>
                {modalTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                    {modalTags.map((t) => {
                      const isChecked = editTags.includes(t._id);
                      return (
                        <button
                          key={t._id}
                          type="button"
                          onClick={() => {
                            if (editTags.includes(t._id)) setEditTags(prev => prev.filter(id => id !== t._id));
                            else setEditTags(prev => [...prev, t._id]);
                          }}
                          style={{ 
                            backgroundColor: isChecked ? `${t.color}25` : 'transparent',
                            color: isChecked ? t.color : '',
                            borderColor: isChecked ? t.color : 'rgba(148, 163, 184, 0.2)'
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border uppercase transition-all flex items-center gap-1 select-none"
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 py-1 border-t border-slate-100 dark:border-slate-805 pt-3">
                <input
                  type="checkbox"
                  id="overview-public-stats"
                  checked={editIsPublicAnalytics}
                  onChange={(e) => setEditIsPublicAnalytics(e.target.checked)}
                  className="rounded border-slate-350 text-brand-650 focus:ring-brand-500 w-4 h-4"
                />
                <label htmlFor="overview-public-stats" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Enable Public Stats Page
                </label>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-805 pt-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-450" /> Scheduled Expiry Date
                </label>
                <input
                  type="date"
                  disabled={editRemoveExpiry}
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none disabled:opacity-40"
                />
              </div>

              <div className="flex items-center gap-2.5 py-1">
                <input
                  type="checkbox"
                  id="overview-remove-expiry"
                  checked={editRemoveExpiry}
                  onChange={(e) => setEditRemoveExpiry(e.target.checked)}
                  className="rounded border-slate-350 text-brand-650 w-4 h-4"
                />
                <label htmlFor="overview-remove-expiry" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                  Remove expiration limit (Keep active indefinitely)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setEditUrlObj(null)} className="px-4 py-2.5 border border-slate-205 rounded-xl text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold">{actionLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Link Confirmation Modal (Recent table) */}
      {deleteUrlId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Short Link?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to delete this URL? This action cannot be undone. All visitor analytics will be permanently destroyed.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => setDeleteUrlId(null)} className="px-4 py-2.5 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleDeleteSubmit} disabled={actionLoading} className="px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold">{actionLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Micro spinner component
function RefreshSpinner() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <div className="absolute w-8 h-8 rounded-full border-4 border-slate-200 dark:border-slate-850 animate-pulse" />
      <div className="absolute w-8 h-8 rounded-full border-4 border-brand-650 border-t-transparent animate-spin" />
    </div>
  );
}
