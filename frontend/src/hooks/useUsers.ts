import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../lib/api';

const fetchUsers = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Échec du chargement des utilisateurs');
  return res.json();
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};
