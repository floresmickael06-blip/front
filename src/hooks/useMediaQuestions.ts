import { useState } from 'react';
import questionService from '../services/question.service';
import type { Question } from '../types/api.types';

/**
 * Hook personnalisé pour gérer les questions avec médias (images/audio)
 * Utilise les endpoints spécialisés /api/questions/media/*
 */
export const useMediaQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupérer toutes les questions avec images
   */
  const fetchQuestionsWithImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await questionService.getQuestionsWithImages();
      setQuestions(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des questions avec images');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Récupérer les questions avec images d'un thème spécifique
   */
  const fetchQuestionsWithImagesByTheme = async (themeId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await questionService.getQuestionsWithImagesByTheme(themeId);
      setQuestions(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des questions avec images');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Récupérer toutes les questions avec audio
   */
  const fetchQuestionsWithVoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await questionService.getQuestionsWithVoices();
      setQuestions(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des questions avec audio');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Récupérer les questions avec audio d'un thème spécifique
   */
  const fetchQuestionsWithVoicesByTheme = async (themeId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await questionService.getQuestionsWithVoicesByTheme(themeId);
      setQuestions(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des questions avec audio');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Récupérer l'image d'une question spécifique
   */
  const fetchQuestionImage = async (questionId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await questionService.getQuestionImage(questionId);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'image');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Récupérer l'audio d'une question spécifique
   */
  const fetchQuestionVoice = async (questionId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await questionService.getQuestionVoice(questionId);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'audio');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filtrer les questions par sous-catégorie (côté client)
   */
  const filterBySubcategory = (subcategory: string) => {
    return questions.filter(q => 
      q.subcategory?.toLowerCase().includes(subcategory.toLowerCase())
    );
  };

  /**
   * Statistiques sur les médias
   */
  const getMediaStats = () => {
    return {
      total: questions.length,
      withImages: questions.filter(q => q.image_url).length,
      withVoices: questions.filter(q => q.voice_url).length,
      withBoth: questions.filter(q => q.image_url && q.voice_url).length,
      subcategories: [...new Set(questions.map(q => q.subcategory).filter(Boolean))]
    };
  };

  return {
    questions,
    isLoading,
    error,
    fetchQuestionsWithImages,
    fetchQuestionsWithImagesByTheme,
    fetchQuestionsWithVoices,
    fetchQuestionsWithVoicesByTheme,
    fetchQuestionImage,
    fetchQuestionVoice,
    filterBySubcategory,
    getMediaStats,
  };
};
