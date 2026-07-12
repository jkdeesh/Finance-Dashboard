import React, { useState, useEffect, useMemo } from 'react';
import { 
  AssetData, 
  TabType, 
  BankAccount, 
  FixedDeposit, 
  MutualFund, 
  CurrencyCode, 
  CURRENCIES, 
  WALLPAPERS, 
  Wallpaper, 
  convertCurrency,
  UserProfile
} from './types';
import { DashboardView } from './components/DashboardView';
import { BankSavingsView } from './components/BankSavingsView';
import { FixedDepositsView } from './components/FixedDepositsView';
import { MutualFundsView } from './components/MutualFundsView';
import { FullPageLoginView } from './components/FullPageLoginView';
import { AccountTabView } from './components/AccountTabView';
import { 
  LayoutDashboard, 
  PiggyBank, 
  Calendar, 
  BarChart4, 
  Menu, 
  X, 
  User, 
  Briefcase,
  HelpCircle,
  Image as ImageIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  LogIn,
  LogOut,
  Mail,
  Lock,
  ChevronsUpDown,
  Users,
  Landmark,
  TrendingUp,
  IndianRupee,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const RupeeCoin = ({ className, ...props }: any) => {
  return (
    <div className={`inline-flex items-center justify-center rounded-full border border-current shrink-0 p-[1px] aspect-square ${className || ''}`}>
      <IndianRupee className="h-[70%] w-[70%] stroke-[2.5]" {...props} />
    </div>
  );
};

const getBankLogo = (bankName: string) => {
  const mapping: Record<string, string> = {
    'ICICI Bank': 'icicibank.com',
    'HDFC Bank': 'hdfcbank.com',
    'IDFC First Bank': 'idfcfirstbank.com',
    'State Bank of India': 'sbi.co.in',
    'Deutsche Bank': 'deutsche-bank.de',
    'Deutsche Kreditbank Berlin': 'dkb.de'
  };
  
  const domain = mapping[bankName] || 'bank.com';
  return `https://img.logo.dev/${domain}?token=pk_your_token_here`; 
  // Note: Replace with a public URL or a free provider like:
  // return `https://logo.clearbit.com/${domain}`;
};

const LOCAL_STORAGE_KEY = 'asset_tracker_portfolio';

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'jagadeesh',
    name: 'Jagadeesh',
    initials: 'J',
    avatarColor: 'bg-indigo-600 text-white border-indigo-500'
  },
  {
    id: 'sreenithi',
    name: 'Sreenithi',
    initials: 'S',
    avatarColor: 'bg-emerald-600 text-white border-emerald-500'
  }
];

