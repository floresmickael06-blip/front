import { useState, useEffect } from 'react';
import progressService from '../services/progress.service';
import { useAuth } from './';
import type { 
  ThemeProgress, 
  MockExamProgress,
  ProgressStats,
  SubmitAnswerRequest
} from '../types/api.types';

/**
 * 🔥 Hook pour gérer la progression utilisateur selon l'API réelle
 * Routes: GET /api/progress, GET /api/progress/stats, POST /api/progress/theme
 */
export const useProgress = () => {
  const { user } = useAuth();
  const [themeProgress, setThemeProgress] = useState<ThemeProgress[]>([]);
  const [mockExamProgress, setMockExamProgress] = useState<MockExamProgress[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all progress (themes + mock exams)
  const fetchAllProgress = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // GET /api/progress - retourne { themes: [], mockExams: [] }
      const data = await progressService.getProgress();
      setThemeProgress(data.themes || []);
      setMockExamProgress(data.mockExams || []);
    } catch (err: any) {
      console.error('❌ Erreur chargement progression:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de la progression');
      setThemeProgress([]);
      setMockExamProgress([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch overall stats
  const fetchStats = async () => {
    if (!user) return;
    
    try {
      setError(null);
      // GET /api/progress/stats
      const data = await progressService.getProgressStats();
      setStats(data);
    } catch (err: any) {
      console.error('❌ Erreur chargement stats:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
    }
  };

  // Submit answer to a theme question
  const submitAnswer = async (data: SubmitAnswerRequest) => {
    try {
      setError(null);
      // POST /api/progress/theme
      const response = await progressService.submitThemeAnswer(data);
      
      // Refresh progress
      await fetchAllProgress();
      
      return response;
    } catch (err: any) {
      console.error('❌ Erreur soumission réponse:', err);
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllProgress();
      fetchStats();
    }
  }, [user]);

  return {
    // Data
    themeProgress,
    mockExamProgress,
    stats,
    // Compatibilité avec l'ancien code
    progressList: themeProgress, // Alias pour éviter de casser le code existant
    // State
    isLoading,
    error,
    // Actions
    fetchAllProgress,
    fetchStats,
    submitAnswer,
    refresh: fetchAllProgress, // Alias
  };
};
