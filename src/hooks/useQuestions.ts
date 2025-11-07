import { useState } from 'react';
import questionService from '../services/question.service';
import type { 
  Question, 
  CreateQuestionRequest, 
  UpdateQuestionRequest 
} from '../types/api.types';

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByTheme = async (themeId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await questionService.getByTheme(themeId);
      setQuestions(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des questions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchById = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await questionService.getById(id);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la question');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createQuestion = async (question: CreateQuestionRequest) => {
    try {
      setError(null);
      const newQuestion = await questionService.create(question);
      setQuestions((prev) => [...prev, newQuestion]);
      return newQuestion;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
      throw err;
    }
  };

  const updateQuestion = async (id: number, updates: UpdateQuestionRequest) => {
    try {
      setError(null);
      await questionService.update(id, updates);
      // Rafraîchir la liste après mise à jour
      const updatedQuestion = await questionService.getById(id);
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? updatedQuestion : q))
      );
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deleteQuestion = async (id: number) => {
    try {
      setError(null);
      await questionService.delete(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      throw err;
    }
  };

  return {
    questions,
    isLoading,
    error,
    fetchByTheme,
    fetchById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
};