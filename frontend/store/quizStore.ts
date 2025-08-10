import { create } from 'zustand';
import { Quiz, QuizSummary, QuizCreate, createQuiz, getMyQuizzes, getQuiz, deleteQuiz } from '../lib/quiz';

interface QuizState {
  quizzes: QuizSummary[];
  currentQuiz: Quiz | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createQuiz: (quizData: QuizCreate) => Promise<Quiz>;
  fetchMyQuizzes: () => Promise<void>;
  fetchQuiz: (quizId: number) => Promise<void>;
  deleteQuiz: (quizId: number) => Promise<void>;
  clearError: () => void;
  setCurrentQuiz: (quiz: Quiz | null) => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  error: null,

  createQuiz: async (quizData: QuizCreate) => {
    set({ isLoading: true, error: null });
    try {
      const newQuiz = await createQuiz(quizData);
      set({ isLoading: false });
      
      // Refresh the quiz list
      get().fetchMyQuizzes();
      
      return newQuiz;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to create quiz' 
      });
      throw error;
    }
  },

  fetchMyQuizzes: async () => {
    set({ isLoading: true, error: null });
    try {
      const quizzes = await getMyQuizzes();
      set({ quizzes, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to fetch quizzes' 
      });
    }
  },

  fetchQuiz: async (quizId: number) => {
    set({ isLoading: true, error: null });
    try {
      const quiz = await getQuiz(quizId);
      set({ currentQuiz: quiz, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to fetch quiz' 
      });
    }
  },

  deleteQuiz: async (quizId: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteQuiz(quizId);
      set({ isLoading: false });
      
      // Remove from local state
      const { quizzes } = get();
      set({ quizzes: quizzes.filter(q => q.id !== quizId) });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to delete quiz' 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  
  setCurrentQuiz: (quiz: Quiz | null) => set({ currentQuiz: quiz }),
}));
