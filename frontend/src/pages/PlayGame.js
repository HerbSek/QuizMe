import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSessionStore } from '../store/sessionStore';
import { useQuizStore } from '../store/quizStore';
import { useAuthStore } from '../store/authStore';
import { SessionStatus } from '../store/sessionStore';

const PlayGame = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentSession, 
    submitAnswer,
    lastAnswer,
    setCurrentSession,
    isLoading: sessionLoading,
    error,
    clearError 
  } = useSessionStore();
  const { currentQuiz, fetchQuiz } = useQuizStore();
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // For now, we'll simulate the session data since we don't have a get session endpoint
  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd fetch the session data here
      const mockSession = {
        id: Number(sessionId),
        quiz_id: 1,
        host_id: 1,
        game_code: 'ABC123',
        status: SessionStatus.ACTIVE,
        current_question_index: currentQuestionIndex,
        created_at: new Date().toISOString(),
      };
      
      setCurrentSession(mockSession);
      fetchQuiz(mockSession.quiz_id);
    }
  }, [sessionId, currentQuestionIndex, setCurrentSession, fetchQuiz]);

  const handleSubmitAnswer = async () => {
    if (!currentSession || !currentQuiz || selectedOption === null) return;
    
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      const response = await submitAnswer(currentSession.id, {
        question_id: currentQuestion.id,
        selected_option_id: selectedOption,
      });
      
      setHasAnswered(true);
      toast.success(response.is_correct ? 'Correct! 🎉' : 'Incorrect 😔');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      // Game finished
      toast.success('Quiz completed!');
      navigate(`/results/${sessionId}`);
    }
  };

  if (sessionLoading || !currentSession || !currentQuiz) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Completed!</h1>
        <p className="text-gray-600 mb-6">Thank you for playing!</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
          </div>
          <div className="text-sm text-gray-500">
            Playing as: {user?.username}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="card mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {currentQuestion.text}
        </h1>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentQuestion.options.map((option, index) => (
            <button
              key={option.id || index}
              onClick={() => !hasAnswered && setSelectedOption(option.id)}
              disabled={hasAnswered}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                hasAnswered
                  ? option.is_correct
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : selectedOption === option.id
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                  : selectedOption === option.id
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
              } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center space-x-3">
                <span className="font-bold text-lg">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option.text}</span>
                {hasAnswered && option.is_correct && (
                  <span className="ml-auto text-green-600">✓</span>
                )}
                {hasAnswered && selectedOption === option.id && !option.is_correct && (
                  <span className="ml-auto text-red-600">✗</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          {!hasAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || sessionLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sessionLoading ? 'Submitting...' : 'Submit Answer'}
            </button>
          ) : (
            <div className="space-y-4">
              {lastAnswer && (
                <div className={`p-4 rounded-lg ${
                  lastAnswer.is_correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-medium">
                    {lastAnswer.is_correct ? '🎉 Correct!' : '😔 Incorrect'}
                  </p>
                </div>
              )}
              <button
                onClick={handleNextQuestion}
                className="btn-primary"
              >
                {currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Game Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Game Code: {currentSession.game_code}</p>
      </div>
    </div>
  );
};

export default PlayGame;
