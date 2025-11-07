import { useState, useEffect, useCallback } from 'react';
import userService from '../services/user.service';
import type { UserStudent, UserStatistics } from '../types/api.types';

interface UseUsersReturn {
  students: UserStudent[];
  activeStudents: UserStudent[];
  inactiveStudents: UserStudent[];
  isLoading: boolean;
  error: string | null;
  selectedUserStats: UserStatistics | null;
  fetchStudents: () => Promise<void>;
  fetchUserStatistics: (userId: number) => Promise<void>;
  clearSelectedUser: () => void;
}

/**
 * 🔥 Hook personnalisé pour gérer les utilisateurs étudiants (Admin)
 * Gère la liste des étudiants et leurs statistiques détaillées
 */
export function useUsers(): UseUsersReturn {
  const [students, setStudents] = useState<UserStudent[]>([]);
  const [selectedUserStats, setSelectedUserStats] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupérer la liste de tous les étudiants
   */
  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getStudents();
      setStudents(data);
    } catch (err: any) {
      console.error('❌ Erreur lors de la récupération des étudiants:', err);
      setError(err.message || 'Erreur lors du chargement des étudiants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Récupérer les statistiques détaillées d'un étudiant
   */
  const fetchUserStatistics = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getUserStatistics(userId);
      console.log('📊 Stats récupérées pour userId', userId, ':', data);
      setSelectedUserStats(data);
    } catch (err: any) {
      console.error('❌ Erreur lors de la récupération des statistiques:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Réinitialiser l'utilisateur sélectionné
   */
  const clearSelectedUser = useCallback(() => {
    setSelectedUserStats(null);
  }, []);

  /**
   * Charger les étudiants au montage du composant
   */
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  /**
   * Séparer les étudiants actifs et inactifs
   */
  const activeStudents = students.filter(student => student.is_active);
  const inactiveStudents = students.filter(student => !student.is_active);

  return {
    students,
    activeStudents,
    inactiveStudents,
    isLoading,
    error,
    selectedUserStats,
    fetchStudents,
    fetchUserStatistics,
    clearSelectedUser,
  };
}