const DEFAULT_ASSET_DATA: AssetData = {
  bankSavings: [
    {
      id: 'sav-1',
      bankName: 'ICICI Bank',
      accountType: 'NRE Account',
      accountNumber: '••••',
      balance: 4591000,
      interestRate: 3.50,
      currency: 'INR',
      notes: 'Jagadeesh ICICI NRE',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'sav-2',
      bankName: 'ICICI Bank',
      accountType: 'NRO Account',
      accountNumber: '••••',
      balance: 32679,
      interestRate: 3.50,
      currency: 'INR',
      notes: 'Jagadeesh ICICI NRO',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'sav-3',
      bankName: 'HDFC Bank',
      accountType: 'Savings Account',
      accountNumber: '••••',
      balance: 38789,
      interestRate: 3.00,
      currency: 'INR',
      notes: 'Jagadeesh HDFC account',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'sav-4',
      bankName: 'ICICI Bank',
      accountType: 'Savings Account',
      accountNumber: '••••',
      balance: 143000,
      interestRate: 3.50,
      currency: 'INR',
      notes: 'Sreenithi ICICI account',
      ownerIds: ['sreenithi']
    },
    {
      id: 'sav-5',
      bankName: 'IDFC First Bank',
      accountType: 'Savings Account',
      accountNumber: '••••',
      balance: 682000,
      interestRate: 4.50,
      currency: 'INR',
      notes: 'Sreenithi IDFC account',
      ownerIds: ['sreenithi']
    },
    {
      id: 'sav-db',
      bankName: 'Deutsche Bank',
      accountType: 'Savings Account',
      accountNumber: '••••',
      balance: 7000,
      interestRate: 2.00,
      currency: 'EUR',
      notes: 'Deutsche Bank primary',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'sav-dkb',
      bankName: 'DKB',
      accountType: 'Checking Account',
      accountNumber: '••••',
      balance: 25000,
      interestRate: 1.50,
      currency: 'EUR',
      notes: 'DKB Cash',
      ownerIds: ['jagadeesh', 'sreenithi']
    }
  ],
  fixedDeposits: [
    {
      id: 'fd-1',
      bankName: 'HDFC Bank',
      depositNumber: 'HDFC - Jaggu FD1',
      principal: 110000,
      interestRate: 7.20,
      startDate: '2023-09-14',
      maturityDate: '2026-08-14',
      currency: 'INR',
      notes: 'Savings Category',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'fd-2',
      bankName: 'HDFC Bank',
      depositNumber: 'HDFC - Jaggu FD2',
      principal: 100000,
      interestRate: 7.35,
      startDate: '2024-10-30',
      maturityDate: '2027-09-30',
      currency: 'INR',
      notes: 'Savings Category',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'fd-3',
      bankName: 'ICICI Bank',
      depositNumber: 'ICICI - Jaggu FD1',
      principal: 55000,
      interestRate: 7.25,
      startDate: '2025-01-08',
      maturityDate: '2027-01-08',
      currency: 'INR',
      notes: 'Savings Category',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'fd-4',
      bankName: 'ICICI Bank',
      depositNumber: 'ICICI - Jaggu FD2',
      principal: 10000,
      interestRate: 6.25,
      startDate: '2026-04-24',
      maturityDate: '2027-04-25',
      currency: 'INR',
      notes: 'Savings Category',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'fd-5',
      bankName: 'ICICI Bank',
      depositNumber: 'ICICI - Sree FD 1',
      principal: 24125,
      interestRate: 6.25,
      startDate: '2025-09-09',
      maturityDate: '2026-09-09',
      currency: 'INR',
      notes: 'Savings Category',
      ownerIds: ['sreenithi']
    },
    {
      id: 'fd-6',
      bankName: 'ICICI Bank',
      depositNumber: 'ICICI - Sree FD2',
      principal: 10939,
      interestRate: 6.25,
      startDate: '2026-01-31',
      maturityDate: '2027-04-30',
      currency: 'INR',
      notes: 'Savings Category',
      ownerIds: ['sreenithi']
    },
    {
      id: 'fd-7',
      bankName: 'ICICI Bank',
      depositNumber: 'ICICI - Sree FD3',
      principal: 180000,
      interestRate: 7.25,
      startDate: '2025-04-14',
      maturityDate: '2026-10-14',
      currency: 'INR',
      notes: 'Savings Category',
      ownerIds: ['sreenithi']
    }
  ],
  mutualFunds: [
    {
      id: 'mf-1',
      fundName: 'HDFC',
      category: 'Equity Fund',
      units: 1000,
      averageNav: 106.00,
      currentNav: 187.07,
      currency: 'INR',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'mf-2',
      fundName: 'SUNDRAM MUTUAL',
      category: 'Equity Fund',
      units: 1000,
      averageNav: 51.00,
      currentNav: 51.38,
      currency: 'INR',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'mf-3',
      fundName: 'UTI MUTUAL',
      category: 'Equity Fund',
      units: 1000,
      averageNav: 68.00,
      currentNav: 73.97,
      currency: 'INR',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'mf-4',
      fundName: 'INVESCO INDIA CONTRA FUND',
      category: 'Equity Fund',
      units: 1000,
      averageNav: 50.00,
      currentNav: 54.87,
      currency: 'INR',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'mf-5',
      fundName: 'MOTILAL OSWAL LARGE MIDCAP',
      category: 'Equity Fund',
      units: 1000,
      averageNav: 50.00,
      currentNav: 62.91,
      currency: 'INR',
      ownerIds: ['jagadeesh']
    },
    {
      id: 'mf-6',
      fundName: 'NIPPON INDIA LARGE CAP FUND',
      category: 'Equity Fund',
      units: 1000,
      averageNav: 100.00,
      currentNav: 109.37,
      currency: 'INR',
      ownerIds: ['jagadeesh']
    }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [assetData, setAssetData] = useState<AssetData>(DEFAULT_ASSET_DATA);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('asset_tracker_currency');
      return (saved as CurrencyCode) || 'INR';
    } catch {
      return 'INR';
    }
  });
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('asset_tracker_wallpaper');
      return saved || 'coastal-sunset';
    } catch {
      return 'coastal-sunset';
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('asset_tracker_dark_mode');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    try {
      localStorage.setItem('asset_tracker_dark_mode', String(newValue));
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }
  };

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to toggle dark class on documentElement', e);
    }
  }, [isDarkMode]);

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('asset_tracker_users');
      if (saved) {
        const parsed = JSON.parse(saved) as UserProfile[];
        // Check if Sreenithi profile is present. If not, auto-restore the full default family profiles
        const hasSree = parsed.some(u => u.id === 'sreenithi');
        if (!hasSree) {
          return DEFAULT_USERS;
        }
        return parsed;
      }
      return DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('asset_tracker_selected_user_ids');
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        // Auto-select all if Sreenithi was missing
        if (!parsed.includes('sreenithi')) {
          return DEFAULT_USERS.map(u => u.id);
        }
        return parsed;
      }
      return DEFAULT_USERS.map(u => u.id);
    } catch {
      return DEFAULT_USERS.map(u => u.id);
    }
  });

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const [loggedInAccount, setLoggedInAccount] = useState<{ email: string; name?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('asset_tracker_logged_in_account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (loggedInAccount) {
        localStorage.setItem('asset_tracker_logged_in_account', JSON.stringify(loggedInAccount));
      } else {
        localStorage.removeItem('asset_tracker_logged_in_account');
      }
    } catch (e) {
      console.warn('Failed to save account state', e);
    }
  }, [loggedInAccount]);

  // Restore function to bring back all family profiles & default portfolio assets
  const handleRestoreJagadeesh = () => {
    setUsers(DEFAULT_USERS);
    setSelectedUserIds(DEFAULT_USERS.map(u => u.id));
    setAssetData(DEFAULT_ASSET_DATA);
    saveToLocalStorage(DEFAULT_ASSET_DATA);
    setIsAuthPopupOpen(false);
  };

  // If no profiles exist, automatically trigger the authentication signup popup
  useEffect(() => {
    if (users.length === 0) {
      setAuthMode('signup');
      setIsAuthPopupOpen(true);
    }
  }, [users.length]);

  useEffect(() => {
    try {
      localStorage.setItem('asset_tracker_users', JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('asset_tracker_selected_user_ids', JSON.stringify(selectedUserIds));
    } catch (e) {
      console.warn('Failed to save selected user IDs', e);
    }
  }, [selectedUserIds]);

  const [dynamicWallpapers, setDynamicWallpapers] = useState<Wallpaper[]>([]);
  const [isBgDropdownOpen, setIsBgDropdownOpen] = useState(false);
  const [isMobileBgDropdownOpen, setIsMobileBgDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchBingWallpapers = async () => {
      try {
        const response = await fetch(
          `https://api.allorigins.win/get?url=${encodeURIComponent(
            'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=10&mkt=en-US'
          )}`
        );
        if (!response.ok) throw new Error('CORS proxy failed');
        const data = await response.json();
        const parsed = JSON.parse(data.contents);
        if (parsed && Array.isArray(parsed.images)) {
          const bingWallpapers = parsed.images.map((img: any, idx: number) => {
            let cleanName = img.copyright ? img.copyright.split(' (')[0] : `Bing Daily ${idx + 1}`;
            if (cleanName.length > 22) {
              cleanName = cleanName.substring(0, 22) + '...';
            }
            return {
              id: `bing-${img.startdate || idx}`,
              name: cleanName,
              url: `https://www.bing.com${img.urlbase}_UHD.jpg`
            };
          });
          
          if (bingWallpapers.length > 0) {
            setDynamicWallpapers(bingWallpapers.slice(0, 10));
            return;
          }
        }
      } catch (err) {
        console.warn('Bing API fetch failed, using daily-seeded high-quality fallbacks', err);
      }
      
      // Fallback: Generate 10 daily seeded 4K images
      const today = new Date();
      const daySeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 31 + today.getDate();
      const categories = [
        'cyberpunk-street',
        'deep-space-nebula',
        'epic-mountain',
        'ocean-waves-aerial',
        'serene-forest',
        'golden-desert-dunes',
        'futuristic-cityscape',
        'coastal-sunset',
        'abstract-gradient',
        'minimalist-aesthetic'
      ];
      
      const fallbackWallpapers = categories.map((cat, idx) => {
        const sig = daySeed + idx;
        const name = cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return {
          id: `unsplash-daily-${idx}`,
          name: name,
          url: `https://images.unsplash.com/featured/3840x2160?sig=${sig}&q=80&auto=format&fit=crop&w=3840&q=${cat}`
        };
      });
      setDynamicWallpapers(fallbackWallpapers);
    };

    fetchBingWallpapers();
  }, []);

  const allWallpapers = [...WALLPAPERS.slice(0, 5), ...dynamicWallpapers];

  const handleCurrencyChange = (currency: CurrencyCode) => {
    setSelectedCurrency(currency);
    try {
      localStorage.setItem('asset_tracker_currency', currency);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWallpaperChange = (wallpaperId: string) => {
    setSelectedWallpaper(wallpaperId);
    try {
      localStorage.setItem('asset_tracker_wallpaper', wallpaperId);
    } catch (e) {
      console.error(e);
    }
  };

  // --- PERSISTENCE ---
  useEffect(() => {
    try {
      
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AssetData;
        const cleaned: AssetData = {
          bankSavings: parsed.bankSavings || [],
          fixedDeposits: parsed.fixedDeposits || [],
          mutualFunds: parsed.mutualFunds || []
        };
        
        // If they don't have any Sreenithi assets, let's merge Sreenithi & Priya assets from DEFAULT_ASSET_DATA
        const hasSreeAssets = (cleaned.fixedDeposits || []).some(d => d.ownerIds === 'sreenithi');
        if (!hasSreeAssets) {
          const merged: AssetData = {
            bankSavings: [
              ...cleaned.bankSavings,
              ...DEFAULT_ASSET_DATA.bankSavings.filter(acc => acc.ownerIds === 'sreenithi' || acc.ownerIds === 'priya')
            ],
            fixedDeposits: [
              ...cleaned.fixedDeposits,
              ...DEFAULT_ASSET_DATA.fixedDeposits.filter(dep => dep.ownerIds === 'sreenithi' || dep.ownerIds === 'priya')
            ],
            mutualFunds: [
              ...cleaned.mutualFunds,
              ...DEFAULT_ASSET_DATA.mutualFunds.filter(fund => fund.ownerIds === 'sreenithi' || fund.ownerIds === 'priya')
            ]
          };
          setAssetData(merged);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        } else {
          setAssetData(cleaned);
        }
      } else {
        setAssetData(DEFAULT_ASSET_DATA);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_ASSET_DATA));
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    }
  }, []);

  const saveToLocalStorage = (newData: AssetData) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  // --- BANK SAVINGS CONTROLLERS ---
  const handleAddSavings = (acc: BankAccount) => {
    const updated = {
      ...assetData,
      bankSavings: [...assetData.bankSavings, acc]
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleEditSavings = (edited: BankAccount) => {
    const updated = {
      ...assetData,
      bankSavings: assetData.bankSavings.map(acc => acc.id === edited.id ? edited : acc)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleDeleteSavings = (id: string) => {
    const updated = {
      ...assetData,
      bankSavings: assetData.bankSavings.filter(acc => acc.id !== id)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  // --- FIXED DEPOSITS CONTROLLERS ---
  const handleAddFD = (dep: FixedDeposit) => {
    const updated = {
      ...assetData,
      fixedDeposits: [...assetData.fixedDeposits, dep]
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleEditFD = (edited: FixedDeposit) => {
    const updated = {
      ...assetData,
      fixedDeposits: assetData.fixedDeposits.map(dep => dep.id === edited.id ? edited : dep)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleDeleteFD = (id: string) => {
    const updated = {
      ...assetData,
      fixedDeposits: assetData.fixedDeposits.filter(dep => dep.id !== id)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  // --- MUTUAL FUNDS CONTROLLERS ---
  const handleAddFund = (fund: MutualFund) => {
    const updated = {
      ...assetData,
      mutualFunds: [...assetData.mutualFunds, fund]
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleEditFund = (edited: MutualFund) => {
    const updated = {
      ...assetData,
      mutualFunds: assetData.mutualFunds.map(f => f.id === edited.id ? edited : f)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleDeleteFund = (id: string) => {
    const updated = {
      ...assetData,
      mutualFunds: assetData.mutualFunds.filter(f => f.id !== id)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const filteredAssetData = useMemo(() => {
    const isVisible = (item: { ownerIds?: string[] }) => {
      // If no ownerIds defined, show to everyone
      if (!item.ownerIds || item.ownerIds.length === 0) return true;
      
      // Check if there is any intersection between 
      // the asset's owners and the currently selected users
      return item.ownerIds.some(id => selectedUserIds.includes(id));
    };

    return {
      bankSavings: assetData.bankSavings.filter(isVisible),
      fixedDeposits: assetData.fixedDeposits.filter(isVisible),
      mutualFunds: assetData.mutualFunds.filter(isVisible),
    };
  }, [assetData, selectedUserIds]);

  // Calculate high-level stats for visual markers
  const totalBalance = 
    filteredAssetData.bankSavings.reduce((sum, item) => sum + convertCurrency(item.balance, item.currency || 'INR', selectedCurrency), 0) +
    filteredAssetData.fixedDeposits.reduce((sum, item) => sum + convertCurrency(item.principal, item.currency || 'INR', selectedCurrency), 0) +
    filteredAssetData.mutualFunds.reduce((sum, item) => sum + convertCurrency(item.units * item.currentNav, item.currency || 'INR', selectedCurrency), 0);

  // Tabs layout configs
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'savings' as TabType, label: 'Bank Savings', icon: Landmark },
    { id: 'deposits' as TabType, label: 'Fixed Deposits', icon: RupeeCoin },
    { id: 'funds' as TabType, label: 'Mutual Funds', icon: TrendingUp },
    { id: 'account' as TabType, label: 'Accounts', icon: User },
  ];

  const activeWallpaper = allWallpapers.find(w => w.id === selectedWallpaper) || WALLPAPERS.find(w => w.id === selectedWallpaper) || WALLPAPERS[0];

  if (!loggedInAccount) {
    return (
      <FullPageLoginView 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        onLoginSuccess={(email, name) => {
          setLoggedInAccount({ email, name });
          // If no user profiles exist on login, restore defaults so it's not empty
          if (users.length === 0) {
            setUsers(DEFAULT_USERS);
            setSelectedUserIds(DEFAULT_USERS.map(u => u.id));
          }
        }} 
      />
    );
  }

  return (
    <div 
      className={`h-screen w-full relative flex flex-col md:flex-row font-sans overflow-hidden antialiased transition-colors duration-500 ${isDarkMode ? 'dark text-slate-100' : 'text-slate-800'}`}
      style={{
        backgroundImage: isDarkMode 
          ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.7) 100%), url('${activeWallpaper.url}')`
          : `linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 0%, rgba(241, 245, 249, 0.18) 100%), url('${activeWallpaper.url}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      
      {/* Ambient background meshes for the Glassmorphism blur pop! */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft Indigo/Cyan bubble */}
        <div className="absolute -top-10 -left-10 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 rounded-full blur-[90px]" />
        {/* Soft Magenta/Rose bubble */}
        <div className="absolute bottom-20 right-10 w-[550px] h-[550px] bg-gradient-to-tr from-rose-500/25 to-violet-500/20 rounded-full blur-[110px]" />
        {/* Bright sky blue refracting center bubble */}
        <div className="absolute top-[35%] right-[20%] w-[450px] h-[450px] bg-sky-400/25 dark:bg-sky-500/15 rounded-full blur-[100px]" />
        {/* Ultra light lens glow for reflection */}
        <div className="absolute top-[10%] left-[30%] w-[350px] h-[350px] bg-white/20 dark:bg-white/5 rounded-full blur-[80px]" />
      </div>

      {users.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-6 z-10 text-center relative max-w-lg mx-auto h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full glass-panel border border-white/30 dark:border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-slate-800 dark:text-slate-100"
          >
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/40">
              <Users className="h-8 w-8" />
            </div>
            
            <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              No Portfolios Found
            </h1>
            
            <p className="text-sm text-slate-600 dark:text-slate-350 mb-8 max-w-sm leading-relaxed font-medium">
              All family portfolio profiles have been removed. Create a new portfolio profile to begin tracking, or restore the default family portfolios for testing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setIsAuthPopupOpen(true);
                }}
                className="flex-grow sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create Portfolio</span>
              </button>
              
              <button
                type="button"
                onClick={handleRestoreJagadeesh}
                className="flex-grow sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-white/45 dark:bg-slate-800/45 hover:bg-white/60 dark:hover:bg-slate-800/65 border border-slate-200/60 dark:border-slate-750 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-xs transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span>Restore Default Portfolios</span>
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
 
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-60 mr-6 glass-panel shrink-0 border border-white/20 h-full z-30 p-5 text-slate-800 dark:text-slate-100 isolate transform-gpu">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/20 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white rounded-xl shadow-md shrink-0">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-display font-bold text-indigo-950 dark:text-indigo-100 tracking-tight leading-none truncate">Asset Tracker</h2>
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-widest mt-1 block truncate">Compounding Yield</span>
            </div>
          </div>
          
          {/* Theme Toggle Button */}
          <button 
            type="button"
            onClick={toggleDarkMode}
            className="p-2 ml-1 rounded-xl bg-white/20 hover:bg-white/40 border border-white/30 text-slate-800 dark:text-slate-100 transition-all cursor-pointer shadow-sm focus:outline-none shrink-0"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
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

        {/* Navigation Tabs */}
        <nav className="space-y-1.5 flex-1 text-sm font-medium">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                // 'relative' is essential here so the highlight stays locked to the button
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer relative group ${
                  isActive 
                    ? 'text-indigo-950 dark:text-indigo-100 font-bold' 
                    : 'text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10'
                }`}
              >
                {/* Active Highlight pills */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    // Use rounded-xl here to match the button's curves
                    // Use 'z-0' to ensure it stays behind the text
                    className="absolute inset-0 liquid-glass-active rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <span className="flex items-center gap-3 relative z-10">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  {tab.label}
                </span>

                {/* Micro numerical indicator */}
                {tab.id === 'savings' && (
                  <span className="relative z-10 text-[10px] font-mono bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 px-1.5 py-0.5 rounded">
                    {filteredAssetData.bankSavings.length}
                  </span>
                )}
                {tab.id === 'deposits' && (
                  <span className="relative z-10 text-[10px] font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                    {filteredAssetData.fixedDeposits.length}
                  </span>
                )}
                {tab.id === 'funds' && (
                  <span className="relative z-10 text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                    {filteredAssetData.mutualFunds.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Currency Selector */}
        <div className="mt-5 pt-5 border-t border-slate-200/20 text-xs">
          <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[9px] mb-2">
            Base Portfolio Currency
          </label>
          <div className="relative">
            <select
              value={selectedCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
              className="w-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md text-slate-900 dark:text-slate-100 border border-white/40 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none transition-all shadow-sm"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium">
                  {c.symbol} &nbsp; {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-600 dark:text-slate-400">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Workspace Wallpaper Selector */}
        <div className="my-4 text-xs relative">
          <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[9px] mb-2">
            Background
          </label>
          
          {/* Dropdown Toggle Button */}
          <button 
            type="button"
            onClick={() => setIsBgDropdownOpen(!isBgDropdownOpen)}
            className="w-full flex items-center justify-between bg-white/30 dark:bg-slate-800/30 hover:bg-white/45 dark:hover:bg-slate-800/45 border border-white/40 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 transition-all cursor-pointer shadow-sm focus:outline-none"
          >
            <span className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-850">
                <img 
                  src={activeWallpaper.url.replace('w=1920', 'w=40&h=30&fit=crop')} 
                  alt="" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="truncate text-[11px] text-slate-800 dark:text-slate-200 font-semibold">{activeWallpaper.name}</span>
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-600 dark:text-slate-400 shrink-0 transition-transform duration-200 ${isBgDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Collapsible Slider Panel */}
          <AnimatePresence initial={false}>
            {isBgDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="overflow-hidden z-20 w-full"
              >
                <div className="relative flex items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl p-2 shadow-md">
                  {/* Left scroll arrow */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const el = document.getElementById('desktop-wallpaper-slider');
                      if (el) el.scrollLeft -= 90;
                    }}
                    className="absolute left-1 z-10 p-1 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-full shadow border border-slate-200/40 dark:border-white/10 cursor-pointer transition-all hover:scale-105"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>

                  {/* Horizontal Scroll/Slider */}
                  <div 
                    id="desktop-wallpaper-slider"
                    className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1 px-4 scrollbar-none w-full"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {allWallpapers.map((w) => {
                      const isSelected = selectedWallpaper === w.id;
                      const thumbUrl = w.url.replace('w=1920', 'w=80&h=54&fit=crop');
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => handleWallpaperChange(w.id)}
                          className="flex-none w-[64px] flex flex-col items-center gap-1 focus:outline-none group cursor-pointer snap-start"
                          title={w.name}
                        >
                          <div 
                            className={`w-full aspect-[3/2] rounded-md overflow-hidden border transition-all shadow-sm ${
                              isSelected 
                                ? 'border-indigo-600 ring-2 ring-indigo-600/30 scale-[1.03]' 
                                : 'border-white/50 hover:border-white/90'
                            }`}
                          >
                            <img 
                              src={thumbUrl} 
                              alt={w.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className={`text-[8px] leading-tight text-center font-semibold truncate w-full ${
                            isSelected ? 'text-indigo-950 dark:text-indigo-100 font-bold' : 'text-slate-600 dark:text-slate-350 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}>
                            {w.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right scroll arrow */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const el = document.getElementById('desktop-wallpaper-slider');
                      if (el) el.scrollLeft += 90;
                    }}
                    className="absolute right-1 z-10 p-1 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-full shadow border border-slate-200/40 dark:border-white/10 cursor-pointer transition-all hover:scale-105"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Profile */}
        <div className="pt-6 border-t border-slate-200/20 text-xs relative">
          {/* Accounts Popover Dropdown */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                {/* Global click overlay to dismiss dropdown */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsUserMenuOpen(false)} 
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 right-0 mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-50 text-slate-800 dark:text-slate-100 min-w-[240px]"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-3">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-xs">Family Portfolios</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Consolidate selected views</span>
                    </div>
                    <Users className="h-4 w-4 text-indigo-500" />
                  </div>

                  <div className="space-y-2 max-h-[180px] overflow-y-auto scrollbar-thin">
                    {users.map((u) => {
                      const isSelected = selectedUserIds.includes(u.id);
                      return (
                        <div 
                          key={u.id}
                          onClick={() => {
                            // Toggle selection
                            setSelectedUserIds(prev => {
                              if (prev.includes(u.id)) {
                               if (prev.length === 1) return prev; // keep at least 1
                                return prev.filter(id => id !== u.id);
                              } else {
                                return [...prev, u.id];
                              }
                            });
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60' 
                              : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Checkbox */}
                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-850'
                          }`}>
                            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>

                          {/* Avatar */}
                          <div className={`w-7 h-7 rounded-lg font-bold text-[10px] flex items-center justify-center shrink-0 border ${u.avatarColor}`}>
                            {u.initials}
                          </div>

                          <div className="overflow-hidden min-w-0 flex-1">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px] truncate">{u.name}</span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-450 block truncate">Family Member</span>
                          </div>

                          {/* Delete profile button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedUsers = users.filter(usr => usr.id !== u.id);
                              setUsers(updatedUsers);
                              const updatedSelected = selectedUserIds.filter(id => id !== u.id);
                              setSelectedUserIds(updatedSelected);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all shrink-0 cursor-pointer"
                            title="Remove profile"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Register New Account button */}
                  <button 
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setAuthMode('signup');
                      setIsAuthPopupOpen(true);
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Family Portfolio</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Interactive footer profile card element */}
          <div 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center justify-between bg-white/20 dark:bg-slate-800/25 p-3 rounded-xl border border-white/30 dark:border-white/10 shadow-sm hover:bg-white/35 dark:hover:bg-slate-800/40 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {selectedUserIds.length === 1 ? (
                // Single Active User Display
                (() => {
                  const activeUser = users.find(u => u.id === selectedUserIds[0]) || users[0];
                  return (
                    <>
                      <div className={`p-2 rounded-lg font-bold text-center border shrink-0 min-w-[32px] ${activeUser.avatarColor}`}>
                        {activeUser.initials}
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {activeUser.name}
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-350 block truncate">
                          Active Portfolio
                        </span>
                      </div>
                    </>
                  );
                })()
              ) : (
                // Consolidated/Family display
                <>
                  <div className="flex -space-x-2 shrink-0">
                    {selectedUserIds.slice(0, 3).map((id, index) => {
                      const u = users.find(profile => profile.id === id);
                      if (!u) return null;
                      return (
                        <div 
                          key={u.id}
                          style={{ zIndex: 3 - index }}
                          className={`w-7 h-7 rounded-lg font-bold text-[9px] flex items-center justify-center border-2 border-slate-100 dark:border-slate-900 shrink-0 ${u.avatarColor}`}
                        >
                          {u.initials}
                        </div>
                      );
                    })}
                  </div>
                  <div className="overflow-hidden">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Consolidated View
                    </span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-350 block truncate">
                      {selectedUserIds.length} accounts active
                    </span>
                  </div>
                </>
              )}
            </div>

            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px]">
            <HelpCircle className="h-3 w-3" />
            <span>Asset Tracking v1.0.0</span>
          </div>
        </div>

      </aside>

      {/* --- MOBILE NAVIGATION BAR --- */}
      <header className="md:hidden glass-panel border-b border-white/20 sticky top-0 z-40 px-4 py-3 flex items-center justify-between text-slate-800 dark:text-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="font-display font-extrabold text-sm text-indigo-950 dark:text-indigo-100">Asset Tracker</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Mobile */}
          <button 
            type="button"
            onClick={toggleDarkMode}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/40 border border-white/30 text-slate-800 dark:text-slate-100 transition-all cursor-pointer shadow-sm focus:outline-none"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
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

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 hover:bg-white/40 dark:hover:bg-slate-850/40 border border-slate-200/30 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* --- MOBILE DRAWER SLIDE-OUT --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900 z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="fixed top-0 bottom-0 left-0 w-60 glass-panel border-r border-white/20 z-50 p-5 flex flex-col justify-between md:hidden text-slate-800 dark:text-slate-100"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200/20">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="font-display font-extrabold text-sm text-indigo-950 dark:text-indigo-100">Asset Tracker</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 rounded-lg text-slate-500 dark:text-slate-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1 font-medium text-xs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl overflow-hidden isolate transform-gpu transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-indigo-600 text-white font-bold shadow-md' 
                            : 'text-slate-600 dark:text-slate-350 hover:bg-white/20 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          {tab.label}
                        </span>
                        
                        {tab.id === 'savings' && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-indigo-700 text-white' : 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'}`}>
                            {filteredAssetData.bankSavings.length}
                          </span>
                        )}
                        {tab.id === 'deposits' && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-indigo-700 text-white' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'}`}>
                            {filteredAssetData.fixedDeposits.length}
                          </span>
                        )}
                        {tab.id === 'funds' && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-indigo-700 text-white' : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'}`}>
                            {filteredAssetData.mutualFunds.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Currency Selector Mobile */}
              <div className="mt-3 pt-3 border-t border-slate-200/20 text-xs">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[9px] mb-1.5">
                  Portfolio Currency
                </label>
                <div className="relative">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
                    className="w-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md text-slate-900 dark:text-slate-100 border border-white/40 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none transition-all shadow-sm"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium">
                        {c.symbol} &nbsp; {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-600 dark:text-slate-400">
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Wallpaper Selector Mobile */}
              <div className="my-2.5 text-xs relative">
                <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[9px] mb-2">
                  Background
                </label>
                
                {/* Dropdown Toggle Button */}
                <button 
                  type="button"
                  onClick={() => setIsMobileBgDropdownOpen(!isMobileBgDropdownOpen)}
                  className="w-full flex items-center justify-between bg-white/30 dark:bg-slate-800/30 hover:bg-white/45 dark:hover:bg-slate-800/45 border border-white/40 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 transition-all cursor-pointer shadow-sm focus:outline-none"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-850">
                      <img 
                        src={activeWallpaper.url.replace('w=1920', 'w=40&h=30&fit=crop')} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="truncate text-[11px] text-slate-800 dark:text-slate-200 font-semibold">{activeWallpaper.name}</span>
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-600 dark:text-slate-400 shrink-0 transition-transform duration-200 ${isMobileBgDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Collapsible Slider Panel */}
                <AnimatePresence initial={false}>
                  {isMobileBgDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden z-20 w-full"
                    >
                      <div className="relative flex items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl p-2 shadow-md">
                        {/* Left scroll arrow */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const el = document.getElementById('mobile-wallpaper-slider');
                            if (el) el.scrollLeft -= 90;
                          }}
                          className="absolute left-1 z-10 p-1 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-full shadow border border-slate-200/40 dark:border-white/10 cursor-pointer transition-all hover:scale-105"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </button>

                        {/* Horizontal Scroll/Slider */}
                        <div 
                          id="mobile-wallpaper-slider"
                          className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1 px-4 scrollbar-none w-full"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {allWallpapers.map((w) => {
                            const isSelected = selectedWallpaper === w.id;
                            const thumbUrl = w.url.replace('w=1920', 'w=80&h=54&fit=crop');
                            return (
                              <button
                                key={w.id}
                                type="button"
                                onClick={() => handleWallpaperChange(w.id)}
                                className="flex-none w-[64px] flex flex-col items-center gap-1 focus:outline-none group cursor-pointer snap-start"
                                title={w.name}
                              >
                                <div 
                                  className={`w-full aspect-[3/2] rounded-md overflow-hidden border transition-all shadow-sm ${
                                    isSelected 
                                      ? 'border-indigo-600 ring-2 ring-indigo-600/30 scale-[1.03]' 
                                      : 'border-white/50 hover:border-white/90'
                                  }`}
                                >
                                  <img 
                                    src={thumbUrl} 
                                    alt={w.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <span className={`text-[8px] leading-tight text-center font-semibold truncate w-full ${
                                  isSelected ? 'text-indigo-950 dark:text-indigo-100 font-bold' : 'text-slate-600 dark:text-slate-350 group-hover:text-slate-900 dark:group-hover:text-white'
                                }`}>
                                  {w.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Right scroll arrow */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const el = document.getElementById('mobile-wallpaper-slider');
                            if (el) el.scrollLeft += 90;
                          }}
                          className="absolute right-1 z-10 p-1 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-full shadow border border-slate-200/40 dark:border-white/10 cursor-pointer transition-all hover:scale-105"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile card footer mobile */}
              <div className="pt-4 border-t border-slate-200/20 text-xs relative">
                {/* Mobile Accounts Popover */}
                <AnimatePresence>
                  {isMobileUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsMobileUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xl z-50 text-slate-800 dark:text-slate-100"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">Family Portfolios</span>
                          <Users className="h-3.5 w-3.5 text-indigo-500" />
                        </div>

                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                          {users.map((u) => {
                            const isSelected = selectedUserIds.includes(u.id);
                            return (
                              <div 
                                key={u.id}
                                onClick={() => {
                                  setSelectedUserIds(prev => {
                                    if (prev.includes(u.id)) {
                                      if (prev.length === 1) return prev;
                                      return prev.filter(id => id !== u.id);
                                    } else {
                                      return [...prev, u.id];
                                    }
                                  });
                                }}
                                className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60' 
                                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all shrink-0 ${
                                  isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-750'
                                }}`}>
                                  {isSelected && <Check className="h-2 w-2 stroke-[3]" />}
                                </div>
                                <div className={`w-6 h-6 rounded-md font-bold text-[9px] flex items-center justify-center shrink-0 border ${u.avatarColor}`}>
                                  {u.initials}
                                </div>
                                <div className="overflow-hidden min-w-0 flex-1">
                                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-[10px] truncate">{u.name}</span>
                                  <span className="text-[8px] text-slate-500 dark:text-slate-450 block truncate">Family Member</span>
                                </div>

                                {/* Delete profile button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedUsers = users.filter(usr => usr.id !== u.id);
                                    setUsers(updatedUsers);
                                    const updatedSelected = selectedUserIds.filter(id => id !== u.id);
                                    setSelectedUserIds(updatedSelected);
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all shrink-0 cursor-pointer"
                                  title="Remove profile"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <button 
                          onClick={() => {
                            setIsMobileUserMenuOpen(false);
                            setIsMobileMenuOpen(false);
                            setAuthMode('signup');
                            setIsAuthPopupOpen(true);
                          }}
                          className="w-full mt-2 flex items-center justify-center gap-1 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-[9px] cursor-pointer"
                        >
                          <Plus className="h-2.5 w-2.5" />
                          <span>Add Family Portfolio</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                <div 
                  onClick={() => setIsMobileUserMenuOpen(!isMobileUserMenuOpen)}
                  className="flex items-center justify-between bg-white/20 dark:bg-slate-800/25 p-2.5 rounded-xl border border-white/30 dark:border-white/10 shadow-sm hover:bg-white/35 dark:hover:bg-slate-800/40 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {selectedUserIds.length === 1 ? (
                      (() => {
                        const activeUser = users.find(u => u.id === selectedUserIds[0]) || users[0];
                        return (
                          <>
                            <div className={`p-1.5 rounded-lg font-bold border shrink-0 ${activeUser.avatarColor}`}>
                              {activeUser.initials}
                            </div>
                            <div className="overflow-hidden">
                              <span className="font-bold text-slate-900 dark:text-slate-100 block truncate text-[11px]">
                                {activeUser.name}
                              </span>
                              <span className="text-[9px] text-slate-600 dark:text-slate-350 block truncate">
                                Active Portfolio
                              </span>
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <>
                        <div className="flex -space-x-1.5 shrink-0">
                          {selectedUserIds.slice(0, 3).map((id) => {
                            const u = users.find(profile => profile.id === id);
                            if (!u) return null;
                            return (
                              <div 
                                key={u.id}
                                className={`w-6 h-6 rounded-md font-bold text-[8px] flex items-center justify-center border border-slate-100 dark:border-slate-900 shrink-0 ${u.avatarColor}`}
                              >
                                {u.initials}
                              </div>
                            );
                          })}
                        </div>
                        <div className="overflow-hidden">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block truncate text-[11px]">
                            Consolidated View
                          </span>
                          <span className="text-[9px] text-slate-600 dark:text-slate-350 block truncate">
                            {selectedUserIds.length} accounts active
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronsUpDown className="h-3 w-3 text-slate-600 dark:text-slate-400 shrink-0" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN PAGE CONTENT --- */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 z-10 w-full md:w-auto min-w-0 relative isolate transform-gpu">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full relative isolate transform-gpu"
            style={{ willChange: 'transform, opacity' }}
          >
            {activeTab === 'dashboard' && (
              <DashboardView data={filteredAssetData} setActiveTab={setActiveTab} selectedCurrency={selectedCurrency} />
            )}
            {activeTab === 'savings' && (
              <BankSavingsView 
                accounts={filteredAssetData.bankSavings}
                onAddAccount={handleAddSavings}
                onEditAccount={handleEditSavings}
                onDeleteAccount={handleDeleteSavings}
                selectedCurrency={selectedCurrency}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}
            {activeTab === 'deposits' && (
              <FixedDepositsView
                deposits={filteredAssetData.fixedDeposits}
                onAddDeposit={handleAddFD}
                onEditDeposit={handleEditFD}
                onDeleteDeposit={handleDeleteFD}
                selectedCurrency={selectedCurrency}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}
            {activeTab === 'funds' && (
              <MutualFundsView
                funds={filteredAssetData.mutualFunds}
                onAddFund={handleAddFund}
                onEditFund={handleEditFund}
                onDeleteFund={handleDeleteFund}
                selectedCurrency={selectedCurrency}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}
            {activeTab === 'account' && (
              <AccountTabView
                loggedInAccount={loggedInAccount!}
                onLogout={() => {
                  setLoggedInAccount(null);
                  localStorage.removeItem('asset_tracker_logged_in_account');
                }}
                portfolios={users}
                onAddPortfolio={(name) => {
                  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString().slice(-4);
                  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || name.charAt(0).toUpperCase();
                  
                  const AVATAR_COLORS = [
                    'bg-purple-600 text-white border-purple-500',
                    'bg-teal-600 text-white border-teal-500',
                    'bg-rose-600 text-white border-rose-500',
                    'bg-amber-600 text-white border-amber-500',
                    'bg-emerald-600 text-white border-emerald-500',
                    'bg-cyan-600 text-white border-cyan-500',
                    'bg-indigo-600 text-white border-indigo-500'
                  ];
                  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

                  const newUser: UserProfile = {
                    id,
                    name,
                    initials,
                    avatarColor: randomColor
                  };

                  setUsers(prev => [...prev, newUser]);
                  setSelectedUserIds(prev => [...prev, id]);

                  // Generate default mock assets
                  const randomStartingBalance = Math.floor(Math.random() * 80000) + 20000;
                  const newSavingsAccount: BankAccount = {
                    id: `sav-${Date.now()}`,
                    bankName: 'IDFC First Bank',
                    accountType: 'Savings Account',
                    accountNumber: Math.floor(Math.random() * 9000 + 1000).toString(),
                    balance: randomStartingBalance,
                    interestRate: 4.00,
                    currency: 'INR',
                    notes: `${newUser.name}'s default savings`,
                    ownerIds: [newUser.id]
                  };
                  
                  const newFund: MutualFund = {
                    id: `mf-${Date.now()}`,
                    fundName: 'UTI Nifty 50 Index Fund',
                    category: 'Index Fund',
                    units: 180,
                    averageNav: 150,
                    currentNav: 172.40,
                    currency: 'INR',
                    ownerIds: newUser.id
                  };

                  const updatedAssets = {
                    ...assetData,
                    bankSavings: [...assetData.bankSavings, newSavingsAccount],
                    mutualFunds: [...assetData.mutualFunds, newFund]
                  };
                  setAssetData(updatedAssets);
                  saveToLocalStorage(updatedAssets);
                }}
                onDeletePortfolio={(id) => {
                  setUsers(prev => prev.filter(p => p.id !== id));
                  setSelectedUserIds(prev => {
                    const filtered = prev.filter(pId => pId !== id);
                    if (filtered.length > 0) return filtered;
                    // If no user left selected, select the first remaining user
                    const remainingUsers = users.filter(p => p.id !== id);
                    return remainingUsers.length > 0 ? [remainingUsers[0].id] : [];
                  });
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      </>
      )}

      {/* --- ADD NEW PORTFOLIO POPUP MODAL --- */}
      <AnimatePresence>
        {isAuthPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthPopupOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col p-6 text-slate-800 dark:text-slate-100"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsAuthPopupOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title & Header */}
              <div className="text-center mt-2 mb-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
                  Add Family Portfolio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Create a secondary silo to track individual assets
                </p>
              </div>

              {/* Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as HTMLFormElement;
                  const nameInput = target.elements.namedItem('portfolioName') as HTMLInputElement;
                  const name = nameInput.value.trim();
                  if (!name) return;

                  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString().slice(-4);
                  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || name.charAt(0).toUpperCase();
                  
                  const AVATAR_COLORS = [
                    'bg-purple-600 text-white border-purple-500',
                    'bg-teal-600 text-white border-teal-500',
                    'bg-rose-600 text-white border-rose-500',
                    'bg-amber-600 text-white border-amber-500',
                    'bg-emerald-600 text-white border-emerald-500',
                    'bg-cyan-600 text-white border-cyan-500',
                    'bg-indigo-600 text-white border-indigo-500'
                  ];
                  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

                  const newUser: UserProfile = {
                    id,
                    name,
                    initials,
                    avatarColor: randomColor
                  };

                  // Add user
                  setUsers(prev => [...prev, newUser]);
                  setSelectedUserIds(prev => [...prev, newUser.id]);
                  
                  // Generate default mock assets
                  const randomStartingBalance = Math.floor(Math.random() * 80000) + 20000;
                  const newSavingsAccount: BankAccount = {
                    id: `sav-${Date.now()}`,
                    bankName: 'IDFC First Bank',
                    accountType: 'Savings Account',
                    accountNumber: Math.floor(Math.random() * 9000 + 1000).toString(),
                    balance: randomStartingBalance,
                    interestRate: 4.00,
                    currency: 'INR',
                    notes: `${newUser.name}'s default savings`,
                    ownerIds: newUser.id
                  };
                  
                  const newFund: MutualFund = {
                    id: `mf-${Date.now()}`,
                    fundName: 'UTI Nifty 50 Index Fund',
                    category: 'Index Fund',
                    units: 180,
                    averageNav: 150,
                    currentNav: 172.40,
                    currency: 'INR',
                    ownerIds: newUser.id
                  };

                  const updatedAssets = {
                    ...assetData,
                    bankSavings: [...assetData.bankSavings, newSavingsAccount],
                    mutualFunds: [...assetData.mutualFunds, newFund]
                  };
                  setAssetData(updatedAssets);
                  saveToLocalStorage(updatedAssets);

                  setIsAuthPopupOpen(false);
                }} 
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Portfolio Name
                  </label>
                  <input
                    type="text"
                    name="portfolioName"
                    required
                    placeholder="e.g., Sreenithi, Trust, Corporate"
                    className="w-full bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Portfolio</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
