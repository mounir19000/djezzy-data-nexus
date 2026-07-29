import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../lib/api';

const fetchSites = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/sites`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch sites');
  return res.json();
};

export const useSites = () => {
  return useQuery({
    queryKey: ['sites'],
    queryFn: fetchSites,
  });
};

const fetchSite = async (siteId: string) => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/sites/${siteId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch site');
  return res.json();
};

export const useSite = (siteId?: string) => {
  return useQuery({
    queryKey: ['site', siteId],
    queryFn: () => fetchSite(siteId!),
    enabled: !!siteId,
  });
};

const fetchSiteDashboard = async (siteId: string) => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/sites/${siteId}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch site dashboard');
  return res.json();
};

export const useSiteDashboard = (siteId?: string) => {
  return useQuery({
    queryKey: ['site-dashboard', siteId],
    queryFn: () => fetchSiteDashboard(siteId!),
    enabled: !!siteId,
  });
};
