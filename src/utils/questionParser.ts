/**
 * Parser pour les questions multiples
 * Détecte et structure les questions qui contiennent plusieurs sous-questions
 * Pattern: "Texte principal : Sous-question 1 : (A-B) Sous-question 2 : (C-D)"
 */

export interface ParsedQuestion {
  mainText: string; // Texte principal de la question
  subQuestions: SubQuestion[]; // Liste des sous-questions
}

export interface SubQuestion {
  text: string; // Texte de la sous-question
  options: string[]; // Options concernées (ex: ['A', 'B'])
  startOption: string; // Première option (ex: 'A')
  endOption: string; // Dernière option (ex: 'B')
}

/**
 * Parse une question pour détecter les sous-questions multiples
 * @param questionText Le texte complet de la question
 * @returns L'objet ParsedQuestion avec le texte principal et les sous-questions
 */
export function parseQuestionText(questionText: string): ParsedQuestion {
  // Pattern pour détecter les sous-questions : "Texte : (A-B)" ou "Texte : (C-D)"
  // Regex: capture le texte avant " : (X-Y)" et les lettres X et Y
  const subQuestionPattern = /([^:]+)\s*:\s*\(([A-D])-([A-D])\)/g;
  
  const subQuestions: SubQuestion[] = [];
  let match;
  
  // Extraire toutes les sous-questions
  while ((match = subQuestionPattern.exec(questionText)) !== null) {
    const subQuestionText = match[1].trim();
    const startOption = match[2]; // Ex: 'A'
    const endOption = match[3];   // Ex: 'B'
    
    // Générer la liste des options (A-B -> ['A', 'B'], C-D -> ['C', 'D'])
    const options: string[] = [];
    const startCode = startOption.charCodeAt(0);
    const endCode = endOption.charCodeAt(0);
    
    for (let code = startCode; code <= endCode; code++) {
      options.push(String.fromCharCode(code));
    }
    
    subQuestions.push({
      text: subQuestionText,
      options,
      startOption,
      endOption
    });
  }
  
  // Extraire le texte principal (avant la première sous-question)
  let mainText = questionText;
  
  if (subQuestions.length > 0) {
    // Trouver le début de la première sous-question
    const firstMatch = questionText.match(/([^:]+)\s*:\s*\(([A-D])-([A-D])\)/);
    if (firstMatch) {
      const firstSubQuestionIndex = questionText.indexOf(firstMatch[1]);
      mainText = questionText.substring(0, firstSubQuestionIndex).trim();
      
      // Enlever le ":" final s'il existe
      if (mainText.endsWith(':')) {
        mainText = mainText.slice(0, -1).trim();
      }
    }
  }
  
  return {
    mainText: mainText || questionText,
    subQuestions
  };
}

/**
 * Vérifie si une question contient des sous-questions multiples
 * @param questionText Le texte de la question
 * @returns true si la question contient des sous-questions
 */
export function hasMultipleSubQuestions(questionText: string): boolean {
  const pattern = /\([A-D]-[A-D]\)/g;
  const matches = questionText.match(pattern);
  return matches !== null && matches.length > 0;
}

/**
 * Trouve la sous-question correspondant à une option donnée
 * @param parsed L'objet ParsedQuestion
 * @param option L'option à chercher (ex: 'A', 'B', 'C', 'D')
 * @returns La SubQuestion correspondante ou null
 */
export function findSubQuestionForOption(parsed: ParsedQuestion, option: string): SubQuestion | null {
  return parsed.subQuestions.find(sq => sq.options.includes(option)) || null;
}
