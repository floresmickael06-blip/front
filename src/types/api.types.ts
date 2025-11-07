// ============= Types de réponses API =============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  error?: string; // Code d'erreur (ex: 'ACCOUNT_EXPIRED')
}

// ============= Authentication =============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  password: string;
  role: 'admin' | 'student';
  firstLogin: boolean | number;
  // 🔥 NOUVEAUX CHAMPS pour la gestion d'activation
  activation_start_date?: string | null;
  activation_end_date?: string | null;
  is_active?: boolean;
}

/**
 * 🔥 Profil étudiant complet avec statistiques
 * GET /api/users/me/statistics
 */
export interface StudentProfile {
  user: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'student';
    is_active: number | boolean;
    days_remaining: number;
  };
  themeProgress: Array<{
    theme_id: number;
    theme_name: string;
    completed_questions: number;
    total_questions: number;
    progress_percentage: number | string | null; // Peut être string ou null depuis l'API
    score: number | string; // Peut être string depuis l'API
  }>;
  mockExamStats: {
    total_attempts: number;
    best_score: number;
    average_score: number | string; // Peut être string depuis l'API
  };
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password?: string;
  role?: 'student';
  // 🔥 NOUVEAUX CHAMPS pour l'activation
  activation_start_date?: string; // ISO date string
  activation_weeks?: number; // Nombre de semaines d'activation
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  password?: string;
  role?: 'student' | 'admin';
  // 🔥 Gestion de l'activation
  activation_start_date?: string;
  activation_weeks?: number;
  is_active?: boolean;
}

// ============= User Management (Admin) =============

/**
 * 🔥 Étudiant avec informations d'activation
 * GET /api/users/students
 */
export interface UserStudent {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  activation_start_date: string | null;
  activation_end_date: string | null;
  days_remaining: number | null;
}

/**
 * 🔥 Progression d'un étudiant sur un thème
 * GET /api/users/:userId/progress/themes
 */
export interface UserThemeProgress {
  theme_id: number;
  theme_name: string;
  completed_questions: number;
  total_questions: number;
  progress_percentage: number;
  score: number;
}

/**
 * 🔥 Statistiques des examens blancs d'un étudiant
 * GET /api/users/:userId/progress/mock-exams
 */
export interface UserMockExamStats {
  total_attempts: number;
  best_score: number;
  average_score: number;
  exams: Array<{
    exam_id: number;
    exam_name: string;
    score: number;
    passed: boolean;
    completed_at: string;
  }>;
}

/**
 * 🔥 Statistiques complètes d'un étudiant
 * GET /api/users/:userId/statistics
 */
export interface UserStatistics {
  user: {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    days_remaining: number | null;
  };
  themeProgress: UserThemeProgress[];
  mockExamStats: UserMockExamStats;
}

// ============= Themes =============

/**
 * 🔥 Thème selon la BDD réelle
 * Table: themes avec colonnes (id, title, description, icon, color, display_order)
 */
export interface Theme {
  id: number;
  title: string; // 🔥 CORRECTION: La BDD utilise 'title' pas 'name'
  description?: string;
  icon?: string; // Nom d'icône Lucide React
  color?: string; // Couleur pour l'UI
  display_order?: number; // Ordre d'affichage
  question_count?: number; // Nombre de questions (calculé)
  // 🔥 NOUVEAUX CHAMPS pour la progression (optionnels)
  total_questions?: number; // Nombre total de questions du thème
  answered_questions?: number; // Nombre de questions répondues par l'utilisateur
  progress_percentage?: number; // Pourcentage de progression (0-100)
  created_at?: string;
  updated_at?: string;
}

/**
 * Requête pour créer un thème (admin uniquement)
 * POST /api/themes
 */
export interface CreateThemeRequest {
  title: string; // 🔥 CORRECTION: 'title' pas 'name'
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
}

/**
 * Requête pour mettre à jour un thème (admin uniquement)
 * PUT /api/themes/:id
 */
export interface UpdateThemeRequest extends Partial<CreateThemeRequest> {}

// ============= DEPRECATED - Gardé pour compatibilité temporaire =============
// Ces types seront supprimés une fois la migration terminée

/** @deprecated Utiliser Theme à la place */
export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

