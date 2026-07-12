import React, { useState } from 'react';
import { Mail, Lock, LogIn, User, Eye, EyeOff, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface FullPageLoginViewProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLoginSuccess: (email: string, name: string) => void;
}

export const FullPageLoginView: React.FC<FullPageLoginViewProps> = ({
  isDarkMode,
  toggleDarkMode,
  onLoginSuccess
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'signup' && !name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    // Simulate secure network call
    setTimeout(() => {
      setIsLoading(false);
      const accountName = authMode === 'signup' 
        ? name 
        : email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      onLoginSuccess(email.trim().toLowerCase(), accountName);
    }, 1200);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess('jagadeesh.srmuniv@gmail.com', 'Jagadeesh');
    }, 600);
  };

  return (
    <div 
      className={`h-screen w-full relative flex items-center justify-center font-sans overflow-hidden antialiased transition-colors duration-500 ${isDarkMode ? 'dark text-slate-100' : 'text-slate-800'}`}
      style={{
        backgroundImage: isDarkMode 
          ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.8) 100%), url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop')`
          : `linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(241, 245, 249, 0.4) 100%), url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Ambient background meshes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-[450px] h-[450px] bg-gradient-to-br from-indigo-500/25 to-cyan-400/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-tr from-rose-500/20 to-violet-500/20 rounded-full blur-[90px]" />
      </div>

      <div className="absolute top-6 right-6 z-10">
        {/* Dark Mode toggle */}
        <button 
          type="button"
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-white/20 dark:bg-slate-900/40 backdrop-blur-md hover:bg-white/30 dark:hover:bg-slate-900/60 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-100 transition-all cursor-pointer shadow-sm focus:outline-none"
        >
          {isDarkMode ? (
            <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.591 1.591m10.91 10.91l1.591 1.591M3 12h2.25m13.5 0H21M4.95 19.05l1.591-1.591m10.91-10.91l1.591-1.591M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>
      </div>

      <div className="w-full max-w-md px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col"
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white rounded-2xl flex items-center justify-center shadow-lg mb-3">
              <Sparkles className="h-6 w-6 stroke-[2]" />
            </div>
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
              Family Asset Tracker
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-350 mt-1 font-medium">
              Securely log in to manage, track, and consolidate family portfolios
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-slate-200/50 dark:bg-slate-950/40 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/55 dark:bg-slate-850/50 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/55 dark:bg-slate-850/50 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/55 dark:bg-slate-850/50 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end -mt-2 mb-4">
              <button
                type="button"
                onClick={() => alert('Forgot password functionality coming soon!')}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 mt-2 text-white font-extrabold rounded-xl text-xs transition-all duration-300 cursor-pointer 
                        ${authMode === 'signin' 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-[0_4px_12px_-2px_rgba(79,70,229,0.4)]' 
                          : 'bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-[0_4px_12px_-2px_rgba(16,185,129,0.4)]'
                        }
                        hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)] 
                        hover:scale-[1.01] active:scale-[0.99] border border-white/10
                        flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>{authMode === 'signin' ? 'Sign In to Account' : 'Register New Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center gap-3">
            {/* Left Line */}
            {/* <div className="flex-1 border-t border-slate-250 dark:border-slate-800" /> */}
            
            {/* Text */}
            {/* <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Quick Demo Access
            </span> */}
            
            {/* Right Line */}
            {/* <div className="flex-1 border-t border-slate-250 dark:border-slate-800" /> */}
          </div>

          {/* One-click login button */}
          {/* <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/10 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
            <span>1-Click Demo Login (Jagadeesh)</span>
          </button> */}
        </motion.div>
      </div>
    </div>
  );
};
