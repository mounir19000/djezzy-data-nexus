const DEFAULT_API_PORT = '4000';

const normalizeApiUrl = (url?: string) => {
  const trimmed = url?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : undefined;
};

const inferApiUrl = () => {
  if (typeof window === 'undefined') {
    return `http://localhost:${DEFAULT_API_PORT}`;
  }

  return `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}`;
};

export const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL) || inferApiUrl();
