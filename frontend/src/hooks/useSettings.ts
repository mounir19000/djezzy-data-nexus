import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../lib/api';

const fetchRules = async (siteId?: string) => {
  const token = localStorage.getItem('djezzy_token');
  const url = siteId 
    ? `${API_BASE_URL}/api/settings/rules?siteId=${siteId}`
    : `${API_BASE_URL}/api/settings/rules`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Échec du chargement des règles expertes');
  return res.json();
};

export const useExpertRules = (siteId?: string) => {
  return useQuery({
    queryKey: ['rules', siteId],
    queryFn: () => fetchRules(siteId),
  });
};

export const useUpdateRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, threshold }: { id: string, threshold: number }) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`${API_BASE_URL}/api/settings/rules/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ threshold })
      });
      if (!res.ok) throw new Error('Échec de la mise à jour de la règle');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    }
  });
};
