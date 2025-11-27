import { create } from 'zustand';
import type { User } from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  layout: {
    sidebarWidth: number;
    graphHeight: number;
  };
  
  setUser: (user: User | null) => void;
  setAuthenticated: (status: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setGraphHeight: (height: number) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  theme: 'system',
  sidebarOpen: true,
  layout: {
    sidebarWidth: 256,
    graphHeight: 600,
  },

  setUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    set({ user });
  },

  setAuthenticated: (status) => set({ isAuthenticated: status }),

  setTheme: (theme) => set({ theme }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarWidth: (width) => set((state) => ({ layout: { ...state.layout, sidebarWidth: width } })),
  setGraphHeight: (height) => set((state) => ({ layout: { ...state.layout, graphHeight: height } })),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
}));
