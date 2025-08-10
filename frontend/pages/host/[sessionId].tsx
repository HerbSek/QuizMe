import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { useQuizStore } from '@/store/quizStore';
import { SessionStatus } from '@/lib/session';

export default function HostGamePage() {
  const router = useRouter();
  const { sessionId } = router.query;
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { 
    currentSession, 
    leaderboard,
    fetchLeaderboard,
    setCurrentSession,
    isLoading: sessionLoading,
    error,
    clearError 
  } = useSessionStore();
  const { currentQuiz, fetchQuiz } = useQuizStore();
  
  const [gameCode, setGameCode] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // For now, we'll simulate the session data since we don't have a get session endpoint
  useEffect(() => {
    if (sessionId && isAuthenticated) {
      // In a real app, you'd fetch the session data here
      // For now, we'll create a mock session
      const mockSession = {
        id: Number(sessionId),
        quiz_id: 1, // This would come from the actual session
        host_id: 1,
        game_code: 'ABC123', // This would be the actual game code
        status: SessionStatus.WAITING,
        current_question_index: 0,
        created_at: new Date().toISOString(),
      };
      
      setCurrentSession(mockSession);
      setGameCode(mockSession.game_code);
      fetchQuiz(mockSession.quiz_id);
      fetchLeaderboard(Number(sessionId));
    }
  }, [sessionId, isAuthenticated, setCurrentSession, fetchQuiz, fetchLeaderboard]);

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast.success('Game code copied to clipboard!');
  };

  const handleEndSession = () => {
    if (confirm('Are you sure you want to end this game session?')) {
      toast.success('Game session ended');
      router.push('/quizzes');
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

  if (sessionLoading || !currentSession) {
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
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Game Session Host
              </h1>
              <p className="text-gray-600">
                {currentQuiz?.title || 'Loading quiz...'}
              </p>
            </div>
            <button
              onClick={handleEndSession}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              End Session
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Code */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <h2 className="text-xl font-semibold mb-4">Game Code</h2>
              <div className="bg-primary-50 rounded-lg p-6 mb-4">
                <div className="text-4xl font-mono font-bold text-primary-600 mb-2">
                  {gameCode}
                </div>
                <p className="text-sm text-gray-600">
                  Players use this code to join
                </p>
              </div>
              <button
                onClick={copyGameCode}
                className="btn-secondary w-full"
              >
                Copy Code
              </button>
            </div>

            {/* Session Status */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold mb-4">Session Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    currentSession.status === SessionStatus.WAITING
                      ? 'bg-yellow-100 text-yellow-800'
                      : currentSession.status === SessionStatus.ACTIVE
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentSession.status.charAt(0).toUpperCase() + currentSession.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Players:</span>
                  <span>{leaderboard?.entries.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Question:</span>
                  <span>{currentSession.current_question_index + 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentSession.status === SessionStatus.WAITING ? (
              <div className="card text-center">
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold mb-4">Waiting for Players</h2>
                <p className="text-gray-600 mb-6">
                  Share the game code <strong>{gameCode}</strong> with your players.
                  The game will start once players begin joining.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Instructions for Players:</h3>
                  <ol className="text-sm text-blue-800 space-y-1 text-left">
                    <li>1. Go to the QuizMe website</li>
                    <li>2. Click "Join Game"</li>
                    <li>3. Enter the game code: <strong>{gameCode}</strong></li>
                    <li>4. Wait for the game to start</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Game in Progress</h2>
                <p className="text-gray-600">
                  Game session functionality will be enhanced with real-time features.
                  For now, players can join and submit answers.
                </p>
              </div>
            )}

            {/* Leaderboard */}
            {leaderboard && leaderboard.entries.length > 0 && (
              <div className="card mt-6">
                <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
                <div className="space-y-2">
                  {leaderboard.entries.map((entry, index) => (
                    <div
                      key={entry.player_id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg">#{index + 1}</span>
                        <span className="font-medium">{entry.username}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary-600">
                          {entry.score} points
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.correct_answers}/{entry.total_answers} correct
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
