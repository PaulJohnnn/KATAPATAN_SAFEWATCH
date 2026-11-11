import React, { useState } from 'react';
import { Bell, Shield, RotateCcw, LogOut, ChevronRight, Moon, Eye, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, currentUser, updateSettings, resetDemoData } from '../../lib/store';
import { hasSupabase } from '../../lib/supabaseClient';

const Toggle = ({ enabled, setEnabled, icon: Icon, title, desc }) => (
  <div className="flex items-center justify-between p-8 border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
    <div className="flex items-center space-x-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${enabled ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <span className="font-black text-blue-950 dark:text-white text-lg leading-none block mb-1 tracking-tight">{title}</span>
        <span className="text-gray-400 dark:text-slate-500 font-medium text-xs uppercase tracking-widest">{desc}</span>
      </div>
    </div>
    <button 
      onClick={() => setEnabled(!enabled)}
      type="button"
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`}
    >
      <motion.span 
        initial={false}
        animate={{ x: enabled ? 28 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="inline-block h-6 w-6 rounded-full bg-white shadow-lg shadow-blue-950/20" 
      />
    </button>
  </div>
);

const SettingsContent = ({ onLogout, isDarkMode, setIsDarkMode }) => {
  const user = useStore(currentUser);
  const notifications = user?.settings?.notifications ?? true;
  const anonymous = user?.settings?.anonymous ?? false;
  const setNotifications = (v) => updateSettings({ notifications: v });
  const setAnonymous = (v) => updateSettings({ anonymous: v });
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="flex flex-col h-full px-4 md:px-0 max-w-4xl mx-auto pb-24">
      <div className="mb-10">
        <h2 className="font-black text-blue-950 dark:text-white text-3xl md:text-4xl tracking-tight">Settings</h2>
        <p className="text-gray-400 dark:text-slate-500 font-medium mt-1">Configure your safety experience.</p>
      </div>

      <div className="space-y-12">
        {/* App Preferences */}
        <section className="space-y-6">
          <h3 className="font-black text-blue-950 dark:text-white text-xs uppercase tracking-[0.2em] ml-2">App Preferences</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-gray-50 dark:border-slate-800 overflow-hidden">
            <Toggle 
              enabled={notifications} 
              setEnabled={setNotifications} 
              icon={Bell} 
              title="Emergency Alerts" 
              desc="Immediate push notifications" 
            />
            <Toggle 
              enabled={anonymous} 
              setEnabled={setAnonymous} 
              icon={Eye} 
              title="Ghost Reporting" 
              desc="Always hide my real name" 
            />
            <Toggle 
              enabled={isDarkMode} 
              setEnabled={setIsDarkMode} 
              icon={Moon} 
              title="Dark Interface" 
              desc="Switch to night mode" 
            />
          </div>
        </section>

        {/* Security & Account */}
        <section className="space-y-6">
          <h3 className="font-black text-blue-950 dark:text-white text-xs uppercase tracking-[0.2em] ml-2">Security & Identity</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-gray-50 dark:border-slate-800 overflow-hidden">
            <button onClick={() => setShowPrivacy(!showPrivacy)} aria-expanded={showPrivacy} className="w-full flex items-center justify-between p-8 border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all text-left group">
              <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="font-black text-blue-950 dark:text-white text-lg tracking-tight">Data & Privacy</span>
              </div>
              <ChevronRight className={`w-6 h-6 text-gray-300 dark:text-slate-600 transition-transform ${showPrivacy ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {showPrivacy && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-gray-50 dark:border-slate-800/50">
                  <p className="px-8 py-6 text-sm font-medium text-gray-500 dark:text-slate-400 leading-relaxed">
                    {hasSupabase
                      ? 'Your account is stored on this device. Reports and SOS alerts are also saved to the SafeWatch database so neighbors can see them.'
                      : 'This demo keeps your account, reports and SOS alerts in this browser only. Nothing is sent to a server, and clearing your browser data removes it.'}
                    {' '}With Ghost Reporting on, your name is never shown on reports.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => { resetDemoData(); setResetDone(true); setTimeout(() => setResetDone(false), 2500); }}
              className="w-full flex items-center justify-between p-8 border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all text-left group"
            >
              <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <span>
                  <span className="block font-black text-blue-950 dark:text-white text-lg tracking-tight">Reset demo data</span>
                  <span className="block text-gray-400 dark:text-slate-500 font-medium text-xs uppercase tracking-widest">{resetDone ? 'Done: sample reports restored' : 'Restore the sample reports'}</span>
                </span>
              </div>
            </button>
            <button onClick={onLogout} className="w-full flex items-center justify-between p-8 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-left group">
              <div className="flex items-center space-x-5 text-red-600 dark:text-red-400">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                  <LogOut className="w-6 h-6" />
                </div>
                <span className="font-black text-lg tracking-tight">Logout of Account</span>
              </div>
            </button>
          </div>
        </section>

        {/* Device Info */}
        <div className="flex items-center justify-center p-10 flex-col space-y-4">
           <Smartphone className="w-8 h-8 text-gray-200 dark:text-slate-800" />
           <p className="text-[10px] font-black text-gray-300 dark:text-slate-700 uppercase tracking-[0.3em]">VERSION 1.1.0 • KATAPATAN SAFEWATCH</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
