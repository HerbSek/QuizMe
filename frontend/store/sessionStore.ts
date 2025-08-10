import { create } from 'zustand';
import {
  GameSession,
  Leaderboard,
  PlayerAnswerCreate,
  AnswerResponse,
  startGameSession,
  joinGameSession,
  submitAnswer,
  getLeaderboard,
} from '../lib/session';

interface SessionState {
  currentSession: GameSession | null;
  leaderboard: Leaderboard | null;
  isLoading: boolean;
  error: string | null;
  lastAnswer: AnswerResponse | null;
  
  // Actions
  startSession: (quizId: number) => Promise<GameSession>;
  joinSession: (gameCode: string) => Promise<GameSession>;
  submitAnswer: (sessionId: number, answerData: PlayerAnswerCreate) => Promise<AnswerResponse>;
  fetchLeaderboard: (sessionId: number) => Promise<void>;
  clearError: () => void;
  clearSession: () => void;
  setCurrentSession: (session: GameSession | null) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  leaderboard: null,
  isLoading: false,
  error: null,
  lastAnswer: null,

  startSession: async (quizId: number) => {
    set({ isLoading: true, error: null });
    try {
      const session = await startGameSession(quizId);
      set({ currentSession: session, isLoading: false });
      return session;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to start game session',
      });
      throw error;
    }
  },

  joinSession: async (gameCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await joinGameSession(gameCode);
      set({ currentSession: session, isLoading: false });
      return session;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to join game session',
      });
      throw error;
    }
  },

  submitAnswer: async (sessionId: number, answerData: PlayerAnswerCreate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await submitAnswer(sessionId, answerData);
      set({ lastAnswer: response, isLoading: false });
      return response;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to submit answer',
      });
      throw error;
    }
  },

  fetchLeaderboard: async (sessionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const leaderboard = await getLeaderboard(sessionId);
      set({ leaderboard, isLoading: false });
    } catch (error: any) {
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
  
  setCurrentSession: (session: GameSession | null) => set({ currentSession: session }),
}));
