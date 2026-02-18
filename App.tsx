
import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { AppLayout } from './components/Layout/AppLayout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Finance } from './pages/Finance';
import { Habits } from './pages/Habits';
import { Journal } from './pages/Journal';
import { Settings } from './pages/Settings';
import './index.css';

const AppRoutes = () => {
  const { currentUser, loading } = useApp();

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      window.deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-body)] text-[var(--text-muted)] font-medium">
        <div className="animate-pulse">Loading Zenith...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}