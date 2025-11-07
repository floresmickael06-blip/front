import { useState } from 'react';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface QuestionImageProps {
  imageUrl?: string | null;
  alt?: string;
  className?: string;
}

/**
 * Composant pour afficher les images des questions de quiz
 * - Gère les cas où imageUrl est null/undefined
 * - Affiche un fallback en cas d'erreur de chargement
 * - Supporte le lazy loading et est responsive
 */
export function QuestionImage({ imageUrl, alt = "Image de la question", className = "" }: QuestionImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Si pas d'image URL, ne rien afficher
  if (!imageUrl) {
    return null;
  }

  // Transformer le chemin relatif en chemin absolu
  // En développement : "images/..." devient "/images/..."
  // En production : "images/..." devient "/app-bateau-client/images/..."
  let fullImageUrl = imageUrl;
  
  if (imageUrl.startsWith('images/')) {
    if (import.meta.env.DEV) {
      fullImageUrl = `/${imageUrl}`;
    } else {
      // En production sur https://iam-mickael.me/app-bateau-client/
      fullImageUrl = `/app-bateau-client/${imageUrl}`;
    }
  } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
    // Autres chemins relatifs
    fullImageUrl = `/${imageUrl}`;
  }

  // Si l'image a échoué à charger, afficher le fallback
  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-8 ${className}`}>
        <div className="text-center text-slate-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Image non disponible</p>
          <p className="text-xs text-slate-400 mt-1">{fullImageUrl}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Skeleton loader pendant le chargement */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse rounded-lg flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-slate-400" />
        </div>
      )}

      {/* Image avec lazy loading */}
      <img
        src={fullImageUrl}
        alt={alt}
        loading="lazy"
        className={`w-full h-auto max-w-full rounded-lg shadow-sm border border-slate-200 transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
        style={{
          maxHeight: '400px',
          objectFit: 'contain'
        }}
      />

      {/* Overlay d'erreur si nécessaire (fallback supplémentaire) */}
      {imageError && (
        <div className="absolute inset-0 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Erreur de chargement</p>
            <p className="text-xs text-red-500 mt-1">{imageUrl}</p>
          </div>
        </div>
      )}
    </div>
  );
}