import React, { useState } from 'react';
import { Mail, Lock, LogIn, User, Eye, EyeOff, ShieldAlert, Sparkles, RefreshCw, Fingerprint, ShieldCheck, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface RegisteredAccount {
  username: string;
  email: string;
  name: string;
  password: string;
  status?: 'active' | 'dormant';
}

const getRegisteredAccounts = (): RegisteredAccount[] => {
  try {
    const saved = localStorage.getItem('asset_tracker_registered_accounts');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
  
  return [];
};

const saveRegisteredAccount = (account: RegisteredAccount) => {
  try {
    const accounts = getRegisteredAccounts();
    const exists = accounts.some(
      a => a.email.toLowerCase() === account.email.toLowerCase() || 
           a.username.toLowerCase() === account.username.toLowerCase()
    );
    if (!exists) {
      accounts.push(account);
      localStorage.setItem('asset_tracker_registered_accounts', JSON.stringify(accounts));
    }
  } catch (e) {
    console.error(e);
  }
};

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
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Stores email on signup, or username/email on signin
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Security Verification States
  const [verificationPendingAccount, setVerificationPendingAccount] = useState<{ email: string; name: string } | null>(null);
  const [verificationMode, setVerificationMode] = useState<'none' | 'tfa' | 'biometric' | 'both'>('none');
  const [currentVerificationStep, setCurrentVerificationStep] = useState<'none' | 'biometric' | 'tfa'>('none');
  const [tfaCode, setTfaCode] = useState('');
  const [expectedTfaCode, setExpectedTfaCode] = useState('');
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  // Password Recovery States
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Dormant account state
  const [dormantAccountToReactivate, setDormantAccountToReactivate] = useState<RegisteredAccount | null>(null);

  // Listen for popup messages from oauth_social.html
  React.useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { provider, email: socialEmail, name: socialName } = event.data;
        if (socialEmail && socialName) {
          setIsLoading(true);
          setError('');
          setSuccessMessage('');
          setDormantAccountToReactivate(null);

          setTimeout(() => {
            setIsLoading(false);
            const accounts = getRegisteredAccounts();
            const matchedAccount = accounts.find(a => a.email.toLowerCase() === socialEmail.toLowerCase());

            if (matchedAccount) {
              if (matchedAccount.status === 'dormant') {
                setDormantAccountToReactivate(matchedAccount);
                return;
              }
              onLoginSuccess(matchedAccount.email, matchedAccount.name);
            } else {
              // Auto-register new OAuth account with active status
              const newAcc: RegisteredAccount = {
                username: socialEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, ''),
                email: socialEmail.toLowerCase(),
                name: socialName,
                password: 'oauth_secured_' + Math.random().toString(36).slice(-8),
                status: 'active'
              };
              saveRegisteredAccount(newAcc);
              onLoginSuccess(newAcc.email, newAcc.name);
            }
          }, 1000);
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [onLoginSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (authMode === 'forgot') {
      const targetEmail = forgotEmail.trim().toLowerCase();
      if (!targetEmail || !targetEmail.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        const accounts = getRegisteredAccounts();
        const matchedAccount = accounts.find(a => a.email.toLowerCase() === targetEmail);

        if (!matchedAccount) {
          setError('No account found with this email address.');
          return;
        }

        if (!otpSent) {
          // Generate 6-digit OTP code
          const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOtp(newOtp);
          setOtpSent(true);
          setSuccessMessage(`A secure verification code has been sent to ${targetEmail}.`);
          
          // Log to console for easy developer testing and debugging
          console.log(`[SMTP SIMULATOR] Verification code for ${targetEmail}: ${newOtp}`);
        } else {
          // Verify code
          if (otpCode.trim() !== generatedOtp) {
            setError('Invalid verification code. Please check and try again.');
            return;
          }
          if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
          }

          // Update password in local registered database
          const updatedAccounts = accounts.map(a => {
            if (a.email.toLowerCase() === targetEmail) {
              return { ...a, password: newPassword, status: 'active' as const };
            }
            return a;
          });
          localStorage.setItem('asset_tracker_registered_accounts', JSON.stringify(updatedAccounts));

          setSuccessMessage('Password successfully reset! Redirecting to sign in...');
          setTimeout(() => {
            setEmail(targetEmail);
            setAuthMode('signin');
            setForgotEmail('');
            setOtpCode('');
            setNewPassword('');
            setOtpSent(false);
            setGeneratedOtp('');
            setSuccessMessage('');
          }, 2000);
        }
      }, 1200);
      return;
    }

    if (authMode === 'signup') {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      if (!cleanUsername) {
        setError('Please enter a valid username');
        return;
      }
      if (cleanUsername.includes('@')) {
        setError('Username cannot contain the "@" symbol');
        return;
      }
      if (!name.trim()) {
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

      setTimeout(() => {
        setIsLoading(false);
        const accounts = getRegisteredAccounts();
        const usernameExists = accounts.some(a => a.username.toLowerCase() === cleanUsername.toLowerCase());
        const emailExists = accounts.some(a => a.email.toLowerCase() === email.trim().toLowerCase());

        if (usernameExists) {
          setError('Username is already taken');
          return;
        }
        if (emailExists) {
          setError('Email is already registered');
          return;
        }

        const newAccount: RegisteredAccount = {
          username: cleanUsername,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          password: password,
          status: 'active'
        };
        saveRegisteredAccount(newAccount);

        onLoginSuccess(newAccount.email, newAccount.name);
      }, 1200);

    } else {
      // Sign-in mode
      const identifier = email.trim();
      if (!identifier) {
        setError('Please enter your username or email address');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        const accounts = getRegisteredAccounts();
        
        // Find matching account by email or username
        const matchedAccount = accounts.find(
          a => a.email.toLowerCase() === identifier.toLowerCase() || 
               a.username.toLowerCase() === identifier.toLowerCase()
        );

        if (matchedAccount) {
          if (matchedAccount.password !== password) {
            setError('Incorrect password. Please try again.');
            return;
          }
          if (matchedAccount.status === 'dormant') {
            setDormantAccountToReactivate(matchedAccount);
            return;
          }

          // Check if MFA/2FA or Biometrics is active for this account
          const emailKey = matchedAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
          const tfaEnabled = localStorage.getItem(`asset_tracker_tfa_${emailKey}`) === 'true';
          const bioEnabled = localStorage.getItem(`asset_tracker_biometric_${emailKey}`) === 'true';

          if (tfaEnabled || bioEnabled) {
            setVerificationPendingAccount({ email: matchedAccount.email, name: matchedAccount.name });
            setTfaCode('');
            
            if (bioEnabled) {
              setVerificationMode(tfaEnabled ? 'both' : 'biometric');
              setCurrentVerificationStep('biometric');
              setBiometricStatus('scanning');
              
              // Automatically simulate successful biometric scanning after 1.5s
              setTimeout(() => {
                setBiometricStatus('success');
                setTimeout(() => {
                  if (tfaEnabled) {
                    setCurrentVerificationStep('tfa');
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    setExpectedTfaCode(code);
                    console.log(`[MFA SIMULATOR] 2FA Verification Code for ${matchedAccount.email}: ${code}`);
                  } else {
                    onLoginSuccess(matchedAccount.email, matchedAccount.name);
                    setVerificationPendingAccount(null);
                    setCurrentVerificationStep('none');
                  }
                }, 1000);
              }, 1800);
            } else {
              setVerificationMode('tfa');
              setCurrentVerificationStep('tfa');
              const code = Math.floor(100000 + Math.random() * 900000).toString();
              setExpectedTfaCode(code);
              console.log(`[MFA SIMULATOR] 2FA Verification Code for ${matchedAccount.email}: ${code}`);
            }
            return;
          }

          onLoginSuccess(matchedAccount.email, matchedAccount.name);
        } else {
          // Permissive email log-in for unsaved email accounts
          if (identifier.includes('@')) {
            const derivedName = identifier.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const newAcc: RegisteredAccount = {
              username: identifier.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, ''),
              email: identifier.toLowerCase(),
              name: derivedName,
              password: password,
              status: 'active'
            };
            saveRegisteredAccount(newAcc);
            onLoginSuccess(newAcc.email, newAcc.name);
          } else {
            setError('Account not found. Please sign up or enter a valid email.');
          }
        }
      }, 1200);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setDormantAccountToReactivate(null);

    // Calculate popup position centered on the screen
    const width = 450;
    const height = 580;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popupUrl = `/oauth_social.html?provider=${encodeURIComponent(provider)}`;
    const oauthWindow = window.open(
      popupUrl,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!oauthWindow) {
      setIsLoading(false);
      setError('Popup was blocked by your browser. Please allow popups for this site.');
    } else {
      // Check in the background to stop loading state if they close the popup without finishing
      const checkPopup = setInterval(() => {
        if (oauthWindow.closed) {
          clearInterval(checkPopup);
          setIsLoading(false);
        }
      }, 1000);
    }
  };

  const handleReactivateDormant = () => {
    if (!dormantAccountToReactivate) return;
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      setIsLoading(false);
      const accounts = getRegisteredAccounts();
      const updated = accounts.map(a => {
        if (a.email.toLowerCase() === dormantAccountToReactivate.email.toLowerCase()) {
          return { ...a, status: 'active' as const };
        }
        return a;
      });
      localStorage.setItem('asset_tracker_registered_accounts', JSON.stringify(updated));
      
      const reactivated = dormantAccountToReactivate;
      setDormantAccountToReactivate(null);
      onLoginSuccess(reactivated.email, reactivated.name);
    }, 1000);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setDormantAccountToReactivate(null);
    setTimeout(() => {
      setIsLoading(false);
      // Automatically register demo@familyasset.ai so that it works as a standard login too
      const demoAccount: RegisteredAccount = {
        username: 'demo',
        email: 'demo@familyasset.ai',
        name: 'Demo Family',
        password: 'password',
        status: 'active'
      };
      saveRegisteredAccount(demoAccount);
      onLoginSuccess('demo@familyasset.ai', 'Demo Family');
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

          {/* Tab Selection (Hidden during Password Recovery or Reactivation) */}
          {!dormantAccountToReactivate && authMode !== 'forgot' && (
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
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Dormant Account Reactivation View */}
          {verificationPendingAccount ? (
            /* Multi-Factor & Biometric Security Verification Screen */
            <div className="space-y-6 flex flex-col items-center py-4">
              <div className="text-center">
                <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-3">
                  <ShieldCheck className="h-6 w-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Security Verification
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                  Protecting your financial records. Please verify your identity.
                </p>
              </div>

              {currentVerificationStep === 'biometric' && (
                <div className="flex flex-col items-center space-y-4 w-full">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Ripple effects */}
                    {biometricStatus === 'scanning' && (
                      <>
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                        <div className="absolute inset-2 bg-indigo-500/15 rounded-full animate-pulse" />
                      </>
                    )}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all ${
                      biometricStatus === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 scale-105'
                        : 'bg-indigo-500/5 border-indigo-500/30 text-indigo-500'
                    }`}>
                      {biometricStatus === 'success' ? (
                        <Check className="h-8 w-8 stroke-[3]" />
                      ) : (
                        <Fingerprint className="h-8 w-8 stroke-[1.5] animate-pulse" />
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <span className={`text-xs font-bold ${
                      biometricStatus === 'success' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-350'
                    }`}>
                      {biometricStatus === 'scanning' && 'Touch ID / Face ID Scanning...'}
                      {biometricStatus === 'success' && 'Biometrics Authenticated!'}
                    </span>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {biometricStatus === 'scanning' && 'Place your fingerprint on the sensor'}
                    </p>
                  </div>
                </div>
              )}

              {currentVerificationStep === 'tfa' && (
                <div className="w-full space-y-4">
                  <div className="space-y-1.5 text-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Enter 2FA Code
                    </span>
                    <p className="text-[9px] text-slate-400">
                      Two-Factor Authentication is active. Enter the 6-digit code.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="------"
                      value={tfaCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setTfaCode(val);
                        if (val === expectedTfaCode || val === '123456') {
                          setTimeout(() => {
                            onLoginSuccess(verificationPendingAccount.email, verificationPendingAccount.name);
                            // Reset state
                            setVerificationPendingAccount(null);
                            setCurrentVerificationStep('none');
                            setTfaCode('');
                          }, 600);
                        }
                      }}
                      className="w-full tracking-[1.5em] text-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:tracking-normal placeholder:text-slate-300"
                    />
                  </div>

                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-[9px] text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                    <p>
                      💡 <span className="font-bold">MFA Simulator Active:</span> A 2FA code was logged to your browser console. Or, bypass using code <span className="underline font-bold text-amber-700 dark:text-amber-300">123456</span>.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setVerificationPendingAccount(null);
                  setCurrentVerificationStep('none');
                  setError('Security verification cancelled');
                }}
                className="text-[10px] font-bold text-indigo-500 hover:underline hover:text-indigo-400 mt-2"
              >
                Cancel Sign In
              </button>
            </div>
          ) : dormantAccountToReactivate ? (
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-amber-200/50">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Account Status: Dormant</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  The account <strong>{dormantAccountToReactivate.email}</strong> is currently set to dormant.
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-350 text-center bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                Reactivating this account will immediately restore full portal access, clear inactivity limitations, and unfreeze active asset trackers.
              </p>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDormantAccountToReactivate(null)}
                  className="flex-1 py-2.5 text-xs font-extrabold text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReactivateDormant}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-gradient-to-br from-indigo-600 to-indigo-500 hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
                >
                  {isLoading ? (
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    "Reactivate & Sign In"
                  )}
                </button>
              </div>
            </div>
          ) : authMode === 'forgot' ? (
            /* Forgot Password Flow */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setForgotEmail('');
                    setOtpSent(false);
                    setOtpCode('');
                    setNewPassword('');
                    setSuccessMessage('');
                    setError('');
                  }}
                  className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  ← Back to Sign In
                </button>
              </div>

              {!otpSent ? (
                /* Phase 1: Request Email */
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-white/55 dark:bg-slate-850/50 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:scale-[1.01] active:scale-[0.99] border border-white/10 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      "Send Secure Reset Code"
                    )}
                  </button>
                </div>
              ) : (
                /* Phase 2: Code verification & New password */
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-150/40 dark:border-indigo-900/50 rounded-xl text-[11px] space-y-1.5 text-indigo-800 dark:text-indigo-300">
                    <p className="font-extrabold flex items-center gap-1">
                      <span>📧 Simulated Local Mailbox</span>
                    </p>
                    <p className="leading-relaxed opacity-95">
                      Because this is a sandboxed container, we simulated sending an SMTP recovery request. Enter your OTP code to reset password:
                    </p>
                    <div className="pt-0.5 flex justify-center">
                      <span className="font-mono font-black text-xs bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 tracking-wider">
                        {generatedOtp}
                      </span>
                    </div>
                  </div>

                  {/* Verification Code Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full bg-white/55 dark:bg-slate-850/50 text-center tracking-widest font-mono text-sm text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-xl py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
                    />
                  </div>

                  {/* New Password Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Choose New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/55 dark:bg-slate-850/50 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:scale-[1.01] active:scale-[0.99] border border-white/10 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      "Reset & Update Password"
                    )}
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' ? (
                <>
                  {/* Username */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/55 dark:bg-slate-850/50 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/55 dark:bg-slate-850/50 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
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
                </>
              ) : (
                /* Sign In: Username or Email */
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Username or Email Address
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your username or email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/55 dark:bg-slate-850/50 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>
              )}

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

              {/* Forgot Password Link - Only visible on Sign-In form, not on Sign-Up */}
              {authMode === 'signin' && (
                <div className="flex justify-end -mt-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setError('');
                      setSuccessMessage('');
                      setForgotEmail(email.includes('@') ? email : '');
                    }}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

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
          )}

          {/* Social Sign-In (Hidden during Reactivation or Forgot Mode) */}
          {!dormantAccountToReactivate && authMode !== 'forgot' && (
            <>
              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center gap-3">
                <div className="flex-1 border-t border-slate-200/40 dark:border-slate-800/60" />
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {authMode === 'signin' ? 'Or Sign In with' : 'Or Create Account with'}
                </span>
                <div className="flex-1 border-t border-slate-200/40 dark:border-slate-800/60" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/45 hover:bg-white/75 dark:bg-slate-800/35 dark:hover:bg-slate-800/75 border border-slate-200/50 dark:border-slate-800/80 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-slate-800 dark:text-slate-100"
                  title="Sign in with Google"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span className="text-[11px] font-bold">Google</span>
                </button>

                {/* Apple Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Apple')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/45 hover:bg-white/75 dark:bg-slate-800/35 dark:hover:bg-slate-800/75 border border-slate-200/50 dark:border-slate-800/80 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-slate-800 dark:text-slate-100"
                  title="Sign in with Apple"
                >
                  <svg className="h-4 w-4 shrink-0 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94 1.07.08 2.15-.52 2.81-1.33z" />
                  </svg>
                  <span className="text-[11px] font-bold">Apple</span>
                </button>

                {/* Facebook Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/45 hover:bg-white/75 dark:bg-slate-800/35 dark:hover:bg-slate-800/75 border border-slate-200/50 dark:border-slate-800/80 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-slate-800 dark:text-slate-100"
                  title="Sign in with Facebook"
                >
                  <svg className="h-4 w-4 shrink-0 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-[11px] font-bold">Facebook</span>
                </button>
              </div>

              {/* Quick Demo Access Link */}
              <div className="text-center mt-2 pt-1 border-t border-slate-100/10">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-all cursor-pointer"
                >
                  Quick Demo Login (Demo Account)
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
