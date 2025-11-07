import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronRight, Upload, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import type { Question } from '../../types/api.types';
import type { ThemeWithQuestions } from '../../services/theme.service';
import { getAllThemesWithQuestions } from '../../services/theme.service';
import questionService from '../../services/question.service';
import { uploadQuestionImage } from '../../services/upload.service';
import { generateVoice } from '../../services/voice.service';

export function QuestionManagement() {
  const [themes, setThemes] = useState<ThemeWithQuestions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedThemeId, setExpandedThemeId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // États pour l'upload d'image
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    theme_id: 0,
    question_text: '',
    question_type: 'multiple_choice' as 'multiple_choice' | 'true_false',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    image_url: '' as string | undefined
  });

  // Charger les thèmes avec leurs questions au montage
  useEffect(() => {
    loadThemesWithQuestions();
  }, []);

  const loadThemesWithQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllThemesWithQuestions();
      setThemes(data);
    } catch (err: any) {
      console.error('Erreur chargement thèmes:', err);
      setError('Erreur lors du chargement des thèmes');
      setThemes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const reloadThemeQuestions = async (themeId: number) => {
    try {
      setError(null);
      const updatedQuestions = await questionService.getByTheme(themeId);
      setThemes(prev => prev.map(theme => 
        theme.id === themeId 
          ? { ...theme, questions: updatedQuestions, question_count: updatedQuestions.length }
          : theme
      ));
    } catch (err: any) {
      console.error('Erreur rechargement questions:', err);
      setError('Erreur lors du rechargement des questions');
    }
  };

  const handleToggleThemeQuestions = (themeId: number) => {
    // Si on clique sur le thème déjà ouvert, on le ferme
    if (expandedThemeId === themeId) {
      setExpandedThemeId(null);
    } else {
      // Ouvrir le thème
      setExpandedThemeId(themeId);
    }
  };

  const handleOpenDialog = (question?: Question, themeId?: number) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        theme_id: question.theme_id,
        question_text: question.question_text,
        question_type: question.question_type,
        option_a: question.option_a || '',
        option_b: question.option_b || '',
        option_c: question.option_c || '',
        option_d: question.option_d || '',
        correct_answer: question.correct_answer || '',
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'medium',
        image_url: question.image_url || ''
      });
      // Réinitialiser l'image
      setSelectedImage(null);
      setImagePreview(question.image_url || null);
    } else {
      setEditingQuestion(null);
      setFormData({
        theme_id: themeId || 0,
        question_text: '',
        question_type: 'multiple_choice',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        explanation: '',
        difficulty: 'medium',
        image_url: ''
      });
      setSelectedImage(null);
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingQuestion(null);
    setError(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  /**
   * Gestion de la sélection d'image
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Supprimer l'image sélectionnée
   */
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  /**
   * Upload de l'image et mise à jour du formulaire
   */
  const handleUploadImage = async () => {
    if (!selectedImage) return;

    try {
      setUploadingImage(true);
      const result = await uploadQuestionImage(selectedImage);
      
      // Mettre à jour le champ image_url avec l'URL de l'image
      setFormData(prev => ({ ...prev, image_url: result.imageUrl }));
      setSuccess('Image uploadée avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Fonction pour gérer le toggle des réponses correctes
  const toggleCorrectAnswer = (option: string) => {
    const currentAnswers = formData.correct_answer.split(',').filter(a => a);
    
    if (currentAnswers.includes(option)) {
      // Retirer l'option
      const newAnswers = currentAnswers.filter(a => a !== option);
      setFormData({ ...formData, correct_answer: newAnswers.join(',') });
    } else {
      // Ajouter l'option
      const newAnswers = [...currentAnswers, option].sort();
      setFormData({ ...formData, correct_answer: newAnswers.join(',') });
    }
  };

  // Vérifier si une option est une réponse correcte
  const isCorrectAnswer = (option: string) => {
    return formData.correct_answer.split(',').includes(option);
  };

  const handleSaveQuestion = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Validation
      if (!formData.question_text.trim()) {
        setError('Le texte de la question est requis');
        return;
      }

      if (formData.question_type === 'multiple_choice') {
        if (!formData.option_a.trim() || !formData.option_b.trim()) {
          setError('Au moins 2 options sont requises pour un QCM');
          return;
        }
        if (!formData.correct_answer) {
          setError('Veuillez sélectionner au moins une réponse correcte');
          return;
        }
      } else {
        if (!['true', 'false', 'A', 'B'].includes(formData.correct_answer)) {
          setError('La réponse correcte doit être "true" ou "false" (ou A/B)');
          return;
        }
      }

      if (editingQuestion) {
        // Mise à jour
        const response = await questionService.update(editingQuestion.id, formData);
        setSuccess('Question modifiée avec succès');
        
        // 🎙️ Régénérer la voix si nécessaire
        if (response.voiceNeedsRegeneration) {
          console.log(`🔄 Régénération de la voix pour la question ${editingQuestion.id}...`);
          try {
            await generateVoice(editingQuestion.id, {
              question_text: formData.question_text,
              question_type: formData.question_type,
              option_a: formData.option_a,
              option_b: formData.option_b,
              option_c: formData.option_c,
              option_d: formData.option_d
            });
            setSuccess('Question modifiée et voix régénérée avec succès');
          } catch (voiceError) {
            console.error('Erreur génération voix:', voiceError);
            setSuccess('Question modifiée (erreur génération voix)');
          }
        }
      } else {
        // Création
        const newQuestion = await questionService.create(formData);
        const newQuestionId = newQuestion.id;
        setSuccess('Question créée avec succès');
        
        // 🎙️ Générer la voix automatiquement
        console.log(`🎙️ Génération de la voix pour la nouvelle question ${newQuestionId}...`);
        try {
          await generateVoice(newQuestionId, {
            question_text: formData.question_text,
            question_type: formData.question_type,
            option_a: formData.option_a,
            option_b: formData.option_b,
            option_c: formData.option_c,
            option_d: formData.option_d
          });
          setSuccess('Question créée et voix générée avec succès');
        } catch (voiceError) {
          console.error('Erreur génération voix:', voiceError);
          setSuccess('Question créée (erreur génération voix)');
        }
      }

      handleCloseDialog();
      // Recharger les questions du thème
      if (formData.theme_id) {
        await reloadThemeQuestions(formData.theme_id);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erreur sauvegarde question:', err);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: number, themeId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      return;
    }

    try {
      await questionService.delete(id);
      setSuccess('Question supprimée avec succès');
      // Recharger les questions du thème
      await reloadThemeQuestions(themeId);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erreur suppression question:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des questions</h2>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Cards des thèmes */}
      <div className="grid gap-4">
        {Array.isArray(themes) && themes.map((theme) => {
          const isExpanded = expandedThemeId === theme.id;
          const questions = theme.questions || [];

          return (
            <Card key={theme.id}>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleToggleThemeQuestions(theme.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle>{theme.title}</CardTitle>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>📝 {questions.length} questions</span>
                        {theme.description && (
                          <span className="text-gray-500">{theme.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(undefined, theme.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une question
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 text-sm text-gray-700">
                      Questions du thème ({questions.length})
                    </h4>

                    {questions.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {questions.map((question: Question) => (
                          <Card key={question.id} className="bg-gray-50 border border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start gap-4">
                                {/* Image de la question si présente */}
                                {question.image_url && (
                                  <div className="flex-shrink-0">
                                    <img 
                                      src={question.image_url} 
                                      alt="Question" 
                                      className="w-20 h-20 object-cover rounded border border-gray-300"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium mb-2">
                                    {question.question_text}
                                  </p>
                                  <div className="flex gap-2 flex-wrap mb-3">
                                    <Badge variant={question.question_type === 'multiple_choice' ? 'default' : 'secondary'}>
                                      {question.question_type === 'multiple_choice' ? 'QCM' : 'Vrai/Faux'}
                                    </Badge>
                                    <Badge variant="outline">
                                      {question.difficulty === 'easy' ? '😊 Facile' :
                                        question.difficulty === 'hard' ? '😰 Difficile' : '😐 Moyen'}
                                    </Badge>
                                    <Badge variant="outline" className="bg-green-50">
                                      ✓ Réponse: {question.correct_answer}
                                    </Badge>
                                  </div>
                                  
                                  {/* Options */}
                                  <div className="space-y-1 text-sm">
                                    {question.option_a && (
                                      <div className="flex gap-2">
                                        <Badge variant={question.correct_answer?.includes('A') ? 'default' : 'outline'} className="min-w-[24px] justify-center">A</Badge>
                                        <span>{question.option_a}</span>
                                      </div>
                                    )}
                                    {question.option_b && (
                                      <div className="flex gap-2">
                                        <Badge variant={question.correct_answer?.includes('B') ? 'default' : 'outline'} className="min-w-[24px] justify-center">B</Badge>
                                        <span>{question.option_b}</span>
                                      </div>
                                    )}
                                    {question.option_c && (
                                      <div className="flex gap-2">
                                        <Badge variant={question.correct_answer?.includes('C') ? 'default' : 'outline'} className="min-w-[24px] justify-center">C</Badge>
                                        <span>{question.option_c}</span>
                                      </div>
                                    )}
                                    {question.option_d && (
                                      <div className="flex gap-2">
                                        <Badge variant={question.correct_answer?.includes('D') ? 'default' : 'outline'} className="min-w-[24px] justify-center">D</Badge>
                                        <span>{question.option_d}</span>
                                      </div>
                                    )}
                                  </div>

                                  {question.explanation && (
                                    <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                                      <p className="text-xs text-blue-900">
                                        <strong>💡 Explication :</strong> {question.explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenDialog(question)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteQuestion(question.id, theme.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic py-4">
                        Aucune question pour ce thème. Cliquez sur "Ajouter une question" pour commencer.
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {(!themes || themes.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Aucun thème créé. Veuillez d'abord créer des thèmes dans "Gestion des thèmes".
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog pour créer/éditer une question */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Modifier la question' : 'Nouvelle question'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="question_text">Question *</Label>
              <Textarea
                id="question_text"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="Ex: Quelle est la couleur du feu tribord ?"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="question_type">Type de question</Label>
                <Select
                  value={formData.question_type}
                  onValueChange={(value: any) => setFormData({ ...formData, question_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">QCM (4 options)</SelectItem>
                    <SelectItem value="true_false">Vrai/Faux</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulté</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">😊 Facile</SelectItem>
                    <SelectItem value="medium">😐 Moyen</SelectItem>
                    <SelectItem value="hard">😰 Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.question_type === 'multiple_choice' ? (
              <>
                <div className="space-y-3">
                  <Label>Options et réponses correctes *</Label>
                  <p className="text-sm text-gray-500">Cochez les cases pour indiquer les bonnes réponses</p>
                  
                  <div className="space-y-3">
                    {/* Option A */}
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        id="correct_a"
                        checked={isCorrectAnswer('A')}
                        onCheckedChange={() => toggleCorrectAnswer('A')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="option_a" className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">A</Badge>
                          <span className="text-sm">Option A *</span>
                        </Label>
                        <Input
                          id="option_a"
                          value={formData.option_a}
                          onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                          placeholder="Première option"
                          required
                        />
                      </div>
                    </div>

                    {/* Option B */}
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        id="correct_b"
                        checked={isCorrectAnswer('B')}
                        onCheckedChange={() => toggleCorrectAnswer('B')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="option_b" className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">B</Badge>
                          <span className="text-sm">Option B *</span>
                        </Label>
                        <Input
                          id="option_b"
                          value={formData.option_b}
                          onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                          placeholder="Deuxième option"
                          required
                        />
                      </div>
                    </div>

                    {/* Option C */}
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        id="correct_c"
                        checked={isCorrectAnswer('C')}
                        onCheckedChange={() => toggleCorrectAnswer('C')}
                        disabled={!formData.option_c}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="option_c" className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">C</Badge>
                          <span className="text-sm">Option C</span>
                        </Label>
                        <Input
                          id="option_c"
                          value={formData.option_c}
                          onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                          placeholder="Troisième option (optionnel)"
                        />
                      </div>
                    </div>

                    {/* Option D */}
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        id="correct_d"
                        checked={isCorrectAnswer('D')}
                        onCheckedChange={() => toggleCorrectAnswer('D')}
                        disabled={!formData.option_d}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="option_d" className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">D</Badge>
                          <span className="text-sm">Option D</span>
                        </Label>
                        <Input
                          id="option_d"
                          value={formData.option_d}
                          onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                          placeholder="Quatrième option (optionnel)"
                        />
                      </div>
                    </div>
                  </div>

                  {formData.correct_answer && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        ✓ Réponse(s) correcte(s) : <strong>{formData.correct_answer}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="option_a">Option Vrai</Label>
                    <Input
                      id="option_a"
                      value={formData.option_a || 'Vrai'}
                      onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                      placeholder="Vrai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="option_b">Option Faux</Label>
                    <Input
                      id="option_b"
                      value={formData.option_b || 'Faux'}
                      onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                      placeholder="Faux"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="correct_answer">Réponse correcte *</Label>
                  <Select
                    value={formData.correct_answer}
                    onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir la bonne réponse..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Vrai (A)</SelectItem>
                      <SelectItem value="B">Faux (B)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="explanation">Explication (optionnel)</Label>
              <Textarea
                id="explanation"
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Expliquez pourquoi cette réponse est correcte..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Image de la question (optionnel)</span>
              
              {imagePreview || formData.image_url ? (
                <div className="space-y-2">
                  <div className="relative w-full max-w-md mx-auto h-48 border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
                    <img 
                      src={imagePreview || formData.image_url} 
                      alt="Aperçu de la question" 
                      className="w-full h-full object-contain bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      aria-label="Supprimer l'image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedImage && !formData.image_url && (
                    <Button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={uploadingImage}
                      size="sm"
                      className="w-full"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Uploader l'image
                        </>
                      )}
                    </Button>
                  )}
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">Ou</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="image-url">Modifier l'URL d'image</Label>
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://exemple.com/image.jpg"
                      value={formData.image_url}
                      onChange={(e) => {
                        const url = e.target.value;
                        setFormData({ ...formData, image_url: url });
                        setImagePreview(url || null);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600 mb-2">
                      Glissez une image ou cliquez pour sélectionner
                    </p>
                    <Input
                      id="question-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={isSaving}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">Ou</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="image-url">Entrez une URL d'image</Label>
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://exemple.com/image.jpg"
                      value={formData.image_url}
                      onChange={(e) => {
                        const url = e.target.value;
                        setFormData({ ...formData, image_url: url });
                        if (url) {
                          setImagePreview(url);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              
              <p className="text-xs text-slate-500">
                Formats acceptés: JPEG, PNG, GIF, WebP (max 5MB)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button onClick={handleSaveQuestion} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
