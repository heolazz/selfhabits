
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './contexts/AppContext';
import { AppLayout } from './components/Layout/AppLayout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Finance } from './pages/Finance';
import { Habits } from './pages/Habits';
import { Journal } from './pages/Journal';
import { Settings } from './pages/Settings';
import { ToastProvider } from './components/Toast';
import { TashoLoadingScreen } from './components/TashoLoadingScreen';
import { useSync } from './hooks/useSync';
import './index.css';

const AppRoutes = () => {
  const { currentUser, authLoading } = useApp();
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);
  useSync(true); // Enable Global Sync

  useEffect(() => {
    // Memberikan waktu agar animasi logo Tasho dapat dinikmati saat masuk aplikasi
    const timer = setTimeout(() => {
      setMinSplashElapsed(true);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      window.deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const isAppLoading = authLoading || !minSplashElapsed;

  return (
    <>
      <AnimatePresence mode="wait">
        {isAppLoading && <TashoLoadingScreen key="tasho-splash" />}
      </AnimatePresence>

      {!isAppLoading && (
        !currentUser ? (
          <Auth />
        ) : (
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
        )
      )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}