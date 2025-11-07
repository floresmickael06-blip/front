import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import type { Theme, Question } from '../types/api.types';
import questionService from '../services/question.service';
import { parseQuestionText, hasMultipleSubQuestions, findSubQuestionForOption } from '../utils/questionParser';

interface ThemeQuizViewProps {
  theme: Theme;
  onBack: () => void;
  onComplete: () => Promise<void>;
}

interface QuestionResult {
  questionId: number;
  questionText: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export function ThemeQuizView({ theme, onBack, onComplete }: ThemeQuizViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Changé en tableau
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false); // 🔥 Nouveau state pour recommencer

  // Fonction pour mélanger aléatoirement un tableau (algorithme Fisher-Yates)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        console.log('🔥 ThemeQuizView: Chargement des questions pour le thème', theme.id);
        
        // 1️⃣ Récupérer les IDs des questions déjà répondues
        const answeredIds = await questionService.getAnsweredQuestionIds(theme.id);
        console.log('✅ Questions déjà répondues:', answeredIds);
        
        // 2️⃣ Récupérer TOUTES les questions du thème
        const allQuestions = await questionService.getByTheme(theme.id);
        console.log('✅ Total questions du thème:', allQuestions.length);
        
        // 3️⃣ Filtrer les questions NON répondues
        const unansweredQuestions = allQuestions.filter(
          question => !answeredIds.includes(question.id)
        );
        console.log('✅ Questions restantes à répondre:', unansweredQuestions.length);
        
        // 4️⃣ Mélanger aléatoirement les questions non répondues
        const shuffledQuestions = shuffleArray(unansweredQuestions);
        console.log('🎲 Questions mélangées aléatoirement');
        
