// Ré-exporter les types de l'API
export type { User, LoginRequest, LoginResponse } from './api.types';

export type UserRole = 'student' | 'admin';

export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export interface Quiz {
  id: number;
  category_id: number;
  title: string;
  description?: string;
}

export interface QuizTheme {
  id: number;
  quiz_id?: number;
  name: string;
  title?: string;
}

export interface Question {
  id: number;
  quiz_theme_id: number;
  text: string;
  image_url?: string;
  created_by: number;
}

export interface Answer {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
}

export interface MockExam {
  id: number;
  title: string;
  duration_minutes: number;
  passing_score: number;
}

export interface MockExamQuestion {
  id: number;
  mock_exam_id: number;
  question_id: number;
}

export interface StudentProgress {
  id: number;
  user_id: number;
  quiz_theme_id?: number;
  mock_exam_id?: number;
  score: number;
  total_questions: number;
  completed_at: string;
}
