import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Layout from '../../../components/Layout';
import { useAuthStore } from '../../../store/authStore';
import { useQuizStore } from '../../../store/quizStore';
import { useSessionStore } from '../../../store/sessionStore';

export default function StartGamePage() {
  const router = useRouter();
  const { quizId } = router.query;
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { currentQuiz, fetchQuiz, isLoading: quizLoading } = useQuizStore();
  const { 
    currentSession, 
    startSession, 
    isLoading: sessionLoading, 
    error,
    clearError 
  } = useSessionStore();
  
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (quizId && isAuthenticated) {
      fetchQuiz(Number(quizId));
    }
  }, [quizId, isAuthenticated, fetchQuiz]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleStartSession = async () => {
    if (!currentQuiz) return;
    
    setIsStarting(true);
    try {
      const session = await startSession(currentQuiz.id!);
      toast.success('Game session started!');
      router.push(`/host/${session.id}`);
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsStarting(false);
    }
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

  if (quizLoading || !currentQuiz) {
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Game Session</h1>
          <p className="text-gray-600">
            Review your quiz and start a live game session
          </p>
        </div>

        <div className="card mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentQuiz.title}
              </h2>
              {currentQuiz.description && (
                <p className="text-gray-600 mb-4">{currentQuiz.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{currentQuiz.questions.length} questions</span>
                <span>•</span>
                <span>Multiple choice format</span>
              </div>
            </div>
            <Link
              href={`/quizzes/${currentQuiz.id}`}
              className="btn-secondary"
            >
              Edit Quiz
            </Link>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Quiz Preview</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentQuiz.questions.map((question, index) => (
                <div key={question.id || index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">
                    {index + 1}. {question.text}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={option.id || optionIndex}
                        className={`p-2 rounded text-sm ${
                          option.is_correct
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {String.fromCharCode(65 + optionIndex)}. {option.text}
                        {option.is_correct && ' ✓'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
            <p className="text-gray-600 mb-6">
              Once you start the game session, players will be able to join using a game code.
              You'll be able to control the game flow and see live results.
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link href="/quizzes" className="btn-secondary">
                Back to Quizzes
              </Link>
              <button
                onClick={handleStartSession}
                disabled={isStarting || sessionLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? 'Starting Session...' : 'Start Game Session'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How Game Sessions Work</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Players join using a 6-character game code</li>
            <li>• You control when to show each question</li>
            <li>• See live responses and leaderboard updates</li>
            <li>• Players compete for the highest score</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
