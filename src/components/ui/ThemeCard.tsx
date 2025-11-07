import React from 'react';
import * as LucideIcons from 'lucide-react';
import './ThemeCard.css';

interface ThemeCardProps {
  title: string;
  icon?: string; // Nom de l'icône Lucide React (ex: 'Anchor', 'Lightbulb')
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
  progress?: number; // 0-100
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ 
  title, 
  icon,
  imageUrl,
  onClick,
  className = '',
  progress = 0
}) => {
  // 🔥 Récupérer dynamiquement l'icône Lucide React
  const getLucideIcon = (iconName?: string) => {
    if (!iconName) return null;
    
    // Récupérer le composant d'icône depuis lucide-react
    const IconComponent = (LucideIcons as any)[iconName];
    
    if (IconComponent) {
      return <IconComponent size={40} strokeWidth={1.5} />;
    }
    
    return null;
  };

  const LucideIcon = icon ? getLucideIcon(icon) : null;

  return (
    <div className={`theme-card ${className}`} onClick={onClick}>
      <div className="theme-card-icon-container">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="theme-card-image" />
        ) : LucideIcon ? (
          <div className="theme-card-lucide-icon">{LucideIcon}</div>
        ) : (
          <span className="theme-card-icon">📚</span>
        )}
      </div>
      <div className="theme-card-title">{title}</div>
      
      {/* Barre de progression */}
      {progress > 0 && (
        <div className="theme-card-progress">
          <div className="theme-progress-track">
            <div 
              className="theme-progress-filled" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="theme-progress-label">{progress}%</span>
        </div>
      )}
    </div>
  );
};
