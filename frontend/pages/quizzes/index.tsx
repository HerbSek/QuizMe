import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useQuizStore } from '../../store/quizStore';
import { QuizSummary } from '../../lib/quiz';

export default function QuizzesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { 
    quizzes, 
    isLoading, 
    error, 
    fetchMyQuizzes, 
    deleteQuiz: deleteQuizAction,
    clearError 
  } = useQuizStore();
  
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyQuizzes();
    }
  }, [isAuthenticated, fetchMyQuizzes]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteQuiz = async (quiz: QuizSummary) => {
    if (!confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
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

  const handleStartSession = (quizId: number) => {
    router.push(`/host/start/${quizId}`);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
            <p className="text-gray-600 mt-2">
              Create and manage your quiz collections
            </p>
          </div>
          <Link href="/quizzes/create" className="btn-primary">
            Create New Quiz
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No quizzes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first quiz to get started with hosting game sessions
            </p>
            <Link href="/quizzes/create" className="btn-primary">
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
                    <Link
                      href={`/quizzes/${quiz.id}`}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit quiz"
                    >
                      ✏️
                    </Link>
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
                  <Link
                    href={`/quizzes/${quiz.id}`}
                    className="btn-secondary flex-1 text-sm text-center"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
