import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './app/AppContext';
import { StarsBackground, Toast } from './components/shared/UI';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ResetPassword from './components/ResetPassword';
import Privacy from './components/Privacy';
import ToS from './components/ToS';
import CookiePolicy from './components/CookiePolicy';
import GeneratePage from './dashboard/GeneratePage';
import LibraryPage from './dashboard/LibraryPage';
import ChildrenPage from './dashboard/ChildrenPage';
import AccountPage from './dashboard/AccountPage';
import ProfileModal from './components/modals/ProfileModal';
import StoryModal from './components/modals/StoryModal';
import EmbeddedCheckoutModal from './components/modals/EmbeddedCheckoutModal';

function AppShell() {
  const app = useApp();
  return (
    <div className="relative min-h-screen bg-night text-text">
      <StarsBackground />
      <div className="relative z-10 min-h-screen">
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
            <Route path="/reset-password" element={<ResetPassword onBackToLogin={() => { app.setPasswordRecoveryMode(false); app.setAuthMode('login'); app.setAuthForm({ email: '', password: '', confirmPassword: '', name: '', parentConsent: false }); app.setAuthError(''); app.setAuthNotice(''); window.history.replaceState({}, '', '/login'); }} />} />
            <Route path="/privacy" element={<main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8"><Privacy /></main>} />
            <Route path="/terms" element={<main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8"><ToS /></main>} />
            <Route path="/cookies" element={<main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8"><CookiePolicy /></main>} />
          </Route>

          <Route path="/app" element={app.token ? <DashboardLayout /> : <Navigate to="/login" replace />}>
            <Route index element={<Navigate to="generate" replace />} />
            <Route path="generate" element={<GeneratePage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="children" element={<ChildrenPage />} />
            <Route path="account" element={<AccountPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ProfileModal />
        <StoryModal />
        <EmbeddedCheckoutModal />
        <Toast toast={app.toast} />
      </div>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppShell /></AppProvider>;
}