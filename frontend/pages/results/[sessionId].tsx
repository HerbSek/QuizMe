import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useSessionStore } from '../../store/sessionStore';

export default function ResultsPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const { 
    leaderboard,
    fetchLeaderboard,
    isLoading: sessionLoading,
    error,
    clearError 
  } = useSessionStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (sessionId && isAuthenticated) {
      fetchLeaderboard(Number(sessionId));
    }
  }, [sessionId, isAuthenticated, fetchLeaderboard]);

  const getUserRank = () => {
    if (!leaderboard || !user) return null;
    const userEntry = leaderboard.entries.find(entry => entry.player_id === user.id);
    if (!userEntry) return null;
    return leaderboard.entries.indexOf(userEntry) + 1;
  };

  const getUserScore = () => {
    if (!leaderboard || !user) return null;
    const userEntry = leaderboard.entries.find(entry => entry.player_id === user.id);
    return userEntry;
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

  if (sessionLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const userRank = getUserRank();
  const userScore = getUserScore();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
          <p className="text-gray-600">
            Great job completing the quiz! Here's how you performed.
          </p>
        </div>

        {/* User Performance */}
        {userScore && (
          <div className="card mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Performance</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-primary-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  #{userRank}
                </div>
                <p className="text-gray-600">Final Rank</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {userScore.score}
                </div>
                <p className="text-gray-600">Points Scored</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {userScore.correct_answers}/{userScore.total_answers}
                </div>
                <p className="text-gray-600">Correct Answers</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {leaderboard && leaderboard.entries.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Final Leaderboard
            </h2>
            <div className="space-y-3">
              {leaderboard.entries.map((entry, index) => (
                <div
                  key={entry.player_id}
                  className={`flex justify-between items-center p-4 rounded-lg ${
                    entry.player_id === user?.id
                      ? 'bg-primary-50 border-2 border-primary-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : index === 1
                        ? 'bg-gray-300 text-gray-800'
                        : index === 2
                        ? 'bg-orange-400 text-orange-900'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {entry.username}
                        {entry.player_id === user?.id && (
                          <span className="ml-2 text-sm text-primary-600">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.correct_answers}/{entry.total_answers} correct
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-primary-600">
                      {entry.score} pts
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round((entry.correct_answers / entry.total_answers) * 100)}% accuracy
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="text-center space-x-4">
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
          <Link href="/join" className="btn-secondary">
            Join Another Game
          </Link>
        </div>

        {/* Celebration Message */}
        {userRank === 1 && (
          <div className="mt-8 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-yellow-800 mb-2">
                Congratulations!
              </h3>
              <p className="text-yellow-700">
                You finished in 1st place! Outstanding performance!
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
