import api from '../config/api.config';
import type { 
  UserStudent, 
  UserStatistics,
  UserThemeProgress,
  UserMockExamStats,
  StudentProfile
} from '../types/api.types';

/**
 * 🔥 Service pour la gestion des utilisateurs (Admin uniquement)
 * Base URL: /api/users
 */

// ============= Profil étudiant (pour l'étudiant connecté) =============

/**
 * GET /api/users/me
 * Récupère les informations de base de l'utilisateur connecté
 * L'API retourne: { success: true, data: User }
 */
export const getMyProfile = async (): Promise<any> => {
  const response = await api.get('/users/me');
  return response.data.data || response.data;
};

/**
 * GET /api/users/me/statistics
 * Récupère le profil complet de l'utilisateur connecté avec ses statistiques
 * L'API retourne: { success: true, data: StudentProfile }
 */
export const getStudentProfile = async (): Promise<StudentProfile> => {
  const response = await api.get('/users/me/statistics');
  return response.data.data || response.data;
};

// ============= Liste des étudiants (Admin) =============

/**
 * GET /api/users/students
 * Récupère la liste de tous les étudiants avec leurs informations d'activation
 * L'API retourne: { success: true, data: UserStudent[] }
 */
export const getStudents = async (): Promise<UserStudent[]> => {
  const response = await api.get('/users/students');
  return response.data.data || response.data;
};

// ============= Statistiques d'un étudiant =============

/**
 * GET /api/users/:userId/statistics
 * Récupère les statistiques complètes d'un étudiant (user info + progress + mock exams)
 * L'API retourne: { success: true, data: UserStatistics }
 */
export const getUserStatistics = async (userId: number): Promise<UserStatistics> => {
  const response = await api.get(`/users/${userId}/statistics`);
  return response.data.data || response.data;
};

/**
 * GET /api/users/:userId/progress/themes
 * Récupère la progression par thème d'un étudiant spécifique
 * L'API retourne: { success: true, data: UserThemeProgress[] }
 */
export const getUserThemeProgress = async (userId: number): Promise<UserThemeProgress[]> => {
  const response = await api.get(`/users/${userId}/progress/themes`);
  return response.data.data || response.data;
};

/**
 * GET /api/users/:userId/progress/mock-exams
 * Récupère les statistiques des examens blancs d'un étudiant
 * L'API retourne: { success: true, data: UserMockExamStats }
 */
export const getUserMockExamStats = async (userId: number): Promise<UserMockExamStats> => {
  const response = await api.get(`/users/${userId}/progress/mock-exams`);
  return response.data.data || response.data;
};

// ============= Mise à jour utilisateur (Admin) =============

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  activation_start_date?: string;
  activation_weeks?: number;
  is_active?: boolean;
}

/**
 * PUT /api/users/:userId
 * Met à jour les informations d'un utilisateur
 * L'API retourne: { success: true, message: string }
 */
export const updateUser = async (userId: number, updates: UpdateUserRequest): Promise<void> => {
  const response = await api.put(`/users/${userId}`, updates);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Erreur lors de la mise à jour de l\'utilisateur');
  }
};

/**
 * Mettre à jour la date de validité d'un utilisateur
 */
export const updateUserValidity = async (userId: number, activationStartDate: string, activationWeeks: number): Promise<void> => {
  await updateUser(userId, {
    activation_start_date: activationStartDate,
    activation_weeks: activationWeeks
  });
};

export default {
  getMyProfile,
  getStudentProfile,
  getStudents,
  getUserStatistics,
  getUserThemeProgress,
  getUserMockExamStats,
  updateUser,
  updateUserValidity,
};
