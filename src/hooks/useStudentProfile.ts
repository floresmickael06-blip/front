import { useState, useEffect } from 'react';
import userService from '../services/user.service';
import type { StudentProfile } from '../types/api.types';

/**
 * 🔥 Hook pour gérer le profil et les statistiques de l'étudiant connecté
 */
export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Récupérer les informations complètes du user (avec dates)
      const userInfo = await userService.getMyProfile();
      setUserDetails(userInfo);
      
      // Récupérer les statistiques
      const stats = await userService.getStudentProfile();
      setProfile(stats);
    } catch (err: any) {
      console.error('Erreur lors de la récupération du profil:', err);
      setError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    userDetails,
    isLoading,
    error,
    refresh: fetchProfile
  };
}
