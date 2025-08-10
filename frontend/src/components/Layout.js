import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from 'store/authStore';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                QuizMe
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                  <Link to="/quizzes" className="text-gray-700 hover:text-blue-600">
                    My Quizzes
                  </Link>
                  <Link to="/join" className="text-gray-700 hover:text-blue-600">
                    Join Game
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Welcome, {user?.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="btn-secondary text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
