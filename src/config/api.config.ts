import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 🔥 Configuration intelligente selon l'environnement
const API_URL = import.meta.env.VITE_API_URL || 'https://libertyloc-backend-production-2615.up.railway.app/api';

console.log('🌐 API URL configurée:', API_URL);
console.log('🔧 Mode:', import.meta.env.DEV ? 'DEVELOPMENT' : 'PRODUCTION');

// Instance axios configurée
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important pour les cookies/sessions
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 secondes
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log pour debug
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError<{ message?: string; success: boolean }>) => {
    console.error('❌ Erreur réponse:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
    });
    
    // Token expiré ou invalide
    if (error.response?.status === 401) {
      console.warn('⚠️ Token invalide - Déconnexion');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Éviter la boucle infinie
      if (!window.location.pathname.includes('/')) {
        window.location.href = '/';
      }
    }
    
    // Retourner l'erreur formatée
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'Une erreur est survenue',
      status: error.response?.status,
      originalError: error,
    });
  }
);

// 🎵 Configuration CDN pour les médias (audio/images)
export const MEDIA_CDN = {
  // CDN pour les fichiers audio
  // Si tu utilises un CDN externe comme Cloudinary, Wasabi, ou autre
  AUDIO_BASE_URL: import.meta.env.VITE_AUDIO_CDN_URL || '',
  
  // Fonction utilitaire pour construire l'URL audio complète
  getAudioUrl: (path: string | null | undefined): string | null => {
    if (!path) return null;
    
    // Si c'est déjà une URL complète (http/https), la retourner telle quelle
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Si un CDN est configuré, l'utiliser
    if (MEDIA_CDN.AUDIO_BASE_URL) {
      return `${MEDIA_CDN.AUDIO_BASE_URL}/${path}`;
    }
    
    // Pour les chemins relatifs (sounds/...), utiliser le chemin de production
    if (path.startsWith('sounds/')) {
      // En développement, la requête est proxyfiée par Vite vers le backend
      if (import.meta.env.DEV) {
        return `/${path}`;
      }
      // En production, utiliser le chemin complet avec base path
      return `https://iam-mickael.me/app-bateau-client/${path}`;
    }
    
    // Sinon, utiliser le chemin relatif (proxy Vite en dev, public en prod)
    return `/${path}`;
  },
};

export default apiClient;