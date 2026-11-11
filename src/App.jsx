import React, { useState, useEffect } from 'react';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore, currentUser, signOut, updateSettings } from './lib/store';

export default function App() {
  const user = useStore(currentUser);
  const [view, setView] = useState(user ? 'dashboard' : 'landing');
  const isDarkMode = Boolean(user?.settings?.dark);
  const setIsDarkMode = (dark) => updateSettings({ dark });

  // The session decides: logged in always shows the dashboard, logged out never does
  const shown = user ? 'dashboard' : view === 'dashboard' ? 'landing' : view;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const navigate = (next) => setView(next === 'dashboard' && !user ? 'login' : next);

  return (
    <div className={`min-h-screen w-full bg-white dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'dark' : ''}`}>
      <AnimatePresence mode="wait">
        {shown === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <LandingView onNavigate={navigate} />
          </motion.div>
        )}

        {(shown === 'login' || shown === 'signup') && (
          <motion.div key="login" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }}>
            <LoginView mode={shown} onNavigate={setView} />
          </motion.div>
        )}

        {shown === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <DashboardView
              onLogout={() => { signOut(); setView('landing'); }}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
