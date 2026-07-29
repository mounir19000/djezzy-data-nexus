import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { API_BASE_URL } from '../lib/api';

const readErrorMessage = async (res: Response, fallback: string) => {
  const body = await res.json().catch(() => null);
  return typeof body?.error === 'string' ? body.error : body?.error?.message || fallback;
};

const invalidateMaintenanceQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['maintenance'] });
  queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
  queryClient.invalidateQueries({ queryKey: ['maintenance-history'] });
  queryClient.invalidateQueries({ queryKey: ['schedules'] });
  queryClient.invalidateQueries({ queryKey: ['sites'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['site-dashboard'] });
};

const fetchMaintenanceTasks = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/maintenance`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch maintenance tasks');
  return res.json();
};

const fetchMaintenanceHistory = async ({ queryKey }: { queryKey: [string, string, string] }) => {
  const [, searchTerm, siteId] = queryKey;
  const token = localStorage.getItem('djezzy_token');
  const params = new URLSearchParams();
  if (searchTerm) params.set('q', searchTerm);
  if (siteId) params.set('siteId', siteId);
  const query = params.toString();

  const res = await fetch(`${API_BASE_URL}/api/maintenance/history${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await readErrorMessage(res, 'Failed to fetch maintenance history'));
  return res.json();
};

const useMaintenanceRealtimeInvalidation = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshMaintenance = () => {
      invalidateMaintenanceQueries(queryClient);
    };

    window.addEventListener('maintenance_update', refreshMaintenance);
    return () => window.removeEventListener('maintenance_update', refreshMaintenance);
  }, [queryClient]);

  return queryClient;
};

export const useMaintenanceTasks = () => {
  useMaintenanceRealtimeInvalidation();

  return useQuery({
    queryKey: ['maintenance'],
    queryFn: fetchMaintenanceTasks,
  });
};

export const useMaintenanceHistory = (searchTerm = '', siteId = '') => {
  useMaintenanceRealtimeInvalidation();

  return useQuery({
    queryKey: ['maintenance-history', searchTerm.trim(), siteId],
    queryFn: fetchMaintenanceHistory,
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
      if (!res.ok) throw new Error(await readErrorMessage(res, 'Failed to create maintenance task'));
      return res.json();
    },
    onSuccess: () => {
      invalidateMaintenanceQueries(queryClient);
    }
  });
};

export const useDeleteMaintenanceTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`${API_BASE_URL}/api/maintenance/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, 'Failed to delete maintenance task'));
    },
    onSuccess: () => {
      invalidateMaintenanceQueries(queryClient);
    }
  });
};

export const useDeleteMaintenanceSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`${API_BASE_URL}/api/maintenance/schedules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, 'Failed to delete maintenance schedule'));
    },
    onSuccess: () => {
      invalidateMaintenanceQueries(queryClient);
    }
  });
};
