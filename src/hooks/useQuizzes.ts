// ❌ FICHIER OBSOLETE - Les quizzes n'existent plus dans la nouvelle API
// Utiliser useThemes() à la place
/*
import { useState } from 'react';
import quizService from '../services/quiz.service';
import type { 
  Quiz, 
  QuizWithThemes,
  CreateQuizRequest, 
  UpdateQuizRequest,
  CreateThemeRequest 
} from '../types/api.types';

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizWithThemes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByCategory = async (categoryId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await quizService.getByCategory(categoryId);
      setQuizzes(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchById = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await quizService.getById(id);
      setCurrentQuiz(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createQuiz = async (quiz: CreateQuizRequest) => {
    try {
      setError(null);
      const newQuiz = await quizService.create(quiz);
      setQuizzes((prev) => [...prev, newQuiz]);
      return newQuiz;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
      throw err;
    }
  };

  const updateQuiz = async (id: number, updates: UpdateQuizRequest) => {
    try {
      setError(null);
      await quizService.update(id, updates);
      setQuizzes((prev) =>
        prev.map((quiz) => (quiz.id === id ? { ...quiz, ...updates } : quiz))
      );
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deleteQuiz = async (id: number) => {
    try {
      setError(null);
      await quizService.delete(id);
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      throw err;
    }
  };

  const createTheme = async (theme: CreateThemeRequest) => {
    try {
      setError(null);
      const newTheme = await quizService.createTheme(theme);
      if (currentQuiz && currentQuiz.id === theme.quiz_id) {
        setCurrentQuiz({
          ...currentQuiz,
          themes: [...currentQuiz.themes, newTheme],
        });
      }
      return newTheme;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du thème');
      throw err;
    }
  };

  const deleteTheme = async (id: number) => {
    try {
      setError(null);
      await quizService.deleteTheme(id);
      if (currentQuiz) {
        setCurrentQuiz({
          ...currentQuiz,
          themes: currentQuiz.themes.filter((theme) => theme.id !== id),
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du thème');
      throw err;
    }
  };

  return {
    quizzes,
    currentQuiz,
    isLoading,
    error,
    fetchByCategory,
    fetchById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    createTheme,
    deleteTheme,
  };
};
*/

// Export vide pour éviter les erreurs d'import
export const useQuizzes = () => {
  return {
    quizzes: [],
    currentQuiz: null,
    isLoading: false,
    error: null,
  };
};