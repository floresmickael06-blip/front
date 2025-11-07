import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Mail, Key, Lock } from 'lucide-react';
import { passwordResetService } from '../services';
import './ForgotPasswordScreen.css';

type ResetStep = 'request' | 'verify' | 'reset' | 'success';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  initialEmail?: string;
}

export default function ForgotPasswordScreen({ onBack, initialEmail = '' }: ForgotPasswordScreenProps) {
  const [currentStep, setCurrentStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Étape 1: Demander le code de réinitialisation
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Adresse email invalide');
      return;
    }

    try {
      setIsLoading(true);
      const response = await passwordResetService.requestPasswordReset(email);
      setSuccessMessage(response.message);
      setCurrentStep('verify');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 2: Vérifier le code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code) {
      setError('Veuillez entrer le code reçu par email');
      return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Le code doit être composé de 6 chiffres');
      return;
    }

    try {
      setIsLoading(true);
      await passwordResetService.verifyResetCode(email, code);
      setCurrentStep('reset');
    } catch (err: any) {
      setError(err.message || 'Code invalide ou expiré');
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 3: Réinitialiser le mot de passe
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setIsLoading(true);
      const response = await passwordResetService.resetPassword(email, code, newPassword);
      setSuccessMessage(response.message);
      setCurrentStep('success');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour recommencer le processus
  const handleStartOver = () => {
    setCurrentStep('request');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="forgot-password-screen">
      <div className="forgot-password-container">
        <button
          type="button"
          onClick={onBack}
          className="back-button"
        >
          <ArrowLeft size={20} />
          Retour à la connexion
        </button>

        {/* Étape 1: Demander le code */}
        {currentStep === 'request' && (
          <>
            <div className="step-header">
              <Mail className="step-icon" size={48} />
              <h1>Réinitialiser votre mot de passe</h1>
              <p>Entrez votre adresse email pour recevoir un code de vérification</p>
            </div>

            <form onSubmit={handleRequestReset} className="reset-form">
              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">Adresse email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="submit-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer le code'
                )}
              </button>
            </form>
          </>
        )}

        {/* Étape 2: Vérifier le code */}
        {currentStep === 'verify' && (
          <>
            <div className="step-header">
              <Key className="step-icon" size={48} />
              <h1>Vérifiez votre email</h1>
              <p>
                Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
              </p>
            </div>

            {successMessage && (
              <div className="success-message">
                <CheckCircle size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="reset-form">
              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="code" className="form-label">Code de vérification</label>
                <input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  disabled={isLoading}
                  maxLength={6}
                  className="form-input code-input"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="submit-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Vérification...
                  </>
                ) : (
                  'Vérifier le code'
                )}
              </button>

              <button
                type="button"
                onClick={handleStartOver}
                className="link-button"
              >
                Changer d'adresse email
              </button>
            </form>
          </>
        )}

        {/* Étape 3: Nouveau mot de passe */}
        {currentStep === 'reset' && (
          <>
            <div className="step-header">
              <Lock className="step-icon" size={48} />
              <h1>Nouveau mot de passe</h1>
              <p>
                Votre code a été vérifié pour <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="reset-form">
              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="new-password" className="form-label">Nouveau mot de passe</label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="Au moins 6 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="form-input"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password" className="form-label">Confirmez le mot de passe</label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="form-input"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="submit-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Réinitialisation...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </button>
            </form>
          </>
        )}

        {/* Étape 4: Succès */}
        {currentStep === 'success' && (
          <>
            <div className="step-header success">
              <CheckCircle className="step-icon success" size={48} />
              <h1>Mot de passe modifié !</h1>
              <p>Votre mot de passe a été réinitialisé avec succès.</p>
            </div>

            {successMessage && (
              <div className="success-message">
                <CheckCircle size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onBack}
              className="submit-button"
            >
              Retour à la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}