import apiClient from '../config/api.config';
import type { 
  ApiResponse, 
  Question,
  CreateQuestionRequest,
  UpdateQuestionRequest
} from '../types/api.types';

class QuestionService {
  /**
   * Récupérer toutes les questions d'un thème
   */
  async getByTheme(themeId: number): Promise<Question[]> {
    const { data } = await apiClient.get<ApiResponse<Question[]>>(
      `/questions/theme/${themeId}`
    );
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return [];
  }

  /**
   * Récupérer une question par ID
   */
  async getById(id: number): Promise<Question> {
    const { data } = await apiClient.get<ApiResponse<Question>>(
      `/questions/${id}`
    );
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error('Question non trouvée');
  }

  /**
   * Créer une nouvelle question (Admin uniquement)
   */
  async create(question: CreateQuestionRequest): Promise<Question> {
    const { data } = await apiClient.post<ApiResponse<Question>>(
      '/questions',
      question
    );
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.message || 'Erreur lors de la création');
  }

  /**
   * Mettre à jour une question (Admin uniquement)
   */
  async update(id: number, updates: UpdateQuestionRequest): Promise<{ voiceNeedsRegeneration?: boolean }> {
    const { data } = await apiClient.put<ApiResponse<{ voiceNeedsRegeneration?: boolean }>>(
      `/questions/${id}`,
      updates
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la mise à jour');
    }
    
    return data.data || {};
  }

  /**
   * Supprimer une question (Admin uniquement)
   */
  async delete(id: number): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse>(`/questions/${id}`);
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la suppression');
    }
  }

  /**
   * 🎵 Récupérer toutes les questions avec images
   */
  async getQuestionsWithImages(): Promise<Question[]> {
    const { data } = await apiClient.get<ApiResponse<Question[]>>(
      '/questions/media/images'
    );
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return [];
  }

  /**
   * 🎵 Récupérer les questions avec images d'un thème
   */
  async getQuestionsWithImagesByTheme(themeId: number): Promise<Question[]> {
    const { data } = await apiClient.get<ApiResponse<Question[]>>(
      `/questions/media/images/${themeId}`
    );
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return [];
  }

  /**
   * 🎵 Récupérer toutes les questions avec audio
   */
  async getQuestionsWithVoices(): Promise<Question[]> {
    const { data } = await apiClient.get<ApiResponse<Question[]>>(
      '/questions/media/voices'
    );
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return [];
  }

  /**
   * 🎵 Récupérer les questions avec audio d'un thème
   */
  async getQuestionsWithVoicesByTheme(themeId: number): Promise<Question[]> {
    const { data } = await apiClient.get<ApiResponse<Question[]>>(
      `/questions/media/voices/${themeId}`
    );
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return [];
  }

  /**
   * 🎵 Récupérer l'image d'une question spécifique
   */
  async getQuestionImage(questionId: number): Promise<{ question_id: number; question_text: string; image_url: string }> {
    const { data } = await apiClient.get<ApiResponse<{ question_id: number; question_text: string; image_url: string }>>(
      `/questions/${questionId}/image`
    );
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error('Image non trouvée');
  }

  /**
   * 🎵 Récupérer l'audio d'une question spécifique
   */
  async getQuestionVoice(questionId: number): Promise<{ question_id: number; question_text: string; voice_url: string }> {
    const { data } = await apiClient.get<ApiResponse<{ question_id: number; question_text: string; voice_url: string }>>(
      `/questions/${questionId}/voice`
    );
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error('Audio non trouvé');
  }

  /**
   * 🎯 Récupérer les IDs des questions déjà répondues pour un thème
   * GET /api/questions/theme/:themeId/answered
   * Retourne: { theme_id: number, answered_questions: number[], count: number }
   */
  async getAnsweredQuestionIds(themeId: number): Promise<number[]> {
    const { data } = await apiClient.get<ApiResponse<{
      theme_id: number;
      answered_questions: number[];
      count: number;
    }>>(
      `/questions/theme/${themeId}/answered`
    );
    
    if (data.success && data.data) {
      return data.data.answered_questions || [];
    }
    
    return [];
  }

  /**
   * Valider une réponse utilisateur
   * POST /api/questions/:questionId/validate
   * ⚠️ Cette méthode enregistre AUTOMATIQUEMENT la progression dans la table in_progress
   */
  async validate(questionId: number, userAnswer: string): Promise<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  }> {
    const { data } = await apiClient.post<ApiResponse<any>>(
      `/questions/${questionId}/validate`,
      { user_answer: userAnswer }
    );
    
    if (data.success && data.data) {
      return {
        isCorrect: data.data.is_correct,
        correctAnswer: data.data.correct_answer,
        explanation: data.data.explanation || ''
      };
    }
    
    throw new Error(data.message || 'Erreur lors de la validation');
  }

  /**
   * 🔄 Réinitialiser la progression d'un thème
   * DELETE /api/progress/theme/:themeId
   * Supprime toutes les réponses enregistrées pour ce thème
   */
  async resetThemeProgress(themeId: number): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse>(
      `/progress/theme/${themeId}`
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la réinitialisation');
    }
  }
}

export default new QuestionService();