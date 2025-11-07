import apiClient from '../config/api.config';
import type { ApiResponse } from '../types/api.types';

interface RequestResetResponse extends ApiResponse {
  message: string;
}

interface VerifyCodeResponse extends ApiResponse {
  message: string;
  resetToken?: string;
  email?: string;
}

interface ResetPasswordResponse extends ApiResponse {
  message: string;
}

class PasswordResetService {
  /**
   * Étape 1: Demander un code de réinitialisation
   * @param email - Email de l'utilisateur
   */
  async requestPasswordReset(email: string): Promise<RequestResetResponse> {
    const { data } = await apiClient.post<RequestResetResponse>(
      '/auth/request-reset',
      { email }
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la demande de réinitialisation');
    }
    
    return data;
  }

  /**
   * Étape 2: Vérifier le code de réinitialisation
   * @param email - Email de l'utilisateur
   * @param code - Code à 6 chiffres reçu par email
   */
  async verifyResetCode(email: string, code: string): Promise<VerifyCodeResponse> {
    const { data } = await apiClient.post<VerifyCodeResponse>(
      '/auth/verify-reset-code',
      { email, code }
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Code invalide ou expiré');
    }
    
    return data;
  }

  /**
   * Étape 3: Réinitialiser le mot de passe
   * @param email - Email de l'utilisateur
   * @param code - Code de vérification
   * @param newPassword - Nouveau mot de passe
   */
  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> {
    const { data } = await apiClient.post<ResetPasswordResponse>(
      '/auth/reset-password',
      { email, code, newPassword }
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
    
    return data;
  }
}

export default new PasswordResetService();
