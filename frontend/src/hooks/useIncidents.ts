import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const fetchIncidents = async (siteId?: string) => {
  const token = localStorage.getItem('djezzy_token');
  const params = new URLSearchParams();
  if (siteId) params.set('siteId', siteId);
  const query = params.toString();
  const res = await fetch(`http://localhost:4000/api/incidents${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
};

export const useIncidents = (siteId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshIncidents = () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    };

    window.addEventListener('alarm_update', refreshIncidents);
    window.addEventListener('ticket_update', refreshIncidents);

    return () => {
      window.removeEventListener('alarm_update', refreshIncidents);
      window.removeEventListener('ticket_update', refreshIncidents);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['incidents', siteId || 'all'],
    queryFn: () => fetchIncidents(siteId),
  });
};

export const useAcknowledgeIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`http://localhost:4000/api/incidents/${id}/acknowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to acknowledge');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    }
  });
};
