import { useEffect, lazy, Suspense } from 'react';
import LoginScreen from './components/LoginScreen';
import ChangePasswordScreen from './components/ChangePasswordScreen';
import { useAuth } from './hooks';
import { initializeStorage } from './utils/storage';

// Lazy load des dashboards pour réduire le bundle initial
const StudentDashboard = lazy(() => import('./components/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Composant de chargement
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Chargement...</p>
    </div>
  </div>
);

export default function App() {
  const { user, logout, isLoading, refreshUser } = useAuth();

  useEffect(() => {
    // En développement, nettoyer l'auth au démarrage pour forcer la connexion
    if (import.meta.env.DEV) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    
    // 🔥 Vérifier le mode (ne charge plus de données mockées)
    initializeStorage();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Vérifier si c'est la première connexion (firstLogin peut être boolean ou number)
  const isFirstLogin = user.firstLogin === true || user.firstLogin === 1;
  
  if (isFirstLogin) {
    return (
      <ChangePasswordScreen 
        email={user.email} 
        onPasswordChanged={refreshUser}
      />
    );
  }

  if (user.role === 'admin') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AdminDashboard user={user} onLogout={logout} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <StudentDashboard user={user} onLogout={logout} />
    </Suspense>
  );
}
