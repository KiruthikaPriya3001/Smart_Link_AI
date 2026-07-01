/**
 * Returns the base URL used for SHORT LINK generation.
 *
 * In production (Vercel): VITE_SHORT_BASE_URL must point to the Render backend
 * e.g.  https://smartlink-backend.onrender.com
 *
 * In local dev: falls back to window.location.origin (Vite proxies /:shortCode to Express)
 *
 * WHY: The /:shortCode redirect route lives on the Express backend (Render).
 * Vercel only serves the React SPA and cannot perform DB-backed 302 redirects.
 */
export const getPublicBaseUrl = () => {
  // Production: explicit backend URL set in Vercel environment variables
  const shortBase = import.meta.env.VITE_SHORT_BASE_URL;
  if (shortBase && shortBase.trim()) {
    return shortBase.trim().replace(/\/$/, '');
  }

  // Legacy env var support
  const legacyUrl = import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_APP_URL;
  if (legacyUrl && legacyUrl.trim()) {
    return legacyUrl.trim().replace(/\/$/, '');
  }

  // Local dev: Vite proxy forwards /:shortCode → Express on port 5000
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return 'https://smartlink-backend.onrender.com';
};

export const getShortUrl = (slug) => `${getPublicBaseUrl().replace(/\/$/, '')}/${slug}`;

