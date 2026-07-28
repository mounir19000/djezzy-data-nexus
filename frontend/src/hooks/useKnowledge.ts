import { useQuery } from '@tanstack/react-query';

const fetchKnowledge = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch('http://localhost:4000/api/knowledge', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch KB articles');
  return res.json();
};

export const useKnowledgeBase = () => {
  return useQuery({
    queryKey: ['knowledge'],
    queryFn: fetchKnowledge,
  });
};
