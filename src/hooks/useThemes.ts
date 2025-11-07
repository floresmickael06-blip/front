import { useState, useEffect } from 'react';
import themeService from '../services/theme.service';
import type { Theme, CreateThemeRequest, UpdateThemeRequest } from '../types/api.types';

/**
 * 🔥 Hook pour récupérer et gérer tous les thèmes selon l'API réelle
 */
export function useThemes(withProgress: boolean = false) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all themes (with or without progress)
  const fetchThemes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Utiliser la route appropriée selon withProgress
      const data = withProgress 
        ? await themeService.getThemesWithProgress()
        : await themeService.getAllThemes();
      
      // 🔥 Validation: s'assurer que data est bien un tableau
      console.log(`📦 Response ${withProgress ? 'getThemesWithProgress' : 'getAllThemes'}:`, data);
      
      if (Array.isArray(data)) {
        setThemes(data);
      } else {
        console.error('❌ La réponse n\'est pas un tableau:', data);
        setThemes([]);
        setError('Format de réponse invalide');
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des thèmes:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des thèmes');
      setThemes([]); // Assurer que themes reste un tableau
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new theme (admin only)
  const createTheme = async (data: CreateThemeRequest) => {
    try {
      setError(null);
      const newTheme = await themeService.createTheme(data);
      setThemes((prev) => [...prev, newTheme]);
      return newTheme;
    } catch (err: any) {
      console.error('❌ Erreur création thème:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création');
      throw err;
    }
  };

  // Update a theme (admin only)
  const updateTheme = async (id: number, data: UpdateThemeRequest) => {
    try {
      setError(null);
      const updated = await themeService.updateTheme(id, data);
      setThemes((prev) =>
        prev.map((theme) => (theme.id === id ? updated : theme))
      );
    } catch (err: any) {
      console.error('❌ Erreur mise à jour thème:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  // Delete a theme (admin only)
  const deleteTheme = async (id: number) => {
    try {
      setError(null);
      await themeService.deleteTheme(id);
      setThemes((prev) => prev.filter((theme) => theme.id !== id));
    } catch (err: any) {
      console.error('❌ Erreur suppression thème:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      throw err;
    }
  };

  useEffect(() => {
    fetchThemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withProgress]);

  return { 
    themes, 
    isLoading, 
    error,
    refresh: fetchThemes, // Alias pour le rafraîchissement
    fetchThemes,
    createTheme,
    updateTheme,
    deleteTheme,
  };
}
