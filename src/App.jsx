import {ProductionGate} from '@scs/platform/auth';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import DemoWorkspaceLayout from '@/components/workspace/DemoWorkspaceLayout';
import RoleRedirect from '@/components/RoleRedirect';
import ReceptionistConsole from '@/pages/ReceptionistConsole';
import AdminConsole from '@/pages/AdminConsole';
import Favorites from '@/pages/Favorites';
import KeypadPage from '@/pages/KeypadPage';
import RecentsPage from '@/pages/RecentsPage';
import ContactsPage from '@/pages/ContactsPage';
import VoicemailPage from '@/pages/VoicemailPage';
import MessagesPage from '@/pages/MessagesPage';
import TeamChat from '@/pages/TeamChat';
import Fax from '@/pages/Fax';
import Meetings from '@/pages/Meetings';
import Integrations from '@/pages/Integrations';
import SettingsPage from '@/pages/SettingsPage';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<DemoWorkspaceLayout />}>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/dialer" element={<Navigate to="/keypad" replace />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/keypad" element={<KeypadPage />} />
        <Route path="/recents" element={<RecentsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/voicemail" element={<VoicemailPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/team-chat" element={<TeamChat />} />
        <Route path="/fax" element={<Fax />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/receptionist" element={<ReceptionistConsole />} />
        <Route path="/admin" element={<AdminConsole />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*" element={<ProductionGate><AuthenticatedApp /></ProductionGate>} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App