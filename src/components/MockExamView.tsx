import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Loader2, Trophy, AlertCircle, RotateCcw, Volume2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import type { MockExamWithQuestions } from '../types/api.types';
import { useMockExams } from '../hooks/useMockExams';
import { useIsMobile } from '../hooks/useIsMobile';
import progressService from '../services/progress.service';
import questionService from '../services/question.service';
import { MEDIA_CDN } from '../config/api.config';
import { parseQuestionText, hasMultipleSubQuestions, findSubQuestionForOption } from '../utils/questionParser';

interface MockExamViewProps {
  examId: number;
  attemptId?: number | null; // 🔥 Si présent, mode correction
  onBack: () => void;
  onComplete: () => void;
}

interface QuestionResult {
  questionId: number;
  questionText: string;
  userAnswer: string;
  userAnswerText?: string; // 🔥 Texte complet de la réponse utilisateur
  isCorrect: boolean;
  correctAnswer: string;
  correctAnswerText?: string; // 🔥 Texte complet de la bonne réponse
  explanation: string;
}

export function MockExamView({ examId, attemptId, onBack, onComplete }: MockExamViewProps) {
  const { isLoading: isLoadingExams, fetchAttemptDetail, fetchQuestionByIndex } = useMockExams();
  const [exam, setExam] = useState<MockExamWithQuestions | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Changé en tableau
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCorrectionMode, setIsCorrectionMode] = useState(false); // 🔥 Mode correction
  
  // �️ Détecter si on est sur mobile ou desktop
  const isMobile = useIsMobile();
  
  // �🔥 Nouveaux états pour le chargement progressif
  const loadingQuestionsRef = useRef<Set<number>>(new Set()); // 🔥 Track des questions en cours de chargement
  const previousQuestionIndexRef = useRef<number>(-1); // 🔥 Pour éviter de rejouer l'audio
  
  // 🎵 États audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [postAudioTimer, setPostAudioTimer] = useState<number | null>(null);
  const postAudioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Charger l'examen
  useEffect(() => {
    if (attemptId) {
      // 🔥 Mode correction - charger la tentative avec les réponses
      loadAttempt();
    } else {
      // Mode normal - charger l'examen
      loadExam();
    }
  }, [examId, attemptId]);

  const loadAttempt = async () => {
    try {
      setError(null);
      setIsCorrectionMode(true);
      const attemptData = await fetchAttemptDetail(attemptId!);
      
      // Transformer les données pour MockExamWithQuestions
      const examData: MockExamWithQuestions = {
        id: attemptData.attempt.exam_id,
        title: attemptData.attempt.exam_name,
        duration_minutes: attemptData.attempt.duration_minutes,
        passing_score: attemptData.attempt.passing_score,
        questions: attemptData.questions as any[],
        question_count: attemptData.questions.length
      };
      
      setExam(examData);
      setShowResults(true); // Afficher directement les résultats
      
      // Transformer les questions en results pour affichage
      const correctionResults = attemptData.questions.map(q => ({
        questionId: q.id,
        questionText: q.question_text,
        userAnswer: q.user_answer || '',
        userAnswerText: q.user_answer_text || '', // 🔥 Texte de la réponse utilisateur
        isCorrect: q.is_correct,
        correctAnswer: q.correct_answer,
        correctAnswerText: q.correct_answer_text || '', // 🔥 Texte de la bonne réponse
        explanation: q.explanation || ''
      }));
      
      setResults(correctionResults);
    } catch (err: any) {
      console.error('Erreur chargement tentative:', err);
      setError('Impossible de charger la correction');
    }
  };

  const loadExam = async () => {
    try {
      setError(null);
      
      // 🔥 Chargement progressif : charger d'abord la première question
      console.log('🚀 Chargement progressif de l\'examen', examId);
      
      const firstQuestionData = await fetchQuestionByIndex(examId, 0);
      
      if (!firstQuestionData) {
        setError('Impossible de charger l\'examen');
        return;
      }
      
      // Créer un objet exam minimal avec la première question
      const examData: MockExamWithQuestions = {
        id: firstQuestionData.mock_exam.id,
        title: firstQuestionData.mock_exam.title,
        duration_minutes: firstQuestionData.mock_exam.duration_minutes,
        passing_score: firstQuestionData.mock_exam.passing_score,
        questions: [firstQuestionData.question], // Seulement la première question
        question_count: firstQuestionData.total_questions
      };
      
      // Stocker la première question dans la Map
      const questionsMap = new Map();
      questionsMap.set(0, firstQuestionData.question);
      
      // Afficher l'interface avec la première question
      setExam(examData);
      
      // Initialiser le timer (en secondes)
      if (examData.duration_minutes) {
        setTimeRemaining(examData.duration_minutes * 60);
      }
      
      console.log('✅ Première question chargée, affichage de l\'interface');
      
      // 🔥 Charger les autres questions en arrière-plan
      loadRemainingQuestions(examId, firstQuestionData.total_questions, examData, questionsMap);
      
    } catch (err: any) {
      console.error('Erreur chargement examen:', err);
      setError('Impossible de charger l\'examen');
    }
  };
  
  // 🔥 Charger les questions restantes en arrière-plan
  const loadRemainingQuestions = async (
    examId: number, 
    totalCount: number, 
    _initialExam: MockExamWithQuestions,
    questionsMap: Map<number, any>
  ) => {
    console.log(`🔄 Chargement en arrière-plan de ${totalCount - 1} questions...`);
    
    // Charger les questions une par une
    for (let i = 1; i < totalCount; i++) {
      // Vérifier si déjà en cours de chargement
      if (loadingQuestionsRef.current.has(i)) {
        console.log(`⏭️ Question ${i} déjà en cours de chargement, skip`);
        continue;
      }
      
      // Marquer comme en cours de chargement
      loadingQuestionsRef.current.add(i);
      
      try {
        const questionData = await fetchQuestionByIndex(examId, i);
        
        if (questionData && questionData.question) {
          // Ajouter la question à la Map
          questionsMap.set(i, questionData.question);
          
          // Mettre à jour l'objet exam avec toutes les questions chargées jusqu'à présent
          const updatedQuestions = Array.from({ length: totalCount }, (_, idx) => {
            return questionsMap.get(idx) || null;
          }).filter(Boolean);
          
          setExam(prev => prev ? {
            ...prev,
            questions: updatedQuestions
          } : null);
          
          console.log(`✅ Question ${i + 1}/${totalCount} chargée`);
        }
      } catch (err) {
        console.error(`❌ Erreur lors du chargement de la question ${i}:`, err);
        // Continuer le chargement des autres questions même en cas d'erreur
      } finally {
        // Retirer de la liste des chargements en cours
        loadingQuestionsRef.current.delete(i);
      }
    }
    
    console.log('✅ Toutes les questions ont été chargées en arrière-plan');
  };

  // Timer countdown
  useEffect(() => {
    if (isCorrectionMode) return; // 🔥 Pas de timer en mode correction
    if (timeRemaining === null || timeRemaining <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Temps écoulé - soumettre automatiquement
          if (!showResults) {
            handleAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, showResults, isCorrectionMode]);

  // 🎵 Gestion de l'audio pour chaque question
  useEffect(() => {
    if (isCorrectionMode) return; // 🔥 Pas d'audio en mode correction
    if (showResults) return; // 🔥 Pas d'audio si résultats affichés
    
    const currentQuestion = exam?.questions[currentQuestionIndex];
    
    // Si la question n'est pas encore chargée, ne rien faire
    if (!currentQuestion) {
      console.log(`⏳ Question ${currentQuestionIndex} pas encore chargée, attente...`);
      return;
    }
    
    // 🔥 Ne recharger l'audio que si l'index de la question a vraiment changé
    if (previousQuestionIndexRef.current === currentQuestionIndex) {
      console.log(`✅ Question ${currentQuestionIndex} déjà initialisée, skip audio`);
      return; // Même question, ne rien faire
    }
    
    console.log(`🎵 Initialisation audio pour question ${currentQuestionIndex}`);
    
    // Mettre à jour la référence APRÈS avoir vérifié que la question existe
    previousQuestionIndexRef.current = currentQuestionIndex;
    
    // Nettoyer l'ancien audio et timer
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (postAudioIntervalRef.current) {
      clearInterval(postAudioIntervalRef.current);
      postAudioIntervalRef.current = null;
    }
    
    // Réinitialiser les états
    setAudioProgress(0);
    setPostAudioTimer(null);
    setAudioLoading(false);
    setAudioReady(false);
    
    // Si la question a un audio, le charger et le jouer
    if (currentQuestion.voice_url) {
      const audioUrl = MEDIA_CDN.getAudioUrl(currentQuestion.voice_url);
      if (!audioUrl) return;
      
      setAudioLoading(true);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.volume = audioVolume;
      
      // Événements audio
      audio.addEventListener('loadedmetadata', () => {
        // Audio prêt
        setAudioLoading(false);
        setAudioReady(true);
      });
      
      audio.addEventListener('error', () => {
        console.error('❌ Erreur audio:', {
          audioUrl,
          voiceUrl: currentQuestion?.voice_url,
          networkState: audio.networkState,
          readyState: audio.readyState,
          errorMessage: audio.error?.message,
          errorCode: audio.error?.code
        });
        setAudioLoading(false);
        setAudioReady(false);
      });
      
      audio.addEventListener('timeupdate', () => {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      });
      
      audio.addEventListener('ended', () => {
        setAudioProgress(100);
        setAudioReady(false);
        
        // Démarrer le timer de 20 secondes après la fin de l'audio
        setPostAudioTimer(20);
        let countdown = 20;
        
        postAudioIntervalRef.current = setInterval(() => {
          countdown--;
          setPostAudioTimer(countdown);
          
          if (countdown <= 0) {
            // Temps écoulé - passer à la question suivante automatiquement
            if (postAudioIntervalRef.current) {
              clearInterval(postAudioIntervalRef.current);
              postAudioIntervalRef.current = null;
            }
            
            // Simuler un clic sur "Suivant"
            const nextButton = document.querySelector('[data-next-button="true"]') as HTMLButtonElement;
            if (nextButton) {
              nextButton.click();
            }
          }
        }, 1000);
      });
      
      // Jouer l'audio automatiquement
      audio.play().catch(err => {
        console.error('Erreur lecture audio:', err);
      });
    }
    
    // Cleanup lors du changement de question
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (postAudioIntervalRef.current) {
        clearInterval(postAudioIntervalRef.current);
        postAudioIntervalRef.current = null;
      }
    };
  }, [currentQuestionIndex, isCorrectionMode, showResults, exam?.questions[currentQuestionIndex]]);

  // 🔊 Mettre à jour le volume de l'audio en cours sans le redémarrer
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
      console.log(`🔊 Volume mis à jour: ${Math.round(audioVolume * 100)}%`);
    }
  }, [audioVolume]);

  // Mettre à jour le volume quand il change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 🔥 Helper pour obtenir le texte d'une réponse à partir de sa lettre
  const getAnswerText = (question: any, answerKey: string): string => {
    if (!answerKey || !question) return '';
    
    // Gérer les réponses multiples (ex: "A,B")
    const keys = answerKey.split(',').map(k => k.trim());
    const texts = keys.map(key => {
      switch(key) {
        case 'A': return question.option_a;
        case 'B': return question.option_b;
        case 'C': return question.option_c;
        case 'D': return question.option_d;
        default: return null;
      }
    }).filter(Boolean);
    
    return texts.join(', ');
  };

  // Gérer la sélection/désélection des réponses
  const handleAnswerToggle = (answer: string) => {
    setSelectedAnswers(prev => {
      if (prev.includes(answer)) {
        return prev.filter(a => a !== answer);
      } else {
        return [...prev, answer].sort();
      }
    });
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = exam?.questions?.[currentQuestionIndex];
    if (!currentQuestion) return;
    
    // Pour les questions vrai/faux, une seule réponse
    if (currentQuestion.question_type === 'true_false') {
      setSelectedAnswers([answer]);
    } else {
      // Pour les QCM, permettre la sélection multiple
      handleAnswerToggle(answer);
    }
  };

  const handleAutoSubmit = async () => {
    // Soumission automatique quand le temps est écoulé
    setShowResults(true);
    
    // Enregistrer le résultat dans le backend
    try {
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
      const timeSpentMinutes = Math.round(timeSpentSeconds / 60);
      const correctCount = results.filter(r => r.isCorrect).length;
      
      // 🔥 Construire l'objet answers { questionId: userAnswer }
      const answersObject: Record<number, string> = {};
      results.forEach(result => {
        answersObject[result.questionId] = result.userAnswer;
      });
      
      // ⚠️ Important : s'assurer que score est un nombre (même 0)
      console.log('🔥 handleAutoSubmit - Envoi:', {
        mock_exam_id: examId,
        score: correctCount,
        time_spent_minutes: timeSpentMinutes,
        answers: answersObject
      });
      
      await progressService.submitExamResult({
        mock_exam_id: examId,
        score: correctCount,  // Peut être 0 si aucune question validée
        time_spent_minutes: timeSpentMinutes,
        answers: answersObject // 🔥 Ajouter les réponses
      });
    } catch (err: any) {
      console.error('⚠️ Erreur sauvegarde résultat (non bloquant):', err);
      console.error('Réponse API:', err.response?.data);
    }
  };

  const handleNext = async () => {
    if (!exam) return;
    
    // 🎵 Nettoyer le timer post-audio si l'utilisateur clique manuellement
    if (postAudioIntervalRef.current) {
      clearInterval(postAudioIntervalRef.current);
      postAudioIntervalRef.current = null;
      setPostAudioTimer(null);
    }
    
    const currentQuestion = exam.questions?.[currentQuestionIndex];
    if (!currentQuestion) return;

    setIsSubmitting(true);
    try {
      // Convertir le tableau en string pour l'API (vide si aucune réponse)
      const userAnswerString = selectedAnswers.join(',');
      
      // 🔥 Valider la réponse avec l'API (comme ThemeQuizView)
      const validation = await questionService.validate(currentQuestion.id, userAnswerString);
      
      // 🔥 Obtenir les textes des réponses
      const userAnswerText = getAnswerText(currentQuestion, userAnswerString);
      const correctAnswerText = getAnswerText(currentQuestion, validation.correctAnswer || userAnswerString);
      
      // Stocker le résultat
      const result: QuestionResult = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question_text,
        userAnswer: userAnswerString,
        userAnswerText: userAnswerText, // 🔥 Texte de la réponse utilisateur
        isCorrect: validation.isCorrect,
        correctAnswer: validation.correctAnswer || userAnswerString,
        correctAnswerText: correctAnswerText, // 🔥 Texte de la bonne réponse
        explanation: validation.explanation || ''
      };
      
      const newResults = [...results, result];
      setResults(newResults);

      // Passer à la question suivante ou afficher les résultats
      if (currentQuestionIndex < (exam.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswers([]);
      } else {
        // Dernière question - afficher les résultats et sauvegarder
        setShowResults(true);
        
        // Enregistrer le résultat dans le backend
        try {
          const timeSpentSeconds = exam.duration_minutes 
            ? (exam.duration_minutes * 60 - (timeRemaining || 0)) 
            : Math.floor((Date.now() - startTime) / 1000);
          const timeSpentMinutes = Math.round(timeSpentSeconds / 60);
          const correctCount = newResults.filter(r => r.isCorrect).length;
          
          // 🔥 Construire l'objet answers { questionId: userAnswer }
          const answersObject: Record<number, string> = {};
          newResults.forEach(result => {
            answersObject[result.questionId] = result.userAnswer;
          });
          
          // ⚠️ Important : s'assurer que score est un nombre (même 0)
          const dataToSend = {
            mock_exam_id: examId,
            score: correctCount,
            time_spent_minutes: timeSpentMinutes,
            answers: answersObject // 🔥 Ajouter les réponses
          };
          
          console.log('🔥 handleNext - Envoi:', dataToSend);
          
          await progressService.submitExamResult(dataToSend);
        } catch (err: any) {
          console.error('⚠️ Erreur sauvegarde résultat (non bloquant):', err);
          console.error('Réponse API:', err.response?.data);
        }
      }
    } catch (err: any) {
      console.error('❌ Erreur validation réponse:', err);
      setError(err.response?.data?.message || 'Erreur lors de la validation de la réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    if (isCorrectionMode) {
      // 🔥 En mode correction, "Refaire l'examen" recharge l'examen en mode normal
      setIsCorrectionMode(false);
      setShowResults(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setResults([]);
      setError(null);
      loadExam(); // Recharger l'examen en mode normal
    } else {
      // Mode normal : recommencer l'examen
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setResults([]);
      setShowResults(false);
      setError(null);
      // Réinitialiser le timer
      if (exam?.duration_minutes) {
        setTimeRemaining(exam.duration_minutes * 60);
      }
    }
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

  if (isLoadingExams || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Chargement de l'examen...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Écran de résultats (comme ThemeQuizView + info examen)
  if (showResults) {
    const totalQuestions = exam?.questions?.length || 0;
    const correctCount = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = correctCount >= (exam?.passing_score || 0);
    
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
                {passed ? 'Félicitations !' : 'Examen terminé'}
              </CardTitle>
              <p className="text-slate-600 mt-2">{exam?.title}</p>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-slate-800 mb-2">{percentage}%</div>
                <p className="text-slate-600">
                  {correctCount} bonnes réponses sur {totalQuestions}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Score minimum requis : {exam?.passing_score} / {totalQuestions}
                </p>
              </div>

              <Progress value={percentage} className="h-3 mb-6" />

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
                            Votre réponse : <span className="font-semibold">{result.userAnswer} </span>
                            {result.userAnswerText && (
                              <span className="ml-1 text-slate-500">({result.userAnswerText})</span>
                            )}
                            {!result.isCorrect && result.correctAnswer && (
                              <>
                                <br />
                                Bonne réponse : <span className="font-semibold text-green-700">{result.correctAnswer} </span>
                                {result.correctAnswerText && (
                                  <span className="ml-1 text-green-600">({result.correctAnswerText})</span>
                                )}
                              </>
                            )}
                            {result.isCorrect && result.correctAnswerText && (
                              <>
                                <br />
                                <span className="text-green-600">✓ {result.correctAnswerText}</span>
                              </>
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
                  {isCorrectionMode ? 'Réessayer' : 'Recommencer'}
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
                      Retour
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

  // Affichage de la question courante (comme ThemeQuizView + Timer)
  const currentQuestion = exam.questions?.[currentQuestionIndex];
  const totalQuestions = exam.questions?.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;

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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${isMobile ? 'p-4' : 'p-8'}`}>
      <div className={`mx-auto py-6 ${isMobile ? 'max-w-3xl' : 'max-w-[80vw]'}`}>
        {/* Header avec timer et retour */}
        <div className="mb-4 flex items-center justify-between">
          <Button variant="outline" onClick={onBack} size={isMobile ? "sm" : "lg"}>
            <ArrowLeft className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} mr-2`} />
            Retour
          </Button>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={isMobile ? "text-sm" : "text-lg px-4 py-2"}>
              Question {currentQuestionIndex + 1} / {totalQuestions}
            </Badge>
            
            {timeRemaining !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold ${isMobile ? 'text-sm' : 'text-lg'} ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className={isMobile ? 'w-4 h-4' : 'w-6 h-6'} />
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <Progress value={progress} className={isMobile ? 'h-2' : 'h-4'} />
          <div className={`flex justify-between items-center mt-2 ${isMobile ? 'text-xs' : 'text-base'} text-slate-600`}>
            <span>{exam?.title}</span>
            <span>Score minimum : {exam?.passing_score}/{totalQuestions}</span>
          </div>
        </div>

        {/* Alerte si temps faible */}
        {timeRemaining !== null && timeRemaining < 60 && !showResults && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              ⏰ Moins d'une minute restante !
            </AlertDescription>
          </Alert>
        )}

        {/* Erreur */}
        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* 🔥 Indicateur de chargement si la question n'est pas encore chargée */}
        {!currentQuestion && !isCorrectionMode && exam && (
          <Card className="border-2 border-slate-200 mb-4">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600 font-medium">Chargement de la question...</p>
                <p className="text-sm text-slate-500 mt-2">Veuillez patienter</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question actuelle */}
        {currentQuestion && (
          <Card className={`border-2 border-slate-200 ${!isMobile ? 'p-4' : ''}`}>
            <CardHeader>
              {/* Parser la question pour détecter les sous-questions multiples */}
              {(() => {
                const parsed = parseQuestionText(currentQuestion.question_text);
                const hasSubQuestions = hasMultipleSubQuestions(currentQuestion.question_text);
                
                if (hasSubQuestions && parsed.subQuestions.length > 0) {
                  // Afficher le texte principal seulement
                  return (
                    <CardTitle className={isMobile ? "text-lg" : "text-2xl"}>
                      {parsed.mainText}
                    </CardTitle>
                  );
                } else {
                  // Afficher la question complète normalement
                  return (
                    <CardTitle className={isMobile ? "text-lg" : "text-2xl"}>
                      {currentQuestion.question_text}
                    </CardTitle>
                  );
                }
              })()}
            </CardHeader>
            <CardContent>
              {/* Affichage des images si disponibles (support multi-images avec séparateur ';') */}
              {currentQuestion.image_url && (
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

              {/* 🎵 Contrôles audio avec barre de progression et volume */}
              {currentQuestion.voice_url && (
                <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200 shadow-sm space-y-4">
                  {/* Barre de progression audio */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        {audioLoading ? (
                          <>
                            <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                            <span className="font-medium">Chargement de l'audio...</span>
                          </>
                        ) : audioReady ? (
                          <>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="font-medium">Lecture audio en cours...</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-slate-400 rounded-full" />
                            <span className="font-medium">En attente...</span>
                          </>
                        )}
                      </div>
                      <span className="font-semibold">{Math.round(audioProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-300 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-full transition-all duration-300 ease-out relative"
                        style={{ width: `${audioProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Contrôle de volume avec Slider - Desktop uniquement */}
                  {!isMobile && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <Volume2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 px-2">
                        <Slider
                          value={[audioVolume * 100]}
                          onValueChange={(value) => setAudioVolume(value[0] / 100)}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                          disabled={audioLoading}
                        />
                      </div>
                      <span className="text-sm font-bold text-blue-700 w-12 text-right">
                        {Math.round(audioVolume * 100)}%
                      </span>
                      
                      {/* Timer post-audio */}
                      {postAudioTimer !== null && (
                        <Badge variant="destructive" className="ml-2 animate-pulse font-bold">
                          ⏱️ {postAudioTimer}s
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Timer post-audio pour mobile (si pas de slider) */}
                  {isMobile && postAudioTimer !== null && (
                    <div className="flex justify-center">
                      <Badge variant="destructive" className="animate-pulse font-bold">
                        ⏱️ Prochaine question dans {postAudioTimer}s
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 mb-6">
                {currentQuestion.question_type === 'true_false' && (
                  <p className="text-sm text-slate-500 mb-3">Sélectionnez une réponse</p>
                )}
                {currentQuestion.question_type === 'multiple_choice' && (
                  <p className="text-sm text-slate-500 mb-3">
                    {currentQuestion.correct_answer?.includes(',') 
                      ? '⚠️ Plusieurs réponses possibles - Cochez toutes les bonnes réponses'
                      : 'Sélectionnez une ou plusieurs réponses'}
                  </p>
                )}
                
                {/* Parser la question pour gérer les sous-questions multiples */}
                {(() => {
                  const parsed = parseQuestionText(currentQuestion.question_text);
                  const hasSubQuestions = hasMultipleSubQuestions(currentQuestion.question_text);
                  
                  if (!hasSubQuestions || parsed.subQuestions.length === 0) {
                    // Affichage normal sans sous-questions
                    return options.map((option) => {
                      const isSelected = selectedAnswers.includes(option.key);
                      const isTrueFalse = currentQuestion.question_type === 'true_false';
                      
                      return (
                        <div
                          key={option.key}
                          onClick={() => !isSubmitting && handleAnswerSelect(option.key)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-blue-300 bg-white'
                          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                              // Checkbox pour choix multiples
                              <Checkbox
                                checked={isSelected}
                                className="pointer-events-none"
                              />
                            )}
                            <div className="flex-1">
                              <span className="font-semibold text-blue-600">{option.key}.</span>
                              <span className="ml-2 text-slate-700">{option.value}</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  }
                  
                  // Affichage avec sous-questions structurées
                  return (
                    <>
                      {options.map((option) => {
                        const isSelected = selectedAnswers.includes(option.key);
                        const isTrueFalse = currentQuestion.question_type === 'true_false';
                        const subQuestion = findSubQuestionForOption(parsed, option.key);
                        
                        // Afficher le titre de la sous-question avant la première option du groupe
                        const shouldShowSubQuestionTitle = subQuestion && subQuestion.options[0] === option.key;
                        
                        return (
                          <div key={option.key}>
                            {/* Titre de la sous-question */}
                            {shouldShowSubQuestionTitle && (
                              <div className="mb-3 mt-6 first:mt-0">
                                <h4 className={`font-semibold text-slate-700 ${isMobile ? 'text-base' : 'text-lg'}`}>
                                  {subQuestion.text} :
                                </h4>
                              </div>
                            )}
                            
                            {/* Option */}
                            <div
                              onClick={() => !isSubmitting && handleAnswerSelect(option.key)}
                              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-blue-300 bg-white'
                              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                                  // Checkbox pour choix multiples
                                  <Checkbox
                                    checked={isSelected}
                                    className="pointer-events-none"
                                  />
                                )}
                                <div className="flex-1">
                                  <span className="font-semibold text-blue-600">{option.key}.</span>
                                  <span className="ml-2 text-slate-700">{option.value}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>

              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                data-next-button="true"
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validation...
                  </>
                ) : (
                  currentQuestionIndex < totalQuestions - 1 ? 'Question suivante' : 'Terminer l\'examen'
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}