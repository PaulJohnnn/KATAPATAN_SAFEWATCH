import React, { useState } from 'react';
import { Shield, UserCircle, UserPlus, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signUp } from '../lib/store';

const inputCls =
  'w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-slate-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 bg-gray-50 dark:bg-slate-700/50 outline-none transition-all font-medium text-gray-800 dark:text-slate-200';

const Field = ({ label, ...props }) => (
  <label className="block space-y-2">
    <span className="block text-sm font-bold text-gray-700 dark:text-slate-300 ml-1">{label}</span>
    <input className={inputCls} required {...props} />
  </label>
);

const LoginView = ({ mode = 'login', onNavigate }) => {
  const isSignup = mode === 'signup';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ login: '', password: '', fullName: '', email: '', phone: '', address: '' });
  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const run = async (fn) => {
    setError('');
    setIsLoading(true);
    try {
      await fn();
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run(() =>
      isSignup
        ? signUp({ fullName: form.fullName, email: form.email, phone: form.phone, address: form.address, password: form.password })
        : signIn(form.login, form.password),
    );
  };

  const useDemo = () => run(() => signIn('demo@safewatch.ph', 'safewatch'));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300">
        <button className="flex items-center text-blue-950 dark:text-blue-100" onClick={() => onNavigate('landing')}>
          <Shield className="w-8 h-8 mr-2 text-blue-600" />
          <span className="font-extrabold text-xl tracking-tight">Katapatan SafeWatch</span>
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-red-100 dark:bg-red-900/20 rounded-full blur-3xl opacity-60"></div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-md w-full border border-gray-50 dark:border-slate-700 relative z-10"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
              {isSignup ? <UserPlus className="w-11 h-11" /> : <UserCircle className="w-12 h-12" />}
            </div>
          </div>
          <h2 className="text-3xl font-black text-center text-blue-950 dark:text-white mb-2">
            {isSignup ? 'Join your barangay' : 'Welcome back'}
          </h2>
          <p className="text-center text-gray-500 dark:text-slate-400 mb-8 font-medium">
            {isSignup ? 'Create a resident account in under a minute.' : 'Log in to your resident account.'}
          </p>

          {!isSignup && (
            <button
              type="button"
              onClick={useDemo}
              disabled={isLoading}
              className="w-full mb-6 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold py-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Sparkles className="w-5 h-5" /> Try the demo resident account
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup ? (
              <>
                <Field label="Full name" value={form.fullName} onChange={on('fullName')} placeholder="Juan Dela Cruz" autoComplete="name" />
                <Field label="Email" type="email" value={form.email} onChange={on('email')} placeholder="juan@email.com" autoComplete="email" />
                <Field label="Mobile number" type="tel" value={form.phone} onChange={on('phone')} placeholder="0912 345 6789" autoComplete="tel" />
                <Field label="Home address" value={form.address} onChange={on('address')} placeholder="Block 5, Katapatan Homes" autoComplete="street-address" />
                <Field label="Password" type="password" value={form.password} onChange={on('password')} placeholder="At least 6 characters" minLength={6} autoComplete="new-password" />
              </>
            ) : (
              <>
                <Field label="Email or mobile number" value={form.login} onChange={on('login')} placeholder="demo@safewatch.ph" autoComplete="username" />
                <Field label="Password" type="password" value={form.password} onChange={on('password')} placeholder="••••••••" autoComplete="current-password" />
              </>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                  className="flex items-start gap-2 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-2xl p-4"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-950 dark:bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-[0_10px_25px_rgba(23,37,84,0.2)] hover:bg-blue-900 dark:hover:bg-blue-500 transition-all flex items-center justify-center text-lg mt-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>{isSignup ? 'Create account' : 'Secure log in'} <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400 font-medium pb-4 border-b border-gray-50 dark:border-slate-700/50">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => { setError(''); onNavigate(isSignup ? 'login' : 'signup'); }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {isSignup ? 'Log in' : 'Create one'}
            </button>
          </div>
          <button onClick={() => onNavigate('landing')} className="w-full mt-4 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 font-bold text-sm transition-colors py-2">
            Back to home
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default LoginView;
