import api from '../config/api.config';
import type { 
  Theme, 
  CreateThemeRequest, 
  UpdateThemeRequest, 
  Question,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse
} from '../types/api.types';

/**
 * 🔥 Service pour gérer les thèmes selon l'API réelle
 * Base URL: /api/themes
 */

// ============= Themes =============

/**
 * GET /api/themes
 * Récupère tous les thèmes avec le nombre de questions
 * L'API retourne: { success: true, data: Theme[] }
 */
export const getAllThemes = async (): Promise<Theme[]> => {
  const response = await api.get('/themes');
  // L'API retourne { success: true, data: [...] }
  return response.data.data || response.data;
};

/**
 * GET /api/themes/with-progress
 * Récupère tous les thèmes avec la progression de l'utilisateur connecté
 * L'API retourne: { success: true, data: Theme[] }
 */
export const getThemesWithProgress = async (): Promise<Theme[]> => {
  const response = await api.get('/themes/with-progress');
  return response.data.data || response.data;
};

/**
 * GET /api/themes/:id
 * Récupère un thème spécifique avec ses détails
 * L'API retourne: { success: true, data: Theme }
 */
export const getThemeById = async (id: number): Promise<Theme> => {
  const response = await api.get(`/themes/${id}`);
  return response.data.data || response.data;
};

/**
 * POST /api/themes
 * Crée un nouveau thème (admin uniquement)
 * L'API retourne: { success: true, data: Theme }
 */
export const createTheme = async (data: CreateThemeRequest): Promise<Theme> => {
  const response = await api.post('/themes', data);
  return response.data.data || response.data;
};

/**
 * PUT /api/themes/:id
 * Met à jour un thème (admin uniquement)
 * L'API retourne: { success: true, data: Theme }
 */
export const updateTheme = async (id: number, data: UpdateThemeRequest): Promise<Theme> => {
  const response = await api.put(`/themes/${id}`, data);
  return response.data.data || response.data;
};

/**
 * DELETE /api/themes/:id
 * Supprime un thème (admin uniquement)
 */
export const deleteTheme = async (id: number): Promise<void> => {
  await api.delete(`/themes/${id}`);
};

// ============= Questions par thème =============

/**
 * GET /api/questions/theme/:themeId
 * Récupère toutes les questions d'un thème
 * Pour les étudiants : les réponses correctes sont masquées
 * Pour les admins : toutes les informations sont incluses
 * L'API retourne: { success: true, data: Question[] }
 * 
 * 🎵 Note: Utilise maintenant l'endpoint sans médias car les médias sont récupérés séparément
 */
export const getQuestionsByTheme = async (themeId: number): Promise<Question[]> => {
  const response = await api.get(`/questions/theme/${themeId}`);
  return response.data.data || response.data;
};

/**
 * 🎵 GET /api/questions/media/images/:themeId
 * Récupère toutes les questions avec IMAGES d'un thème
 * Retourne les champs: id, theme_id, question_text, image_url, voice_url, subcategory
 */
export const getQuestionsWithMediaByTheme = async (themeId: number): Promise<Question[]> => {
  const response = await api.get(`/questions/media/images/${themeId}`);
  return response.data.data || response.data;
};

/**
 * 🔥 Fonction helper pour récupérer tous les thèmes avec leurs questions
 * Utile pour la sélection de questions dans les examens blancs
 */
export interface ThemeWithQuestions extends Theme {
  questions: Question[];
}

export const getAllThemesWithQuestions = async (): Promise<ThemeWithQuestions[]> => {
  const themes = await getAllThemes();
  
  // Récupérer les questions pour chaque thème en parallèle
  const themesWithQuestions = await Promise.all(
    themes.map(async (theme) => {
      try {
        const questions = await getQuestionsByTheme(theme.id);
        return { ...theme, questions };
      } catch (error) {
        console.error(`Erreur lors de la récupération des questions du thème ${theme.id}:`, error);
        return { ...theme, questions: [] };
      }
    })
  );
  
  return themesWithQuestions;
};

/**
 * POST /api/themes/:themeId/questions
 * Crée une nouvelle question pour un thème (admin uniquement)
 */
export const createQuestion = async (themeId: number, data: CreateQuestionRequest): Promise<Question> => {
  const response = await api.post(`/themes/${themeId}/questions`, data);
  return response.data;
};

/**
 * PUT /api/questions/:id
 * Met à jour une question (admin uniquement)
 */
export const updateQuestion = async (questionId: number, data: UpdateQuestionRequest): Promise<Question> => {
  const response = await api.put(`/questions/${questionId}`, data);
  return response.data;
};

/**
 * DELETE /api/questions/:id
 * Supprime une question (admin uniquement)
 */
export const deleteQuestion = async (questionId: number): Promise<void> => {
  await api.delete(`/questions/${questionId}`);
};

// ============= Soumission de réponses =============

/**
 * POST /api/progress/theme
 * Soumet une réponse à une question et met à jour la progression
 */
export const submitAnswer = async (data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
  const response = await api.post('/progress/theme', data);
  return response.data;
};

export default {
  getAllThemes,
  getThemesWithProgress,
  getThemeById,
  createTheme,
  updateTheme,
  deleteTheme,
  getQuestionsByTheme,
  getAllThemesWithQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  submitAnswer,
};
