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
  Check,
  FileSpreadsheet,
  Download,
  Upload,
  FileUp,
  FileDown,
  AlertTriangle,
  RefreshCcw,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, AssetData, BankAccount, FixedDeposit, MutualFund, ImmovableAsset, InsurancePolicy, PreciousAsset, Liability, CurrencyCode, CURRENCIES } from '../types';
import * as XLSX from 'xlsx';

function getRealDeviceInfo() {
  if (typeof window === 'undefined' || !window.navigator) {
    return {
      os: 'Desktop Device',
      browser: 'Secure Browser',
      isMobile: false
    };
  }

  const ua = window.navigator.userAgent;
  let os = 'Desktop Device';
  let browser = 'Web Browser';
  let isMobile = false;

  // OS Detection
  if (/Windows/i.test(ua)) os = 'Windows PC';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'Mac';
  else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = /iPad/i.test(ua) ? 'iPad' : 'iPhone';
    isMobile = true;
  } else if (/Android/i.test(ua)) {
    os = 'Android Device';
    isMobile = true;
  } else if (/Linux/i.test(ua)) os = 'Linux PC';

  // Browser Detection
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  // Mobile detection fallback
  if (/Mobile|Android|iP(hone|od)/i.test(ua)) {
    isMobile = true;
  }

  return {
    os,
    browser,
    isMobile
  };
}

function getRealLocationAndTZ() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetHours = -Math.floor(offsetMinutes / 60);
    const offsetMinsRemaining = Math.abs(offsetMinutes % 60);
    const offsetStr = `GMT${offsetHours >= 0 ? '+' : ''}${offsetHours}:${offsetMinsRemaining.toString().padStart(2, '0')}`;
    
    let city = 'Local Session';
    if (tz.includes('/')) {
      city = tz.split('/').pop()?.replace('_', ' ') || tz;
    }
    
    return `${city}, IN (${offsetStr})`;
  } catch (e) {
    return 'Local Session';
  }
}

interface AccountTabViewProps {
  selectedCurrency: CurrencyCode;
  loggedInAccount: { email: string; name?: string };
  onLogout: () => void;
  portfolios: UserProfile[];
  onAddPortfolio: (name: string) => void;
  onDeletePortfolio: (id: string) => void;
  assetData: AssetData;
  onImportAssetData: (data: AssetData) => void;
}

