import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const fetchTickets = async (siteId?: string) => {
  const token = localStorage.getItem('djezzy_token');
  const params = new URLSearchParams();
  if (siteId) params.set('siteId', siteId);
  const query = params.toString();
  const res = await fetch(`http://localhost:4000/api/tickets${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
};

export const useTickets = (siteId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshTickets = () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    };

    window.addEventListener('ticket_update', refreshTickets);
    window.addEventListener('alarm_update', refreshTickets);

    return () => {
      window.removeEventListener('ticket_update', refreshTickets);
      window.removeEventListener('alarm_update', refreshTickets);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['tickets', siteId || 'all'],
    queryFn: () => fetchTickets(siteId),
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, assignedTo }: { id: string, status: string, assignedTo?: string }) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`http://localhost:4000/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status, ...(assignedTo !== undefined ? { assignedTo } : {}) })
      });
      const body = await res.json();
      if (!res.ok) {
        const message = typeof body?.error === 'string' ? body.error : body?.error?.message || 'Failed to update status';
        throw new Error(message);
      }
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['site-dashboard'] });
    }
  });
};

export const useSubmitTicketReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, report }: {
      id: string;
      report: {
        isFailure: boolean;
        failureDomain: string;
        rootCause: string;
        actionTaken: string;
        serviceImpact: string;
        currentState: string;
        notes?: string;
      };
    }) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`http://localhost:4000/api/tickets/${id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(report)
      });
      const body = await res.json();
      if (!res.ok) {
        const message = typeof body?.error === 'string' ? body.error : body?.error?.message || 'Failed to submit ticket report';
        throw new Error(message);
      }
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['site-dashboard'] });
    }
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`http://localhost:4000/api/tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = typeof body?.error === 'string' ? body.error : body?.error?.message || 'Failed to delete ticket';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['site-dashboard'] });
    }
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      alarmId?: string;
      equipmentId?: string;
      title?: string;
      priority?: 'low' | 'medium' | 'high';
      assignedTo?: string;
      dueDate?: string;
    }) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch('http://localhost:4000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (!res.ok) {
        const message = typeof body?.error === 'string' ? body.error : body?.error?.message || 'Failed to create ticket';
        const error = new Error(message) as Error & { ticket?: any };
        error.ticket = body?.ticket;
        throw error;
      }
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['site-dashboard'] });
    }
  });
};
