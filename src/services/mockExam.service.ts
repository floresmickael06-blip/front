import api from '../config/api.config';
import type { 
  MockExam,
  MockExamWithQuestions,
  CreateMockExamRequest,
  UpdateMockExamRequest,
  SubmitMockExamRequest,
  SubmitMockExamResponse,
  AddQuestionToExamRequest,
  BatchAddQuestionsRequest,
  BatchAddQuestionsResponse,
  ExamAttempt,
  ExamAttemptDetail
} from '../types/api.types';

/**
 * 🔥 Service pour gérer les examens blancs selon l'API réelle
 * Base URL: /api/mock-exams
 */

// ============= Examens blancs =============

/**
 * GET /api/mock-exams
 * Récupère tous les examens blancs disponibles
 * L'API retourne: { success: true, data: MockExam[] }
 */
export const getAllMockExams = async (): Promise<MockExam[]> => {
  const response = await api.get('/mock-exams');
  return response.data.data || response.data;
};

/**
 * GET /api/mock-exams/:id
 * Récupère un examen blanc avec ses détails (sans les questions)
 * L'API retourne: { success: true, data: MockExam }
 */
export const getMockExamById = async (id: number): Promise<MockExam> => {
  const response = await api.get(`/mock-exams/${id}`);
  return response.data.data || response.data;
};

/**
 * GET /api/mock-exams/:id/questions
 * Récupère les questions d'un examen blanc avec leurs informations complètes
 * Format retourné: { mock_exam: {...}, questions: [...], question_count: number }
 * Les réponses correctes sont masquées pour les étudiants
 * L'API retourne: { success: true, data: { mock_exam, questions, question_count } }
 * 
 * 🎵 Enrichi avec les données médias de chaque question
 */
export const getMockExamQuestions = async (id: number): Promise<MockExamWithQuestions> => {
  const response = await api.get(`/mock-exams/${id}/questions`);
  const apiData = response.data.data || response.data;
  
  // L'API retourne { mock_exam: {...}, questions: [...], question_count: X }
  // Enrichir chaque question avec ses données médias
  const questionsWithMedia = await Promise.all(
    apiData.questions.map(async (question: any) => {
      try {
        // Récupérer les données complètes de la question (incluant image_url et voice_url)
        const fullQuestion = await api.get(`/questions/${question.id}`);
        return {
          ...question,
          image_url: fullQuestion.data.data?.image_url || null,
          voice_url: fullQuestion.data.data?.voice_url || null,
          subcategory: fullQuestion.data.data?.subcategory || null
        };
      } catch (err) {
        console.warn(`⚠️ Impossible de charger les médias pour la question ${question.id}`);
        return question; // Retourner la question sans médias si erreur
      }
    })
  );
  
  // On transforme pour correspondre à MockExamWithQuestions
  return {
    ...apiData.mock_exam,
    questions: questionsWithMedia,
    question_count: apiData.question_count
  };
};

/**
 * 🔥 GET /api/mock-exams/:id/questions/:index
 * Récupère UNE question d'un examen blanc par son index (chargement progressif)
 * Retourne la question avec TOUS ses médias (image_url, voice_url) déjà inclus
 * L'API retourne: { success: true, data: { mock_exam, question, question_index, total_questions } }
 */
export const getMockExamQuestionByIndex = async (examId: number, index: number): Promise<{
  mock_exam: MockExam;
  question: any;
  question_index: number;
  total_questions: number;
}> => {
  const response = await api.get(`/mock-exams/${examId}/questions/${index}`);
  return response.data.data || response.data;
};

/**
 * POST /api/mock-exams/:id/submit
 * Soumet les réponses d'un examen blanc
 * Note: Cette route n'existe pas selon la doc - utiliser POST /api/progress/exam
 */
export const submitMockExam = async (
  id: number, 
  answers: SubmitMockExamRequest
): Promise<SubmitMockExamResponse> => {
  // 🔥 ATTENTION: Utiliser POST /api/progress/exam à la place
  const response = await api.post(`/progress/exam`, { exam_id: id, ...answers });
  return response.data;
};

