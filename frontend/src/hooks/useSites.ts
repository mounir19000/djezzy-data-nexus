import { useQuery } from '@tanstack/react-query';

const fetchSites = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch('http://localhost:4000/api/sites', {
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
  const res = await fetch(`http://localhost:4000/api/sites/${siteId}`, {
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
