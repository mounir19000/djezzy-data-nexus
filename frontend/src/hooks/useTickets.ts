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
    }
  });
};
