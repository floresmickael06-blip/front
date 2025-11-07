import axios from 'axios';
import { buildQuestionText } from '../utils/textBuilder';

/**
 * Génère l'audio pour une question via le backend qui appelle le script PHP
 */
export async function generateVoice(questionId: number, questionData: any): Promise<{
  success: boolean;
  filename: string;
  audioUrl: string;
}> {
  try {
    console.log(`🎙️ [Question ${questionId}] Génération de la voix en cours...`);
    
    // URL de l'API backend Railway
    const apiUrl = 'https://libertyloc-backend-production-2615.up.railway.app/api';
    
    // Construire le texte complet (fonction utilitaire partagée)
    const textToRead = buildQuestionText(questionData);
    
    // Appeler le backend Node.js (qui appelle le PHP)
    const response = await axios.post(
      `${apiUrl}/admin/generate-speech`,
      {
        question_id: questionId,
        text: textToRead
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erreur lors de la génération');
    }
    
    const { fileName, filePath } = response.data;
    
    console.log(`✅ [Question ${questionId}] Fichier généré : ${fileName}`);
    console.log(`✅ [Question ${questionId}] BD mise à jour automatiquement`);
    console.log(`🎉 [Question ${questionId}] Voix générée avec succès !`);
    
    return {
      success: true,
      filename: fileName,
      audioUrl: filePath
    };
  } catch (error: any) {
    console.error(`❌ [Question ${questionId}] Erreur génération voix:`, error);
    throw error;
  }
}

export default {
  generateVoice
};
