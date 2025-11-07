import apiClient from '../config/api.config';
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  User} from '../types/api.types';

class AuthService {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<any>(
      '/auth/login',
      credentials
    );
    
    if (data.success) {
      // La réponse a token et user directement, pas dans data.data
      const loginResponse: LoginResponse = {
        token: data.token,
        user: data.user
      };
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem('auth_token', loginResponse.token);
      localStorage.setItem('user_data', JSON.stringify(loginResponse.user));
      return loginResponse;
    }
    
    throw new Error(data.message || 'Erreur de connexion');
  }

  /**
   * Vérification du token JWT
   */
  async verifyToken(): Promise<User> {
    const { data } = await apiClient.get<any>(
      '/auth/verify'
    );
    
    // La réponse peut avoir user directement ou dans data.user
    const user = data.user || data.data?.user;
    
    if (data.success && user) {
      // Mettre à jour les infos utilisateur locales
      localStorage.setItem('user_data', JSON.stringify(user));
      return user;
    }
    
    throw new Error('Token invalide');
  }

  /**
   * Mise à jour du statut de première connexion
   */
  async updateFirstLogin(): Promise<void> {
    const { data } = await apiClient.put<ApiResponse>(
      '/auth/first-login'
    );
    
    if (data.success) {
      // Mettre à jour localement
      const userData = this.getCurrentUser();
      if (userData) {
        userData.firstLogin = false;
        localStorage.setItem('user_data', JSON.stringify(userData));
      }
    }
  }

  /**
   * Changement de mot de passe
   */
  async changePassword(passwords: { currentPassword: string; newPassword: string }): Promise<void> {
    const { data } = await apiClient.put<ApiResponse>(
      '/auth/change-password',
      passwords
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors du changement de mot de passe');
    }
  }

  /**
   * Créer un nouvel utilisateur (admin uniquement)
   */
  async createUser(userdata: { 
    email: string; 
    name: string;
    activation_start_date?: string;
    activation_weeks?: number;
  }): Promise<User> {
    const createUserRequest = {
      email: userdata.email,
      name: userdata.name,
      password: 'student123',
      role: 'student',
      // 🔥 Nouveaux champs pour l'activation
      activation_start_date: userdata.activation_start_date,
      activation_weeks: userdata.activation_weeks
    };

    const { data } = await apiClient.post<any>(
      '/auth/register',
      createUserRequest
    );
    
    if (data.success) {
      return data.user || data.data;
    }
    
    throw new Error(data.message || 'Erreur lors de la création de l\'utilisateur');
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/app-bateau-client';
  }

  /**
   * Récupérer l'utilisateur actuel depuis localStorage
   */
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Récupérer le token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export default new AuthService();