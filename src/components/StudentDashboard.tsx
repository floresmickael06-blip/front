import { useState, useEffect } from 'react';
import { Home, User as UserIcon, LogOut } from 'lucide-react';
import type { User } from '../types';
import type { Theme } from '../types/api.types';
import { useThemes, useMockExams, useProgress } from '../hooks';
import { useIsMobile } from '../hooks/useIsMobile';
import { ThemeQuizView } from './ThemeQuizView';
import { MockExamView } from './MockExamView';
import { StudentProfile } from './StudentProfile';
import { ThemeCard } from './ui/ThemeCard';
//import { ProgressBar } from './ui/ProgressBar';
import './StudentDashboard.css';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

type DashboardView = 'dashboard' | 'quiz' | 'mockExam' | 'profile';

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedMockExamId, setSelectedMockExamId] = useState<number | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  
  // 🖥️ Détecter si on est sur mobile ou desktop
  const isMobile = useIsMobile();
  
  const { themes, isLoading: themesLoading, error: themesError, refresh: refreshThemes } = useThemes(true); // 🔥 Avec progression
  const { 
    nextExam, 
    examHistory, 
    isLoading: examsLoading, 
    error: examsError,
    fetchNextExam,
    fetchExamHistory
  } = useMockExams();
  const { 
    isLoading: progressLoading, 
    error: progressError,
    refresh: refreshProgress,
    fetchStats
  } = useProgress();

  // 🔥 Charger l'examen suivant et l'historique au montage
  useEffect(() => {
    fetchNextExam();
    fetchExamHistory();
  }, []);

  const handleThemeClick = (theme: Theme) => {
    setSelectedTheme(theme);
    setCurrentView('quiz');
  };

  const handleMockExamClick = (examId: number) => {
    setSelectedMockExamId(examId);
    setSelectedAttemptId(null); // Nouveau examen, pas une correction
    setCurrentView('mockExam');
  };

  const handleAttemptClick = (attemptId: number, examId: number) => {
    setSelectedMockExamId(examId);
    setSelectedAttemptId(attemptId); // Mode correction
    setCurrentView('mockExam');
  };

  const handleLaunchNextExam = () => {
    if (nextExam) {
      handleMockExamClick(nextExam.id);
    }
  };

  const handleBack = async () => {
    if (currentView === 'quiz') {
      setCurrentView('dashboard');
      setSelectedTheme(null);
      // 🔄 Rafraîchir les données comme lors de la connexion
      console.log('🔄 Retour au dashboard - Rechargement des données...');
      await Promise.all([
        refreshThemes(), 
        refreshProgress(), 
        fetchStats(),
        fetchNextExam(),
        fetchExamHistory()
      ]);
      console.log('✅ Données rechargées');
    } else if (currentView === 'mockExam') {
      setCurrentView('dashboard');
      setSelectedMockExamId(null);
      // 🔄 Rafraîchir les données comme lors de la connexion
      console.log('🔄 Retour au dashboard - Rechargement des données...');
      await Promise.all([
        refreshThemes(), 
        refreshProgress(), 
        fetchStats(),
        fetchNextExam(),
        fetchExamHistory()
      ]);
      console.log('✅ Données rechargées');
    } else if (currentView === 'profile') {
      setCurrentView('dashboard');
    }
  };

  const handleQuizComplete = async () => {
    // Rafraîchir les thèmes avec progression ET les stats globales
    console.log('🔄 Rechargement de la progression et des thèmes...');
    await Promise.all([
      refreshThemes(), 
      refreshProgress(), 
      fetchStats(),
      fetchNextExam(), // 🔥 Rafraîchir l'examen suivant
      fetchExamHistory() // 🔥 Rafraîchir l'historique
    ]);
    console.log('✅ Rechargement terminé');
  };

  if (currentView === 'quiz' && selectedTheme) {
    return (
      <ThemeQuizView
        theme={selectedTheme}
        onBack={handleBack}
        onComplete={handleQuizComplete}
      />
    );
  }

  if (currentView === 'mockExam' && selectedMockExamId) {
    return (
      <MockExamView
        examId={selectedMockExamId}
        attemptId={selectedAttemptId} // 🔥 Passer l'ID de tentative pour le mode correction
        onBack={handleBack}
        onComplete={handleQuizComplete}
      />
    );
  }

  if (currentView === 'profile') {
    return (
      <StudentProfile
        onBack={handleBack}
      />
    );
  }

  if (themesLoading || examsLoading || progressLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (themesError || examsError || progressError) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">❌</div>
        <h2>Erreur de chargement</h2>
        <p>{themesError || examsError || progressError || 'Une erreur est survenue.'}</p>
        <button onClick={() => window.location.reload()} className="error-button">
          Recharger la page
        </button>
      </div>
    );
  }

  const userName = user.name || user.email.split('@')[0];

  return (
    <div className={`student-dashboard ${!isMobile ? 'desktop-mode' : ''}`}>
      {/* Header */}
      <div className={`dashboard-header ${!isMobile ? 'desktop-header' : ''}`}>
        <img
          className={`dashboard-logo ${!isMobile ? 'desktop-logo' : ''}`}
          alt="Logo LibertyLoc"
          src="/logo-liberty-loc-1-1.png"
        />
        <h1 className={`dashboard-greeting ${!isMobile ? 'desktop-greeting' : ''}`}>Salut {userName}</h1>
        
        {/* Boutons desktop : Profil + Déconnexion */}
        <div className="flex items-center gap-3">
          {!isMobile && (
            <button 
              className="desktop-profile-button" 
              onClick={() => setCurrentView('profile')}
              title="Mon Profil"
            >
              <UserIcon size={28} color="#006DB5" />
              <span>Mon Profil</span>
            </button>
          )}
          <button className={`logout-button ${!isMobile ? 'desktop-logout' : ''}`} onClick={onLogout} title="Se déconnecter">
            <LogOut size={!isMobile ? 32 : 24} color="#F5F5F5" />
          </button>
        </div>
      </div>

      {/* Section Exercices */}
      <div className={`exercises-section ${!isMobile ? 'desktop-section' : ''}`}>
        <h2 className={`section-title ${!isMobile ? 'desktop-title' : ''}`}>Exercices</h2>
        <div className={`themes-grid ${!isMobile ? 'desktop-grid' : ''}`}>
          {Array.isArray(themes) && themes.map(theme => {
            // 🔥 Utiliser directement progress_percentage du thème
            const progressPercentage = theme.progress_percentage || 0;
            
            return (
              <ThemeCard 
                key={theme.id}
                title={theme.title}
                imageUrl={theme.icon} // 🔥 Utiliser l'URL de l'image stockée dans le champ icon
                onClick={() => handleThemeClick(theme)}
                progress={progressPercentage}
              />
            );
          })}
        </div>
      </div>

      {/* Section Examens blancs */}
      <div className={`mock-exams-section ${!isMobile ? 'desktop-section' : ''}`}>
        <h2 className={`section-title ${!isMobile ? 'desktop-title' : ''}`}>Examens blanc</h2>
        
        {/* Bouton pour lancer le prochain examen */}
        {nextExam && (
          <button 
            className={`launch-exam-button ${!isMobile ? 'desktop-launch-button' : ''}`}
            onClick={handleLaunchNextExam}
          >
            Lancer un examen blanc 
          </button>
        )}

        {/* Liste des tentatives passées */}
        {examHistory && examHistory.length > 0 && (
          <div className={`exam-history ${!isMobile ? 'desktop-history' : ''}`}>
            <h3 className={`history-title ${!isMobile ? 'desktop-subtitle' : ''}`}>Historique des tentatives</h3>
            <div className={`exams-list ${!isMobile ? 'desktop-exams-list' : ''}`}>
              {examHistory.map((attempt) => (
                <div 
                  key={attempt.attempt_id} 
                  className="exam-card"
                  onClick={() => handleAttemptClick(attempt.attempt_id, attempt.exam_id)}
                >
                  <div className="exam-title">{attempt.exam_name}</div>
                  <div className="exam-info">
                    {new Date(attempt.completed_at).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="exam-score">
                    Score : <strong>{attempt.score}/40</strong>
                    {attempt.passed ? ' ✅' : ' ❌'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-navigation">
        <button className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}>
          <Home size={24} />
        </button>
        <button 
          onClick={() => setCurrentView('profile')}
        >
          <UserIcon size={24} />
        </button>
      </div>
    </div>
  );
}
