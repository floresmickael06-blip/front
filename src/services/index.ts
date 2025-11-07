// 🔥 Export centralisé de tous les services selon l'API réelle
export { default as authService } from './auth.service';
export { default as themeService } from './theme.service';
export { default as mockExamService } from './mockExam.service';
export { default as progressService } from './progress.service';
export { default as userService } from './user.service'; // 🔥 Nouveau service pour la gestion des utilisateurs (Admin)

// ❌ Services obsolètes (à supprimer après migration complète)
// export { default as categoryService } from './category.service';
// export { default as quizService } from './quiz.service';
// export { default as questionService } from './question.service';
