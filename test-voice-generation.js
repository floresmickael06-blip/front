import { generateVoice } from './src/services/voice.service';

// Test simple
const testData = {
  question_text: "Quelle est la capitale de la France ?",
  question_type: "multiple_choice",
  option_a: "Paris",
  option_b: "Londres",
  option_c: "Berlin",
  option_d: "Madrid"
};

console.log('🧪 Test de génération de voix...');
console.log('📝 Données de test:', testData);

generateVoice(999, testData)
  .then(result => {
    console.log('✅ Succès !', result);
  })
  .catch(error => {
    console.error('❌ Erreur:', error);
  });
