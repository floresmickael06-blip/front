import { useState } from 'react';
import { useAuth } from '../hooks';
import { Loader2, AlertCircle } from 'lucide-react';
import './LoginScreen.css';
import DiscoverScreen from './DiscoverScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';

type ScreenView = 'welcome' | 'login' | 'discover' | 'forgot-password';

export default function LoginScreen() {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ScreenView>('welcome');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
    } catch (err: any) {
      if (err.error === 'ACCOUNT_EXPIRED' || err.message?.includes('expiré')) {
        setError(
          'Votre compte a expiré. Veuillez contacter l\'administrateur pour renouveler votre accès.'
        );
      } else {
        setError(err.message || 'Email ou mot de passe incorrect');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (currentView === 'discover') {
    return <DiscoverScreen onBack={() => setCurrentView('welcome')} />;
  }

  if (currentView === 'forgot-password') {
    return (
      <ForgotPasswordScreen
        onBack={() => setCurrentView('login')}
        initialEmail={email}
      />
    );
  }

  if (currentView === 'welcome') {
    return (
      <div className="login-welcome-screen">
        <img
          className="welcome-logo"
          alt="Logo LibertyLoc"
          src="./logo-liberty-loc-1-1.png"
        />

        <p className="welcome-text">
          <span className="welcome-title">
            Bienvenue sur LibertyLoc
            <br />
          </span>
          <span className="welcome-subtitle">
            L'application qui t'accompagne pour ton permis bateau
          </span>
        </p>

        <button 
          className="welcome-button discover-button"
          onClick={() => setCurrentView('discover')}
        >
          Découvrir l'app
        </button>

        <button 
          className="welcome-button login-button"
          onClick={() => setCurrentView('login')}
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <img
          className="login-logo"
          alt="Logo LibertyLoc"
          src="./logo-liberty-loc-1-1.png"
        />

        <h1 className="login-title">Se connecter</h1>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('forgot-password')}
            className="forgot-password-link"
          >
            Mot de passe oublié ?
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('welcome')}
            className="back-button"
          >
            Retour
          </button>
        </form>
      </div>
    </div>
  );
}
