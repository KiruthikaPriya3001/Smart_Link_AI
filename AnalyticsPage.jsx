import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { getPublicBaseUrl, getShortUrl } from '../utils/url';
import QrCodeGenerator from '../components/QrCodeGenerator';
import { 
  ArrowLeft, RefreshCw, Calendar, MousePointerClick, Users, 
  Clock, Link2, Sparkles, AlertCircle, Copy, Check, Eye, CheckCircle2,
  Folder, Tag, Globe, Lock, ShieldAlert, Cpu
} from 'lucide-react';

export default function AnalyticsPage() {
  const { urlId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics/${urlId}`);
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch analytics data.', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [urlId]);

  const handleCopyLink = () => {
    if (!analytics?.url) return;
    const slug = analytics.url.customAlias || analytics.url.shortCode;
    const shortUrl = getShortUrl(slug);

    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    showToast('Short URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPublicLink = () => {
    if (!analytics?.url) return;
    const slug = analytics.url.customAlias || analytics.url.shortCode;
    const publicUrl = `${getPublicBaseUrl()}/stats/${slug}`;

    navigator.clipboard.writeText(publicUrl);
    setPublicLinkCopied(true);
    showToast('Public stats page link copied!');
    setTimeout(() => setPublicLinkCopied(false), 2000);
  };

  const getFullShortUrl = () => {
    if (!analytics?.url) return '';
    const slug = analytics.url.customAlias || analytics.url.shortCode;
    return getShortUrl(slug);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHealthBadgeDetails = (health) => {
    const status = health?.status || 'unchecked';
    const code = health?.statusCode || '';
    const lastChecked = health?.lastChecked ? new Date(health.lastChecked).toLocaleTimeString() : '';

    if (status === 'healthy') {
      return (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 rounded-2xl">
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <div className="text-xs">
            <p className="font-extrabold text-emerald-800 dark:text-emerald-350">Link Destination is Healthy ({code || 200})</p>
            <p className="text-slate-500 mt-0.5">Last checked: {lastChecked || 'Just now'} &bull; Status: OK</p>
          </div>
        </div>
      );
    }
    if (status === 'broken') {
      return (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/30 rounded-2xl">
          <div className="w-4 h-4 rounded-full bg-rose-500 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-extrabold text-rose-800 dark:text-rose-400">Destination Page Unreachable ({code || 'Error'})</p>
            <p className="text-rose-600 dark:text-rose-450 mt-0.5 font-medium">Error: {health?.errorMessage || 'Broken link'}</p>
          </div>
        </div>
      );
    }
    if (status === 'loop') {
      return (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-150 dark:border-amber-900/30 rounded-2xl">
          <div className="w-4 h-4 rounded-full bg-amber-500 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-extrabold text-amber-800 dark:text-amber-400">Redirect Loop Detected</p>
            <p className="text-amber-600 dark:text-amber-450 mt-0.5 font-medium">Link forwards recursively, potentially crashing visitors.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="w-4 h-4 rounded-full bg-slate-400 flex-shrink-0" />
        <div className="text-xs">
          <p className="font-extrabold text-slate-700 dark:text-slate-300">Health Check Pending</p>
          <p className="text-slate-500 mt-0.5">Audit is processing or has not run for this destination yet.</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800" />
          <div className="absolute w-10 h-10 rounded-full border-4 border-indigo-650 border-t-transparent animate-spin" />
        </div>
        <span className="text-sm font-semibold">Generating link insights...</span>
      </div>
    );
  }

  const { url, summary, insights, smartExpiry, recentVisits } = analytics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Back to dashboard & Public page link */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        
        {url.isPublicAnalytics && (
          <button
            onClick={() => navigate(`/stats/${url.customAlias || url.shortCode}`)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View Public Page
          </button>
        )}
      </div>

      {/* URL Meta details card */}
      <div className="bg-white/90 dark:bg-slate-900 border border-brand-100 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden transition-all shadow-sm">
        <div className="absolute right-0 top-0 w-32 h-32 bg-brand-50/50 rounded-bl-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider font-mono">
              TARGET URL: {url.originalUrl.substring(0, 100)}...
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
              {url.customAlias ? `smartlink.app/${url.customAlias}` : `/${url.shortCode}`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all font-semibold">
              Original: <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-500">{url.originalUrl}</a>
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-slate-800 text-brand-700 dark:text-brand-300 font-bold text-xs transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Health Diagnostic Banner */}
      {getHealthBadgeDetails(url.healthStatus)}

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/90 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Click Redirects</span>
            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{summary.totalClicks}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
            <MousePointerClick className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-white/90 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Unique Visitors</span>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{summary.uniqueVisitors}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-900 border border-amber-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Last Click Received</span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {summary.lastVisitedTime ? formatDate(summary.lastVisitedTime) : 'Never'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Side Bar Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Recharts graphs */}
        <div className="lg:col-span-8 space-y-6">
          <AnalyticsCharts data={analytics} />

          {/* AI insights audits */}
          {url.aiInsights && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden transition-all shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-950 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                AI Link Insights Audit
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Categorization Category</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{url.aiInsights.category}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Website Type Profile</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{url.aiInsights.websiteType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Link Safety Risk score</span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${url.aiInsights.riskScore}%` }} 
                        className={`h-full rounded-full ${
                          url.aiInsights.riskScore > 50 ? 'bg-rose-500' :
                          url.aiInsights.riskScore > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-black font-mono">{url.aiInsights.riskScore}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">SEO Friendly compliance score</span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${url.aiInsights.seoFriendliness}%` }} 
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                    <span className="text-xs font-black font-mono">{url.aiInsights.seoFriendliness}/100</span>
                  </div>
                </div>
              </div>

              {url.aiInsights.seoReport?.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">SEO Diagnostic Audit Logs</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {url.aiInsights.seoReport.map((rep, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-655 dark:text-slate-400">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{rep}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Insights Coach specific to click trends */}
          {insights && insights.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900/40 dark:to-indigo-950/30 border border-indigo-200/50 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden transition-all shadow-sm">
              <div className="flex items-center gap-2 border-b border-indigo-200/50 dark:border-slate-800 pb-3 mb-4">
                <div className="p-1.5 rounded-lg bg-brand-100 dark:bg-brand-950/40">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-pulse" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                  AI Link Performance Insights
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.map((insight, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2.5 p-3.5 rounded-xl border border-brand-100 dark:border-indigo-950 bg-white/80 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium hover:border-brand-300 hover:shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smart Expiry Recommendation Box */}
          {smartExpiry && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900/20 dark:to-amber-955/10 border border-amber-200/40 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 animate-bounce" />
                Smart Expiry Recommendation
              </h4>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-slate-950/20 p-3 rounded-xl border border-amber-100/50 dark:border-slate-850">
                {smartExpiry.recommendation}
              </p>
            </div>
          )}

          {/* 4. Recent Visitors Table log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Recent Click Events (Last 10)</h3>
            </div>
            
            {recentVisits.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">No traffic logged yet. Share your short link to populate logs.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-150 font-semibold uppercase tracking-wider">
                      <th className="p-3">Time</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Browser/OS</th>
                      <th className="p-3">Device</th>
                      <th className="p-3">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350">
                    {recentVisits.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                        <td className="p-3 font-mono">{formatDate(v.timestamp)}</td>
                        <td className="p-3 font-semibold">
                          {v.city !== 'Unknown' || v.country !== 'Unknown' ? `${v.city}, ${v.country}` : 'Unknown'}
                        </td>
                        <td className="p-3 font-medium">
                          {v.browser} &bull; {v.os}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            v.device === 'Mobile' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' :
                            v.device === 'Tablet' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {v.device}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{v.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Side Bar controls: QR Generator & Public Info */}
        <div className="lg:col-span-4 space-y-6">
          <QrCodeGenerator value={getFullShortUrl()} title={url.customAlias || url.shortCode} />
          
          {/* Public Sharing Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm text-sm">
            <h4 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-500" />
              Public Statistics Console
            </h4>
            {url.isPublicAnalytics ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Anyone with this link can view the simplified traffic trends without logging in:
                </p>
                <div className="flex gap-1">
                  <input
                    type="text"
                    readOnly
                    value={`${getPublicBaseUrl()}/stats/${url.customAlias || url.shortCode}`}
                    className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-mono truncate text-indigo-600"
                  />
                  <button
                    onClick={handleCopyPublicLink}
                    className="px-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-all"
                    title="Copy Public link"
                  >
                    {publicLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/20 text-xs text-slate-500">
                <Lock className="w-4.5 h-4.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  Public statistics is disabled. Enable "Enable Public Analytics Page" in settings to share reports.
                </span>
              </div>
            )}
          </div>

          {/* Expiry and status stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm text-sm">
            <h4 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-3">Link Status Info</h4>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Short URL Status</span>
              {url.expiryDate && new Date() > new Date(url.expiryDate) ? (
                <span className="px-2 py-0.5 rounded-full text-xs bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40 font-bold">Expired</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 font-bold">Active</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Created Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-250 font-mono text-xs">{formatDate(url.createdAt).split('at')[0]}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Scheduled Expiry</span>
              <span className="font-semibold text-slate-800 dark:text-slate-250 font-mono text-xs">
                {url.expiryDate ? formatDate(url.expiryDate).split('at')[0] : 'None'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
