import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';

interface JoinGameForm {
  gameCode: string;
}

export default function JoinGamePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { joinSession, isLoading, error, clearError } = useSessionStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinGameForm>();

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

  const onSubmit = async (data: JoinGameForm) => {
    setIsSubmitting(true);
    try {
      const session = await joinSession(data.gameCode.toUpperCase());
      toast.success('Successfully joined the game!');
      router.push(`/play/${session.id}`);
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
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

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Game</h1>
          <p className="text-gray-600">
            Enter the game code provided by your host to join the quiz session
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="gameCode" className="block text-sm font-medium text-gray-700 mb-1">
                Game Code
              </label>
              <input
                type="text"
                id="gameCode"
                className="input-field text-center text-2xl font-mono uppercase tracking-widest"
                placeholder="ABC123"
                maxLength={6}
                {...register('gameCode', {
                  required: 'Game code is required',
                  minLength: {
                    value: 6,
                    message: 'Game code must be 6 characters',
                  },
                  maxLength: {
                    value: 6,
                    message: 'Game code must be 6 characters',
                  },
                  pattern: {
                    value: /^[A-Z0-9]{6}$/i,
                    message: 'Game code must contain only letters and numbers',
                  },
                })}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                }}
              />
              {errors.gameCode && (
                <p className="text-red-500 text-sm mt-1">{errors.gameCode.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
            >
              {isSubmitting ? 'Joining Game...' : 'Join Game'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have a game code?{' '}
              <a href="/quizzes" className="text-primary-600 hover:text-primary-700">
                Create your own quiz
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to Join</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Get the 6-character game code from your host</li>
              <li>2. Enter the code above</li>
              <li>3. Click "Join Game" to start playing</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}
