// ❌ FICHIER OBSOLETE - Les catégories et quizzes n'existent plus dans la nouvelle API
// Utiliser ThemeQuizView directement avec les thèmes
/*
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BookOpen } from 'lucide-react';
import type { Category, Quiz, QuizTheme, QuizWithThemes } from '../types/api.types';
import { useQuizzes } from '../hooks/useQuizzes';
import { useProgress } from '../hooks/useProgress';

interface CategoryQuizViewProps {
  category: Category;
  onBack: () => void;
  onQuizSelect: (quiz: Quiz, theme: QuizTheme) => void;
}

export function CategoryQuizView({ category, onBack, onQuizSelect }: CategoryQuizViewProps) {
  const { quizzes, isLoading, error, fetchByCategory, fetchById } = useQuizzes();
  const { progressList: progress } = useProgress();
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithThemes | null>(null);
  const [loadingQuizId, setLoadingQuizId] = useState<number | null>(null);

  const getThemeProgress = (themeId: number): number => {
    const themeProgress = progress.filter((p: any) => p.quiz_theme_id === themeId);
    if (themeProgress.length === 0) return 0;
    
    // Prendre le meilleur score
    const bestScore = Math.max(...themeProgress.map((p: any) => p.score || 0));
    return Math.min(100, bestScore);
  };

  useEffect(() => {
    console.log('🔥 CategoryQuizView: Chargement des quiz pour la catégorie', category.id, category.name);
    fetchByCategory(category.id);
  }, [category.id]);

  // Debug: Vérifions les données
  console.log('🔥 CategoryQuizView Debug:', {
    categoryId: category.id,
    categoryName: category.name,
    quizzesCount: quizzes?.length || 0,
    quizzes: quizzes,
    isLoading,
    error,
    selectedQuiz: selectedQuiz?.id || null
  });

  const handleQuizClick = async (quiz: Quiz) => {
    try {
      setLoadingQuizId(quiz.id);
      const quizWithThemes = await fetchById(quiz.id);
      setSelectedQuiz(quizWithThemes);
    } catch (err) {
      console.error('Erreur lors du chargement du quiz:', err);
    } finally {
      setLoadingQuizId(null);
    }
  };

  const handleThemeClick = (theme: QuizTheme) => {
    if (selectedQuiz) {
      onQuizSelect(selectedQuiz, theme);
    }
  };

  // Auto-sélection si un seul quiz dans la catégorie
  useEffect(() => {
    if (!isLoading && !error && quizzes && quizzes.length === 1 && !selectedQuiz) {
      console.log('🔥 Auto-sélection du seul quiz disponible:', quizzes[0]);
      handleQuizClick(quizzes[0]);
    }
  }, [quizzes, isLoading, error, selectedQuiz]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-slate-600">Chargement des quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Erreur de chargement</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => fetchByCategory(category.id)}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Si un quiz est sélectionné, afficher ses thèmes
  if (selectedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              ← Retour au tableau de bord
            </Button>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 text-blue-900">{selectedQuiz.title}</h1>
            <p className="text-slate-600 mb-4">{selectedQuiz.description}</p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <BookOpen className="w-3 h-3 mr-1" />
                {selectedQuiz.themes?.length || 0} thème{(selectedQuiz.themes?.length || 0) > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedQuiz.themes?.map((theme) => (
              <Card 
                key={theme.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200"
                onClick={() => handleThemeClick(theme)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-800 mb-1">
                        {theme.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-600 line-clamp-2">
                        Thème de quiz
                      </CardDescription>
                    </div>
                    <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Questions</span>
                      <span className="font-medium text-slate-800">
                        À définir
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progression</span>
                        <span className="font-medium text-slate-800">{getThemeProgress(theme.id)}%</span>
                      </div>
                      <Progress value={getThemeProgress(theme.id)} className="h-2" />
                    </div>

                    <Button className="w-full mt-3" size="sm">
                      Commencer le thème
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!selectedQuiz.themes || selectedQuiz.themes.length === 0) && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">Aucun thème disponible</h3>
              <p className="text-slate-500">
                Ce quiz n'a pas encore de thèmes configurés.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Afficher la liste des quiz de la catégorie
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            ← Retour au tableau de bord
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-blue-900">{category.name}</h1>
          <p className="text-slate-600">{category.description}</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Aucun quiz disponible</h3>
            <p className="text-slate-500">
              Cette catégorie ne contient pas encore de quiz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card 
                key={quiz.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200"
                onClick={() => handleQuizClick(quiz)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-800 mb-1">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-600 line-clamp-2">
                        {quiz.description}
                      </CardDescription>
                    </div>
                    <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        Quiz
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progression</span>
                        <span className="font-medium text-slate-800">À définir</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>

                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      disabled={loadingQuizId === quiz.id}
                    >
                      {loadingQuizId === quiz.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Chargement...
                        </div>
                      ) : (
                        'Voir les thèmes'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
*/

// Export vide pour éviter les erreurs d'import
export function CategoryQuizView() {
  return null;
}