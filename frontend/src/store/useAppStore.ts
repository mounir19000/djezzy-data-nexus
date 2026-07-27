import { create } from 'zustand';

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  userRole: 'Super Admin' | 'Engineer' | 'Site Operator';
  setUserRole: (role: 'Super Admin' | 'Engineer' | 'Site Operator') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  userRole: 'Engineer', // Defaulting to Engineer for the MVP
  setUserRole: (role) => set({ userRole: role }),
}));