/** @deprecated Les quiz n'existent plus dans la nouvelle structure */
export interface Quiz {
  id: number;
  category_id: number;
  title: string;
  description: string;
  themes?: QuizTheme[];
}

/** @deprecated Utiliser Theme à la place */
export interface QuizTheme {
  id: number;
  quiz_id?: number;
  name: string;
  title?: string;
}

/** @deprecated */
export interface QuizWithThemes extends Quiz {
  themes: QuizTheme[];
}

/** @deprecated */
export interface CreateQuizRequest {
  category_id: number;
  title: string;
  description: string;
}

/** @deprecated */
export interface UpdateQuizRequest extends Partial<CreateQuizRequest> {}

/** @deprecated */
export interface CreateCategoryRequest {
  name: string;
  description: string;
  image_url?: string;
}

/** @deprecated */
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// ============= Questions (liées directement aux Themes) =============

/**
 * 🔥 Question selon l'API réelle
 * GET /api/themes/:id/questions retourne les questions du thème
 * Pour les étudiants : correct_answer et explanation sont masqués
 * Pour les admins : toutes les informations sont incluses
 */
export interface Question {
  id: number;
  theme_id: number; // 🔥 Lié directement au thème
  question_text: string;
  image_url?: string | null; // Chemin vers l'image de la question (ex: "images/1_Cardinale Est, Danger-1.png")
  voice_url?: string | null; // Chemin vers le fichier audio (ex: "audio/question_1.mp3")
  subcategory?: string | null; // Sous-catégorie (ex: "Cardinales Danger", "Cardinales Passage")
  question_type: 'multiple_choice' | 'true_false';
  options?: string[]; // ['A', 'B', 'C', 'D'] - format retourné pour les étudiants
  // Ou format détaillé :
  option_a?: string;
  option_b?: string;
  option_c?: string | null;
  option_d?: string | null;
  correct_answer?: string; // 'A', 'B', 'C', 'D' - masqué pour les étudiants
  explanation?: string | null; // Masqué pour les étudiants
  difficulty?: 'easy' | 'medium' | 'hard';
  created_at?: string;
  updated_at?: string;
}

/**
 * Requête pour créer une question (admin uniquement)
 * POST /api/themes/:themeId/questions ou POST /api/questions
 * 🔥 Format BDD: option_a, option_b, option_c, option_d (pas options:[])
 */
