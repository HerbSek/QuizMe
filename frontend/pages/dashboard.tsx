import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Ready to create some amazing quizzes or join a game?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/quizzes/create" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-4">➕</div>
              <h3 className="text-xl font-semibold mb-2">Create Quiz</h3>
              <p className="text-gray-600">
                Build a new interactive quiz with multiple choice questions
              </p>
            </div>
          </Link>

          <Link href="/quizzes" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">My Quizzes</h3>
              <p className="text-gray-600">
                View and manage all your created quizzes
              </p>
            </div>
          </Link>

          <Link href="/join" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-2">Join Game</h3>
              <p className="text-gray-600">
                Enter a game code to join a live quiz session
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Stats</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">0</div>
              <p className="text-gray-600">Quizzes Created</p>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <p className="text-gray-600">Games Hosted</p>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
              <p className="text-gray-600">Games Played</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
