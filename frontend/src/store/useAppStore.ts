import { create } from 'zustand';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AppState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Auth
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  theme: 'dark',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),
  
  // Auth Initial State
  token: typeof window !== 'undefined' ? localStorage.getItem('djezzy_token') : null,
  user: typeof window !== 'undefined' && localStorage.getItem('djezzy_user') ? JSON.parse(localStorage.getItem('djezzy_user')!) : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('djezzy_token') : false,
  
  login: (token, user) => {
    localStorage.setItem('djezzy_token', token);
    localStorage.setItem('djezzy_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('djezzy_token');
    localStorage.removeItem('djezzy_user');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));