export const AccountTabView: React.FC<AccountTabViewProps> = ({
  selectedCurrency,
  loggedInAccount,
  onLogout,
  portfolios,
  onAddPortfolio,
  onDeletePortfolio,
  assetData,
  onImportAssetData
}) => {
  const realDevice = getRealDeviceInfo();
  const realLocation = getRealLocationAndTZ();

  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  
  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Email Simulation State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [modalEmailContent, setModalEmailContent] = useState<any>(null);

  // Account Lifecycle State
  const [isDormant, setIsDormant] = useState(false);
  const [showDormancyModal, setShowDormancyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    try {
      const emailKey = loggedInAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
      
      const saved = localStorage.getItem('asset_tracker_registered_accounts');
      if (saved) {
        const accounts = JSON.parse(saved);
        const matched = accounts.find((a: any) => a.email.toLowerCase() === loggedInAccount.email.toLowerCase());
        if (matched && matched.status === 'dormant') {
          setIsDormant(true);
        }
      }
      
      const tfa = localStorage.getItem(`asset_tracker_tfa_${emailKey}`);
      if (tfa !== null) setTfaEnabled(tfa === 'true');
      
      const bio = localStorage.getItem(`asset_tracker_biometric_${emailKey}`);
      if (bio !== null) setBiometricEnabled(bio === 'true');
      
      const notif = localStorage.getItem(`asset_tracker_notifications_${emailKey}`);
      if (notif !== null) setNotifEnabled(notif === 'true');
    } catch (e) {
      console.error(e);
    }
  }, [loggedInAccount]);

  const confirmToggleDormancy = (makeDormant: boolean) => {
    try {
      const saved = localStorage.getItem('asset_tracker_registered_accounts');
      let accounts = saved ? JSON.parse(saved) : [];
      
      const hasAccount = accounts.some((a: any) => a.email.toLowerCase() === loggedInAccount.email.toLowerCase());
      if (!hasAccount) {
        accounts.push({
          username: loggedInAccount.email.split('@')[0],
          email: loggedInAccount.email.toLowerCase(),
          name: loggedInAccount.name || 'User',
          password: 'password',
          status: 'active'
        });
      }

      const updated = accounts.map((a: any) => {
        if (a.email.toLowerCase() === loggedInAccount.email.toLowerCase()) {
          return { ...a, status: makeDormant ? 'dormant' : 'active' };
        }
        return a;
      });

      localStorage.setItem('asset_tracker_registered_accounts', JSON.stringify(updated));
      setIsDormant(makeDormant);
      setShowDormancyModal(false);
      
      if (makeDormant) {
        onLogout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDeleteAccount = () => {
    try {
      const saved = localStorage.getItem('asset_tracker_registered_accounts');
      let accounts = saved ? JSON.parse(saved) : [];
      
      const filtered = accounts.filter((a: any) => a.email.toLowerCase() !== loggedInAccount.email.toLowerCase());
      localStorage.setItem('asset_tracker_registered_accounts', JSON.stringify(filtered));
      
      const emailKey = loggedInAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
      localStorage.removeItem(`asset_tracker_users_${emailKey}`);
      localStorage.removeItem(`asset_tracker_selected_user_ids_${emailKey}`);
      localStorage.removeItem(`asset_tracker_portfolio_${emailKey}`);
      localStorage.removeItem('asset_tracker_logged_in_account');
      
      setShowDeleteModal(false);
      onLogout();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioName.trim()) return;
    onAddPortfolio(newPortfolioName.trim());
    setNewPortfolioName('');
    setShowAddForm(false);
  };

  const handleSaveSecurity = () => {
    try {
      const emailKey = loggedInAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
      localStorage.setItem(`asset_tracker_tfa_${emailKey}`, String(tfaEnabled));
      localStorage.setItem(`asset_tracker_biometric_${emailKey}`, String(biometricEnabled));
      localStorage.setItem(`asset_tracker_notifications_${emailKey}`, String(notifEnabled));
      setIsSavedAlert(true);
      setTimeout(() => setIsSavedAlert(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const getUpcomingAlerts = () => {
    const today = new Date();
    const list: Array<{ name: string; type: 'FD' | 'Insurance' | 'EMI' | 'Loan'; date: string; daysLeft: number; amount: number; currency: string }> = [];
    
    (assetData.fixedDeposits || []).forEach(fd => {
      if (!fd.maturityDate) return;
      const mDate = new Date(fd.maturityDate);
      const diffTime = mDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Maturing within next 90 days
      if (diffDays >= -10 && diffDays <= 90) {
        list.push({
          name: `${fd.bankName} Fixed Deposit (No: ${fd.depositNumber || 'N/A'})`,
          type: 'FD',
          date: fd.maturityDate,
          daysLeft: diffDays,
          amount: fd.principal,
          currency: fd.currency || 'INR'
        });
      }
    });

    (assetData.insurances || []).forEach(ins => {
      if (!ins.dueDate) return;
      const dDate = new Date(ins.dueDate);
      const diffTime = dDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Premium due within next 90 days
      if (diffDays >= -10 && diffDays <= 90 && ins.status === 'Active') {
        list.push({
          name: `${ins.policyName} Premium (No: ${ins.policyNumber || 'N/A'})`,
          type: 'Insurance',
          date: ins.dueDate,
          daysLeft: diffDays,
          amount: ins.premiumAmount,
          currency: ins.currency || 'INR'
        });
      }
    });

    // 1. Monthly EMI Payments & 2. Loan Maturities Alerts
    (assetData.liabilities || []).forEach(loan => {
      // 1. Monthly EMI Payment Due Alert (based on start date's day of month)
      let dueDay = 5;
      if (loan.startDate) {
        const sDate = new Date(loan.startDate);
        if (!isNaN(sDate.getTime())) {
          dueDay = sDate.getDate();
        }
      }
      
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      let emiDueDate = new Date(currentYear, currentMonth, dueDay);
      
      // If payment has already passed for this month, monitor next month's due date
      if (emiDueDate.getTime() - today.getTime() < -2 * 24 * 60 * 60 * 1000) {
        emiDueDate = new Date(currentYear, currentMonth + 1, dueDay);
      }
      
      const diffTime = emiDueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= -2 && diffDays <= 15 && loan.monthlyPayment > 0) {
        list.push({
          name: `Monthly EMI Due: ${loan.lenderName} (${loan.liabilityType})`,
          type: 'EMI',
          date: emiDueDate.toISOString().split('T')[0],
          daysLeft: diffDays,
          amount: loan.monthlyPayment,
          currency: loan.currency || 'INR'
        });
      }

      // 2. Loan Maturity / Termination Alert (within next 90 days)
      if (loan.endDate) {
        const eDate = new Date(loan.endDate);
        if (!isNaN(eDate.getTime())) {
          const diffMaturityTime = eDate.getTime() - today.getTime();
          const diffMaturityDays = Math.ceil(diffMaturityTime / (1000 * 60 * 60 * 24));
          
          if (diffMaturityDays >= -10 && diffMaturityDays <= 90) {
            list.push({
              name: `Loan Account Maturity: ${loan.lenderName} (${loan.liabilityType})`,
              type: 'Loan',
              date: loan.endDate,
              daysLeft: diffMaturityDays,
              amount: loan.outstandingAmount,
              currency: loan.currency || 'INR'
            });
          }
        }
      }
    });

    return list.sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const handleTriggerSimulatedEmail = () => {
    const alerts = getUpcomingAlerts();
    const emailKey = loggedInAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
    
    setModalEmailContent({
      to: loggedInAccount.email,
      subject: `🚨 [Asset Tracker] Maturity & Premium Alerts for your Family Portfolio`,
      date: new Date().toLocaleString(),
      alerts: alerts
    });
    setShowEmailModal(true);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 4 chars long.' });
      return;
    }

    try {
      const saved = localStorage.getItem('asset_tracker_registered_accounts');
      let accounts = saved ? JSON.parse(saved) : [];
      
      const emailLower = loggedInAccount.email.toLowerCase();
      let accountIndex = accounts.findIndex((a: any) => a.email.toLowerCase() === emailLower);
      
      let actualCurrentPassword = 'password';
      if (accountIndex !== -1) {
        actualCurrentPassword = accounts[accountIndex].password || 'password';
      }

      if (currentPassword !== actualCurrentPassword) {
        setPasswordMessage({ type: 'error', text: 'Current password is incorrect.' });
        return;
      }

      if (accountIndex === -1) {
        // Logged in but not in local registry yet - create the entry
        accounts.push({
          username: loggedInAccount.email.split('@')[0],
          email: emailLower,
          name: loggedInAccount.name || 'User',
          password: newPassword,
          status: 'active'
        });
      } else {
        accounts[accountIndex].password = newPassword;
      }

      localStorage.setItem('asset_tracker_registered_accounts', JSON.stringify(accounts));
      setPasswordMessage({ type: 'success', text: 'Password successfully updated!' });
      
      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error(err);
      setPasswordMessage({ type: 'error', text: 'Failed to update password.' });
    }
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // 1. Bank Savings
      const bankData = (assetData.bankSavings || []).map(acc => ({
        'Bank Name': acc.bankName || '',
        'Account Type': acc.accountType || '',
        'Account Number': acc.accountNumber || '',
        'Balance': acc.balance || 0,
        'Interest Rate (%)': acc.interestRate || 0,
        'Currency': acc.currency || 'INR',
        'Notes': acc.notes || '',
        'Owner IDs': (acc.ownerIds || []).join(', ')
      }));
      const wsBank = XLSX.utils.json_to_sheet(bankData);
      XLSX.utils.book_append_sheet(wb, wsBank, 'Bank Savings');
      
      // 2. Fixed Deposits
      const fdData = (assetData.fixedDeposits || []).map(fd => ({
        'Bank Name': fd.bankName || '',
        'Deposit Number': fd.depositNumber || '',
        'Principal': fd.principal || 0,
        'Interest Rate (%)': fd.interestRate || 0,
        'Start Date (YYYY-MM-DD)': fd.startDate || '',
        'Maturity Date (YYYY-MM-DD)': fd.maturityDate || '',
        'Currency': fd.currency || 'INR',
        'Notes': fd.notes || '',
        'Owner IDs': (fd.ownerIds || []).join(', ')
      }));
      const wsFD = XLSX.utils.json_to_sheet(fdData);
      XLSX.utils.book_append_sheet(wb, wsFD, 'Fixed Deposits');
      
      // 3. Mutual Funds
      const mfData = (assetData.mutualFunds || []).map(mf => ({
        'Fund Name': mf.fundName || '',
        'Category': mf.category || '',
        'Units': mf.units || 0,
        'Average NAV': mf.averageNav || 0,
        'Current NAV': mf.currentNav || 0,
        'Investment Type': mf.investmentType || 'Lumpsum',
        'Currency': mf.currency || 'INR',
        'Owner IDs': (mf.ownerIds || []).join(', ')
      }));
      const wsMF = XLSX.utils.json_to_sheet(mfData);
      XLSX.utils.book_append_sheet(wb, wsMF, 'Mutual Funds');

      // 4. Landed Estates (Immovable Assets)
      const propData = ((assetData as any).immovableAssets || []).map((p: any) => ({
        'Property Name': p.propertyName || '',
        'Property Type': p.propertyType || '',
        'Area': p.area || 0,
        'Unit': p.unit || 'sqft',
        'Location Name': p.locationName || '',
        'Latitude': p.latitude || 0,
        'Longitude': p.longitude || 0,
        'Estimated Value': p.estimatedValue || 0,
        'Currency': p.currency || 'INR',
        'Notes': p.notes || '',
        'Owner IDs': (p.ownerIds || []).join(', ')
      }));
      const wsProp = XLSX.utils.json_to_sheet(propData);
      XLSX.utils.book_append_sheet(wb, wsProp, 'Landed Estates');

      // 5. InsureShield Policies (Insurances)
      const insData = ((assetData as any).insurances || []).map((i: any) => ({
        'Policy Name': i.policyName || '',
        'Policy Type': i.policyType || '',
        'Policy Number': i.policyNumber || '',
        'Premium Amount': i.premiumAmount || 0,
        'Frequency': i.frequency || 'Annually',
        'Sum Assured': i.sumAssured || 0,
        'Start Date (YYYY-MM-DD)': i.startDate || '',
        'Due Date (YYYY-MM-DD)': i.dueDate || '',
        'Status': i.status || 'Active',
        'Notes': i.notes || '',
        'Currency': i.currency || 'INR',
        'Owner IDs': (i.ownerIds || []).join(', ')
      }));
      const wsIns = XLSX.utils.json_to_sheet(insData);
      XLSX.utils.book_append_sheet(wb, wsIns, 'InsureShield');

      // 6. Gold & Ornaments
      const preciousData = (assetData.preciousAssets || []).map(p => ({
        'Asset Name': p.name || '',
        'Metal/Asset Type': p.type || 'Gold',
        'Weight/Value': p.weight || 0,
        'Unit': p.unit || 'grams',
        'Purity/Karat': p.karat || p.purity || '',
        'Purchase Price': p.purchasePrice || 0,
        'Purchase Currency': p.purchaseCurrency || 'INR',
        'Notes': p.notes || '',
        'Owner IDs': (p.ownerIds || []).join(', ')
      }));
      const wsPrecious = XLSX.utils.json_to_sheet(preciousData);
      XLSX.utils.book_append_sheet(wb, wsPrecious, 'Gold & Ornaments');

      // 7. Liability Ledger (Loans & Debts)
      const liabilityData = (assetData.liabilities || []).map(l => ({
        'Lender Name': l.lenderName || '',
        'Liability Type': l.liabilityType || 'Loan',
        'Total Loan Amount': l.totalAmount || 0,
        'Outstanding Amount': l.outstandingAmount || 0,
        'Interest Rate (%)': l.interestRate || 0,
        'Monthly EMI': l.monthlyPayment || 0,
        'Start Date (YYYY-MM-DD)': l.startDate || '',
        'End Date (YYYY-MM-DD)': l.endDate || '',
        'Currency': l.currency || 'INR',
        'Notes': l.notes || '',
        'Owner IDs': (l.ownerIds || []).join(', ')
      }));
      const wsLiability = XLSX.utils.json_to_sheet(liabilityData);
      XLSX.utils.book_append_sheet(wb, wsLiability, 'Liability Ledger');
      
      XLSX.writeFile(wb, 'Asset_Tracker_Backup.xlsx');
      setStatusMessage({
        type: 'success',
        text: 'All asset data successfully exported to Excel (.xlsx)!'
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e) {
      console.error(e);
      setStatusMessage({
        type: 'error',
        text: 'Failed to export to Excel file.'
      });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      const bankSample = [
        {
          'Bank Name': 'SBI',
          'Account Type': 'Savings',
          'Account Number': '30012345678',
          'Balance': 75000,
          'Interest Rate (%)': 3.0,
          'Currency': 'INR',
          'Notes': 'Emergency Fund',
          'Owner IDs': 'Ramesh'
        }
      ];
      const wsBank = XLSX.utils.json_to_sheet(bankSample);
      XLSX.utils.book_append_sheet(wb, wsBank, 'Bank Savings');
      
      const fdSample = [
        {
          'Bank Name': 'SBI',
          'Deposit Number': 'FD882314',
          'Principal': 100000,
          'Interest Rate (%)': 6.8,
          'Start Date (YYYY-MM-DD)': '2025-04-01',
          'Maturity Date (YYYY-MM-DD)': '2026-04-01',
          'Currency': 'INR',
          'Notes': 'Tax saving FD',
          'Owner IDs': 'Anita'
        }
      ];
      const wsFD = XLSX.utils.json_to_sheet(fdSample);
      XLSX.utils.book_append_sheet(wb, wsFD, 'Fixed Deposits');
      
      const mfSample = [
        {
          'Fund Name': 'HDFC Index Fund Nifty 50 Direct',
          'Category': 'Index Fund',
          'Units': 550,
          'Average NAV': 42.50,
          'Current NAV': 48.90,
          'Investment Type': 'SIP',
          'Currency': 'INR',
          'Owner IDs': 'Ramesh, Anita'
        }
      ];
      const wsMF = XLSX.utils.json_to_sheet(mfSample);
      XLSX.utils.book_append_sheet(wb, wsMF, 'Mutual Funds');

      const propSample = [
        {
          'Property Name': 'Prestige Apartment',
          'Property Type': 'Residential',
          'Area': 1500,
          'Unit': 'sqft',
          'Location Name': 'Whitefield, Bangalore',
          'Latitude': 12.9845,
          'Longitude': 77.7324,
          'Estimated Value': 12000000,
          'Currency': 'INR',
          'Notes': 'Family Flat',
          'Owner IDs': 'Ramesh, Anita'
        }
      ];
      const wsProp = XLSX.utils.json_to_sheet(propSample);
      XLSX.utils.book_append_sheet(wb, wsProp, 'Landed Estates');

      const insSample = [
        {
          'Policy Name': 'LIC Endowment Plan',
          'Policy Type': 'Life (LIC)',
          'Policy Number': 'LIC-123456',
          'Premium Amount': 15000,
          'Frequency': 'Annually',
          'Sum Assured': 500000,
          'Start Date (YYYY-MM-DD)': '2020-05-15',
          'Due Date (YYYY-MM-DD)': '2028-05-15',
          'Status': 'Active',
          'Notes': 'Endowment plan',
          'Currency': 'INR',
          'Owner IDs': 'Ramesh'
        }
      ];
      const wsIns = XLSX.utils.json_to_sheet(insSample);
      XLSX.utils.book_append_sheet(wb, wsIns, 'InsureShield');

      const preciousSample = [
        {
          'Asset Name': 'Bridal Gold Necklace',
          'Metal/Asset Type': 'Gold',
          'Weight/Value': 45,
          'Unit': 'grams',
          'Purity/Karat': '22K',
          'Purchase Price': 225000,
          'Purchase Currency': 'INR',
          'Notes': 'Wedding Jewelry',
          'Owner IDs': 'Anita'
        },
        {
          'Asset Name': 'Heritage Diamond Ring',
          'Metal/Asset Type': 'Diamond',
          'Weight/Value': 1.5,
          'Unit': 'carats',
          'Purity/Karat': 'Round',
          'Purchase Price': 180000,
          'Purchase Currency': 'INR',
          'Notes': 'Engagement Ring',
          'Owner IDs': 'Ramesh'
        }
      ];
      const wsPrecious = XLSX.utils.json_to_sheet(preciousSample);
      XLSX.utils.book_append_sheet(wb, wsPrecious, 'Gold & Ornaments');

      const liabilitySample = [
        {
          'Lender Name': 'HDFC Bank',
          'Liability Type': 'Home Loan',
          'Total Loan Amount': 4500000,
          'Outstanding Amount': 3800000,
          'Interest Rate (%)': 8.65,
          'Monthly EMI': 35000,
          'Start Date (YYYY-MM-DD)': '2023-01-15',
          'End Date (YYYY-MM-DD)': '2038-01-15',
          'Currency': 'INR',
          'Notes': 'Apartment Mortgage',
          'Owner IDs': 'Ramesh, Anita'
        },
        {
          'Lender Name': 'ICICI Credit Card',
          'Liability Type': 'Credit Card',
          'Total Loan Amount': 150000,
          'Outstanding Amount': 24000,
          'Interest Rate (%)': 15.0,
          'Monthly EMI': 5000,
          'Start Date (YYYY-MM-DD)': '2025-01-01',
          'End Date (YYYY-MM-DD)': '2025-12-31',
          'Currency': 'INR',
          'Notes': 'Laptop EMI',
          'Owner IDs': 'Ramesh'
        }
      ];
      const wsLiability = XLSX.utils.json_to_sheet(liabilitySample);
      XLSX.utils.book_append_sheet(wb, wsLiability, 'Liability Ledger');
      
      XLSX.writeFile(wb, 'Asset_Tracker_Template.xlsx');
      setStatusMessage({
        type: 'success',
        text: 'Excel template downloaded! Fill it out and upload.'
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e) {
      console.error(e);
      setStatusMessage({
        type: 'error',
        text: 'Failed to generate Excel template.'
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImportFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImportFile(file);
    }
  };

  const processImportFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        
        const workbook = XLSX.read(data, { type: 'binary' });
        
        let importedBank: BankAccount[] = [];
        let importedFD: FixedDeposit[] = [];
        let importedMF: MutualFund[] = [];
        let importedProp: ImmovableAsset[] = [];
        let importedIns: InsurancePolicy[] = [];
        let importedPrecious: PreciousAsset[] = [];
        let importedLiability: Liability[] = [];
        
        let parsedSomeSheet = false;
        
        const parseOwners = (val: any): string[] => {
          if (!val) {
            return portfolios.length > 0 ? [portfolios[0].id] : ['default'];
          }
          return String(val)
            .split(',')
            .map(s => s.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
            .filter(Boolean);
        };
        
        const sheetNames = workbook.SheetNames;
        
        if (sheetNames.length === 1) {
          const sheetName = sheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<any>(sheet);
          
          if (rows.length > 0) {
            const firstRow = rows[0];
            const hasBalance = 'Balance' in firstRow || 'balance' in firstRow || 'Account Type' in firstRow || 'Bank Name' in firstRow && 'Account Number' in firstRow;
            const hasPrincipal = 'Principal' in firstRow || 'principal' in firstRow || 'Deposit Number' in firstRow || 'Maturity Date' in firstRow;
            const hasUnits = 'Units' in firstRow || 'units' in firstRow || 'Fund Name' in firstRow || 'Current NAV' in firstRow;
            const hasImmovable = 'Property Name' in firstRow || 'propertyName' in firstRow || ('Estimated Value' in firstRow && 'Area' in firstRow);
            const hasInsurance = 'Policy Name' in firstRow || 'policyName' in firstRow || 'Policy Number' in firstRow || 'Sum Assured' in firstRow;
            const hasPrecious = 'Asset Name' in firstRow || 'assetName' in firstRow || 'Metal/Asset Type' in firstRow || 'Weight/Value' in firstRow;
            const hasLiability = 'Lender Name' in firstRow || 'lenderName' in firstRow || 'Outstanding Amount' in firstRow || 'Monthly EMI' in firstRow;
            
            if (hasBalance && !hasPrincipal && !hasUnits) {
              importedBank = rows.map((row, idx) => ({
                id: `bank-${Date.now()}-${idx}`,
                bankName: String(row['Bank Name'] || row['bankName'] || 'Unknown Bank'),
                accountType: String(row['Account Type'] || row['accountType'] || 'Savings'),
                accountNumber: String(row['Account Number'] || row['accountNumber'] || ''),
                balance: Number(row['Balance'] !== undefined ? row['Balance'] : (row['balance'] !== undefined ? row['balance'] : 0)),
                interestRate: Number(row['Interest Rate (%)'] !== undefined ? row['Interest Rate (%)'] : (row['interestRate'] !== undefined ? row['interestRate'] : 0)),
                currency: (row['Currency'] || row['currency'] || 'INR') as any,
                notes: row['Notes'] || row['notes'] || undefined,
                ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
              }));
              parsedSomeSheet = true;
            } else if (hasPrincipal) {
              importedFD = rows.map((row, idx) => ({
                id: `fd-${Date.now()}-${idx}`,
                bankName: String(row['Bank Name'] || row['bankName'] || 'Unknown Bank'),
                depositNumber: String(row['Deposit Number'] || row['depositNumber'] || ''),
                principal: Number(row['Principal'] !== undefined ? row['Principal'] : (row['principal'] !== undefined ? row['principal'] : 0)),
                interestRate: Number(row['Interest Rate (%)'] !== undefined ? row['Interest Rate (%)'] : (row['interestRate'] !== undefined ? row['interestRate'] : 0)),
                startDate: String(row['Start Date (YYYY-MM-DD)'] || row['startDate'] || new Date().toISOString().split('T')[0]),
                maturityDate: String(row['Maturity Date (YYYY-MM-DD)'] || row['maturityDate'] || new Date().toISOString().split('T')[0]),
                currency: (row['Currency'] || row['currency'] || 'INR') as any,
                notes: row['Notes'] || row['notes'] || undefined,
                ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
              }));
              parsedSomeSheet = true;
            } else if (hasUnits) {
              importedMF = rows.map((row, idx) => ({
                id: `mf-${Date.now()}-${idx}`,
                fundName: String(row['Fund Name'] || row['fundName'] || 'Unknown Fund'),
                category: String(row['Category'] || row['category'] || 'Equity'),
                units: Number(row['Units'] !== undefined ? row['Units'] : (row['units'] !== undefined ? row['units'] : 0)),
                averageNav: Number(row['Average NAV'] !== undefined ? row['Average NAV'] : (row['averageNav'] !== undefined ? row['averageNav'] : 0)),
                currentNav: Number(row['Current NAV'] !== undefined ? row['Current NAV'] : (row['currentNav'] !== undefined ? row['currentNav'] : 0)),
                currency: (row['Currency'] || row['currency'] || 'INR') as any,
                ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
              }));
              parsedSomeSheet = true;
            } else if (hasImmovable) {
              importedProp = rows.map((row, idx) => ({
                id: `prop-${Date.now()}-${idx}`,
                propertyName: String(row['Property Name'] || row['propertyName'] || 'Unknown Property'),
                propertyType: String(row['Property Type'] || row['propertyType'] || 'Residential'),
                area: Number(row['Area'] !== undefined ? row['Area'] : (row['area'] !== undefined ? row['area'] : 0)),
                unit: (row['Unit'] || row['unit'] || 'sqft') as any,
                locationName: String(row['Location Name'] || row['locationName'] || ''),
                latitude: Number(row['Latitude'] !== undefined ? row['Latitude'] : (row['latitude'] !== undefined ? row['latitude'] : 0)),
                longitude: Number(row['Longitude'] !== undefined ? row['Longitude'] : (row['longitude'] !== undefined ? row['longitude'] : 0)),
                estimatedValue: Number(row['Estimated Value'] !== undefined ? row['Estimated Value'] : (row['estimatedValue'] !== undefined ? row['estimatedValue'] : 0)),
                currency: (row['Currency'] || row['currency'] || 'INR') as any,
                notes: row['Notes'] || row['notes'] || undefined,
                ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
              }));
              parsedSomeSheet = true;
            } else if (hasInsurance) {
              importedIns = rows.map((row, idx) => ({
                id: `ins-${Date.now()}-${idx}`,
                policyName: String(row['Policy Name'] || row['policyName'] || 'Unknown Policy'),
                policyType: String(row['Policy Type'] || row['policyType'] || 'Life (LIC)'),
                policyNumber: String(row['Policy Number'] || row['policyNumber'] || ''),
                premiumAmount: Number(row['Premium Amount'] !== undefined ? row['Premium Amount'] : (row['premiumAmount'] !== undefined ? row['premiumAmount'] : 0)),
                frequency: (row['Frequency'] || row['frequency'] || 'Annually') as any,
                sumAssured: Number(row['Sum Assured'] !== undefined ? row['Sum Assured'] : (row['sumAssured'] !== undefined ? row['sumAssured'] : 0)),
                startDate: String(row['Start Date (YYYY-MM-DD)'] || row['startDate'] || ''),
                dueDate: String(row['Due Date (YYYY-MM-DD)'] || row['dueDate'] || ''),
                status: (row['Status'] || row['status'] || 'Active') as any,
                notes: row['Notes'] || row['notes'] || undefined,
                currency: (row['Currency'] || row['currency'] || 'INR') as any,
                ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
              }));
              parsedSomeSheet = true;
            } else if (hasPrecious) {
              importedPrecious = rows.map((row, idx) => {
                const karatVal = String(row['Purity/Karat'] || row['purity'] || row['karat'] || '');
                const isGold = String(row['Metal/Asset Type'] || row['type'] || 'Gold').toLowerCase() === 'gold';
                const isSilver = String(row['Metal/Asset Type'] || row['type'] || '').toLowerCase() === 'silver';
                return {
                  id: `precious-${Date.now()}-${idx}`,
                  name: String(row['Asset Name'] || row['name'] || 'Unknown Ornament'),
                  type: (row['Metal/Asset Type'] || row['type'] || 'Gold') as any,
                  weight: Number(row['Weight/Value'] !== undefined ? row['Weight/Value'] : (row['weight'] !== undefined ? row['weight'] : 0)),
                  unit: (row['Unit'] || row['unit'] || 'grams') as any,
                  karat: isGold ? (karatVal as any) : undefined,
                  purity: isSilver ? (karatVal as any) : undefined,
                  purchasePrice: Number(row['Purchase Price'] !== undefined ? row['Purchase Price'] : (row['purchasePrice'] !== undefined ? row['purchasePrice'] : 0)),
                  purchaseCurrency: (row['Purchase Currency'] || row['purchaseCurrency'] || 'INR') as any,
                  notes: row['Notes'] || row['notes'] || undefined,
                  ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
                };
              });
              parsedSomeSheet = true;
            } else if (hasLiability) {
              importedLiability = rows.map((row, idx) => ({
                id: `liability-${Date.now()}-${idx}`,
                lenderName: String(row['Lender Name'] || row['lenderName'] || 'Unknown Lender'),
                liabilityType: String(row['Liability Type'] || row['liabilityType'] || 'Loan') as any,
                totalAmount: Number(row['Total Loan Amount'] !== undefined ? row['Total Loan Amount'] : (row['totalAmount'] !== undefined ? row['totalAmount'] : 0)),
                outstandingAmount: Number(row['Outstanding Amount'] !== undefined ? row['Outstanding Amount'] : (row['outstandingAmount'] !== undefined ? row['outstandingAmount'] : 0)),
                interestRate: Number(row['Interest Rate (%)'] !== undefined ? row['Interest Rate (%)'] : (row['interestRate'] !== undefined ? row['interestRate'] : 0)),
                monthlyPayment: Number(row['Monthly EMI'] !== undefined ? row['Monthly EMI'] : (row['monthlyPayment'] !== undefined ? row['monthlyPayment'] : 0)),
                startDate: String(row['Start Date (YYYY-MM-DD)'] || row['startDate'] || ''),
                endDate: String(row['End Date (YYYY-MM-DD)'] || row['endDate'] || ''),
                currency: (row['Currency'] || row['currency'] || 'INR') as any,
                notes: row['Notes'] || row['notes'] || undefined,
                ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
              }));
              parsedSomeSheet = true;
            }
          }
        } else {
          // Multi-sheet Excel workbook
          const bankSheetName = sheetNames.find(n => n.toLowerCase().includes('bank') || n.toLowerCase().includes('saving'));
          if (bankSheetName) {
            const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[bankSheetName]);
            importedBank = rows.map((row, idx) => ({
              id: `bank-${Date.now()}-${idx}`,
              bankName: String(row['Bank Name'] || row['bankName'] || 'Unknown Bank'),
              accountType: String(row['Account Type'] || row['accountType'] || 'Savings'),
              accountNumber: String(row['Account Number'] || row['accountNumber'] || ''),
              balance: Number(row['Balance'] !== undefined ? row['Balance'] : (row['balance'] !== undefined ? row['balance'] : 0)),
              interestRate: Number(row['Interest Rate (%)'] !== undefined ? row['Interest Rate (%)'] : (row['interestRate'] !== undefined ? row['interestRate'] : 0)),
              currency: (row['Currency'] || row['currency'] || 'INR') as any,
              notes: row['Notes'] || row['notes'] || undefined,
              ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
            }));
            parsedSomeSheet = true;
          }
          
          const fdSheetName = sheetNames.find(n => n.toLowerCase().includes('deposit') || n.toLowerCase().includes('fixed') || n.toLowerCase() === 'fd');
          if (fdSheetName) {
            const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[fdSheetName]);
            importedFD = rows.map((row, idx) => ({
              id: `fd-${Date.now()}-${idx}`,
              bankName: String(row['Bank Name'] || row['bankName'] || 'Unknown Bank'),
              depositNumber: String(row['Deposit Number'] || row['depositNumber'] || ''),
              principal: Number(row['Principal'] !== undefined ? row['Principal'] : (row['principal'] !== undefined ? row['principal'] : 0)),
              interestRate: Number(row['Interest Rate (%)'] !== undefined ? row['Interest Rate (%)'] : (row['interestRate'] !== undefined ? row['interestRate'] : 0)),
              startDate: String(row['Start Date (YYYY-MM-DD)'] || row['startDate'] || new Date().toISOString().split('T')[0]),
              maturityDate: String(row['Maturity Date (YYYY-MM-DD)'] || row['maturityDate'] || new Date().toISOString().split('T')[0]),
              currency: (row['Currency'] || row['currency'] || 'INR') as any,
              notes: row['Notes'] || row['notes'] || undefined,
              ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
            }));
            parsedSomeSheet = true;
          }
          
          const mfSheetName = sheetNames.find(n => n.toLowerCase().includes('fund') || n.toLowerCase().includes('mutual') || n.toLowerCase() === 'mf');
          if (mfSheetName) {
            const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[mfSheetName]);
            importedMF = rows.map((row, idx) => ({
              id: `mf-${Date.now()}-${idx}`,
              fundName: String(row['Fund Name'] || row['fundName'] || 'Unknown Fund'),
              category: String(row['Category'] || row['category'] || 'Equity'),
              units: Number(row['Units'] !== undefined ? row['Units'] : (row['units'] !== undefined ? row['units'] : 0)),
              averageNav: Number(row['Average NAV'] !== undefined ? row['Average NAV'] : (row['averageNav'] !== undefined ? row['averageNav'] : 0)),
              currentNav: Number(row['Current NAV'] !== undefined ? row['Current NAV'] : (row['currentNav'] !== undefined ? row['currentNav'] : 0)),
              investmentType: (row['Investment Type'] || row['investmentType'] || 'Lumpsum') as any,
              currency: (row['Currency'] || row['currency'] || 'INR') as any,
              ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
            }));
            parsedSomeSheet = true;
          }

          const propSheetName = sheetNames.find(n => n.toLowerCase().includes('land') || n.toLowerCase().includes('property') || n.toLowerCase().includes('estate') || n.toLowerCase() === 'prop');
          if (propSheetName) {
            const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[propSheetName]);
            importedProp = rows.map((row, idx) => ({
              id: `prop-${Date.now()}-${idx}`,
              propertyName: String(row['Property Name'] || row['propertyName'] || 'Unknown Property'),
              propertyType: String(row['Property Type'] || row['propertyType'] || 'Residential'),
              area: Number(row['Area'] !== undefined ? row['Area'] : (row['area'] !== undefined ? row['area'] : 0)),
              unit: (row['Unit'] || row['unit'] || 'sqft') as any,
              locationName: String(row['Location Name'] || row['locationName'] || ''),
              latitude: Number(row['Latitude'] !== undefined ? row['Latitude'] : (row['latitude'] !== undefined ? row['latitude'] : 0)),
              longitude: Number(row['Longitude'] !== undefined ? row['Longitude'] : (row['longitude'] !== undefined ? row['longitude'] : 0)),
              estimatedValue: Number(row['Estimated Value'] !== undefined ? row['Estimated Value'] : (row['estimatedValue'] !== undefined ? row['estimatedValue'] : 0)),
              currency: (row['Currency'] || row['currency'] || 'INR') as any,
              notes: row['Notes'] || row['notes'] || undefined,
              ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
            }));
            parsedSomeSheet = true;
          }

          const insSheetName = sheetNames.find(n => n.toLowerCase().includes('insur') || n.toLowerCase().includes('policy') || n.toLowerCase().includes('lic') || n.toLowerCase() === 'ins');
          if (insSheetName) {
            const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[insSheetName]);
            importedIns = rows.map((row, idx) => ({
              id: `ins-${Date.now()}-${idx}`,
              policyName: String(row['Policy Name'] || row['policyName'] || 'Unknown Policy'),
              policyType: String(row['Policy Type'] || row['policyType'] || 'Life (LIC)'),
              policyNumber: String(row['Policy Number'] || row['policyNumber'] || ''),
              premiumAmount: Number(row['Premium Amount'] !== undefined ? row['Premium Amount'] : (row['premiumAmount'] !== undefined ? row['premiumAmount'] : 0)),
              frequency: (row['Frequency'] || row['frequency'] || 'Annually') as any,
              sumAssured: Number(row['Sum Assured'] !== undefined ? row['Sum Assured'] : (row['sumAssured'] !== undefined ? row['sumAssured'] : 0)),
              startDate: String(row['Start Date (YYYY-MM-DD)'] || row['startDate'] || ''),
              dueDate: String(row['Due Date (YYYY-MM-DD)'] || row['dueDate'] || ''),
              status: (row['Status'] || row['status'] || 'Active') as any,
              notes: row['Notes'] || row['notes'] || undefined,
              currency: (row['Currency'] || row['currency'] || 'INR') as any,
              ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
            }));
            parsedSomeSheet = true;
          }

          const preciousSheetName = sheetNames.find(n => n.toLowerCase().includes('gold') || n.toLowerCase().includes('ornament') || n.toLowerCase().includes('precious') || n.toLowerCase() === 'precious');
          if (preciousSheetName) {
            const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[preciousSheetName]);
            importedPrecious = rows.map((row, idx) => {
              const karatVal = String(row['Purity/Karat'] || row['purity'] || row['karat'] || '');
              const isGold = String(row['Metal/Asset Type'] || row['type'] || 'Gold').toLowerCase() === 'gold';
              const isSilver = String(row['Metal/Asset Type'] || row['type'] || '').toLowerCase() === 'silver';
              
              return {
                id: `precious-${Date.now()}-${idx}`,
                name: String(row['Asset Name'] || row['name'] || 'Unknown Ornament'),
                type: (row['Metal/Asset Type'] || row['type'] || 'Gold') as any,
                weight: Number(row['Weight/Value'] !== undefined ? row['Weight/Value'] : (row['weight'] !== undefined ? row['weight'] : 0)),
                unit: (row['Unit'] || row['unit'] || 'grams') as any,
                karat: isGold ? (karatVal as any) : undefined,
                purity: isSilver ? (karatVal as any) : undefined,
                purchasePrice: Number(row['Purchase Price'] !== undefined ? row['Purchase Price'] : (row['purchasePrice'] !== undefined ? row['purchasePrice'] : 0)),
                purchaseCurrency: (row['Purchase Currency'] || row['purchaseCurrency'] || 'INR') as any,
                notes: row['Notes'] || row['notes'] || undefined,
                ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
              };
            });
            parsedSomeSheet = true;
          }

          const liabilitySheetName = sheetNames.find(n => n.toLowerCase().includes('liabilit') || n.toLowerCase().includes('loan') || n.toLowerCase().includes('debt') || n.toLowerCase() === 'liability');
          if (liabilitySheetName) {
            const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[liabilitySheetName]);
            importedLiability = rows.map((row, idx) => ({
              id: `liability-${Date.now()}-${idx}`,
              lenderName: String(row['Lender Name'] || row['lenderName'] || 'Unknown Lender'),
              liabilityType: String(row['Liability Type'] || row['liabilityType'] || 'Loan') as any,
              totalAmount: Number(row['Total Loan Amount'] !== undefined ? row['Total Loan Amount'] : (row['totalAmount'] !== undefined ? row['totalAmount'] : 0)),
              outstandingAmount: Number(row['Outstanding Amount'] !== undefined ? row['Outstanding Amount'] : (row['outstandingAmount'] !== undefined ? row['outstandingAmount'] : 0)),
              interestRate: Number(row['Interest Rate (%)'] !== undefined ? row['Interest Rate (%)'] : (row['interestRate'] !== undefined ? row['interestRate'] : 0)),
              monthlyPayment: Number(row['Monthly EMI'] !== undefined ? row['Monthly EMI'] : (row['monthlyPayment'] !== undefined ? row['monthlyPayment'] : 0)),
              startDate: String(row['Start Date (YYYY-MM-DD)'] || row['startDate'] || ''),
              endDate: String(row['End Date (YYYY-MM-DD)'] || row['endDate'] || ''),
              currency: (row['Currency'] || row['currency'] || 'INR') as any,
              notes: row['Notes'] || row['notes'] || undefined,
              ownerIds: parseOwners(row['Owner IDs'] || row['ownerIds'])
            }));
            parsedSomeSheet = true;
          }
        }
        
        if (!parsedSomeSheet && importedBank.length === 0 && importedFD.length === 0 && importedMF.length === 0 && importedProp.length === 0 && importedIns.length === 0 && importedPrecious.length === 0 && importedLiability.length === 0) {
          setStatusMessage({
            type: 'error',
            text: 'Could not find readable assets sheet/columns. Download the template for reference!'
          });
          return;
        }
        
        let mergedData: AssetData;
        if (importMode === 'overwrite') {
          mergedData = {
            bankSavings: importedBank,
            fixedDeposits: importedFD,
            mutualFunds: importedMF,
            immovableAssets: importedProp,
            insurances: importedIns,
            preciousAssets: importedPrecious,
            liabilities: importedLiability
          };
        } else {
          mergedData = {
            bankSavings: [...(assetData.bankSavings || []), ...importedBank],
            fixedDeposits: [...(assetData.fixedDeposits || []), ...importedFD],
            mutualFunds: [...(assetData.mutualFunds || []), ...importedMF],
            immovableAssets: [...((assetData as any).immovableAssets || []), ...importedProp],
            insurances: [...((assetData as any).insurances || []), ...importedIns],
            preciousAssets: [...(assetData.preciousAssets || []), ...importedPrecious],
            liabilities: [...((assetData as any).liabilities || []), ...importedLiability]
          };
        }
        
        onImportAssetData(mergedData);
        
        const totalCount = importedBank.length + importedFD.length + importedMF.length + importedProp.length + importedIns.length + importedPrecious.length + importedLiability.length;
        setStatusMessage({
          type: 'success',
          text: `Success! Imported ${totalCount} records (${importedBank.length} savings, ${importedFD.length} deposits, ${importedMF.length} funds, ${importedProp.length} estates, ${importedIns.length} insurances, ${importedPrecious.length} ornaments, ${importedLiability.length} liabilities).`
        });
        setTimeout(() => setStatusMessage(null), 6000);
        
      } catch (err) {
        console.error(err);
        setStatusMessage({
          type: 'error',
          text: 'Error processing your file. Please ensure it is a valid .csv or .xlsx file.'
        });
        setTimeout(() => setStatusMessage(null), 6000);
      }
    };
    
    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'Failed to read the file.'
      });
    };
    
    reader.readAsBinaryString(file);
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
                {realDevice.isMobile ? (
                  <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                ) : (
                  <Laptop className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{realDevice.os} {realDevice.browser}</span>
                    <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Current Session
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {realLocation}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Active Now</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50/40 dark:bg-slate-900/15 border border-slate-100 dark:border-slate-850 rounded-2xl">
                {!realDevice.isMobile ? (
                  <Smartphone className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                ) : (
                  <Laptop className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{realDevice.isMobile ? 'macOS Workstation' : 'iPhone 15 Mobile Web'}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">2 hours ago</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {realLocation}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last active 10:24 AM</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Data Management Card */}
          <div className="rounded-3xl glass-panel border border-white/30 dark:border-white/10 p-6 shadow-xl transform-gpu overflow-hidden space-y-5">
            <div>
              <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                <span>Backup & Data Management</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Export to multi-sheet Excel, download blank templates, or bulk upload assets.
              </p>
            </div>

            {/* Status alerts */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 shadow-sm ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-500 mt-0.5" />
                  )}
                  <span>{statusMessage.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-2xl text-xs transition-all border border-emerald-500/20 shadow-[0_4px_12px_-2px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <FileDown className="h-4.5 w-4.5" />
                <span>Export to Excel</span>
              </button>

              {/* Template Download */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-slate-850 dark:text-slate-200 font-extrabold rounded-2xl text-xs transition-all border border-slate-200 dark:border-slate-800 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Download className="h-4.5 w-4.5 text-indigo-500" />
                <span>Download Template</span>
              </button>
            </div>

            {/* Import Controls & Area */}
            <div className="border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/15 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Import Settings</span>
                
                {/* Append / Overwrite toggles */}
                <div className="flex items-center bg-slate-200/55 dark:bg-slate-800/60 p-0.5 rounded-xl text-[10px]">
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      importMode === 'append'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-750'
                    }`}
                  >
                    Append Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('overwrite')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      importMode === 'overwrite'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-750'
                    }`}
                    title="Warning: This clears all existing bank, fixed deposit, and mutual fund records!"
                  >
                    Overwrite
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('excel-file-uploader')?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-slate-250 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-750 bg-white/40 dark:bg-slate-900/10'
                }`}
              >
                <input
                  type="file"
                  id="excel-file-uploader"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <FileUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-850 dark:text-slate-200">
                    Drag and drop file here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                    Supports multi-sheet Excel (.xlsx, .xls) and single-table CSV (.csv)
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

              {/* Active Email Monitor Info */}
              {notifEnabled && (
                <div className="mt-3.5 pt-3.5 border-t border-slate-200/50 dark:border-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Maturity & premium alerts
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/15">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Active Engine
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Monitoring {getUpcomingAlerts().length} asset(s) maturing or premium due within 90 days.
                  </p>

                  <button
                    type="button"
                    onClick={handleTriggerSimulatedEmail}
                    className="w-full mt-1 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 border border-indigo-100/40 dark:border-indigo-900/30 cursor-pointer shadow-sm"
                  >
                    <Mail className="h-3 w-3" />
                    <span>Send Simulated Email Alert Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="rounded-3xl glass-panel border border-white/30 dark:border-white/10 p-6 shadow-xl relative transform-gpu overflow-hidden">
            <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-500" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-slate-400/70"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-slate-400/70"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-slate-400/70"
                />
              </div>

              <AnimatePresence>
                {passwordMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={`p-2.5 rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1.5 shadow-sm ${
                      passwordMessage.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {passwordMessage.type === 'success' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>{passwordMessage.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* Real-time Security Overview */}
          <div className="rounded-3xl glass-panel border border-white/30 dark:border-white/10 p-6 shadow-xl bg-gradient-to-tr from-slate-500/5 to-indigo-500/5 transform-gpu overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                Security Overview
              </h4>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/15">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live Monitoring
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-600 dark:text-slate-350">Data Security</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">AES-256 GCM</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-600 dark:text-slate-350">2FA Protection</span>
                <span className={`font-bold ${tfaEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`}>
                  {tfaEnabled ? 'Enabled & Secured' : 'Disabled (Bypassed)'}
                </span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-600 dark:text-slate-350">Biometric Verification</span>
                <span className={`font-bold ${biometricEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                  {biometricEnabled ? 'FaceID / TouchID Active' : 'Password Lock Only'}
                </span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-600 dark:text-slate-350">Maturity Alerts Engine</span>
                <span className={`font-bold ${notifEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {notifEnabled ? `Active (${getUpcomingAlerts().length} items monitored)` : 'Muted'}
                </span>
              </div>
              <div className="flex items-center justify-between font-medium pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                <span className="text-slate-600 dark:text-slate-350">Browser Key Store</span>
                <span className="font-mono text-[10px] text-slate-800 dark:text-slate-200">{realDevice.browser} LocalSandBox</span>
              </div>
            </div>
          </div>

          {/* Danger Zone / Account Lifecycle */}
          <div className="rounded-3xl glass-panel border border-rose-500/30 dark:border-rose-950/40 p-6 shadow-xl bg-gradient-to-tr from-rose-500/5 to-red-500/5 transform-gpu overflow-hidden">
            <h3 className="text-sm font-display font-black text-rose-600 dark:text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              <span>Account Management</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">Set Account Dormant</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium leading-normal">
                    Freeze portfolios, hide alerts, and freeze trackers temporarily. Reactivate anytime upon sign-in.
                  </span>
                </div>
                <button
                  type="button"
                  id="toggle-dormancy-btn"
                  onClick={() => setShowDormancyModal(true)}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 focus:outline-none cursor-pointer ${
                    isDormant ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                    isDormant ? 'left-[18px]' : 'left-0.5'
                  }`} />
                </button>
              </div>

              <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-xs block">Permanently Delete Account</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium leading-normal">
                    Purges your credentials, portfolios, and historical assets permanently. This action is irreversible.
                  </span>
                </div>
                <button
                  type="button"
                  id="delete-account-btn"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[10px] font-extrabold rounded-lg transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Dormancy Confirmation Modal */}
      <AnimatePresence>
        {showDormancyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDormancyModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 flex flex-col text-slate-800 dark:text-slate-100"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-display font-extrabold text-slate-900 dark:text-white mb-2">
                  {isDormant ? "Reactivate Account?" : "Freeze & Set Dormant?"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  {isDormant 
                    ? "Are you sure you want to reactivate your Family Asset Tracker account and unfreeze portfolios?"
                    : "This will temporarily freeze your family portfolios and logs. You will be signed out automatically, and can reactivate this account anytime by signing back in."
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  id="cancel-dormancy-btn"
                  onClick={() => setShowDormancyModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-dormancy-btn"
                  onClick={() => confirmToggleDormancy(!isDormant)}
                  className={`flex-1 py-2 text-white font-bold rounded-xl text-xs transition-all cursor-pointer ${
                    isDormant ? 'bg-indigo-650 hover:bg-indigo-600' : 'bg-amber-655 hover:bg-amber-600'
                  }`}
                >
                  {isDormant ? "Reactivate" : "Freeze Account"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 flex flex-col text-slate-800 dark:text-slate-100"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-display font-extrabold text-slate-900 dark:text-white mb-2">
                  Permanently Delete Account?
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl mb-4 text-left leading-normal">
                  🔥 DANGER ZONE: This will permanently purge your credentials, family portfolio profiles, and historical logs. This action is completely irreversible.
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Are you absolutely certain you want to proceed with deletion?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  id="cancel-delete-btn"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-delete-btn"
                  onClick={confirmDeleteAccount}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Permanently Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Simulated Email Notification Delivery Mockup */}
      <AnimatePresence>
        {showEmailModal && modalEmailContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmailModal(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col text-slate-800 dark:text-slate-100"
            >
              {/* Email App Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                    Incoming Simulated Email Alert
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-xs"
                >
                  ✕ Close
                </button>
              </div>

              {/* Email Metadata Headers */}
              <div className="p-4 bg-white dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-850 space-y-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <div>
                  <strong className="text-slate-700 dark:text-slate-200">From:</strong> Security Alert Daemon &lt;alerts@assettracker.local&gt;
                </div>
                <div>
                  <strong className="text-slate-700 dark:text-slate-200">To:</strong> {modalEmailContent.to}
                </div>
                <div>
                  <strong className="text-slate-700 dark:text-slate-200">Date:</strong> {modalEmailContent.date}
                </div>
                <div>
                  <strong className="text-slate-700 dark:text-slate-200">Subject:</strong> <span className="text-rose-600 dark:text-rose-400 font-bold">{modalEmailContent.subject}</span>
                </div>
              </div>

              {/* Email Client Body */}
              <div className="p-5 overflow-y-auto max-h-[350px] bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 space-y-4">
                <div className="space-y-1">
                  <p className="font-bold text-sm">Dear Portfolio Custodian,</p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    This is an automated advisory alert concerning fixed deposits and premium covenants connected to your registered family portfolio.
                  </p>
                </div>

                {modalEmailContent.alerts.length === 0 ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-2xl text-center space-y-1">
                    <p className="font-bold">✓ Safe Status: No immediate alerts</p>
                    <p className="text-[10px] text-slate-500">There are no fixed deposits maturing or premiums due within the next 90 days.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="font-bold text-slate-750 dark:text-slate-350 uppercase tracking-wider text-[10px]">
                      Upcoming Milestones & Premium Deliveries:
                    </p>
                    <div className="space-y-2">
                      {modalEmailContent.alerts.map((alert: any, idx: number) => {
                        const amountStr = alert.currency === 'INR' 
                          ? `₹${Number(alert.amount).toLocaleString('en-IN')}`
                          : alert.currency === 'USD' ? `$${Number(alert.amount).toLocaleString('en-US')}`
                          : `${alert.currency} ${Number(alert.amount).toLocaleString()}`;
                        return (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 ${
                              alert.daysLeft <= 15
                                ? 'bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-300'
                                : 'bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-xs block">{alert.name}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                                Due/Matures: {new Date(alert.date).toLocaleDateString()} 
                                <span className="font-bold">({alert.daysLeft} days left)</span>
                              </span>
                            </div>
                            <div className="text-right sm:text-right shrink-0">
                              <span className="font-mono font-bold text-xs block">{amountStr}</span>
                              <span className="text-[9px] uppercase tracking-wider font-extrabold bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-slate-700 dark:text-slate-300 inline-block">
                                {alert.type}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/40 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  <p>Securely transmitted from your sandbox local deployment environment. No actual emails leave your container workspace.</p>
                </div>
              </div>

              {/* Email Footer Drawer */}
              <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Dismiss Notification
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
