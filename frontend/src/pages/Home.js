import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">QuizMe</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Create engaging quizzes and host live quiz sessions with your friends, 
          students, or colleagues. Just like Kahoot, but better!
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="card text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Create Quizzes</h3>
            <p className="text-gray-600">
              Build interactive multiple-choice quizzes with ease
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2">Host Live Sessions</h3>
            <p className="text-gray-600">
              Start real-time quiz sessions with game codes
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Track Results</h3>
            <p className="text-gray-600">
              View leaderboards and track player performance
            </p>
          </div>
        </div>
        
        <div className="space-x-4">
          <Link to="/signup" className="btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
