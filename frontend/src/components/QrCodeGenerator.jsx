import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, Image, FileCode, Copy, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getShortUrl } from '../utils/url';

export default function QrCodeGenerator({ value, title = 'Short Link QR Code' }) {
  const [pngDataUrl, setPngDataUrl] = useState('');
  const [svgString, setSvgString] = useState('');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!value) return;

    const resolvedValue = value.startsWith('http://') || value.startsWith('https://') ? value : getShortUrl(value);

    // Generate PNG Data URI
    QRCode.toDataURL(
      resolvedValue,
      {
        width: 500,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (err) {
          console.error(err);
          showToast('Failed to generate PNG QR Code', 'error');
        } else {
          setPngDataUrl(url);
        }
      }
    );

    // Generate SVG string
    QRCode.toString(
      resolvedValue,
      {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      },
      (err, string) => {
        if (err) {
          console.error(err);
        } else {
          setSvgString(string);
        }
      }
    );
  }, [value, showToast]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    showToast('Short link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPng = () => {
    if (!pngDataUrl) return;
    const link = document.createElement('a');
    link.href = pngDataUrl;
    link.download = `smartlink-qr-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('PNG QR Code downloaded successfully!');
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartlink-qr-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('SVG QR Code downloaded successfully!');
  };

  return (
    <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-brand-600" />
        <span className="font-bold text-slate-800 dark:text-slate-200">QR Code Preview</span>
      </div>

      {/* QR Display */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-102 duration-300">
        {pngDataUrl ? (
          <img src={pngDataUrl} alt="QR Code" className="w-48 h-48 rounded" />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-slate-400">
            Generating...
          </div>
        )}
      </div>

      <div className="w-full mt-4 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mx-auto mb-2 font-mono">
          {value}
        </p>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline hover:text-brand-700 font-semibold"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          Copy short URL
        </button>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 w-full mt-5">
        <button
          onClick={downloadPng}
          disabled={!pngDataUrl}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image className="w-4 h-4 text-indigo-500" />
          PNG
        </button>
        <button
          onClick={downloadSvg}
          disabled={!svgString}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileCode className="w-4 h-4 text-emerald-500" />
          SVG
        </button>
      </div>
    </div>
  );
}