        setQuestions(shuffledQuestions);
        setQuestionsError(null);
      } catch (err: any) {
        console.error('❌ Erreur chargement questions:', err);
        setQuestionsError(err.response?.data?.message || 'Erreur lors du chargement des questions');
      } finally {
        setQuestionsLoading(false);
      }
    };

    loadQuestions();
  }, [theme.id]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex) / questions.length) * 100 : 0;

  // 🔥 Fonction pour recommencer le thème depuis le début
  const handleRestartTheme = async () => {
    try {
      setIsRestarting(true);
      console.log('🔄 Recommencer le thème:', theme.id);
      
      // Réinitialiser la progression pour ce thème
      await questionService.resetThemeProgress(theme.id);
      console.log('✅ Progression réinitialisée');
      
      // Recharger toutes les questions du thème
      const allQuestions = await questionService.getByTheme(theme.id);
      const shuffledQuestions = shuffleArray(allQuestions);
      
      // Réinitialiser tous les states
      setQuestions(shuffledQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setResults([]);
      setShowResult(false);
      setQuestionsError(null);
      
      console.log('✅ Thème redémarré avec', shuffledQuestions.length, 'questions');
    } catch (err: any) {
      console.error('❌ Erreur lors du redémarrage:', err);
      setQuestionsError('Erreur lors du redémarrage du thème');
    } finally {
      setIsRestarting(false);
    }
  };

  // Gérer la sélection/désélection des réponses (pour sélection multiple)
  const handleAnswerToggle = (answer: string) => {
    setSelectedAnswers(prev => {
      if (prev.includes(answer)) {
        // Décocher
        return prev.filter(a => a !== answer);
      } else {
        // Cocher
        return [...prev, answer].sort();
      }
    });
  };

  const handleAnswerSelect = (answer: string) => {
    // Pour les questions vrai/faux, une seule réponse
    if (currentQuestion?.question_type === 'true_false') {
      setSelectedAnswers([answer]);
    } else {
      // Pour les QCM, permettre la sélection multiple
      handleAnswerToggle(answer);
    }
  };

  const handleNext = async () => {
    if (selectedAnswers.length === 0 || !currentQuestion) return;

    setSubmitting(true);
    try {
      // Convertir le tableau en string pour l'API (ex: ["A","C"] -> "A,C")
      const userAnswerString = selectedAnswers.join(',');
      
      // 🔥 Valider la réponse avec l'API
      // ⚠️ IMPORTANT: L'API /validate enregistre AUTOMATIQUEMENT la progression dans in_progress
      const validation = await questionService.validate(currentQuestion.id, userAnswerString);
      console.log('✅ Validation question', currentQuestion.id, '- Progression automatiquement enregistrée');
      
      // Stocker le résultat
      const result: QuestionResult = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question_text,
        userAnswer: userAnswerString,
        isCorrect: validation.isCorrect,
        correctAnswer: validation.correctAnswer || userAnswerString,
        explanation: validation.explanation || ''
      };
      
      const newResults = [...results, result];
      setResults(newResults);

      // Passer à la question suivante ou afficher les résultats
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswers([]);
      } else {
        // 🔥 Fin du quiz : afficher les résultats
        // ℹ️ Plus besoin d'enregistrer manuellement la progression
        // car chaque appel à /validate l'a déjà fait automatiquement
        setShowResult(true);
        console.log('🎉 Quiz terminé !');
        console.log('📊 Résultats:', {
          total: newResults.length,
          correct: newResults.filter(r => r.isCorrect).length,
          percentage: ((newResults.filter(r => r.isCorrect).length / newResults.length) * 100).toFixed(1) + '%'
        });
      }
    } catch (err: any) {
      console.error('❌ Erreur validation réponse:', err);
      alert(err.response?.data?.message || 'Erreur lors de la validation de la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setResults([]);
    setShowResult(false);
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await onComplete();
      onBack();
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      setIsFinishing(false);
    }
  };

  // États de chargement et d'erreur
  if (questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-slate-600">Chargement des questions...</p>
        </div>
      </div>
    );
  }

  if (questionsError || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              {questions.length === 0 && !questionsError ? 'Thème complété !' : 'Aucune question disponible'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-6">
              {questions.length === 0 && !questionsError
                ? '🎉 Félicitations ! Vous avez répondu à toutes les questions de ce thème.'
                : questionsError || 'Ce thème ne contient pas encore de questions.'}
            </p>
            
            {questions.length === 0 && !questionsError && (
              <div className="space-y-3">
                <Button 
                  onClick={handleRestartTheme} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isRestarting}
                >
                  {isRestarting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redémarrage...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Recommencer ce thème
                    </>
                  )}
                </Button>
                <Button onClick={onBack} variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour au tableau de bord
                </Button>
              </div>
            )}
            
            {(questionsError || (questions.length === 0 && questionsError)) && (
              <Button onClick={onBack} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affichage des résultats finaux
  if (showResult) {
    const correctCount = results.filter(r => r.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 50; // 50% pour réussir

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-3xl mx-auto py-6">
          <Card className="border-2 border-slate-200">
            <CardHeader className="text-center pb-4">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
                {passed ? (
                  <Trophy className="w-10 h-10 text-green-600" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-orange-600" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {passed ? 'Félicitations !' : 'Quiz terminé'}
              </CardTitle>
              <p className="text-slate-600 mt-2">Thème : {theme.title}</p>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-slate-800 mb-2">{score}%</div>
                <p className="text-slate-600">
                  {correctCount} bonnes réponses sur {questions.length}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {results.map((result) => (
                  <Card key={result.questionId} className={`border ${result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {result.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{result.questionText}</p>
                          <p className="text-xs text-slate-600 mb-2">
                            Votre réponse : <span className="font-semibold">{result.userAnswer}</span>
                            {!result.isCorrect && result.correctAnswer && (
                              <> • Bonne réponse : <span className="font-semibold text-green-700">{result.correctAnswer}</span></>
                            )}
                          </p>
                          {result.isCorrect && result.correctAnswer.includes(',') && (
                            <p className="text-xs text-green-600 mb-2">
                              ✅ Toutes les bonnes réponses trouvées !
                            </p>
                          )}
                          {result.explanation && (
                            <p className="text-xs text-slate-500 italic bg-blue-50 p-2 rounded border border-blue-200">
                              💡 {result.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleRestart} variant="outline" className="flex-1" disabled={isFinishing}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recommencer
                </Button>
                <Button onClick={handleFinish} className="flex-1" disabled={isFinishing}>
                  {isFinishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour au dashboard
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Affichage de la question courante
  const getOptions = () => {
    if (!currentQuestion) return [];
    
    // Pour les questions Vrai/Faux, on retourne les options A et B
    if (currentQuestion.question_type === 'true_false') {
      return [
        { key: 'A', value: currentQuestion.option_a || 'Vrai' },
        { key: 'B', value: currentQuestion.option_b || 'Faux' },
      ];
    }
    
    // Pour les QCM, on retourne toutes les options disponibles
    const options = [
      { key: 'A', value: currentQuestion.option_a },
      { key: 'B', value: currentQuestion.option_b },
      { key: 'C', value: currentQuestion.option_c },
      { key: 'D', value: currentQuestion.option_d },
    ].filter(opt => opt.value);
    
    return options;
  };

  const options = getOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-3xl mx-auto py-6">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Badge variant="outline" className="text-sm">
            Question {currentQuestionIndex + 1} / {questions.length}
          </Badge>
        </div>

        <div className="mb-4">
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-2 border-slate-200">
          <CardHeader>
            {/* Parser la question pour détecter les sous-questions multiples */}
            {currentQuestion && (() => {
              const parsed = parseQuestionText(currentQuestion.question_text);
              const hasSubQuestions = hasMultipleSubQuestions(currentQuestion.question_text);
              
              if (hasSubQuestions && parsed.subQuestions.length > 0) {
                // Afficher le texte principal seulement
                return (
                  <CardTitle className="text-lg">
                    {parsed.mainText}
                  </CardTitle>
                );
              } else {
                // Afficher la question complète normalement
                return (
                  <CardTitle className="text-lg">
                    {currentQuestion.question_text}
                  </CardTitle>
                );
              }
            })()}
          </CardHeader>
          <CardContent>
            {/* Affichage des images si disponibles (support multi-images avec séparateur ';') */}
            {currentQuestion?.image_url && (
              <div className="mb-6 space-y-4">
                {currentQuestion.image_url.split(';').filter(url => url.trim()).map((imageUrl, index) => {
                  const trimmedUrl = imageUrl.trim();
                  let fullImageUrl = trimmedUrl;
                  
                  // Gérer les URLs selon l'environnement
                  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
                    if (import.meta.env.DEV) {
                      fullImageUrl = `/${trimmedUrl}`;
                    } else {
                      // En production sur https://iam-mickael.me/app-bateau-client/
                      fullImageUrl = `/app-bateau-client/${trimmedUrl}`;
                    }
                  }
                  
                  return (
                    <div key={index}>
                      <img
                        src={fullImageUrl}
                        alt={`Image de la question ${index + 1}`}
                        className="w-full h-auto max-h-96 object-contain rounded-lg border border-slate-200"
                        onError={(e) => {
                          console.error('Erreur chargement image:', fullImageUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3 mb-6">
              {currentQuestion?.question_type === 'true_false' && (
                <p className="text-sm text-slate-500 mb-3">Sélectionnez une réponse</p>
              )}
              {currentQuestion?.question_type === 'multiple_choice' && (
                <p className="text-sm text-slate-500 mb-3">
                  {currentQuestion.correct_answer?.includes(',') 
                    ? '⚠️ Plusieurs réponses possibles - Cochez toutes les bonnes réponses'
                    : 'Sélectionnez une ou plusieurs réponses'}
                </p>
              )}
              
              {currentQuestion && (() => {
                const parsed = parseQuestionText(currentQuestion.question_text);
                const hasSubQuestions = hasMultipleSubQuestions(currentQuestion.question_text);
                
                return options.map((option, index) => {
                  const isSelected = selectedAnswers.includes(option.key);
                  const isTrueFalse = currentQuestion?.question_type === 'true_false';
                  
                  // Déterminer si on doit afficher un header de sous-question avant cette option
                  let subQuestionHeader = null;
                  if (hasSubQuestions && parsed.subQuestions.length > 0) {
                    const subQuestion = findSubQuestionForOption(parsed, option.key);
                    
                    // Afficher le header uniquement pour la première option de chaque sous-question
                    if (subQuestion) {
                      const isFirstOptionOfSubQuestion = 
                        index === 0 || 
                        !subQuestion.options.includes(options[index - 1].key);
                      
                      if (isFirstOptionOfSubQuestion) {
                        subQuestionHeader = (
                          <div key={`subq-${option.key}`} className="mt-4 mb-2 font-semibold text-slate-700">
                            {subQuestion.text}
                          </div>
                        );
                      }
                    }
                  }
                  
                  return (
                    <React.Fragment key={option.key}>
                      {subQuestionHeader}
                      <div
                        onClick={() => handleAnswerSelect(option.key)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isTrueFalse ? (
                            // Radio button pour vrai/faux
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-slate-300'
                            }`}>
                              {isSelected && (
                                <div className="w-3 h-3 rounded-full bg-white" />
                              )}
                            </div>
                          ) : (
                            // Checkbox pour QCM
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleAnswerSelect(option.key)}
                              className="w-5 h-5"
                            />
                          )}
                          <span className="font-medium text-slate-700">
                            {option.key}. {option.value}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                });
              })()}
            </div>

            <Button
              onClick={handleNext}
              disabled={selectedAnswers.length === 0 || submitting}
              className="w-full"
            >
              {submitting ? 'Validation...' : (currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Terminer le quiz')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

