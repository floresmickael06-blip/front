import api from '../config/api.config';
import type { 
  ThemeProgress, 
  MockExamProgress, 
  ProgressStats,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  SaveExamProgressRequest
} from '../types/api.types';

/**
 * 🔥 Service pour gérer la progression des utilisateurs selon l'API réelle
 * Base URL: /api/progress
 */

// ============= Progression globale =============

/**
 * GET /api/progress
 * Récupère la progression complète de l'utilisateur connecté
 * L'API retourne: { success: true, data: { themes: [], mockExams: [] } }
 */
export const getProgress = async (): Promise<{ themes: ThemeProgress[], mockExams: MockExamProgress[] }> => {
  const response = await api.get('/progress');
  return response.data.data || response.data;
};

/**
 * GET /api/progress/stats
 * Récupère les statistiques globales de l'utilisateur connecté
 * L'API retourne: { success: true, data: ProgressStats }
 */
export const getProgressStats = async (): Promise<ProgressStats> => {
  const response = await api.get('/progress/stats');
  return response.data.data || response.data;
};

// ============= Progression par thème =============

/**
 * GET /api/progress/theme/:themeId
 * Récupère la progression de l'utilisateur pour un thème spécifique
 * L'API retourne: { success: true, data: ThemeProgress }
 */
export const getThemeProgress = async (themeId: number): Promise<ThemeProgress> => {
  const response = await api.get(`/progress/theme/${themeId}`);
  return response.data.data || response.data;
};

/**
 * POST /api/progress/theme
 * Enregistre la progression d'un thème (nombre total de questions et bonnes réponses)
 * L'API retourne: { success: true, data: SubmitAnswerResponse }
 */
export const submitThemeAnswer = async (data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
  console.log('📤 submitThemeAnswer - Données envoyées:', data);
  const response = await api.post('/progress/theme', data);
  console.log('📥 submitThemeAnswer - Réponse reçue:', response.data);
  return response.data.data || response.data;
};

// ============= Progression des examens blancs =============

/**
 * POST /api/progress/exam
 * Enregistre le résultat d'un examen blanc
 * L'API retourne: { success: true, data: MockExamProgress }
 * 
 * @param data - Les données de l'examen avec mock_exam_id, score et time_spent_minutes
 */
export const submitExamResult = async (data: SaveExamProgressRequest): Promise<MockExamProgress> => {
  console.log('📤 submitExamResult - Données envoyées:', data);
  const response = await api.post('/progress/exam', data);
  console.log('📥 submitExamResult - Réponse reçue:', response.data);
  return response.data.data || response.data;
};

export default {
  getProgress,
  getProgressStats,
  getThemeProgress,
  submitThemeAnswer,
  submitExamResult,
};