export interface CreateQuestionRequest {
  theme_id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string; // 'A', 'B', 'C', 'D' pour QCM
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Requête pour mettre à jour une question (admin uniquement)
 * PUT /api/questions/:id
 */
export interface UpdateQuestionRequest {
  question_text?: string;
  question_type?: 'multiple_choice' | 'true_false';
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Requête pour valider une réponse
 * POST /api/questions/:id/validate (si disponible)
 * Ou géré via POST /api/progress/theme
 */
export interface ValidateAnswerRequest {
  user_answer: string; // 'A', 'B', 'C', 'D', 'true', 'false'
}

export interface ValidateAnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
}

// ============= DEPRECATED - Ancienne structure =============

/** @deprecated Les Answer séparées n'existent plus, tout est dans Question */
export interface Answer {
  id: number;
  question_id: number;
  text: string;
  is_correct: number;
}

/** @deprecated Utiliser CreateQuestionRequest à la place */
export interface CreateAnswerRequest {
  text: string;
  is_correct: boolean;
}

// ============= Mock Exams =============

/**
 * 🔥 Examen blanc selon la BDD réelle
 * Table: mock_exams avec colonnes (id, title, description, duration_minutes, passing_score, total_questions, is_active)
 */
export interface MockExam {
  id: number;
  title: string; // 🔥 CORRECTION: La BDD utilise 'title' pas 'name'
  description?: string;
  duration_minutes: number; // Durée en minutes
  passing_score: number; // Score de passage (sur total_questions)
  total_questions?: number; // Nombre total de questions (défaut 40)
  is_active?: boolean; // Examen actif ou non
  question_count?: number; // Alias pour total_questions (pour compatibilité)
  created_at?: string;
  updated_at?: string;
}

/**
 * 🔥 Question d'examen avec informations supplémentaires
 * Retournée par GET /api/mock-exams/:id/questions
 * Inclut le theme_name et question_order
 */
export interface MockExamQuestion extends Question {
  theme_name: string; // Nom du thème (inclus dans la réponse API)
  question_order: number; // Ordre de la question dans l'examen
}

/**
 * 🔥 Examen blanc avec ses questions
 * GET /api/mock-exams/:id/questions retourne l'examen complet
 * Les réponses correctes sont masquées pour les étudiants
 */
export interface MockExamWithQuestions extends MockExam {
  questions: MockExamQuestion[]; // Questions avec theme_name et order
  question_count: number; // Nombre total de questions
}

/**
 * Requête pour soumettre un examen blanc
 * POST /api/mock-exams/:id/submit
 */
export interface SubmitMockExamRequest {
  answers: Record<string, string>; // { "1": "A", "2": "B", "3": "C", ... }
}

/**
 * Réponse après soumission d'un examen blanc
 * POST /api/mock-exams/:id/submit
 */
export interface SubmitMockExamResponse {
  score: number; // Score obtenu
  passed: boolean; // Si l'examen est réussi
  correct_answers: number; // Nombre de réponses correctes
  total_questions: number; // Nombre total de questions
  results?: Array<{
    question_id: number;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }>;
}

/**
 * Requête pour créer un examen blanc (admin)
 * POST /api/mock-exams
 */
export interface CreateMockExamRequest {
  title: string; // 🔥 CORRECTION: 'title' pas 'name'
  description?: string;
  duration_minutes: number;
  passing_score: number;
  total_questions?: number; // Défaut 40
}

/**
 * Requête pour mettre à jour un examen blanc (admin)
 * PUT /api/mock-exams/:id
 */
export interface UpdateMockExamRequest extends Partial<CreateMockExamRequest> {}

/**
 * 🔥 Requête pour ajouter UNE question à un examen
 * POST /api/mock-exams/questions
 */
export interface AddQuestionToExamRequest {
  mock_exam_id: number;
  question_id: number;
  question_order?: number; // Optionnel, ajouté à la fin si omis
}

/**
 * 🔥 Requête pour ajouter PLUSIEURS questions à un examen (batch)
 * POST /api/mock-exams/questions/batch
 */
export interface BatchAddQuestionsRequest {
  mock_exam_id: number;
  question_ids: number[]; // Tableau d'IDs de questions
}

/**
 * 🔥 Réponse après ajout batch de questions
 */
export interface BatchAddQuestionsResponse {
  success: boolean;
  message: string;
  data: {
    added: Array<{
      question_id: number;
      question_order: number;
    }>;
    errors?: Array<{
      question_id: number;
      error: string;
    }>;
  };
}

// ============= DEPRECATED - Anciens types Mock Exam =============

/** @deprecated Utiliser Question à la place */
export interface MockExamQuestionDetail {
  id: number;
  text: string;
  image_url: string | null;
  theme_name: string;
  quiz_title: string;
  category_name: string;
  exam_question_id: number;
  answers: Array<{
    id: number;
    text: string;
    is_correct: number;
  }>;
}

export interface MockExamQuestionsResponse {
  mock_exam: {
    id: number;
    title: string;
  };
  questions: MockExamQuestionDetail[];
  question_count: number;
}

/** @deprecated Utiliser CreateMockExamRequest (nouvelle version avec 'name') */
export interface OldCreateMockExamRequest {
  title: string;
  duration_minutes: number;
  passing_score: number;
}

/** @deprecated */
export interface OldUpdateMockExamRequest extends Partial<OldCreateMockExamRequest> {}

/** @deprecated */
export interface AddQuestionToExamRequest {
  mock_exam_id: number;
  question_id: number;
}

// ============= Progress (Progression utilisateur) =============

/**
 * 🔥 Progression par thème selon l'API
 * GET /api/progress/themes/:userId retourne la progression de l'utilisateur
 */
export interface ThemeProgress {
  theme_id: number;
  theme_name: string;
  completed_questions: number;
  total_questions: number;
  score: number; // Pourcentage de bonnes réponses
  progress_percentage: number; // Pourcentage de questions complétées
}

/**
 * 🔥 Progression des examens blancs
 * GET /api/progress/mock-exams/:userId
 */
export interface MockExamProgress {
  exam_id: number;
  exam_name: string;
  score: number;
  passed: boolean;
  completed_at: string;
  attempts_count: number;
}

/**
 * 🔥 Historique des tentatives d'examens
 * GET /api/progress/exam-history
 */
export interface ExamAttempt {
  attempt_id: number;
  exam_id: number;
  exam_name: string;
  score: number;
  passed: boolean;
  time_spent_minutes: number | null;
  completed_at: string;
}

/**
 * 🔥 Question avec correction pour une tentative
 * Retournée par GET /api/progress/exam-attempt/:attemptId
 */
export interface QuestionWithCorrection {
  id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string;
  correct_answer_text: string | null; // 🔥 Intitulé de la bonne réponse
  user_answer: string | null;
  user_answer_text: string | null; // 🔥 Intitulé de la réponse utilisateur
  is_correct: boolean;
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  theme_name: string;
  question_order: number;
  image_url?: string | null;
  voice_url?: string | null;
}

/**
 * 🔥 Détail d'une tentative d'examen avec correction
 * GET /api/progress/exam-attempt/:attemptId
 */
export interface ExamAttemptDetail {
  attempt: {
    attempt_id: number;
    exam_id: number;
    exam_name: string;
    duration_minutes: number;
    passing_score: number;
    score: number;
    passed: boolean;
    time_spent_minutes: number | null;
    completed_at: string;
  };
  questions: QuestionWithCorrection[];
}

/**
 * 🔥 Statistiques globales de progression
 * GET /api/progress/stats/:userId
 */
export interface ProgressStats {
  total_themes: number;
  completed_themes: number;
  average_score: number;
  total_mock_exams: number;
  passed_mock_exams: number;
  recent_activity: Array<{
    type: 'theme' | 'mock_exam';
    name: string;
    score: number;
    date: string;
  }>;
}

/**
 * 🔥 Requête pour enregistrer la progression d'un thème
 * POST /api/progress/theme
 * Note: user_id est extrait du JWT, pas besoin de le passer
 * 
 * Le backend attend le TOTAL des questions répondues et bonnes réponses,
 * pas question par question.
 */
export interface SubmitAnswerRequest {
  theme_id: number;
  questions_answered: number; // Nombre total de questions répondues
  correct_answers: number;    // Nombre total de bonnes réponses
  is_correct?: boolean;       // Optionnel (legacy)
}

/**
 * Réponse après soumission d'une réponse
 * POST /api/progress/theme
 */
export interface SubmitAnswerResponse {
  success: boolean;
  score_updated: boolean;
  progress: ThemeProgress;
}

// ============= DEPRECATED - Anciens types Progress =============

/** @deprecated Utiliser ThemeProgress (nouvelle API) */
export interface OldThemeProgress {
  id: number;
  user_id?: number;
  theme_id: number;
  theme_title?: string;
  questions_answered: number;
  correct_answers: number;
  total_questions: number;
  percentage?: number;
  accuracy?: number;
  last_activity: string;
  created_at?: string;
}

/** @deprecated */
export interface UpdateThemeProgressRequest {
  is_correct: boolean;
}

/** @deprecated Utiliser MockExamProgress (nouvelle API) */
export interface OldMockExamProgress {
  id: number;
  user_id?: number;
  mock_exam_id: number;
  score: number;
  passed: boolean;
  time_spent_minutes?: number;
  completed_at: string;
  email?: string; // Présent pour admin
  exam_title?: string; // Inclus avec JOIN
}

export interface SaveExamProgressRequest {
  mock_exam_id: number;
  score: number;
  time_spent_minutes?: number;
  answers?: Record<number, string>; // 🔥 Objet { questionId: userAnswer } ex: { 1: "A", 2: "B,C", 3: "D" }
}

// ============= DEPRECATED =============

/** @deprecated Utiliser ThemeProgress ou MockExamProgress */
export interface Progress {
  id: number;
  user_id?: number;
  quiz_theme_id: number | null;
  mock_exam_id: number | null;
  score: number;
  completed_at: string;
  email?: string;
  theme_name: string | null;
  exam_title: string | null;
}

/** @deprecated */
export interface ProgressStats {
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  percentage: number;
}

/** @deprecated Utiliser SaveExamProgressRequest */
export interface SaveQuizProgressRequest {
  quiz_theme_id: number;
  score: number;
}