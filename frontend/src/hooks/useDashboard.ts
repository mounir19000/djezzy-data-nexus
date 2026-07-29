import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../lib/api';

const fetchDashboardMetrics = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/dashboard/metrics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
};

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardMetrics,
  });
};
