import { useState, useEffect } from 'react';
import mockExamService from '../services/mockExam.service';
import type { 
  MockExam, 
  MockExamWithQuestions,
  CreateMockExamRequest, 
  UpdateMockExamRequest,
  SubmitMockExamRequest,
  SubmitMockExamResponse,
  ExamAttempt,
  ExamAttemptDetail
} from '../types/api.types';

/**
 * 🔥 Hook pour gérer les examens blancs selon l'API réelle
 */
export const useMockExams = () => {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [currentExam, setCurrentExam] = useState<MockExamWithQuestions | null>(null);
  const [nextExam, setNextExam] = useState<MockExam | null>(null);
  const [examHistory, setExamHistory] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all mock exams
  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await mockExamService.getAllMockExams();
      
      // 🔥 Validation: s'assurer que data est bien un tableau
      console.log('📦 Response getAllMockExams:', data);
      
      if (Array.isArray(data)) {
        setExams(data);
      } else {
        console.error('❌ La réponse n\'est pas un tableau:', data);
        setExams([]);
        setError('Format de réponse invalide');
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement examens:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des examens');
      setExams([]); // Assurer que exams reste un tableau
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a specific exam by ID (with questions)
  const fetchById = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      // GET /api/mock-exams/:id/questions - retourne l'examen avec les questions
      const data = await mockExamService.getMockExamQuestions(id);
      setCurrentExam(data);
      return data;
    } catch (err: any) {
      console.error('❌ Erreur chargement examen:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de l\'examen');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Submit exam answers
  const submitExam = async (
    examId: number, 
    answers: SubmitMockExamRequest
  ): Promise<SubmitMockExamResponse> => {
    try {
      setError(null);
      // POST /api/progress/exam - enregistre le résultat
      const result = await mockExamService.submitMockExam(examId, answers);
      return result;
    } catch (err: any) {
      console.error('❌ Erreur soumission examen:', err);
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
      throw err;
    }
  };

  // Create a new exam (admin only)
  const createExam = async (exam: CreateMockExamRequest) => {
    try {
      setError(null);
      const newExam = await mockExamService.createMockExam(exam);
      setExams((prev) => [...prev, newExam]);
      return newExam;
    } catch (err: any) {
      console.error('❌ Erreur création examen:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création');
      throw err;
    }
  };

  // Update an exam (admin only)
  const updateExam = async (id: number, updates: UpdateMockExamRequest) => {
    try {
      setError(null);
      const updated = await mockExamService.updateMockExam(id, updates);
      setExams((prev) =>
        prev.map((exam) => (exam.id === id ? updated : exam))
      );
    } catch (err: any) {
      console.error('❌ Erreur mise à jour examen:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  // Delete an exam (admin only)
  const deleteExam = async (id: number) => {
    try {
      setError(null);
      await mockExamService.deleteMockExam(id);
      setExams((prev) => prev.filter((exam) => exam.id !== id));
    } catch (err: any) {
      console.error('❌ Erreur suppression examen:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      throw err;
    }
  };

  // 🔥 Fetch next exam to take
  const fetchNextExam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await mockExamService.getNextMockExam();
      setNextExam(data);
      return data;
    } catch (err: any) {
      console.error('❌ Erreur chargement examen suivant:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de l\'examen suivant');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Fetch exam history (all attempts)
  const fetchExamHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await mockExamService.getExamHistory();
      setExamHistory(data);
      return data;
    } catch (err: any) {
      console.error('❌ Erreur chargement historique examens:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de l\'historique');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Fetch attempt detail with correction
  const fetchAttemptDetail = async (attemptId: number): Promise<ExamAttemptDetail> => {
    try {
      setError(null);
      const data = await mockExamService.getExamAttemptDetail(attemptId);
      return data;
    } catch (err: any) {
      console.error('❌ Erreur chargement détail tentative:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de la tentative');
      throw err;
    }
  };

  // 🔥 Fetch single question by index (progressive loading)
  const fetchQuestionByIndex = async (examId: number, index: number) => {
    try {
      setError(null);
      const data = await mockExamService.getMockExamQuestionByIndex(examId, index);
      return data;
    } catch (err: any) {
      console.error('❌ Erreur chargement question:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de la question');
      throw err;
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    exams,
    currentExam,
    nextExam,
    examHistory,
    isLoading,
    error,
    fetchAll,
    fetchById,
    fetchNextExam,
    fetchExamHistory,
    fetchAttemptDetail,
    fetchQuestionByIndex,
    submitExam,
    createExam,
    updateExam,
    deleteExam,
  };
};
