import { create } from 'zustand';
import { startGameSession, joinGameSession, submitAnswer, getLeaderboard } from '../lib/api';

export const SessionStatus = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  FINISHED: 'finished',
};

export const useSessionStore = create((set, get) => ({
  currentSession: null,
  leaderboard: null,
  isLoading: false,
  error: null,
  lastAnswer: null,

  startSession: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const session = await startGameSession(quizId);
      set({ currentSession: session, isLoading: false });
      return session;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to start game session',
      });
      throw error;
    }
  },

  joinSession: async (gameCode) => {
    set({ isLoading: true, error: null });
    try {
      const session = await joinGameSession(gameCode);
      set({ currentSession: session, isLoading: false });
      return session;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to join game session',
      });
      throw error;
    }
  },

  submitAnswer: async (sessionId, answerData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await submitAnswer(sessionId, answerData);
      set({ lastAnswer: response, isLoading: false });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to submit answer',
      });
      throw error;
    }
  },

  fetchLeaderboard: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const leaderboard = await getLeaderboard(sessionId);
      set({ leaderboard, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to fetch leaderboard',
      });
    }
  },

  clearError: () => set({ error: null }),
  
  clearSession: () => set({ 
    currentSession: null, 
    leaderboard: null, 
    lastAnswer: null,
    error: null 
  }),
  
  setCurrentSession: (session) => set({ currentSession: session }),
}));
