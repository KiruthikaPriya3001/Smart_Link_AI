import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import PublicLayout from './components/PublicLayout';
import ConsoleLayout from './components/ConsoleLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CreateUrlPage from './pages/CreateUrlPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PublicStatsPage from './pages/PublicStatsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-450">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800" />
          <div className="absolute w-10 h-10 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Router Layout
function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Marketing/Auth pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/stats/:shortCode" element={<PublicStatsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Protected Management console pages */}
        <Route element={<ProtectedRoute><ConsoleLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateUrlPage />} />
          <Route path="/analytics/:urlId" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
