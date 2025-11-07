import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import type { ThemeWithQuestions } from '../../services/theme.service';
import { getAllThemesWithQuestions } from '../../services/theme.service';

interface QuestionSelectorProps {
  selectedQuestionIds: number[];
  onSelectionChange: (questionIds: number[]) => void;
}

export function QuestionSelector({ selectedQuestionIds, onSelectionChange }: QuestionSelectorProps) {
  const [themes, setThemes] = useState<ThemeWithQuestions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedThemes, setExpandedThemes] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadThemesWithQuestions();
  }, []);

  const loadThemesWithQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllThemesWithQuestions();
      setThemes(data);
      
      // Expand automatiquement les thèmes qui ont des questions sélectionnées
      const themesToExpand = new Set<number>();
      data.forEach(theme => {
        if (theme.questions.some(q => selectedQuestionIds.includes(q.id))) {
          themesToExpand.add(theme.id);
        }
      });
      setExpandedThemes(themesToExpand);
    } catch (err) {
      console.error('Erreur lors du chargement des thèmes:', err);
      setError('Impossible de charger les questions');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = (themeId: number) => {
    setExpandedThemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(themeId)) {
        newSet.delete(themeId);
      } else {
        newSet.add(themeId);
      }
      return newSet;
    });
  };

  const handleQuestionToggle = (questionId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedQuestionIds, questionId]);
    } else {
      onSelectionChange(selectedQuestionIds.filter(id => id !== questionId));
    }
  };

  const handleThemeSelectAll = (themeId: number, checked: boolean) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    const themeQuestionIds = theme.questions.map(q => q.id);
    
    if (checked) {
      // Ajouter toutes les questions du thème
      const newSelection = [...new Set([...selectedQuestionIds, ...themeQuestionIds])];
      onSelectionChange(newSelection);
    } else {
      // Retirer toutes les questions du thème
      onSelectionChange(selectedQuestionIds.filter(id => !themeQuestionIds.includes(id)));
    }
  };

  const getThemeSelectionState = (themeId: number): 'none' | 'some' | 'all' => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme || theme.questions.length === 0) return 'none';

    const selectedCount = theme.questions.filter(q => selectedQuestionIds.includes(q.id)).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === theme.questions.length) return 'all';
    return 'some';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span>Chargement des questions...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-base font-semibold">Sélection des questions</Label>
        <span className="text-sm text-gray-600">
          {selectedQuestionIds.length} question{selectedQuestionIds.length !== 1 ? 's' : ''} sélectionnée{selectedQuestionIds.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2">
        {themes.map((theme) => {
          const isExpanded = expandedThemes.has(theme.id);
          const selectionState = getThemeSelectionState(theme.id);
          const hasQuestions = theme.questions.length > 0;

          return (
            <Card key={theme.id} className="border-l-4" style={{ borderLeftColor: theme.color || '#3b82f6' }}>
              <CardHeader className="p-3 cursor-pointer hover:bg-gray-50" onClick={() => hasQuestions && toggleTheme(theme.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {hasQuestions ? (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                    
                    {hasQuestions && (
                      <Checkbox
                        id={`theme-${theme.id}`}
                        checked={selectionState === 'all'}
                        onCheckedChange={(checked) => handleThemeSelectAll(theme.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        className={selectionState === 'some' ? 'data-[state=checked]:bg-blue-400' : ''}
                      />
                    )}
                    
                    <CardTitle className="text-sm font-medium">
                      {theme.title}
                      <span className="ml-2 text-xs text-gray-500">
                        ({theme.questions.length} question{theme.questions.length !== 1 ? 's' : ''})
                      </span>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && hasQuestions && (
                <CardContent className="p-3 pt-0 space-y-2">
                  {theme.questions.map((question) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 border border-gray-200"
                    >
                      <Checkbox
                        id={`question-${question.id}`}
                        checked={selectedQuestionIds.includes(question.id)}
                        onCheckedChange={(checked) => handleQuestionToggle(question.id, checked as boolean)}
                      />
                      <Label
                        htmlFor={`question-${question.id}`}
                        className="text-sm flex-1 cursor-pointer leading-relaxed"
                      >
                        <span className="font-medium text-gray-700">Q{question.id}:</span>{' '}
                        {question.question_text}
                        {question.difficulty && (
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {question.difficulty === 'easy' ? 'Facile' :
                             question.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              )}

              {!hasQuestions && (
                <CardContent className="p-3 pt-0">
                  <p className="text-sm text-gray-500 italic">Aucune question disponible pour ce thème</p>
                </CardContent>
              )}
            </Card>
          );
        })}

        {themes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun thème disponible
          </div>
        )}
      </div>
    </div>
  );
}
