import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchRules = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch('http://localhost:4000/api/settings/rules', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch expert rules');
  return res.json();
};

export const useExpertRules = () => {
  return useQuery({
    queryKey: ['rules'],
    queryFn: fetchRules,
  });
};

export const useUpdateRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, threshold }: { id: string, threshold: number }) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`http://localhost:4000/api/settings/rules/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ threshold })
      });
      if (!res.ok) throw new Error('Failed to update rule');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    }
  });
};
