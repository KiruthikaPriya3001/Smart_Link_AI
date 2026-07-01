import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import QrCodeGenerator from '../components/QrCodeGenerator';
import { 
  Link2, Sparkles, AlertCircle, RefreshCw, Calendar, 
  ArrowLeft, CheckCircle2, ChevronRight, Copy, Check,
  Folder, Tag, Globe, Plus, ShieldAlert, BadgeAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getShortUrl } from '../utils/url';

export default function CreateUrlPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Inputs
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryType, setExpiryType] = useState('none'); // 'none', 'days', 'date'
  const [expiryDays, setExpiryDays] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [isPublicAnalytics, setIsPublicAnalytics] = useState(false);

  // Lists from DB
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  
  // App States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdUrlObj, setCreatedUrlObj] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [fRes, tRes] = await Promise.all([
          api.get('/folders'),
          api.get('/tags')
        ]);
        setFolders(fRes.data.data);
        setTags(tRes.data.data);
      } catch (err) {
        console.error('Error fetching categories/tags:', err);
      }
    };
    fetchResources();
  }, []);

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
        setTags(tRes.data.data);
        // Automatically check the new tag
        setSelectedTagIds(prev => [...prev, response.data.data._id]);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating tag', 'error');
    }
  };

  const handleTagToggle = (tagId) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      showToast('Please provide a destination URL.', 'error');
      return;
    }

    setError('');
    setLoading(true);

    // Prepare payload
    const payload = {
      originalUrl,
      customAlias: customAlias.trim() || undefined,
      folderId: selectedFolderId || undefined,
      tags: selectedTagIds,
      isPublicAnalytics,
    };

    if (expiryType === 'days' && expiryDays) {
      payload.expiryDays = expiryDays;
    } else if (expiryType === 'date' && expiryDate) {
      payload.expiryDate = expiryDate;
    }

    try {
      const response = await api.post('/url/create', payload);
      if (response.data.success) {
        setCreatedUrlObj(response.data.data);
        showToast('Smart URL created successfully!');
        
        // Celebrate!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to shorten link. Try again.');
      showToast(err.response?.data?.message || 'Error shortening link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdUrlObj) return;
    const slug = createdUrlObj.customAlias || createdUrlObj.shortCode;
    const shortUrl = getShortUrl(slug);

    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    showToast('Short URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setOriginalUrl('');
    setCustomAlias('');
    setExpiryType('none');
    setExpiryDays('');
    setExpiryDate('');
    setSelectedFolderId('');
    setSelectedTagIds([]);
    setIsPublicAnalytics(false);
    setCreatedUrlObj(null);
    setError('');
  };

  const getFullShortUrl = () => {
    if (!createdUrlObj) return '';
    const slug = createdUrlObj.customAlias || createdUrlObj.shortCode;
    return slug ? getShortUrl(slug) : '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Back to dashboard button */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* URL Form Card */}
        <div className="lg:col-span-7 bg-white/90 dark:bg-slate-900 border border-brand-100/50 dark:border-slate-800 rounded-3xl p-6 sm:p-8 transition-all shadow-sm backdrop-blur-sm">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-100 dark:bg-brand-950/40">
                <Link2 className="w-5 h-5 text-brand-600 dark:text-brand-400 rotate-45" />
              </div>
              Shorten destination URL
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-semibold">
              Enter details below to generate a trackable Smart URL.
            </p>
          </div>

          {!createdUrlObj ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Destination URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Original Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://github.com/facebook/react"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-brand-500 text-sm font-mono transition-colors"
                />
              </div>

              {/* Custom Alias */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Custom Branded Alias (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">/your-alias</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-semibold text-slate-400 select-none font-mono">
                    smartlink.app/
                  </span>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    placeholder="react-docs"
                    className="w-full pl-[110px] pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-brand-500 text-sm font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Folder Selector (Productivity Mode) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  Assign to Folder
                </label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-350"
                >
                  <option value="">No Folder (General)</option>
                  {folders.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Add Link Tags
                </label>
                {/* Available tags checklist */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-955/35">
                    {tags.map((t) => {
                      const isChecked = selectedTagIds.includes(t._id);
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
                    placeholder="New tag label name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs"
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
                    className="px-3 bg-slate-150 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tag
                  </button>
                </div>
              </div>

              {/* Public stats toggle */}
              <div className="flex items-center gap-2.5 py-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                <input
                  type="checkbox"
                  id="public-stats-box"
                  checked={isPublicAnalytics}
                  onChange={(e) => setIsPublicAnalytics(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-800 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <label htmlFor="public-stats-box" className="text-xs font-medium text-slate-650 dark:text-slate-400 select-none cursor-pointer flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-450" />
                  Make Analytics Publicly Viewable
                </label>
              </div>

              {/* Expiry Selector */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Link Expiration Limit
                </label>
                
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { type: 'none', label: 'Indefinite' },
                    { type: 'days', label: 'X Days' },
                    { type: 'date', label: 'Calendar' },
                  ].map((x) => (
                    <button
                      key={x.type}
                      type="button"
                      onClick={() => setExpiryType(x.type)}
                      className={`py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 select-none transition-all ${
                        expiryType === x.type
                          ? 'border-brand-600 dark:border-brand-400 text-brand-600 dark:text-indigo-400 bg-brand-50/20 dark:bg-brand-950/10'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {x.label}
                    </button>
                  ))}
                </div>

                {/* Relative Days */}
                {expiryType === 'days' && (
                  <div className="space-y-1.5 animate-fade-in mt-3">
                    <label className="text-xs text-slate-400 font-bold uppercase">Expires After (Days)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                      placeholder="e.g. 7"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                    />
                  </div>
                )}

                {/* Calendar Date */}
                {expiryType === 'date' && (
                  <div className="space-y-1.5 animate-fade-in mt-3">
                    <label className="text-xs text-slate-400 font-bold uppercase">Select Date</label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/25 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-brand-500/10 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Shortening Link...
                  </>
                ) : (
                  <>
                    Create Smart Link
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                    Smart Link Shortened!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Your URL is shortened and logging metrics.
                  </p>
                </div>
              </div>

              {/* Show link output */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Shortened Branded Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getFullShortUrl()}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm font-semibold font-mono text-brand-600 dark:text-brand-400"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors"
                      title="Copy URL"
                    >
                      {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* AI Insights success visual rendering */}
                {createdUrlObj.aiInsights && (
                  <div className="p-5 rounded-2xl border border-indigo-150 dark:border-slate-800 bg-indigo-50/20 dark:bg-slate-900/50 space-y-4">
                    <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      AI Link Assessment Audit
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Category</span>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{createdUrlObj.aiInsights.category}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Website Type</span>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{createdUrlObj.aiInsights.websiteType}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                          Risk Assessment Score
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full">
                            <div 
                              style={{ width: `${createdUrlObj.aiInsights.riskScore}%` }} 
                              className={`h-full rounded-full ${
                                createdUrlObj.aiInsights.riskScore > 50 ? 'bg-rose-500' :
                                createdUrlObj.aiInsights.riskScore > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <span className={`text-xs font-bold font-mono ${
                            createdUrlObj.aiInsights.riskScore > 50 ? 'text-rose-600' :
                            createdUrlObj.aiInsights.riskScore > 20 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>{createdUrlObj.aiInsights.riskScore}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">SEO Compliance Rank</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full">
                            <div 
                              style={{ width: `${createdUrlObj.aiInsights.seoFriendliness}%` }} 
                              className="h-full bg-indigo-650 rounded-full"
                            />
                          </div>
                          <span className="text-xs font-bold font-mono text-indigo-750 dark:text-indigo-400">{createdUrlObj.aiInsights.seoFriendliness}/100</span>
                        </div>
                      </div>
                    </div>

                    {/* SEO Reports checklist */}
                    {createdUrlObj.aiInsights.seoReport?.length > 0 && (
                      <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                        <span className="text-[10px] text-slate-450 font-bold uppercase">Crawler Check Log</span>
                        <div className="space-y-1">
                          {createdUrlObj.aiInsights.seoReport.map((report, rIdx) => (
                            <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-450 font-medium">
                              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{report}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={resetForm}
                    className="py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 text-sm font-bold rounded-xl transition-all"
                  >
                    Shorten Another
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/10 transition-all"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QR Preview Panel */}
        <div className="lg:col-span-5 space-y-4">
          {createdUrlObj ? (
            <div className="animate-fade-in">
              <QrCodeGenerator 
                value={getFullShortUrl()} 
                title={createdUrlObj.customAlias || createdUrlObj.shortCode} 
              />
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-400 dark:text-slate-600 min-h-[300px] flex flex-col items-center justify-center">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2 animate-pulse" />
              <p className="text-sm font-semibold">QR Code Live Preview</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-[200px] mx-auto">
                Once shortened, the vector QR code code generates here for SVG/PNG export downloads.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
