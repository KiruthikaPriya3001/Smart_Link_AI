import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Copy, Check, QrCode, BarChart3, Edit3, Trash2, Search, 
  ChevronLeft, ChevronRight, Filter, SortAsc, AlertCircle, X, Calendar,
  Star, Globe, Lock, Tag, Folder, ShieldAlert, Plus
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import QrCodeGenerator from './QrCodeGenerator';
import { getShortUrl } from '../utils/url';

export default function UrlTable({ refreshKey, onUrlDeleted, selectedFolderId, isFavoriteProp = false, selectedTagId = '' }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const searchUrlParam = searchParams.get('search') || '';

  // Data states
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filter & Search states
  const [search, setSearch] = useState(searchUrlParam);
  const [status, setStatus] = useState(''); // active, expired, '' (all)
  const [sort, setSort] = useState('createdAt:desc'); // default newest
  const [isFavoriteFilter, setIsFavoriteFilter] = useState(isFavoriteProp);

  // Sync search from URL param
  useEffect(() => {
    setSearch(searchUrlParam);
  }, [searchUrlParam]);

  // Sync favorite state from prop
  useEffect(() => {
    setIsFavoriteFilter(isFavoriteProp);
  }, [isFavoriteProp]);

  // Modal states
  const [selectedQrUrl, setSelectedQrUrl] = useState(null); // URL object for QR
  const [editUrlObj, setEditUrlObj] = useState(null); // URL object for Edit
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editRemoveExpiry, setEditRemoveExpiry] = useState(false);
  const [editFolderId, setEditFolderId] = useState('');
  const [editTags, setEditTags] = useState([]); // Array of tag IDs
  const [editIsPublicAnalytics, setEditIsPublicAnalytics] = useState(false);
  const [deleteUrlId, setDeleteUrlId] = useState(null); // ID for Delete
  const [actionLoading, setActionLoading] = useState(false);

  // Resource lists for modal selector
  const [modalFolders, setModalFolders] = useState([]);
  const [modalTags, setModalTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');

  // Copy clip state
  const [copiedId, setCopiedId] = useState(null);

  const fetchUrls = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        status,
        sort,
        page,
        limit,
      };

      if (selectedFolderId && selectedFolderId !== 'all') {
        params.folderId = selectedFolderId;
      }

      if (selectedTagId && selectedTagId !== 'all') {
        params.tagId = selectedTagId;
      }

      if (isFavoriteFilter) {
        params.isFavorite = 'true';
      }

      const response = await api.get('/url/all', { params });
      if (response.data.success) {
        setUrls(response.data.data);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to load links.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [search, status, sort, page, refreshKey, selectedFolderId, isFavoriteFilter, selectedTagId]);

  // Reset page to 1 when filters change
  const handleFilterChange = (setter, val) => {
    setter(val);
    setPage(1);
  };

  const handleCopy = (code, id) => {
    const shortUrl = getShortUrl(code);

    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    showToast('Short link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = async (url) => {
    try {
      const response = await api.put(`/url/${url._id}`, {
        isFavorite: !url.isFavorite
      });
      if (response.data.success) {
        showToast(url.isFavorite ? 'Removed from favorites' : 'Added to favorites');
        fetchUrls();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update favorite status', 'error');
    }
  };

  const handleTogglePublicAnalytics = async (url) => {
    try {
      const response = await api.put(`/url/${url._id}`, {
        isPublicAnalytics: !url.isPublicAnalytics
      });
      if (response.data.success) {
        showToast(url.isPublicAnalytics ? 'Analytics set to Private' : 'Analytics set to Public');
        fetchUrls();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update analytics settings', 'error');
    }
  };

  const openEditModal = async (url) => {
    setEditUrlObj(url);
    setEditOriginalUrl(url.originalUrl);
    setEditExpiryDate(url.expiryDate ? new Date(url.expiryDate).toISOString().split('T')[0] : '');
    setEditRemoveExpiry(false);
    setEditFolderId(url.folderId?._id || url.folderId || '');
    setEditTags(url.tags?.map(t => t._id || t) || []);
    setEditIsPublicAnalytics(url.isPublicAnalytics || false);

    // Fetch resources to populate choices
    try {
      const [fRes, tRes] = await Promise.all([
        api.get('/folders'),
        api.get('/tags')
      ]);
      setModalFolders(fRes.data.data);
      setModalTags(tRes.data.data);
    } catch (err) {
      console.error('Failed to fetch folders/tags for modal', err);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const response = await api.post('/tags', {
        name: newTagName.trim(),
        color: newTagColor
      });
      if (response.data.success) {
        showToast('Tag created!');
        setNewTagName('');
        // Refresh tags selection list
        const tRes = await api.get('/tags');
        setModalTags(tRes.data.data);
        // Automatically check the new tag
        setEditTags(prev => [...prev, response.data.data._id]);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating tag', 'error');
    }
  };

  const handleTagToggle = (tagId) => {
    setEditTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

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
        fetchUrls();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error updating link', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteUrlId) return;

    setActionLoading(true);
    try {
      const response = await api.delete(`/url/${deleteUrlId}`);
      if (response.data.success) {
        showToast('Link permanently deleted.');
        setDeleteUrlId(null);
        fetchUrls();
        if (onUrlDeleted) onUrlDeleted();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete URL.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date() > new Date(expiryDate);
  };

  const getHealthBadge = (health) => {
    const status = health?.status || 'unchecked';
    const code = health?.statusCode || '';
    
    if (status === 'healthy') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 font-semibold" title={`Healthy (HTTP ${code})`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Healthy
        </span>
      );
    }
    if (status === 'broken') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 font-semibold" title={`Broken: ${health.errorMessage || 'Error'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Broken
        </span>
      );
    }
    if (status === 'loop') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 font-semibold" title="Redirect Loop Detected">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Loop
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Unchecked
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search links, aliases, targets..."
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-brand-500 text-sm transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Favorites Filter Toggle */}
          <button
            onClick={() => handleFilterChange(setIsFavoriteFilter, !isFavoriteFilter)}
            className={`px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 border transition-all ${
              isFavoriteFilter 
                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40' 
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-650 dark:text-slate-400'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavoriteFilter ? 'fill-amber-500 text-amber-500' : ''}`} />
            Favorites Only
          </button>

          {/* Status filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={status}
              onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              className="w-full md:w-40 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Links</option>
              <option value="expired">Expired Links</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <SortAsc className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sort}
              onChange={(e) => handleFilterChange(setSort, e.target.value)}
              className="w-full md:w-44 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="clickCount:desc">Most Clicks</option>
              <option value="clickCount:asc">Least Clicks</option>
              <option value="expiryDate:asc">Expiry Soonest</option>
            </select>
          </div>
        </div>
      </div>

      {/* URL Table Render */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshSpinner />
            <span className="text-sm font-semibold">Retrieving your links...</span>
          </div>
        ) : urls.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-250 text-lg">No links found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {search || status || isFavoriteFilter ? "No links match your search filter criteria." : "Create your first shortened link or upload a bulk CSV sheet to get started!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase text-xs tracking-wider">
                  <th className="p-4 pl-6 w-10"></th>
                  <th className="p-4">Original Destination</th>
                  <th className="p-4">Short URL</th>
                  <th className="p-4">Health</th>
                  <th className="p-4">Clicks</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {urls.map((url) => {
                  const isLinkExpired = isExpired(url.expiryDate);
                  const shortSlug = url.customAlias || url.shortCode;
                  const displayShortUrl = getShortUrl(shortSlug);

                  return (
                    <tr key={url._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300 transition-colors">
                      {/* Favorite Toggle Star */}
                      <td className="p-4 pl-6 text-center">
                        <button
                          onClick={() => handleToggleFavorite(url)}
                          className="text-slate-300 hover:text-amber-500 transition-colors"
                          title={url.isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
                        >
                          <Star className={`w-4.5 h-4.5 ${url.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Original Target Destination & Meta tags */}
                      <td className="p-4 max-w-xs md:max-w-sm truncate">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 max-w-full">
                            <a 
                              href={url.originalUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline hover:text-indigo-500 font-medium font-mono text-xs truncate"
                            >
                              {url.originalUrl}
                            </a>
                          </div>
                          
                          {/* Folder & Tag Badges */}
                          <div className="flex flex-wrap gap-1 items-center">
                            {url.folderId && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/35 uppercase">
                                <Folder className="w-2.5 h-2.5" />
                                {url.folderId.name || url.folderId}
                              </span>
                            )}
                            {url.tags && url.tags.map((t) => (
                              <span 
                                key={t._id} 
                                style={{ backgroundColor: `${t.color}15`, color: t.color, borderColor: `${t.color}35` }} 
                                className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase"
                              >
                                <Tag className="w-2.5 h-2.5" />
                                {t.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Shortened URL */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-brand-600 dark:text-brand-400 font-mono text-xs">
                            /{shortSlug}
                          </span>
                          <button
                            onClick={() => handleCopy(shortSlug, url._id)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Copy Short Link"
                          >
                            {copiedId === url._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          
                          {/* Public vs Private Toggler */}
                          <button
                            onClick={() => handleTogglePublicAnalytics(url)}
                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                              url.isPublicAnalytics ? 'text-emerald-500' : 'text-slate-400'
                            }`}
                            title={url.isPublicAnalytics ? "Public Stats Enabled (Click to disable)" : "Private Stats (Click to enable)"}
                          >
                            {url.isPublicAnalytics ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Destination Health Check */}
                      <td className="p-4">
                        {getHealthBadge(url.healthStatus)}
                      </td>

                      {/* Click Redirects */}
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                          {url.clickCount}
                        </span>
                      </td>

                      {/* Expiration date */}
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {url.expiryDate ? (
                          <span className={isLinkExpired ? 'text-rose-500 font-semibold' : ''}>
                            {formatDate(url.expiryDate)}
                          </span>
                        ) : 'Never'}
                      </td>

                      {/* URL Operations */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedQrUrl(displayShortUrl)}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-all"
                            title="QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/analytics/${url._id}`)}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-all"
                            title="Analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(url)}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-all"
                            title="Edit URL"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteUrlId(url._id)}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                            title="Delete URL"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination Controls */}
        {urls.length > 0 && !loading && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-900/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Showing { (page - 1) * limit + 1 } to { Math.min(page * limit, total) } of { total } items
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <span className="text-xs font-semibold px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal Overlay */}
      {selectedQrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-slate-900 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl p-4 border border-slate-200 dark:border-slate-800 animate-slide-up">
            <button
              onClick={() => setSelectedQrUrl(null)}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="pt-4">
              <QrCodeGenerator value={selectedQrUrl} title="Link Code" />
            </div>
          </div>
        </div>
      )}

      {/* Edit URL Modal Overlay */}
      {editUrlObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-950 max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-slide-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4.5 h-4.5 text-indigo-500" />
                Edit Destination URL
              </h3>
              <button
                onClick={() => setEditUrlObj(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Target Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-brand-500 text-sm font-mono"
                  placeholder="https://github.com/user/project"
                />
              </div>

              {/* Folder Selector (Productivity Mode) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  Assign to Folder
                </label>
                <select
                  value={editFolderId}
                  onChange={(e) => setEditFolderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-300"
                >
                  <option value="">No Folder (General)</option>
                  {modalFolders.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Link Tags
                </label>
                {/* Available tags checklist */}
                {modalTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                    {modalTags.map((t) => {
                      const isChecked = editTags.includes(t._id);
                      return (
                        <button
                          key={t._id}
                          type="button"
                          onClick={() => handleTagToggle(t._id)}
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
                {/* Create tags on the fly */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-905 rounded-xl text-xs"
                  />
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-slate-200 dark:border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    className="px-3 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Public Analytics checkbox */}
              <div className="flex items-center gap-2.5 py-1 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <input
                  type="checkbox"
                  id="edit-public-stats"
                  checked={editIsPublicAnalytics}
                  onChange={(e) => setEditIsPublicAnalytics(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-800 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <label htmlFor="edit-public-stats" className="text-xs font-medium text-slate-650 dark:text-slate-400 select-none cursor-pointer flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-450" />
                  Enable Public Analytics Page
                </label>
              </div>

              {/* Scheduled Expiry */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Scheduled Expiry Date
                </label>
                <input
                  type="date"
                  disabled={editRemoveExpiry}
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-brand-500 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-2.5 py-1">
                <input
                  type="checkbox"
                  id="remove-expiry"
                  checked={editRemoveExpiry}
                  onChange={(e) => setEditRemoveExpiry(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-800 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <label htmlFor="remove-expiry" className="text-xs font-medium text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                  Remove expiration limit (Keep active indefinitely)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUrlObj(null)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-brand-500/10"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete URL Confirmation Modal Overlay */}
      {deleteUrlId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Delete Short Link?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to delete this URL? This action cannot be undone. All visitor analytics will be permanently destroyed.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setDeleteUrlId(null)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
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
      <div className="absolute w-8 h-8 rounded-full border-4 border-slate-200 dark:border-slate-800" />
      <div className="absolute w-8 h-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
    </div>
  );
}
