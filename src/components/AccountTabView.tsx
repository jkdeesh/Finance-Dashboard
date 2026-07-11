import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  LogOut, 
  ShieldCheck, 
  Laptop, 
  MapPin, 
  Clock, 
  Key, 
  Lock, 
  Smartphone, 
  Plus, 
  Trash2, 
  Coins, 
  Settings, 
  Bell, 
  FileLock2, 
  CheckCircle2, 
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface AccountTabViewProps {
  loggedInAccount: { email: string; name?: string };
  onLogout: () => void;
  portfolios: UserProfile[];
  onAddPortfolio: (name: string) => void;
  onDeletePortfolio: (id: string) => void;
}

export const AccountTabView: React.FC<AccountTabViewProps> = ({
  loggedInAccount,
  onLogout,
  portfolios,
  onAddPortfolio,
  onDeletePortfolio
}) => {
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioName.trim()) return;
    onAddPortfolio(newPortfolioName.trim());
    setNewPortfolioName('');
    setShowAddForm(false);
  };

  const handleSaveSecurity = () => {
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-white/30 dark:border-white/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-full blur-[50px] -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-display font-extrabold text-xl shadow-lg border border-indigo-500/30">
            {loggedInAccount.name ? loggedInAccount.name.charAt(0).toUpperCase() : loggedInAccount.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                {loggedInAccount.name || 'Active Account'}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified Account</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-350 font-medium mt-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <span>{loggedInAccount.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="z-10 flex items-center justify-center gap-2 px-5 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold rounded-2xl text-xs transition-all border border-rose-500/20 shadow-sm active:scale-[0.98] cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out of Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Portfolios & Family Profiles */}
        <div className="md:col-span-7 space-y-6">
          <div className="rounded-3xl glass-panel border border-white/30 dark:border-white/10 p-6 shadow-xl transform-gpu overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Portfolio Members
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Toggle, create or remove asset silos to aggregate dashboard views
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Portfolio</span>
              </button>
            </div>

            {/* Quick Add Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onSubmit={handleCreatePortfolio}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Add New Portfolio Profile
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sreenithi Corporate, Trust, Priya Savings"
                        value={newPortfolioName}
                        onChange={(e) => setNewPortfolioName(e.target.value)}
                        className="flex-grow bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Portfolios List */}
            <div className="space-y-3">
              {portfolios.map((u) => (
                <div 
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-white/30 dark:bg-slate-800/25 border border-white/20 dark:border-white/10 rounded-2xl hover:bg-white/40 dark:hover:bg-slate-800/35 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border shadow-sm ${u.avatarColor}`}>
                      {u.initials}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                        {u.name}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block">
                        Family Asset Silo
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDeletePortfolio(u.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      title="Delete Portfolio"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {portfolios.length === 0 && (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl font-semibold text-xs">
                  No portfolios created. Click "New Portfolio" to add one!
                </div>
              )}
            </div>
          </div>

          {/* Device & Active Sessions Card */}
          <div className="rounded-3xl glass-panel border border-white/30 dark:border-white/10 p-6 shadow-xl transform-gpu overflow-hidden">
            <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 flex items-center gap-2">
              <Laptop className="h-5 w-5 text-indigo-500" />
              <span>Active Sessions & Security</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-2xl">
                <Laptop className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">MacBook Pro Chrome</span>
                    <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Current Session
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Bengaluru, IN</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Active Now</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50/40 dark:bg-slate-900/15 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <Smartphone className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">iPhone 15 Mobile Web</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">2 hours ago</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Bengaluru, IN</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last active 10:24 AM</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security Configurations */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-3xl glass-panel border border-white/30 dark:border-white/10 p-6 shadow-xl relative transform-gpu overflow-hidden">
            <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-500" />
              <span>Preferences</span>
            </h3>

            <div className="space-y-4">
              {/* Notif */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">Email Alerts</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">Alert me on maturity dates</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifEnabled(!notifEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 focus:outline-none cursor-pointer ${
                    notifEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                    notifEnabled ? 'left-[18px]' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* TFA Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">Two-Factor Auth</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">Double-secure your portfolios</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTfaEnabled(!tfaEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 focus:outline-none cursor-pointer ${
                    tfaEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                    tfaEnabled ? 'left-[18px]' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Biometrics */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">Biometric Lockout</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">Enable FaceID on compatible browsers</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBiometricEnabled(!biometricEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 focus:outline-none cursor-pointer ${
                    biometricEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                    biometricEnabled ? 'left-[18px]' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Save Settings */}
              <button
                type="button"
                onClick={handleSaveSecurity}
                className="w-full mt-2 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Save Preferences</span>
              </button>

              <AnimatePresence>
                {isSavedAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-2.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1.5 mt-2 shadow-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Account settings saved!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Statistics Overview */}
          <div className="rounded-3xl glass-panel border border-white/30 dark:border-white/10 p-6 shadow-xl bg-gradient-to-tr from-slate-500/5 to-indigo-500/5 transform-gpu overflow-hidden">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-4">
              Security Overview
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-600 dark:text-slate-350">Data Encryption</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">AES-256 GCM</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-600 dark:text-slate-350">Local Key Storage</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Device Sandbox</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-600 dark:text-slate-350">IP Session Lock</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span>Locked</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
