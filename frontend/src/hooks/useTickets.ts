import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchTickets = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch('http://localhost:4000/api/tickets', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
};

export const useTickets = () => {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`http://localhost:4000/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
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
