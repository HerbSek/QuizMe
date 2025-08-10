import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useQuizStore } from '../../store/quizStore';
import { QuizCreate } from '../../lib/quiz';

interface QuizFormData {
  title: string;
  description: string;
  questions: {
    text: string;
    options: {
      text: string;
      is_correct: boolean;
    }[];
  }[];
}

export default function CreateQuizPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { createQuiz, isLoading, error, clearError } = useQuizStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuizFormData>({
    defaultValues: {
      title: '',
      description: '',
      questions: [
        {
          text: '',
          options: [
            { text: '', is_correct: true },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
          ],
        },
      ],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions',
  });

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

  const addQuestion = () => {
    appendQuestion({
      text: '',
      options: [
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
    });
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const questions = watch('questions');
    questions[questionIndex].options.forEach((option, index) => {
      option.is_correct = index === optionIndex;
    });
  };

  const onSubmit = async (data: QuizFormData) => {
    setIsSubmitting(true);
    try {
      // Validate that each question has at least one correct answer
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        const hasCorrectAnswer = question.options.some(option => option.is_correct);
        if (!hasCorrectAnswer) {
          toast.error(`Question ${i + 1} must have at least one correct answer`);
          setIsSubmitting(false);
          return;
        }
      }

      // Transform data for API
      const quizData: QuizCreate = {
        title: data.title,
        description: data.description || undefined,
        questions: data.questions.map((question, questionIndex) => ({
          text: question.text,
          order: questionIndex,
          options: question.options.map((option, optionIndex) => ({
            text: option.text,
            is_correct: option.is_correct,
            order: optionIndex,
          })),
        })),
      };

      await createQuiz(quizData);
      toast.success('Quiz created successfully!');
      router.push('/quizzes');
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
          <p className="text-gray-600 mt-2">
            Build an interactive quiz with multiple choice questions
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Quiz Details */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  id="title"
                  className="input-field"
                  {...register('title', { required: 'Quiz title is required' })}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="input-field"
                  {...register('description')}
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-secondary"
              >
                Add Question
              </button>
            </div>

            {questionFields.map((field, questionIndex) => (
              <div key={field.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">Question {questionIndex + 1}</h3>
                  {questionFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register(`questions.${questionIndex}.text`, {
                        required: 'Question text is required',
                      })}
                    />
                    {errors.questions?.[questionIndex]?.text && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.questions[questionIndex]?.text?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options * (Select the correct answer)
                    </label>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`question-${questionIndex}-correct`}
                            className="text-primary-600"
                            {...register(`questions.${questionIndex}.options.${optionIndex}.is_correct`)}
                            onChange={() => setCorrectAnswer(questionIndex, optionIndex)}
                          />
                          <input
                            type="text"
                            placeholder={`Option ${optionIndex + 1}`}
                            className="input-field flex-1"
                            {...register(`questions.${questionIndex}.options.${optionIndex}.text`, {
                              required: 'Option text is required',
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
