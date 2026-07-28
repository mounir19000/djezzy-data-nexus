import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchIncidents = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch('http://localhost:4000/api/incidents', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
};

export const useIncidents = () => {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: fetchIncidents,
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
