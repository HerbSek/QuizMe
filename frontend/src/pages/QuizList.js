import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuizStore } from 'store/quizStore';
import { useSessionStore } from 'store/sessionStore';

const QuizList = () => {
  const navigate = useNavigate();
  const { 
    quizzes, 
    isLoading, 
    error, 
    fetchMyQuizzes, 
    deleteQuiz: deleteQuizAction,
    clearError 
  } = useQuizStore();
  
  const { startSession } = useSessionStore();
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyQuizzes();
  }, [fetchMyQuizzes]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      return;
    }

    setDeletingId(quiz.id);
    try {
      await deleteQuizAction(quiz.id);
      toast.success('Quiz deleted successfully');
    } catch (error) {
      // Error is handled by the store
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartSession = async (quizId) => {
    try {
      const session = await startSession(quizId);
      toast.success('Game session started!');
      navigate(`/host/${session.id}`);
    } catch (error) {
      toast.error('Failed to start game session');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your quiz collections
          </p>
        </div>
        <Link to="/quizzes/create" className="btn-primary">
          Create New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No quizzes yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first quiz to get started with hosting game sessions
          </p>
          <Link to="/quizzes/create" className="btn-primary">
            Create Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                  {quiz.title}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteQuiz(quiz)}
                    disabled={deletingId === quiz.id}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    title="Delete quiz"
                  >
                    {deletingId === quiz.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
              
              {quiz.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {quiz.description}
                </p>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>{quiz.question_count} questions</span>
                <span>
                  Created {new Date(quiz.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStartSession(quiz.id)}
                  className="btn-primary flex-1 text-sm"
                >
                  Start Game
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
