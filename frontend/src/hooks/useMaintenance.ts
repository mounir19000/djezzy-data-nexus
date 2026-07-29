import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../lib/api';

const fetchMaintenanceTasks = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/maintenance`, {
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

export const useCreateMaintenanceTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      equipmentId: string;
      status?: string;
      assignedTo?: string;
      scheduledDate: string;
    }) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`${API_BASE_URL}/api/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create maintenance task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['site-dashboard'] });
    }
  });
};