/**
 * POST /api/mock-exams
 * Crée un nouvel examen blanc (admin uniquement)
 * L'API retourne: { success: true, data: MockExam }
 */
export const createMockExam = async (data: CreateMockExamRequest): Promise<MockExam> => {
  const response = await api.post('/mock-exams', data);
  return response.data.data || response.data;
};

/**
 * PUT /api/mock-exams/:id
 * Met à jour un examen blanc (admin uniquement)
 * L'API retourne: { success: true, data: MockExam }
 */
export const updateMockExam = async (id: number, data: UpdateMockExamRequest): Promise<MockExam> => {
  const response = await api.put(`/mock-exams/${id}`, data);
  return response.data.data || response.data;
};

/**
 * DELETE /api/mock-exams/:id
 * Supprime un examen blanc (admin uniquement)
 */
export const deleteMockExam = async (id: number): Promise<void> => {
  await api.delete(`/mock-exams/${id}`);
};

/**
 * POST /api/mock-exams/questions
 * Ajoute une question à un examen blanc (admin uniquement)
 * Body: { mock_exam_id, question_id, question_order? }
 */
export const addQuestionToExam = async (data: AddQuestionToExamRequest): Promise<void> => {
  await api.post('/mock-exams/questions', data);
};

/**
 * 🔥 POST /api/mock-exams/questions/batch
 * Ajoute plusieurs questions à un examen blanc en une fois (admin uniquement)
 * Body: { mock_exam_id, question_ids: number[] }
 * Retourne: { success, message, data: { added: [...], errors?: [...] } }
 */
export const addQuestionsToExamBatch = async (data: BatchAddQuestionsRequest): Promise<BatchAddQuestionsResponse> => {
  const response = await api.post('/mock-exams/questions/batch', data);
  return response.data;
};

/**
 * DELETE /api/mock-exams/:mockExamId/questions/:questionId
 * Retire une question d'un examen blanc (admin uniquement)
 */
export const removeQuestionFromExam = async (mockExamId: number, questionId: number): Promise<void> => {
  await api.delete(`/mock-exams/${mockExamId}/questions/${questionId}`);
};

/**
 * 🔥 Helper pour supprimer toutes les questions d'un examen
 * Utile avant de réassigner de nouvelles questions
 */
export const removeAllQuestionsFromExam = async (mockExamId: number, questionIds: number[]): Promise<void> => {
  await Promise.all(
    questionIds.map(questionId => removeQuestionFromExam(mockExamId, questionId))
  );
};

/**
 * 🔥 GET /api/mock-exams/next
 * Récupère le prochain examen blanc à faire
 * Retourne le premier examen non fait, ou le premier si tous ont été faits
 */
export const getNextMockExam = async (): Promise<MockExam> => {
  const response = await api.get('/mock-exams/next');
  return response.data.data || response.data;
};

/**
 * 🔥 GET /api/progress/exam-history
 * Récupère l'historique des tentatives d'examens de l'utilisateur connecté
 */
export const getExamHistory = async (): Promise<ExamAttempt[]> => {
  const response = await api.get('/progress/exam-history');
  return response.data.data || response.data;
};

/**
 * 🔥 GET /api/progress/exam-attempt/:attemptId
 * Récupère le détail d'une tentative d'examen avec la correction
 */
export const getExamAttemptDetail = async (attemptId: number): Promise<ExamAttemptDetail> => {
  const response = await api.get(`/progress/exam-attempt/${attemptId}`);
  return response.data.data || response.data;
};

export default {
  getAllMockExams,
  getMockExamById,
  getMockExamQuestions,
  getMockExamQuestionByIndex,
  submitMockExam,
  createMockExam,
  updateMockExam,
  deleteMockExam,
  addQuestionToExam,
  addQuestionsToExamBatch,
  removeQuestionFromExam,
  removeAllQuestionsFromExam,
  getNextMockExam,
  getExamHistory,
  getExamAttemptDetail,
};
