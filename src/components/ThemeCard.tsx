import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  BookOpen, Compass, Shield, Cloud, Book, Anchor, Cog, 
  Target, Zap, Star, LucideIcon, CheckCircle2 
} from 'lucide-react';
import type { Theme, ThemeProgress } from '../types/api.types';

interface ThemeCardProps {
  theme: Theme;
  onClick: (theme: Theme) => void;
  progress?: number; // Pourcentage de progression (optionnel)
  themeProgress?: ThemeProgress; // Données complètes de progression
}

// Mapping des noms d'icônes vers les composants Lucide
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Compass,
  Shield,
  Cloud,
  Book,
  Anchor,
  Cog,
  Target,
  Zap,
  Star,
};

// Mapping des couleurs pour les gradients
const colorGradients: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  red: 'from-red-500 to-red-600',
  sky: 'from-sky-500 to-sky-600',
  indigo: 'from-indigo-500 to-indigo-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  green: 'from-green-500 to-green-600',
  pink: 'from-pink-500 to-pink-600',
  yellow: 'from-yellow-500 to-yellow-600',
  teal: 'from-teal-500 to-teal-600',
};

const colorHovers: Record<string, string> = {
  blue: 'hover:border-blue-300 hover:shadow-blue-100',
  red: 'hover:border-red-300 hover:shadow-red-100',
  sky: 'hover:border-sky-300 hover:shadow-sky-100',
  indigo: 'hover:border-indigo-300 hover:shadow-indigo-100',
  purple: 'hover:border-purple-300 hover:shadow-purple-100',
  orange: 'hover:border-orange-300 hover:shadow-orange-100',
  green: 'hover:border-green-300 hover:shadow-green-100',
  pink: 'hover:border-pink-300 hover:shadow-pink-100',
  yellow: 'hover:border-yellow-300 hover:shadow-yellow-100',
  teal: 'hover:border-teal-300 hover:shadow-teal-100',
};

export function ThemeCard({ theme, onClick, progress, themeProgress }: ThemeCardProps) {
  // 🔥 Gérer les propriétés optionnelles (icon et color peuvent ne pas exister)
  const Icon = (theme.icon && iconMap[theme.icon]) || BookOpen;
  const gradient = (theme.color && colorGradients[theme.color]) || colorGradients.blue;
  const hoverEffect = (theme.color && colorHovers[theme.color]) || colorHovers.blue;

  // 🔥 Convertir en numbers (l'API peut retourner des strings)
  const progressValue = progress || 0;
  const completedQuestions = Number(themeProgress?.completed_questions) || 0;
  const totalQuestions = Number(themeProgress?.total_questions) || 0;
  const scoreValue = Number(themeProgress?.score) || 0;
  const isCompleted = progressValue >= 100;

  // Debug
  console.log('🎯 ThemeCard Debug:', {
    theme: theme.title,
    themeProgress,
    completedQuestions,
    totalQuestions,
    scoreValue,
    progressValue
  });

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg border-slate-200 bg-white ${hoverEffect}`}
      onClick={() => onClick(theme)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-base text-slate-800 line-clamp-2 flex-1">
            {theme.title}
          </CardTitle>
          {isCompleted && (
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription className="text-xs text-slate-600 line-clamp-2 mb-3">
          {theme.description}
        </CardDescription>
        
        {themeProgress ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {completedQuestions}/{totalQuestions} questions
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  isCompleted
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : progressValue >= 50
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {Math.round(progressValue)}%
              </Badge>
            </div>
            <Progress 
              value={progressValue} 
              className={`h-1.5 ${
                isCompleted ? 'bg-green-100' : 'bg-slate-100'
              }`}
            />
            {scoreValue > 0 && (
              <div className="text-xs text-slate-500">
                Score : {Math.round(scoreValue)}% de réussite
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Pas encore commencé
          </div>
        )}
      </CardContent>
    </Card>
  );
}

