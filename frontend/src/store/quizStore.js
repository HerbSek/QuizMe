import { create } from 'zustand';
import { createQuiz, getMyQuizzes, getQuiz, deleteQuiz } from 'lib/api';

export const useQuizStore = create((set, get) => ({
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  error: null,
  
  createQuiz: async (quizData) => {
    set({ isLoading: true, error: null });
    try {
      const newQuiz = await createQuiz(quizData);
      set({ isLoading: false });
      
      // Refresh the quiz list
      get().fetchMyQuizzes();
      
      return newQuiz;
    } catch (error) {
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
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to fetch quizzes' 
      });
    }
  },

  fetchQuiz: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const quiz = await getQuiz(quizId);
      set({ currentQuiz: quiz, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to fetch quiz' 
      });
    }
  },

  deleteQuiz: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteQuiz(quizId);
      set({ isLoading: false });
      
      // Remove from local state
      const { quizzes } = get();
      set({ quizzes: quizzes.filter(q => q.id !== quizId) });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to delete quiz' 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
}));
