// Export centralisé de tous les hooks
export { useAuth } from '../contexts/AuthContext';
export { useThemes } from './useThemes'; // 🔥 Nouveau hook pour les thèmes
export { useMockExams } from './useMockExams';
export { useProgress } from './useProgress';
export { useUsers } from './useUsers'; // 🔥 Nouveau hook pour la gestion des utilisateurs (Admin)
export { useStudentProfile } from './useStudentProfile'; // 🔥 Nouveau hook pour le profil étudiant
export { useMediaQuestions } from './useMediaQuestions'; // 🎵 Nouveau hook pour les questions avec médias

// 🔥 DEPRECATED - Sera supprimé après migration
export { useQuizzes } from './useQuizzes';
export { useQuestions } from './useQuestions';
// export { useCategoryProgress } from './useCategoryProgress'; // OBSOLETE - désactivé