import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import QuizList from './pages/QuizList';
import CreateQuiz from './pages/CreateQuiz';
import JoinGame from './pages/JoinGame';
import HostGame from './pages/HostGame';
import PlayGame from './pages/PlayGame';
import Results from './pages/Results';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/quizzes" element={
              <ProtectedRoute>
                <QuizList />
              </ProtectedRoute>
            } />
            <Route path="/quizzes/create" element={
              <ProtectedRoute>
                <CreateQuiz />
              </ProtectedRoute>
            } />
            <Route path="/join" element={
              <ProtectedRoute>
                <JoinGame />
              </ProtectedRoute>
            } />
            <Route path="/host/:sessionId" element={
              <ProtectedRoute>
                <HostGame />
              </ProtectedRoute>
            } />
            <Route path="/play/:sessionId" element={
              <ProtectedRoute>
                <PlayGame />
              </ProtectedRoute>
            } />
            <Route path="/results/:sessionId" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
