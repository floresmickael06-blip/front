import api from '../config/api.config';

interface UploadImageResponse {
  filename: string;
  imageUrl: string;
  fullUrl: string;
}

/**
 * Service pour gérer l'upload d'images
 */

/**
 * Upload d'une image pour un thème
 * POST /api/themes/upload-image
 */
export const uploadThemeImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/themes/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Upload d'une image pour une question
 * POST /api/questions/upload-image
 */
export const uploadQuestionImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/questions/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

export default {
  uploadThemeImage,
  uploadQuestionImage,
};
