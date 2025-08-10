import { create } from 'zustand';
import { User, login, signup, getCurrentUser, setToken, removeToken, LoginCredentials, SignupCredentials } from '../lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });
    try {
      const authResponse = await login(credentials);
      setToken(authResponse.access_token);
      
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (credentials: SignupCredentials) => {
    set({ isLoading: true });
    try {
      const authResponse = await signup(credentials);
      setToken(authResponse.access_token);
      
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    removeToken();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      removeToken();
    }
  },
}));
