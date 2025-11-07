import type { User, Category, Quiz, QuizTheme, Question, Answer, MockExam, MockExamQuestion, StudentProgress } from '../types';

// 🔥 Données mockées désactivées - utilisation du backend uniquement
// import { initialUsers, initialCategories, ... } from './mockData';

const STORAGE_KEYS = {
  USERS: 'boat_school_users',
  CATEGORIES: 'boat_school_categories',
  QUIZZES: 'boat_school_quizzes',
  QUIZ_THEMES: 'boat_school_quiz_themes',
  QUESTIONS: 'boat_school_questions',
  ANSWERS: 'boat_school_answers',
  MOCK_EXAMS: 'boat_school_mock_exams',
  MOCK_EXAM_QUESTIONS: 'boat_school_mock_exam_questions',
  STUDENT_PROGRESS: 'boat_school_student_progress',
  CURRENT_USER: 'boat_school_current_user'
};

// 🔥 DÉSACTIVÉ - Utilisation du backend uniquement
// Ne plus initialiser le localStorage avec des données mockées
export const initializeStorage = () => {
  console.log('🔥 Mode Backend: localStorage non initialisé avec des données mockées');
  // Les fonctions ci-dessous retourneront des tableaux vides
  // Forçant ainsi l'utilisation des hooks et de l'API backend
};

// Generic CRUD operations
const getItems = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setItems = <T,>(key: string, items: T[]): void => {
  localStorage.setItem(key, JSON.stringify(items));
};

const addItem = <T extends { id: number }>(key: string, item: Omit<T, 'id'>): T => {
  const items = getItems<T>(key);
  const maxId = items.length > 0 ? Math.max(...items.map(i => i.id)) : 0;
  const newItem = { ...item, id: maxId + 1 } as T;
  items.push(newItem);
  setItems(key, items);
  return newItem;
};

const updateItem = <T extends { id: number }>(key: string, id: number, updates: Partial<T>): T | null => {
  const items = getItems<T>(key);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  setItems(key, items);
  return items[index];
};

const deleteItem = <T extends { id: number }>(key: string, id: number): boolean => {
  const items = getItems<T>(key);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  setItems(key, filtered);
  return true;
};

// User operations
export const getUsers = () => getItems<User>(STORAGE_KEYS.USERS);
export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email && u.password === password) || null;
};
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};
export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Category operations
export const getCategories = () => getItems<Category>(STORAGE_KEYS.CATEGORIES);
export const addCategory = (category: Omit<Category, 'id'>) => addItem<Category>(STORAGE_KEYS.CATEGORIES, category);
export const updateCategory = (id: number, updates: Partial<Category>) => updateItem<Category>(STORAGE_KEYS.CATEGORIES, id, updates);
export const deleteCategory = (id: number) => deleteItem<Category>(STORAGE_KEYS.CATEGORIES, id);

// Quiz operations
export const getQuizzes = () => getItems<Quiz>(STORAGE_KEYS.QUIZZES);
export const getQuizzesByCategory = (categoryId: number) => getQuizzes().filter(q => q.category_id === categoryId);
export const addQuiz = (quiz: Omit<Quiz, 'id'>) => addItem<Quiz>(STORAGE_KEYS.QUIZZES, quiz);
export const updateQuiz = (id: number, updates: Partial<Quiz>) => updateItem<Quiz>(STORAGE_KEYS.QUIZZES, id, updates);
export const deleteQuiz = (id: number) => deleteItem<Quiz>(STORAGE_KEYS.QUIZZES, id);

// QuizTheme operations
export const getQuizThemes = () => getItems<QuizTheme>(STORAGE_KEYS.QUIZ_THEMES);
export const getThemesByQuiz = (quizId: number) => getQuizThemes().filter(t => t.quiz_id === quizId);
export const addQuizTheme = (theme: Omit<QuizTheme, 'id'>) => addItem<QuizTheme>(STORAGE_KEYS.QUIZ_THEMES, theme);
export const updateQuizTheme = (id: number, updates: Partial<QuizTheme>) => updateItem<QuizTheme>(STORAGE_KEYS.QUIZ_THEMES, id, updates);
export const deleteQuizTheme = (id: number) => deleteItem<QuizTheme>(STORAGE_KEYS.QUIZ_THEMES, id);

// Question operations
export const getQuestions = () => getItems<Question>(STORAGE_KEYS.QUESTIONS);
export const getQuestionsByTheme = (themeId: number) => getQuestions().filter(q => q.quiz_theme_id === themeId);
export const addQuestion = (question: Omit<Question, 'id'>) => addItem<Question>(STORAGE_KEYS.QUESTIONS, question);
export const updateQuestion = (id: number, updates: Partial<Question>) => updateItem<Question>(STORAGE_KEYS.QUESTIONS, id, updates);
export const deleteQuestion = (id: number) => deleteItem<Question>(STORAGE_KEYS.QUESTIONS, id);

// Answer operations
export const getAnswers = () => getItems<Answer>(STORAGE_KEYS.ANSWERS);
export const getAnswersByQuestion = (questionId: number) => getAnswers().filter(a => a.question_id === questionId);
export const addAnswer = (answer: Omit<Answer, 'id'>) => addItem<Answer>(STORAGE_KEYS.ANSWERS, answer);
export const updateAnswer = (id: number, updates: Partial<Answer>) => updateItem<Answer>(STORAGE_KEYS.ANSWERS, id, updates);
export const deleteAnswer = (id: number) => deleteItem<Answer>(STORAGE_KEYS.ANSWERS, id);

// MockExam operations
export const getMockExams = () => getItems<MockExam>(STORAGE_KEYS.MOCK_EXAMS);
export const addMockExam = (exam: Omit<MockExam, 'id'>) => addItem<MockExam>(STORAGE_KEYS.MOCK_EXAMS, exam);
export const updateMockExam = (id: number, updates: Partial<MockExam>) => updateItem<MockExam>(STORAGE_KEYS.MOCK_EXAMS, id, updates);
export const deleteMockExam = (id: number) => deleteItem<MockExam>(STORAGE_KEYS.MOCK_EXAMS, id);

// MockExamQuestion operations
export const getMockExamQuestions = () => getItems<MockExamQuestion>(STORAGE_KEYS.MOCK_EXAM_QUESTIONS);
export const getQuestionsByMockExam = (examId: number) => getMockExamQuestions().filter(q => q.mock_exam_id === examId);
export const addMockExamQuestion = (meq: Omit<MockExamQuestion, 'id'>) => addItem<MockExamQuestion>(STORAGE_KEYS.MOCK_EXAM_QUESTIONS, meq);
export const deleteMockExamQuestion = (id: number) => deleteItem<MockExamQuestion>(STORAGE_KEYS.MOCK_EXAM_QUESTIONS, id);

// StudentProgress operations
export const getStudentProgress = () => getItems<StudentProgress>(STORAGE_KEYS.STUDENT_PROGRESS);
export const getProgressByUser = (userId: number) => getStudentProgress().filter(p => p.user_id === userId);
export const getProgressByTheme = (userId: number, themeId: number) => 
  getStudentProgress().filter(p => p.user_id === userId && p.quiz_theme_id === themeId);
export const getProgressByMockExam = (userId: number, examId: number) =>
  getStudentProgress().filter(p => p.user_id === userId && p.mock_exam_id === examId);
export const addProgress = (progress: Omit<StudentProgress, 'id'>) => addItem<StudentProgress>(STORAGE_KEYS.STUDENT_PROGRESS, progress);
