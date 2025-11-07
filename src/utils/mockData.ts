import type { User, Category, Quiz, QuizTheme, Question, Answer, MockExam, MockExamQuestion, StudentProgress } from '../types';

export const initialUsers: User[] = [
  {
    id: 1,
    email: 'etudiant@test.com',
    password: 'etudiant123',
    role: 'student',
    firstLogin : false,
    name: 'Jean Dupont'
  },
  {
    id: 2,
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    firstLogin : false,
    name: 'Marie Martin'
  }
];

export const initialCategories: Category[] = [
  {
    id: 1,
    name: 'Navigation et cartographie',
    description: 'Apprenez les bases de la navigation maritime et la lecture des cartes',
    image_url: 'https://images.unsplash.com/photo-1723988433925-035f8625b5c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXV0aWNhbCUyMG5hdmlnYXRpb24lMjBtYXB8ZW58MXx8fHwxNzYwMDk4MTk1fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 2,
    name: 'Sécurité et réglementation',
    description: 'Règles de sécurité et réglementation maritime',
    image_url: 'https://images.unsplash.com/photo-1655857281598-b5ae749bcea7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJpbmUlMjBzYWZldHklMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzYwMDk4MTk2fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 3,
    name: 'Manœuvres et conduite',
    description: 'Techniques de pilotage et manœuvres du bateau',
    image_url: 'https://images.unsplash.com/photo-1616011919027-b3e07e32ffb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWlsaW5nJTIwYm9hdCUyMG9jZWFufGVufDF8fHx8MTc2MDA5ODE5NXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 4,
    name: 'Météorologie marine',
    description: 'Comprendre et anticiper les conditions météorologiques en mer',
    image_url: 'https://images.unsplash.com/photo-1623015849391-09bad23eb48e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2F0JTIwc2FpbGluZyUyMHN1bnNldHxlbnwxfHx8fDE3NjAwOTgxOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

export const initialQuizzes: Quiz[] = [
  {
    id: 1,
    category_id: 1,
    title: 'Navigation et cartographie',
    description: 'Quiz complet sur la navigation'
  },
  {
    id: 2,
    category_id: 2,
    title: 'Sécurité maritime',
    description: 'Quiz sur les règles de sécurité'
  }
];

export const initialQuizThemes: QuizTheme[] = [
  { id: 1, quiz_id: 1, name: 'Carte maritime' },
  { id: 2, quiz_id: 1, name: 'Balisage' },
  { id: 3, quiz_id: 1, name: 'Marques et feux des bateaux' },
  { id: 4, quiz_id: 1, name: 'Règles de navigation' },
  { id: 5, quiz_id: 2, name: 'Équipements de sécurité' },
  { id: 6, quiz_id: 2, name: 'Procédures d\'urgence' }
];

export const initialQuestions: Question[] = [
  // Carte maritime
  {
    id: 1,
    quiz_theme_id: 1,
    text: 'Quelle est la signification de la couleur bleue sur une carte marine ?',
    created_by: 2
  },
  {
    id: 2,
    quiz_theme_id: 1,
    text: 'Comment s\'appelle la ligne qui relie les points de même profondeur sur une carte marine ?',
    created_by: 2
  },
  {
    id: 3,
    quiz_theme_id: 1,
    text: 'Quelle échelle est généralement utilisée pour les cartes côtières ?',
    created_by: 2
  },
  // Balisage
  {
    id: 4,
    quiz_theme_id: 2,
    text: 'De quelle couleur est une balise tribord dans le système de balisage AISM région A ?',
    created_by: 2
  },
  {
    id: 5,
    quiz_theme_id: 2,
    text: 'Que signifie une bouée avec des bandes horizontales vertes et rouges ?',
    created_by: 2
  },
  {
    id: 6,
    quiz_theme_id: 2,
    text: 'Quelle est la forme d\'une balise de danger isolé ?',
    created_by: 2
  },
  // Marques et feux
  {
    id: 7,
    quiz_theme_id: 3,
    text: 'Combien de feux blancs doit afficher un navire à moteur de moins de 50 mètres la nuit ?',
    created_by: 2
  },
  {
    id: 8,
    quiz_theme_id: 3,
    text: 'De quelle couleur est le feu de côté tribord ?',
    created_by: 2
  },
  {
    id: 9,
    quiz_theme_id: 3,
    text: 'Quelle est la portée lumineuse minimale d\'un feu de mouillage ?',
    created_by: 2
  },
  // Règles de navigation
  {
    id: 10,
    quiz_theme_id: 4,
    text: 'Deux navires se présentent par tribord amure, qui est prioritaire ?',
    created_by: 2
  },
  {
    id: 11,
    quiz_theme_id: 4,
    text: 'Quelle est la vitesse maximale en zone portuaire ?',
    created_by: 2
  },
  {
    id: 12,
    quiz_theme_id: 4,
    text: 'À quelle distance minimum doit-on rester d\'un plongeur signalé par un pavillon Alpha ?',
    created_by: 2
  },
  // Équipements de sécurité
  {
    id: 13,
    quiz_theme_id: 5,
    text: 'Combien de fusées parachutes sont requises en navigation côtière ?',
    created_by: 2
  },
  {
    id: 14,
    quiz_theme_id: 5,
    text: 'Quelle est la durée minimale de validité d\'un radeau de survie ?',
    created_by: 2
  },
  {
    id: 15,
    quiz_theme_id: 5,
    text: 'Quel équipement est obligatoire pour une navigation de jour à moins de 2 milles d\'un abri ?',
    created_by: 2
  },
  // Procédures d'urgence
  {
    id: 16,
    quiz_theme_id: 6,
    text: 'Quel est le signal de détresse radio en VHF ?',
    created_by: 2
  },
  {
    id: 17,
    quiz_theme_id: 6,
    text: 'Sur quel canal VHF doit-on lancer un appel de détresse ?',
    created_by: 2
  },
  {
    id: 18,
    quiz_theme_id: 6,
    text: 'Que signifie le signal MAYDAY ?',
    created_by: 2
  }
];

export const initialAnswers: Answer[] = [
  // Question 1
  { id: 1, question_id: 1, text: 'Eau profonde (plus de 10m)', is_correct: true },
  { id: 2, question_id: 1, text: 'Eau peu profonde', is_correct: false },
  { id: 3, question_id: 1, text: 'Zone interdite', is_correct: false },
  { id: 4, question_id: 1, text: 'Zone de baignade', is_correct: false },
  
  // Question 2
  { id: 5, question_id: 2, text: 'Une isobathe', is_correct: true },
  { id: 6, question_id: 2, text: 'Une isocline', is_correct: false },
  { id: 7, question_id: 2, text: 'Un méridien', is_correct: false },
  { id: 8, question_id: 2, text: 'Un parallèle', is_correct: false },
  
  // Question 3
  { id: 9, question_id: 3, text: '1/50 000', is_correct: true },
  { id: 10, question_id: 3, text: '1/10 000', is_correct: false },
  { id: 11, question_id: 3, text: '1/100 000', is_correct: false },
  { id: 12, question_id: 3, text: '1/5 000', is_correct: false },
  
  // Question 4
  { id: 13, question_id: 4, text: 'Verte', is_correct: true },
  { id: 14, question_id: 4, text: 'Rouge', is_correct: false },
  { id: 15, question_id: 4, text: 'Jaune', is_correct: false },
  { id: 16, question_id: 4, text: 'Blanche', is_correct: false },
  
  // Question 5
  { id: 17, question_id: 5, text: 'Chenal préféré à tribord', is_correct: true },
  { id: 18, question_id: 5, text: 'Danger isolé', is_correct: false },
  { id: 19, question_id: 5, text: 'Eaux saines', is_correct: false },
  { id: 20, question_id: 5, text: 'Zone interdite', is_correct: false },
  
  // Question 6
  { id: 21, question_id: 6, text: 'Deux boules noires superposées', is_correct: true },
  { id: 22, question_id: 6, text: 'Un cône noir', is_correct: false },
  { id: 23, question_id: 6, text: 'Un cylindre rouge', is_correct: false },
  { id: 24, question_id: 6, text: 'Une croix jaune', is_correct: false },
  
  // Question 7
  { id: 25, question_id: 7, text: '2 feux (un feu de tête de mât et un feu de poupe)', is_correct: true },
  { id: 26, question_id: 7, text: '1 feu', is_correct: false },
  { id: 27, question_id: 7, text: '3 feux', is_correct: false },
  { id: 28, question_id: 7, text: '4 feux', is_correct: false },
  
  // Question 8
  { id: 29, question_id: 8, text: 'Vert', is_correct: true },
  { id: 30, question_id: 8, text: 'Rouge', is_correct: false },
  { id: 31, question_id: 8, text: 'Blanc', is_correct: false },
  { id: 32, question_id: 8, text: 'Jaune', is_correct: false },
  
  // Question 9
  { id: 33, question_id: 9, text: '2 milles', is_correct: true },
  { id: 34, question_id: 9, text: '1 mille', is_correct: false },
  { id: 35, question_id: 9, text: '3 milles', is_correct: false },
  { id: 36, question_id: 9, text: '5 milles', is_correct: false },
  
  // Question 10
  { id: 37, question_id: 10, text: 'Le navire sous le vent (au vent le moins fort)', is_correct: true },
  { id: 38, question_id: 10, text: 'Le navire au vent', is_correct: false },
  { id: 39, question_id: 10, text: 'Le plus gros navire', is_correct: false },
  { id: 40, question_id: 10, text: 'Le plus rapide', is_correct: false },
  
  // Question 11
  { id: 41, question_id: 11, text: '5 nœuds', is_correct: true },
  { id: 42, question_id: 11, text: '3 nœuds', is_correct: false },
  { id: 43, question_id: 11, text: '10 nœuds', is_correct: false },
  { id: 44, question_id: 11, text: 'Pas de limite', is_correct: false },
  
  // Question 12
  { id: 45, question_id: 12, text: '100 mètres', is_correct: true },
  { id: 46, question_id: 12, text: '50 mètres', is_correct: false },
  { id: 47, question_id: 12, text: '200 mètres', is_correct: false },
  { id: 48, question_id: 12, text: '25 mètres', is_correct: false },
  
  // Question 13
  { id: 49, question_id: 13, text: '3 fusées parachutes', is_correct: true },
  { id: 50, question_id: 13, text: '2 fusées parachutes', is_correct: false },
  { id: 51, question_id: 13, text: '5 fusées parachutes', is_correct: false },
  { id: 52, question_id: 13, text: '1 fusée parachute', is_correct: false },
  
  // Question 14
  { id: 53, question_id: 14, text: '1 an', is_correct: true },
  { id: 54, question_id: 14, text: '6 mois', is_correct: false },
  { id: 55, question_id: 14, text: '2 ans', is_correct: false },
  { id: 56, question_id: 14, text: '3 ans', is_correct: false },
  
  // Question 15
  { id: 57, question_id: 15, text: 'Un moyen de repérage lumineux', is_correct: true },
  { id: 58, question_id: 15, text: 'Une VHF', is_correct: false },
  { id: 59, question_id: 15, text: 'Des fusées de détresse', is_correct: false },
  { id: 60, question_id: 15, text: 'Un radeau de survie', is_correct: false },
  
  // Question 16
  { id: 61, question_id: 16, text: 'MAYDAY', is_correct: true },
  { id: 62, question_id: 16, text: 'SOS', is_correct: false },
  { id: 63, question_id: 16, text: 'SECURITE', is_correct: false },
  { id: 64, question_id: 16, text: 'PAN PAN', is_correct: false },
  
  // Question 17
  { id: 65, question_id: 17, text: 'Canal 16', is_correct: true },
  { id: 66, question_id: 17, text: 'Canal 9', is_correct: false },
  { id: 67, question_id: 17, text: 'Canal 13', is_correct: false },
  { id: 68, question_id: 17, text: 'Canal 70', is_correct: false },
  
  // Question 18
  { id: 69, question_id: 18, text: 'Détresse immédiate, danger de mort', is_correct: true },
  { id: 70, question_id: 18, text: 'Message de sécurité', is_correct: false },
  { id: 71, question_id: 18, text: 'Message d\'urgence', is_correct: false },
  { id: 72, question_id: 18, text: 'Appel de routine', is_correct: false }
];

export const initialMockExams: MockExam[] = [
  {
    id: 1,
    title: 'Examen blanc #1 - Général',
    duration_minutes: 30,
    passing_score: 35
  },
  {
    id: 2,
    title: 'Examen blanc #2 - Navigation',
    duration_minutes: 30,
    passing_score: 35
  }
];

// Mock exam 1 uses questions 1-18 (all current questions)
export const initialMockExamQuestions: MockExamQuestion[] = [
  ...Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    mock_exam_id: 1,
    question_id: i + 1
  })),
  // Mock exam 2 uses first 12 questions
  ...Array.from({ length: 12 }, (_, i) => ({
    id: i + 19,
    mock_exam_id: 2,
    question_id: i + 1
  }))
];

export const initialStudentProgress: StudentProgress[] = [
  {
    id: 1,
    user_id: 1,
    quiz_theme_id: 1,
    score: 2,
    total_questions: 3,
    completed_at: '2025-10-05T10:30:00'
  },
  {
    id: 2,
    user_id: 1,
    quiz_theme_id: 2,
    score: 3,
    total_questions: 3,
    completed_at: '2025-10-06T14:20:00'
  }
];
