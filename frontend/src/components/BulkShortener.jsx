import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, RefreshCw, Copy, Check, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { getShortUrl } from '../utils/url';

export default function BulkShortener({ onComplete }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length <= 1) {
      throw new Error('CSV is empty or lacks headers. Ensure it has "name,url" format.');
    }

    const header = lines[0].toLowerCase().split(',');
    const urlIndex = header.findIndex(h => h.includes('url'));
    const nameIndex = header.findIndex(h => h.includes('name') || h.includes('alias'));

    if (urlIndex === -1) {
      throw new Error('CSV must contain a header containing "url" (e.g. name,url)');
    }

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      // Split by comma, but respect quote strings if present
      const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => 
        c.trim().replace(/^["']|["']$/g, '')
      );
      
      const url = cols[urlIndex];
      const name = nameIndex !== -1 ? cols[nameIndex] : '';

      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        parsed.push({ name, url });
      }
    }
    return parsed;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      setFile(null);
      setPreviewData([]);
      return;
    }

    setError('');
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setError('No valid URLs found in CSV. Ensure links start with http:// or https://');
          setPreviewData([]);
        } else {
          setPreviewData(parsed);
        }
      } catch (err) {
        setError(err.message);
        setPreviewData([]);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // trigger input change simulation
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleBulkSubmit = async () => {
    if (previewData.length === 0) return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/url/bulk', { urls: previewData });
      if (response.data.success) {
        setResults(response.data.data);
        showToast(`Successfully shortened ${response.data.count} links!`);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        if (onComplete) {
          onComplete(); // refresh dashboard
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing batch shortening');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,url\nGithub,https://github.com/facebook/react\nGoogle,https://google.com\nPortfolio,https://myportfolio.dev/profile";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "smartlink_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = (code, index) => {
    const shortUrl = getShortUrl(code);

    navigator.clipboard.writeText(shortUrl);
    setCopiedIndex(index);
    showToast('Short URL copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,Original URL,Short URL,Alias\n";
    results.forEach((row) => {
      const shortUrl = getShortUrl(row.customAlias || row.shortCode);
      csvContent += `"${row.originalUrl}","${shortUrl}","${row.customAlias || ''}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "smartlink_shortened_batch.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setResults([]);
    setError('');
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Bulk URL Shortener
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload a CSV sheet to generate multiple shorten links instantly.
          </p>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 font-semibold transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Template.csv
        </button>
      </div>

      {results.length === 0 ? (
        <div className="space-y-4">
          {/* File Upload Zone */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/20 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Drag & drop your CSV file here, or{' '}
                <span className="text-brand-600 dark:text-brand-400 hover:underline">browse</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                CSV files only (headers must contain "url")
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB &bull; {previewData.length} entries parsed
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 font-semibold"
              >
                Clear
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 border border-rose-100 dark:border-rose-900/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Table Preview */}
          {previewData.length > 0 && (
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-150 dark:border-slate-800 font-semibold uppercase tracking-wider">
                      <th className="p-3">Alias Name</th>
                      <th className="p-3">Target URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-950">
                    {previewData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300">
                        <td className="p-3 font-semibold">{item.name || '-'}</td>
                        <td className="p-3 truncate max-w-xs font-mono">{item.url}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleBulkSubmit}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Shortening Batch...
                  </>
                ) : (
                  <>
                    Shorten {previewData.length} Links
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Shortened Links Results ({results.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="text-xs flex items-center gap-1 px-3 py-1.5 border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 rounded-lg text-emerald-700 dark:text-emerald-400 font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={resetForm}
                className="text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 rounded-lg text-slate-700 dark:text-slate-300 font-semibold"
              >
                Shorten More
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-250 dark:border-slate-800 font-semibold uppercase tracking-wider">
                  <th className="p-3">Original Link</th>
                  <th className="p-3">Short Link</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-950">
                {results.map((row, idx) => {
                  const sCode = row.customAlias || row.shortCode;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300">
                      <td className="p-3 truncate max-w-[180px] font-mono">{row.originalUrl}</td>
                      <td className="p-3 font-semibold font-mono text-brand-600 dark:text-brand-400">
                        {`/${sCode}`}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleCopyLink(sCode, idx)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                          title="Copy Link"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
