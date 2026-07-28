import { useQuery } from '@tanstack/react-query';

const fetchMaintenanceTasks = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch('http://localhost:4000/api/maintenance', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch maintenance tasks');
  return res.json();
};

export const useMaintenanceTasks = () => {
  return useQuery({
    queryKey: ['maintenance'],
    queryFn: fetchMaintenanceTasks,
  });
};
