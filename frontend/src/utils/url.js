export const getPublicBaseUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_APP_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return 'https://smartlink-ai.vercel.app';
};

export const getShortUrl = (slug) => `${getPublicBaseUrl().replace(/\/$/, '')}/${slug}`;
