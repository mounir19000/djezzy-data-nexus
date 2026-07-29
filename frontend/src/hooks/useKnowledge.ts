import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../lib/api';

const fetchKnowledge = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/knowledge`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Échec du chargement des articles de connaissance');
  return res.json();
};

export const useKnowledgeBase = () => {
  return useQuery({
    queryKey: ['knowledge'],
    queryFn: fetchKnowledge,
  });
};

export const useCreateKnowledgeArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      category: string;
      tags: string;
      content: string;
    }) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`${API_BASE_URL}/api/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Échec de la création de l’article de connaissance');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    }
  });
};
