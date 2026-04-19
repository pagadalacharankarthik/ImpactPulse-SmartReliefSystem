import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { SurveyForm } from './pages/SurveyForm';
import { VolunteerPanel } from './pages/VolunteerPanel';
import { FieldWorkerDashboard } from './pages/FieldWorkerDashboard';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { PendingApproval } from './pages/PendingApproval';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { useDatabaseStore } from './store/useDatabaseStore';
import { syncService } from './services/offlineSync';
import { ToastContainer } from './components/ui/Toast';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RoleBasedDashboard = () => {
  const { user } = useAuthStore();
  if (user?.role === 'admin') return <Dashboard />;
  if (user?.role === 'volunteer') return <VolunteerPanel />;
  if (user?.role === 'worker') return <FieldWorkerDashboard />;
  if (user?.role === 'pending') return <PendingApproval />;
  return <Navigate to="/" />;
};

function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => { syncService.setupEventListeners(); }, []);

  const { initializeCloudSync } = useDatabaseStore();
  useEffect(() => {
    initializeCloudSync();
  }, [initializeCloudSync]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
            <Route path="/survey" element={<ProtectedRoute allowedRoles={['worker', 'volunteer']}><SurveyForm /></ProtectedRoute>} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
