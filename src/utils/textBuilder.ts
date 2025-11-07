/**
 * Fonction utilitaire pour construire le texte à lire pour une question
 * Utilisée par le frontend pour construire le texte identique à celui du backend
 */

/**
 * Construit le texte à lire pour une question (question + options)
 * @param questionData - Les données de la question
 * @returns Le texte formaté pour la synthèse vocale
 */
export function buildQuestionText(questionData: any): string {
  let text = `${questionData.question_text}. `;
  
  // Ajouter les options si c'est un QCM
  if (questionData.question_type === 'multiple_choice') {
    if (questionData.option_a) text += `Option A : ${questionData.option_a}. `;
    if (questionData.option_b) text += `Option B : ${questionData.option_b}. `;
    if (questionData.option_c) text += `Option C : ${questionData.option_c}. `;
    if (questionData.option_d) text += `Option D : ${questionData.option_d}. `;
  }
  
  return text.trim();
}
