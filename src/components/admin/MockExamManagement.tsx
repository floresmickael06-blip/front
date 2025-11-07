import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import type { MockExam, MockExamQuestion } from '../../types/api.types';
import { useMockExams } from '../../hooks';
import { QuestionSelector } from './QuestionSelector';
import { getMockExamQuestions, addQuestionsToExamBatch, removeAllQuestionsFromExam } from '../../services/mockExam.service';

export function MockExamManagement() {
  const { exams, isLoading, error, createExam, updateExam, deleteExam } = useMockExams();

  // 🔥 Debug: vérifier le type de exams
  console.log('📊 MockExamManagement - exams:', exams, 'isArray:', Array.isArray(exams));

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<MockExam | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [expandedExamId, setExpandedExamId] = useState<number | null>(null);
  const [examQuestions, setExamQuestions] = useState<Record<number, MockExamQuestion[]>>({});
  const [loadingExamQuestions, setLoadingExamQuestions] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    duration_minutes: 45,
    passing_score: 80
  });

  const handleOpenDialog = async (exam?: MockExam) => {
    // Ouvrir le dialog immédiatement
    setIsDialogOpen(true);
    
    if (exam) {
      setEditingExam(exam);
      setFormData({
        title: exam.title,
        duration_minutes: exam.duration_minutes,
        passing_score: exam.passing_score
      });
      
      // Charger les questions existantes pour cet examen
      setIsLoadingQuestions(true);
      try {
        const examWithQuestions = await getMockExamQuestions(exam.id);
        const questionIds = examWithQuestions.questions.map(q => q.id);
        setSelectedQuestionIds(questionIds);
      } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
        setSelectedQuestionIds([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    } else {
      setEditingExam(null);
      setFormData({
        title: '',
        duration_minutes: 45,
        passing_score: 80
      });
      setSelectedQuestionIds([]);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExam(null);
    setFormData({
      title: '',
      duration_minutes: 45,
      passing_score: 80
    });
    setSelectedQuestionIds([]);
  };

  const handleSaveExam = async () => {
    try {
      setIsSaving(true);

      let examId: number;

      if (editingExam) {
        // Mode édition : mettre à jour l'examen
        await updateExam(editingExam.id, formData);
        examId = editingExam.id;

        // Récupérer les questions actuelles pour savoir lesquelles supprimer
        const currentExam = await getMockExamQuestions(examId);
        const currentQuestionIds = currentExam.questions.map(q => q.id);

        // Supprimer les questions qui ne sont plus sélectionnées
        const questionsToRemove = currentQuestionIds.filter(id => !selectedQuestionIds.includes(id));
        if (questionsToRemove.length > 0) {
          await removeAllQuestionsFromExam(examId, questionsToRemove);
        }

        // Ajouter les nouvelles questions
        const questionsToAdd = selectedQuestionIds.filter(id => !currentQuestionIds.includes(id));
        if (questionsToAdd.length > 0) {
          await addQuestionsToExamBatch({
            mock_exam_id: examId,
            question_ids: questionsToAdd
          });
        }
      } else {
        // Mode création : créer l'examen puis ajouter les questions
        const newExam = await createExam(formData);
        examId = newExam.id;

        // Ajouter les questions sélectionnées
        if (selectedQuestionIds.length > 0) {
          await addQuestionsToExamBatch({
            mock_exam_id: examId,
            question_ids: selectedQuestionIds
          });
        }
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'examen. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen blanc ?')) {
      try {
        await deleteExam(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleToggleExamQuestions = async (examId: number) => {
    // Si on clique sur l'examen déjà ouvert, on le ferme
    if (expandedExamId === examId) {
      setExpandedExamId(null);
      return;
    }

    // Ouvrir l'examen
    setExpandedExamId(examId);

    // Si on a déjà chargé les questions, pas besoin de les recharger
    if (examQuestions[examId]) {
      return;
    }

    // Charger les questions
    setLoadingExamQuestions(examId);
    try {
      const examWithQuestions = await getMockExamQuestions(examId);
      setExamQuestions(prev => ({
        ...prev,
        [examId]: examWithQuestions.questions
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
    } finally {
      setLoadingExamQuestions(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 dark:text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des examens blancs</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel examen
        </Button>
      </div>

      <div className="grid gap-4">
        {Array.isArray(exams) && exams.map((exam) => {
          const isExpanded = expandedExamId === exam.id;
          const questions = examQuestions[exam.id] || [];
          const isLoadingQuestionsList = loadingExamQuestions === exam.id;

          return (
            <Card key={exam.id}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => handleToggleExamQuestions(exam.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle>{exam.title}</CardTitle>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>⏱️ {exam.duration_minutes} minutes</span>
                        <span>✅ Note minimale: {exam.passing_score}%</span>
                        <span>📝 {exam.question_count || 0} questions</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(exam)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteExam(exam.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 text-sm text-gray-700 dark:text-gray-300">
                      Questions de l'examen ({questions.length})
                    </h4>
                    
                    {isLoadingQuestionsList ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500 dark:text-blue-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Chargement des questions...</span>
                      </div>
                    ) : questions.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {questions.map((question, index) => (
                            <div 
                            key={question.id} 
                            className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-blue-500 dark:text-blue-400 text-sm min-w-[2rem]">
                                Q{index + 1}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                                  {question.question_text}
                                </p>
                                <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                    {question.theme_name}
                                  </span>
                                  {question.difficulty && (
                                    <span className={`px-2 py-1 rounded ${
                                      question.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                      question.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                                      'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                    }`}>
                                      {question.difficulty === 'easy' ? 'Facile' :
                                       question.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                                    </span>
                                  )}
                                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                    {question.question_type === 'multiple_choice' ? 'QCM' : 'Vrai/Faux'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
                        Aucune question associée à cet examen
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {(!exams || exams.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500 dark:text-gray-400">
              Aucun examen blanc créé. Cliquez sur "Nouvel examen" pour commencer.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-[90vw] !max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExam ? 'Modifier l\'examen' : 'Nouvel examen blanc'}
            </DialogTitle>
            <DialogDescription>
              Configurez les paramètres de l'examen blanc et sélectionnez les questions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {isLoadingQuestions ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 dark:text-blue-400" />
                <p className="text-lg text-gray-600 dark:text-gray-400">Chargement des questions...</p>
              </div>
            ) : (
              <>
                {/* Paramètres de base */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="title">Nom de l'examen</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Examen blanc 1"
                />
              </div>

              <div>
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  min={1}
                />
              </div>

              <div>
                <Label htmlFor="passing_score">Note minimale (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                  min={0}
                  max={100}
                />
              </div>
            </div>

            {/* Sélecteur de questions */}
            <div className="border-t pt-4">
              {isLoadingQuestions ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500 dark:text-blue-400 mr-2" />
                  <span className="dark:text-gray-400">Chargement des questions...</span>
                </div>
              ) : (
                <QuestionSelector
                  selectedQuestionIds={selectedQuestionIds}
                  onSelectionChange={setSelectedQuestionIds}
                />
              )}
            </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveExam} 
              disabled={isSaving || !formData.title || selectedQuestionIds.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                `Enregistrer (${selectedQuestionIds.length} questions)`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

