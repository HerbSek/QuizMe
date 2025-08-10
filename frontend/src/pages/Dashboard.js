import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from 'store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
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
        <Link to="/quizzes/create" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="text-4xl mb-4">➕</div>
            <h3 className="text-xl font-semibold mb-2">Create Quiz</h3>
            <p className="text-gray-600">
              Build a new interactive quiz with multiple choice questions
            </p>
          </div>
        </Link>

        <Link to="/quizzes" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">My Quizzes</h3>
            <p className="text-gray-600">
              View and manage all your created quizzes
            </p>
          </div>
        </Link>

        <Link to="/join" className="card hover:shadow-lg transition-shadow cursor-pointer">
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
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <p className="text-gray-600">Quizzes Created</p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <p className="text-gray-600">Games Hosted</p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <p className="text-gray-600">Games Played</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
