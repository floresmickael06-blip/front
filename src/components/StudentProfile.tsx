import { ArrowLeft, Calendar, Clock, TrendingUp, Target, Moon, Sun } from 'lucide-react';
import { useStudentProfile } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import './StudentProfile.css';

interface StudentProfileProps {
  onBack: () => void;
}

export function StudentProfile({ onBack }: StudentProfileProps) {
  const { profile, userDetails, isLoading, error } = useStudentProfile();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Debug logs
  console.log('StudentProfile - isLoading:', isLoading);
  console.log('StudentProfile - error:', error);
  console.log('StudentProfile - profile:', profile);
  console.log('StudentProfile - userDetails:', userDetails);

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error || !profile || !userDetails) {
    return (
      <div className="profile-error">
        <div className="error-icon">❌</div>
        <h2>Erreur de chargement</h2>
        <p>{error || 'Impossible de charger votre profil'}</p>
        <p style={{ fontSize: '12px', marginTop: '10px' }}>
          Debug: profile={profile ? 'OK' : 'NULL'}, userDetails={userDetails ? 'OK' : 'NULL'}
        </p>
        <button onClick={onBack} className="back-button">
          Retour
        </button>
      </div>
    );
  }

  const { user, themeProgress, mockExamStats } = profile;

  // Calculer la progression globale en incluant les thèmes avec progress_percentage null comme 0%
  const globalProgress = themeProgress.length > 0
    ? Math.round(themeProgress.reduce((sum, theme) => {
        // Si progress_percentage est null, on compte 0%
        let progress = 0;
        if (theme.progress_percentage !== null) {
          progress = typeof theme.progress_percentage === 'string' 
            ? parseFloat(theme.progress_percentage) 
            : theme.progress_percentage;
        }
        return sum + progress;
      }, 0) / themeProgress.length)
    : 0;
  
  const themesStarted = themeProgress.filter(t => t.completed_questions > 0).length;

  // Convertir average_score en nombre
  const averageScore = typeof mockExamStats.average_score === 'string' 
    ? parseFloat(mockExamStats.average_score) 
    : mockExamStats.average_score;

  // Formatage des dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Déterminer le statut du compte
  const getAccountStatus = () => {
    if (!user.is_active) return { text: 'Compte inactif', color: 'red' };
    if (user.days_remaining <= 7) return { text: 'Expire bientôt', color: 'orange' };
    return { text: 'Compte actif', color: 'green' };
  };

  const accountStatus = getAccountStatus();

  return (
    <div className="student-profile">
      {/* Header avec retour */}
      <div className="profile-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <h1 className="profile-title">Mon Profil</h1>
      </div>

      {/* Card Informations personnelles */}
      <Card className="profile-card">
        <CardHeader>
          <CardTitle className="card-title-with-icon">
            <Calendar size={20} />
            Informations du compte
          </CardTitle>
        </CardHeader>
        <CardContent className="profile-info">
          <div className="info-row">
            <span className="info-label">Nom complet</span>
            <span className="info-value">{user.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date d'activation</span>
            <span className="info-value">{formatDate(userDetails.activation_start_date)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date d'expiration</span>
            <span className="info-value">{formatDate(userDetails.activation_end_date)}</span>
          </div>
          <div className="info-row highlight">
            <span className="info-label">Jours restants</span>
            <span className={`info-value days-remaining ${accountStatus.color}`}>
              {user.days_remaining} jours
            </span>
          </div>
          <div className="account-status" style={{ borderLeftColor: accountStatus.color }}>
            <span className={`status-badge ${accountStatus.color}`}>
              {accountStatus.text}
            </span>
          </div>

          {/* Toggle Dark Mode */}
          <div className="info-row theme-toggle-row">
            <span className="info-label">Mode sombre</span>
            <button 
              onClick={toggleDarkMode} 
              className="theme-toggle-button"
              aria-label={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span>{isDarkMode ? 'Mode clair' : 'Mode sombre'}</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Card Progression globale */}
      <Card className="profile-card">
        <CardHeader>
          <CardTitle className="card-title-with-icon">
            <TrendingUp size={20} />
            Progression globale
          </CardTitle>
        </CardHeader>
        <CardContent className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Thèmes commencés</span>
              <span className="stat-value">
                {themesStarted} / {themeProgress.length}
              </span>
            </div>
          </div>
          

          <div className="progress-bar-container">
            <div className="progress-bar-header">
              <span className="progress-label">Progression globale</span>
              <span className="progress-percentage">{globalProgress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Card Examens blancs */}
      <Card className="profile-card">
        <CardHeader>
          <CardTitle className="card-title-with-icon">
            <Clock size={20} />
            Examens blancs
          </CardTitle>
        </CardHeader>
        <CardContent className="exam-stats">
          <div className="exam-stat-row">
            <span className="exam-label">Examens passés</span>
            <span className="exam-value">{mockExamStats.total_attempts}</span>
          </div>
          <div className="exam-stat-row highlight">
            <span className="exam-label">Meilleure note</span>
            <span className="exam-value best-score">
              {mockExamStats.best_score > 0 ? `${mockExamStats.best_score}/40` : 'Aucun'}
            </span>
          </div>
          <div className="exam-stat-row highlight">
            <span className="exam-label">Moyenne des 5 derniers</span>
            <span className="exam-value average-score">
              {averageScore > 0 ? `${averageScore.toFixed(1)}/40` : 'Aucun'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 🔥 NOUVELLE CARD : Statistiques par thème */}
      <Card className="profile-card">
        <CardHeader>
          <CardTitle className="card-title-with-icon">
            <Target size={20} />
            Statistiques par thème
          </CardTitle>
        </CardHeader>
        <CardContent className="theme-stats-list">
          {themeProgress.length > 0 ? (
            themeProgress.map((theme) => {
              const questionsAnswered = theme.completed_questions || 0;
              const totalQuestions = theme.total_questions || 1;
              const progressPct = typeof theme.progress_percentage === 'string' 
                ? parseFloat(theme.progress_percentage) 
                : (theme.progress_percentage || 0);
              
              // Calculer le taux de réussite si disponible
              const score = typeof theme.score === 'string' ? parseFloat(theme.score) : (theme.score || 0);
              const successRate = questionsAnswered > 0 ? Math.round(score) : 0;

              return (
                <div key={theme.theme_id} className="theme-stat-item">
                  <div className="theme-stat-header">
                    <h4 className="theme-stat-title">{theme.theme_name}</h4>
                    <span className="theme-stat-badge">{Math.round(progressPct)}%</span>
                  </div>
                  <div className="theme-stat-details">
                    <div className="theme-stat-row">
                      <span className="theme-stat-label">Questions répondues</span>
                      <span className="theme-stat-value">
                        {questionsAnswered} / {totalQuestions}
                      </span>
                    </div>
                    <div className="theme-stat-row">
                      <span className="theme-stat-label">Taux de réussite</span>
                      <span className={`theme-stat-value ${successRate >= 70 ? 'success' : successRate >= 50 ? 'warning' : 'danger'}`}>
                        {successRate}%
                      </span>
                    </div>
                  </div>
                  <div className="theme-progress-bar">
                    <div 
                      className="theme-progress-fill" 
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-data">Aucune progression pour le moment</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
