import { useQuery } from '@tanstack/react-query';

const fetchDashboardMetrics = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch('http://localhost:4000/api/dashboard/metrics', {
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
