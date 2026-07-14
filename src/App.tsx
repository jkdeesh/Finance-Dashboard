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
  UserProfile,
  ImmovableAsset,
  InsurancePolicy,
  PreciousAsset,
  safeRandomUUID
} from './types';
import { DashboardView } from './components/DashboardView';
import { BankSavingsView } from './components/BankSavingsView';
import { FixedDepositsView } from './components/FixedDepositsView';
import { MutualFundsView } from './components/MutualFundsView';
import { LandedEstatesView } from './components/LandedEstatesView';
import { InsureShieldView } from './components/InsureShieldView';
import { PreciousReservesView } from './components/PreciousReservesView';
import { MaxAssistant } from './components/MaxAssistant';
import { FullPageLoginView } from './components/FullPageLoginView';
import { AccountTabView } from './components/AccountTabView';
import { fetchMarketRates, calculatePreciousAssetUSD } from './services/marketRates';
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
  RefreshCw,
  Upload,
  Camera,
  Home,
  Shield,
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SILHOUETTES = {
  man: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="50" fill="%23c7d2fe"/><path d="M50 30c6.627 0 12 5.373 12 12s-5.373 12-12 12-12-5.373-12-12 5.373-12 12-12zm-25 40c0-9.941 8.059-18 18-18h14c9.941 0 18 8.059 18 18v6H25v-6z" fill="%234f46e5"/></svg>',
  woman: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="50" fill="%23fbcfe8"/><path d="M50 28c6.075 0 11 4.925 11 11 0 4.836-3.125 8.941-7.466 10.42a12.916 12.916 0 01-7.068 0C42.125 47.941 39 43.836 39 39c0-6.075 4.925-11 11-11zm-23 41c0-8.837 7.163-16 16-16h14c8.837 0 16 7.163 16 16v5H27v-5z" fill="%23db2777"/></svg>',
  family: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="50" fill="%23fed7aa"/><path d="M38 34c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm-16 26c0-6.627 5.373-12 12-12h8c6.627 0 12 5.373 12 12v4H22v-4z" fill="%23ea580c" opacity="0.85"/><path d="M62 34c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm-12 26c0-6.627 5.373-12 12-12h8c6.627 0 12 5.373 12 12v4H50v-4z" fill="%23ea580c" opacity="0.85"/><path d="M50 25c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm-18 30c0-7.732 6.268-14 14-14h8c7.732 0 14 6.268 14 14v4H32v-4z" fill="%23c2410c"/></svg>'
};

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

const DEMO_USERS: UserProfile[] = [
  {
    id: 'aditya',
    name: 'Aditya',
    initials: 'A',
    avatarColor: 'bg-indigo-600 text-white border-indigo-500'
  },
  {
    id: 'nisha',
    name: 'Nisha',
    initials: 'N',
    avatarColor: 'bg-emerald-600 text-white border-emerald-500'
  },
  {
    id: 'kavya',
    name: 'Kavya',
    initials: 'K',
    avatarColor: 'bg-purple-600 text-white border-purple-500'
  }
];

const DEMO_ASSET_DATA: AssetData = {
  bankSavings: [
    {
      id: 'sav-1',
      bankName: 'ICICI Bank',
      accountType: 'NRE Account',
      accountNumber: '•••• 4892',
      balance: 3120000,
      interestRate: 3.50,
      currency: 'INR',
      notes: 'Aditya NRE savings',
      ownerIds: ['aditya']
    },
    {
      id: 'sav-2',
      bankName: 'HDFC Bank',
      accountType: 'Savings Account',
      accountNumber: '•••• 1054',
      balance: 625000,
      interestRate: 3.00,
      currency: 'INR',
      notes: 'Nisha Salary account',
      ownerIds: ['nisha']
    },
    {
      id: 'sav-3',
      bankName: 'State Bank of India',
      accountType: 'Savings Account',
      accountNumber: '•••• 7741',
      balance: 185000,
      interestRate: 2.70,
      currency: 'INR',
      notes: 'Family Joint savings',
      ownerIds: ['aditya', 'nisha']
    },
    {
      id: 'sav-4',
      bankName: 'Deutsche Bank',
      accountType: 'Checking Account',
      accountNumber: '•••• 9812',
      balance: 14500,
      interestRate: 1.25,
      currency: 'EUR',
      notes: 'Euro Travel checking',
      ownerIds: ['aditya']
    }
  ],
  fixedDeposits: [
    {
      id: 'fd-1',
      bankName: 'HDFC Bank',
      depositNumber: 'HDFC - Term Dep #1',
      principal: 350000,
      interestRate: 7.15,
      startDate: '2024-03-15',
      maturityDate: '2027-03-15',
      currency: 'INR',
      notes: 'Kavya Higher Education',
      ownerIds: ['aditya', 'kavya']
    },
    {
      id: 'fd-2',
      bankName: 'ICICI Bank',
      depositNumber: 'ICICI - Tax Saver FD',
      principal: 150000,
      interestRate: 7.25,
      startDate: '2025-01-10',
      maturityDate: '2030-01-10',
      currency: 'INR',
      notes: 'Tax Saver 80C',
      ownerIds: ['aditya']
    },
    {
      id: 'fd-3',
      bankName: 'State Bank of India',
      depositNumber: 'SBI - Nisha FD',
      principal: 200000,
      interestRate: 6.85,
      startDate: '2025-07-20',
      maturityDate: '2026-07-20',
      currency: 'INR',
      notes: 'Emergency reserve',
      ownerIds: ['nisha']
    }
  ],
  mutualFunds: [
    {
      id: 'mf-1',
      fundName: 'SBI Bluechip Fund Direct-Growth',
      category: 'Equity Fund',
      units: 1450,
      averageNav: 82.40,
      currentNav: 121.85,
      currency: 'INR',
      ownerIds: ['aditya']
    },
    {
      id: 'mf-2',
      fundName: 'Parag Parikh Flexi Cap Fund Direct',
      category: 'Equity Fund',
      units: 2100,
      averageNav: 54.10,
      currentNav: 91.15,
      currency: 'INR',
      ownerIds: ['aditya', 'nisha']
    },
    {
      id: 'mf-3',
      fundName: 'HDFC Mid-Cap Opportunities Fund',
      category: 'Equity Fund',
      units: 950,
      averageNav: 110.50,
      currentNav: 148.30,
      currency: 'INR',
      ownerIds: ['nisha']
    },
    {
      id: 'mf-4',
      fundName: 'Mirae Asset Large Cap Fund',
      category: 'Equity Fund',
      units: 1250,
      averageNav: 95.00,
      currentNav: 112.75,
      currency: 'INR',
      ownerIds: ['aditya']
    }
  ],
  immovableAssets: [
    {
      id: 'prop-1',
      propertyName: 'Prestige Shantiniketan Apartment',
      propertyType: 'Residential',
      area: 1850,
      unit: 'sqft',
      locationName: 'Whitefield, Bangalore',
      latitude: 12.9845,
      longitude: 77.7324,
      estimatedValue: 16500000,
      currency: 'INR',
      notes: 'Family primary apartment, rented out currently.',
      ownerIds: ['aditya', 'nisha']
    },
    {
      id: 'prop-2',
      propertyName: 'ECR Coastal Plots',
      propertyType: 'Vacant Land',
      area: 4.5,
      unit: 'grounds',
      locationName: 'ECR, Chennai',
      latitude: 12.8423,
      longitude: 80.2285,
      estimatedValue: 9200000,
      currency: 'INR',
      notes: 'Beachfront residential plot near Uthandi.',
      ownerIds: ['aditya']
    },
    {
      id: 'prop-3',
      propertyName: 'Anamalai Coconut Grove',
      propertyType: 'Agricultural',
      area: 3.2,
      unit: 'acres',
      locationName: 'Pollachi, Tamil Nadu',
      latitude: 10.6589,
      longitude: 77.0124,
      estimatedValue: 12000000,
      currency: 'INR',
      notes: 'Yields organic coconuts quarterly.',
      ownerIds: ['nisha']
    }
  ],
  insurances: [
    {
      id: 'ins-1',
      policyName: 'LIC Jeevan Anand Plan',
      policyType: 'Life (LIC)',
      policyNumber: 'LIC-8429104',
      premiumAmount: 24000,
      frequency: 'Annually',
      sumAssured: 1000000,
      startDate: '2018-05-10',
      dueDate: '2027-05-10',
      status: 'Active',
      notes: 'Endowment policy with survival benefits.',
      currency: 'INR',
      ownerIds: ['aditya']
    },
    {
      id: 'ins-2',
      policyName: 'Star Family Optima Health',
      policyType: 'Health',
      policyNumber: 'STAR-291048',
      premiumAmount: 18500,
      frequency: 'Annually',
      sumAssured: 500000,
      startDate: '2021-12-01',
      dueDate: '2026-12-01',
      status: 'Active',
      notes: 'Floater cover for both Aditya and Nisha.',
      currency: 'INR',
      ownerIds: ['aditya', 'nisha']
    }
  ],
  preciousAssets: [
    {
      id: 'prec-1',
      name: 'Bridal Gold Choker & Bangles Set',
      type: 'Gold',
      weight: 12,
      unit: 'pavun',
      karat: '22K',
      purchasePrice: 520000,
      purchaseCurrency: 'INR',
      notes: 'Ancestral wedding gold jewelry stored in bank locker.',
      ownerIds: ['nisha']
    },
    {
      id: 'prec-2',
      name: 'Solid 24K Gold Minted Bars',
      type: 'Gold',
      weight: 100,
      unit: 'grams',
      karat: '24K',
      purchasePrice: 6200,
      purchaseCurrency: 'USD',
      notes: 'Vault reserve bullion investment.',
      ownerIds: ['aditya']
    },
    {
      id: 'prec-3',
      name: 'Natural Princess Cut Certified Diamond Ring',
      type: 'Diamond',
      weight: 1.8,
      unit: 'carats',
      diamondSpecifics: {
        caratWeight: 1.8,
        cut: 'Princess',
        clarity: 'VVS1',
        color: 'E',
        diamondType: 'Natural'
      },
      purchasePrice: 1250000,
      purchaseCurrency: 'INR',
      notes: 'Anniversary precious ornament gift.',
      ownerIds: ['aditya', 'nisha']
    },
    {
      id: 'prec-4',
      name: 'Sterling Silver Family Utensils Set',
      type: 'Silver',
      weight: 2.5,
      unit: 'kilograms',
      purity: 'Sterling 92.5%',
      purchasePrice: 210000,
      purchaseCurrency: 'INR',
      notes: 'Vintage family dining silver artifacts.',
      ownerIds: ['nisha']
    }
  ]
};

export default function App() {
  const [loggedInAccount, setLoggedInAccount] = useState<{ email: string; name?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('asset_tracker_logged_in_account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      if (loggedInAccount) {
        const emailKey = loggedInAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
        const saved = localStorage.getItem(`asset_tracker_users_${emailKey}`);
        if (saved) {
          return JSON.parse(saved) as UserProfile[];
        }
        // First time login - set one profile for themselves
        const name = loggedInAccount.name || loggedInAccount.email.split('@')[0];
        const initialUser: UserProfile = {
          id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          name: name,
          initials: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || name.charAt(0).toUpperCase(),
          avatarColor: 'bg-indigo-600 text-white border-indigo-500'
        };
        return [initialUser];
      }
      return DEMO_USERS;
    } catch {
      return DEMO_USERS;
    }
  });

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(() => {
    try {
      if (loggedInAccount) {
        const emailKey = loggedInAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
        const saved = localStorage.getItem(`asset_tracker_selected_user_ids_${emailKey}`);
        if (saved) {
          return JSON.parse(saved) as string[];
        }
        const name = loggedInAccount.name || loggedInAccount.email.split('@')[0];
        return [name.toLowerCase().replace(/[^a-z0-9]/g, '')];
      }
      return DEMO_USERS.map(u => u.id);
    } catch {
      return DEMO_USERS.map(u => u.id);
    }
  });

  const ensureIdsExist = (data: any): AssetData => {
    if (!data) return { bankSavings: [], fixedDeposits: [], mutualFunds: [], immovableAssets: [], insurances: [], preciousAssets: [] };
    return {
      bankSavings: (data.bankSavings || []).map((x: any) => ({ ...x, id: x.id || safeRandomUUID() })),
      fixedDeposits: (data.fixedDeposits || []).map((x: any) => ({ ...x, id: x.id || safeRandomUUID() })),
      mutualFunds: (data.mutualFunds || []).map((x: any) => ({ ...x, id: x.id || safeRandomUUID() })),
      immovableAssets: (data.immovableAssets || []).map((x: any) => ({ ...x, id: x.id || safeRandomUUID() })),
      insurances: (data.insurances || []).map((x: any) => ({ ...x, id: x.id || safeRandomUUID() })),
      preciousAssets: (data.preciousAssets || []).map((x: any) => ({ ...x, id: x.id || safeRandomUUID() }))
    };
  };

  const [assetData, setAssetData] = useState<AssetData>(() => {
    try {
      if (loggedInAccount) {
        const emailKey = loggedInAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
        const saved = localStorage.getItem(`asset_tracker_portfolio_${emailKey}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          return ensureIdsExist(parsed);
        }
        return {
          bankSavings: [],
          fixedDeposits: [],
          mutualFunds: [],
          immovableAssets: [],
          insurances: [],
          preciousAssets: []
        };
      }
      return ensureIdsExist(DEMO_ASSET_DATA);
    } catch {
      return ensureIdsExist(DEMO_ASSET_DATA);
    }
  });

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

  // --- MARKET RATES & PRECIOUS VAULT STATE ---
  const [marketRates, setMarketRates] = useState<any>(null);

  const loadMarketRates = async () => {
    try {
      const rates = await fetchMarketRates();
      setMarketRates(rates);
    } catch (e) {
      console.warn('Failed to load market rates', e);
    }
  };

  useEffect(() => {
    loadMarketRates();
    // Refresh rates every 15 minutes in session if needed
    const interval = setInterval(loadMarketRates, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const [profilePic, setProfilePic] = useState<string>(SILHOUETTES.man);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleProfilePicChange = (newPic: string) => {
    setProfilePic(newPic);
    if (loggedInAccount) {
      const emailKey = loggedInAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
      try {
        localStorage.setItem(`asset_tracker_profile_pic_${emailKey}`, newPic);
      } catch (e) {
        console.warn('Failed to save profile picture', e);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleProfilePicChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
  const handleResetDemoPortfolios = () => {
    setUsers(DEMO_USERS);
    setSelectedUserIds(DEMO_USERS.map(u => u.id));
    setAssetData(DEMO_ASSET_DATA);
    saveToLocalStorage(DEMO_ASSET_DATA);
    setIsAuthPopupOpen(false);
  };

  // If no profiles exist, automatically trigger the authentication signup popup
  useEffect(() => {
    if (users.length === 0) {
      setAuthMode('signup');
      setIsAuthPopupOpen(true);
    }
  }, [users.length]);

  // Keep track of loaded email to avoid transitioning state collisions
  const [loadedEmail, setLoadedEmail] = useState<string>(() => loggedInAccount?.email || '');

  // Synchronize state when loggedInAccount changes (e.g., logging out or logging in as another user)
  useEffect(() => {
    if (loggedInAccount) {
      const emailKey = loggedInAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
      const usersKey = `asset_tracker_users_${emailKey}`;
      const selectedKey = `asset_tracker_selected_user_ids_${emailKey}`;
      const assetKey = `asset_tracker_portfolio_${emailKey}`;
      const avatarKey = `asset_tracker_profile_pic_${emailKey}`;

      const savedAvatar = localStorage.getItem(avatarKey);
      setProfilePic(savedAvatar || SILHOUETTES.man);

      let savedUsers = localStorage.getItem(usersKey);
      let savedSelected = localStorage.getItem(selectedKey);
      let savedAssets = localStorage.getItem(assetKey);

      // Seed with beautiful random AI-generated demo data if this is the demo account and no data is saved yet
      if (loggedInAccount.email.toLowerCase() === 'demo@familyasset.ai' && !savedUsers && !savedAssets) {
        localStorage.setItem(usersKey, JSON.stringify(DEMO_USERS));
        localStorage.setItem(selectedKey, JSON.stringify(DEMO_USERS.map(u => u.id)));
        localStorage.setItem(assetKey, JSON.stringify(DEMO_ASSET_DATA));
        savedUsers = JSON.stringify(DEMO_USERS);
        savedSelected = JSON.stringify(DEMO_USERS.map(u => u.id));
        savedAssets = JSON.stringify(DEMO_ASSET_DATA);
      }

      let currentUsers: UserProfile[];
      if (savedUsers) {
        currentUsers = JSON.parse(savedUsers);
      } else {
        const name = loggedInAccount.name || loggedInAccount.email.split('@')[0];
        const initialUser: UserProfile = {
          id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          name: name,
          initials: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || name.charAt(0).toUpperCase(),
          avatarColor: 'bg-indigo-600 text-white border-indigo-500'
        };
        currentUsers = [initialUser];
      }

      setUsers(currentUsers);

      if (savedSelected) {
        setSelectedUserIds(JSON.parse(savedSelected));
      } else {
        setSelectedUserIds(currentUsers.map(u => u.id));
      }

      if (savedAssets) {
        setAssetData(ensureIdsExist(JSON.parse(savedAssets)));
      } else {
        setAssetData({
          bankSavings: [],
          fixedDeposits: [],
          mutualFunds: [],
          immovableAssets: [],
          insurances: [],
          preciousAssets: []
        });
      }
      setLoadedEmail(loggedInAccount.email);
    } else {
      setUsers([]);
      setSelectedUserIds([]);
      setAssetData({
        bankSavings: [],
        fixedDeposits: [],
        mutualFunds: [],
        immovableAssets: [],
        insurances: [],
        preciousAssets: []
      });
      setLoadedEmail('');
      setProfilePic(SILHOUETTES.man);
    }
  }, [loggedInAccount]);

  // User-scoped saving effects
  useEffect(() => {
    if (!loggedInAccount || !loadedEmail || loggedInAccount.email !== loadedEmail) return;
    const emailKey = loadedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const usersKey = `asset_tracker_users_${emailKey}`;
    if (users.length > 0) {
      localStorage.setItem(usersKey, JSON.stringify(users));
    }
  }, [users, loggedInAccount, loadedEmail]);

  useEffect(() => {
    if (!loggedInAccount || !loadedEmail || loggedInAccount.email !== loadedEmail) return;
    const emailKey = loadedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const selectedKey = `asset_tracker_selected_user_ids_${emailKey}`;
    if (selectedUserIds.length > 0) {
      localStorage.setItem(selectedKey, JSON.stringify(selectedUserIds));
    }
  }, [selectedUserIds, loggedInAccount, loadedEmail]);

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
      
      // Fallback: Use verified high-quality 4K Unsplash image IDs for categories
      const fallbackList = [
        { name: 'Cyberpunk Street', photoId: 'photo-1515621061946-eff1c2a352bd' },
        { name: 'Deep Space Nebula', photoId: 'photo-1462331940025-496dfbfc7564' },
        { name: 'Epic Mountain', photoId: 'photo-1464822759023-fed622ff2c3b' },
        { name: 'Ocean Waves Aerial', photoId: 'photo-1505118380757-91f5f5632de0' },
        { name: 'Serene Forest', photoId: 'photo-1441974231531-c6227db76b6e' },
        { name: 'Golden Desert Dunes', photoId: 'photo-1509316975850-ff9c5deb0cd9' },
        { name: 'Futuristic Cityscape', photoId: 'photo-1477959858617-67f85cf4f1df' },
        { name: 'Coastal Sunset', photoId: 'photo-1507525428034-b723cf961d3e' },
        { name: 'Abstract Gradient', photoId: 'photo-1557683316-973673baf926' },
        { name: 'Minimalist Aesthetic', photoId: 'photo-1494438639946-1ebd1d2038b5' }
      ];
      
      const fallbackWallpapers = fallbackList.map((item, idx) => {
        return {
          id: `unsplash-daily-${idx}`,
          name: item.name,
          url: `https://images.unsplash.com/${item.photoId}?q=80&w=1920&auto=format&fit=crop`
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
  const saveToLocalStorage = (newData: AssetData) => {
    if (!loggedInAccount) return;
    try {
      const emailKey = loggedInAccount.email.replace(/[^a-zA-Z0-9]/g, '_');
      const assetKey = `asset_tracker_portfolio_${emailKey}`;
      localStorage.setItem(assetKey, JSON.stringify(newData));
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

  // --- LANDED ESTATES CONTROLLERS ---
  const handleAddImmovableAsset = (prop: Omit<ImmovableAsset, 'id'> & { id?: string }) => {
    const newAsset: ImmovableAsset = {
      ...prop,
      id: prop.id || safeRandomUUID()
    };
    const updated = {
      ...assetData,
      immovableAssets: [...(assetData.immovableAssets || []), newAsset]
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleEditImmovableAsset = (edited: ImmovableAsset) => {
    const updated = {
      ...assetData,
      immovableAssets: (assetData.immovableAssets || []).map(p => p.id === edited.id ? edited : p)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleDeleteImmovableAsset = (id: string) => {
    const updated = {
      ...assetData,
      immovableAssets: (assetData.immovableAssets || []).filter(p => p.id !== id)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  // --- INSURESHIELD CONTROLLERS ---
  const handleAddInsurance = (ins: Omit<InsurancePolicy, 'id'> & { id?: string }) => {
    const newPolicy: InsurancePolicy = {
      ...ins,
      id: ins.id || safeRandomUUID()
    };
    const updated = {
      ...assetData,
      insurances: [...(assetData.insurances || []), newPolicy]
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleEditInsurance = (edited: InsurancePolicy) => {
    const updated = {
      ...assetData,
      insurances: (assetData.insurances || []).map(p => p.id === edited.id ? edited : p)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleDeleteInsurance = (id: string) => {
    const updated = {
      ...assetData,
      insurances: (assetData.insurances || []).filter(p => p.id !== id)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  // --- VAULT RESERVES CONTROLLERS ---
  const handleAddPreciousAsset = (asset: PreciousAsset) => {
    const updated = {
      ...assetData,
      preciousAssets: [...(assetData.preciousAssets || []), asset]
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleEditPreciousAsset = (edited: PreciousAsset) => {
    const updated = {
      ...assetData,
      preciousAssets: (assetData.preciousAssets || []).map(a => a.id === edited.id ? edited : a)
    };
    setAssetData(updated);
    saveToLocalStorage(updated);
  };

  const handleDeletePreciousAsset = (id: string) => {
    const updated = {
      ...assetData,
      preciousAssets: (assetData.preciousAssets || []).filter(a => a.id !== id)
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
      immovableAssets: (assetData.immovableAssets || []).filter(isVisible),
      insurances: (assetData.insurances || []).filter(isVisible),
      preciousAssets: (assetData.preciousAssets || []).filter(isVisible),
    };
  }, [assetData, selectedUserIds]);

  const preciousAssetUSDTotal = useMemo(() => {
    const metalRates = marketRates?.metalRates || {
      gold24k: 78.50,
      gold22k: 72.00,
      gold18k: 58.80,
      gold14k: 45.80,
      silver999: 0.98,
      silver925: 0.91,
      platinum: 32.50,
      diamondBase: 4500.00
    };
    return (filteredAssetData.preciousAssets || []).reduce((sum, item) => {
      return sum + calculatePreciousAssetUSD(item, metalRates);
    }, 0);
  }, [filteredAssetData.preciousAssets, marketRates]);

  const preciousAssetSelectedCurrencyTotal = useMemo(() => {
    const rate = marketRates?.exchangeRates?.[selectedCurrency] || (selectedCurrency === 'INR' ? 83.5 : 1);
    return preciousAssetUSDTotal * rate;
  }, [preciousAssetUSDTotal, selectedCurrency, marketRates]);

  // Calculate high-level stats for visual markers
  const totalBalance = 
    filteredAssetData.bankSavings.reduce((sum, item) => sum + convertCurrency(item.balance, item.currency || 'INR', selectedCurrency), 0) +
    filteredAssetData.fixedDeposits.reduce((sum, item) => sum + convertCurrency(item.principal, item.currency || 'INR', selectedCurrency), 0) +
    filteredAssetData.mutualFunds.reduce((sum, item) => sum + convertCurrency(item.units * item.currentNav, item.currency || 'INR', selectedCurrency), 0) +
    filteredAssetData.immovableAssets.reduce((sum, item) => sum + convertCurrency(item.estimatedValue, item.currency || 'INR', selectedCurrency), 0) +
    preciousAssetSelectedCurrencyTotal;

  // Tabs layout configs
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'savings' as TabType, label: 'Bank Savings', icon: Landmark },
    { id: 'deposits' as TabType, label: 'Fixed Deposits', icon: RupeeCoin },
    { id: 'funds' as TabType, label: 'Mutual Funds', icon: TrendingUp },
    { id: 'terrafirma' as TabType, label: 'Landed Estates', icon: Home },
    { id: 'precious' as TabType, label: 'Gold & Ornaments', icon: Coins },
    { id: 'insurances' as TabType, label: 'InsureShield', icon: Shield },
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
        }} 
      />
    );
  }

  return (
    <div 
      className={`h-screen w-full relative flex flex-col lg:flex-row font-sans overflow-hidden antialiased transition-colors duration-500 ${isDarkMode ? 'dark text-slate-100' : 'text-slate-800'}`}
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
                onClick={handleResetDemoPortfolios}
                className="flex-grow sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-white/45 dark:bg-slate-800/45 hover:bg-white/60 dark:hover:bg-slate-800/65 border border-slate-200/60 dark:border-slate-750 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-xs transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span>Load Demo Portfolios</span>
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
 
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-[225px] lg:mr-4 glass-panel shrink-0 border border-white/20 h-full z-30 p-4 text-slate-800 dark:text-slate-100 isolate transform-gpu">
        
        {/* User Account Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200/20 mb-5 relative">
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="w-11 h-11 rounded-full overflow-hidden border-2 border-indigo-500/50 hover:border-indigo-500 transition-all shadow-md cursor-pointer focus:outline-none flex items-center justify-center bg-white/20 dark:bg-slate-800/40"
              title="Change profile picture"
            >
              <img
                src={profilePic}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </button>
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-0.5 -right-0.5 bg-indigo-600 text-white rounded-full p-0.5 shadow-sm border border-white dark:border-slate-900 cursor-pointer hover:bg-indigo-500 transition-colors focus:outline-none"
              title="Change picture"
            >
              <Camera className="h-2.5 w-2.5" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-display font-extrabold text-indigo-950 dark:text-indigo-100 tracking-tight leading-tight truncate" title={loggedInAccount?.name || loggedInAccount?.email.split('@')[0]}>
              {loggedInAccount?.name || loggedInAccount?.email.split('@')[0]}
            </h2>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium lowercase truncate block mt-0.5" title={loggedInAccount?.email}>
              {loggedInAccount?.email}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1 flex-1 text-[13px] font-medium">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                // 'relative' is essential here so the highlight stays locked to the button
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer relative group text-left ${
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
                
                <span className="flex items-center gap-2.5 relative z-10 whitespace-nowrap min-w-0 flex-1 text-left">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <span className="truncate">{tab.label}</span>
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
                {tab.id === 'terrafirma' && (
                  <span className="relative z-10 text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                    {filteredAssetData.immovableAssets.length}
                  </span>
                )}
                {tab.id === 'insurances' && (
                  <span className="relative z-10 text-[10px] font-mono bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-1.5 py-0.5 rounded">
                    {filteredAssetData.insurances.length}
                  </span>
                )}
                {tab.id === 'precious' && (
                  <span className="relative z-10 text-[10px] font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                    {(filteredAssetData.preciousAssets || []).length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Currency Selector */}
        <div className="mt-4 pt-4 border-t border-slate-200/20 text-xs">
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

        {/* Appearance Mode Selector */}
        <div className="mt-3 text-xs">
          <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[9px] mb-2">
            Appearance Mode
          </label>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between bg-white/30 dark:bg-slate-800/30 hover:bg-white/45 dark:hover:bg-slate-800/45 border border-white/40 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 transition-all cursor-pointer shadow-sm focus:outline-none"
          >
            <span className="flex items-center gap-2">
              {isDarkMode ? (
                <>
                  <svg className="h-4 w-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.591 1.591m10.91 10.91l1.591 1.591M3 12h2.25m13.5 0H21M4.95 19.05l1.591-1.591m10.91-10.91l1.591-1.591M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-slate-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                  <span>Light Mode</span>
                </>
              )}
            </span>
            <span className="text-[9px] bg-slate-500/10 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-500/10 dark:border-white/10">
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </button>
        </div>

        {/* Workspace Wallpaper Selector */}
        <div className="my-3 text-xs relative">
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
        <div className="pt-4 border-t border-slate-200/20 text-xs relative">
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
                  className="absolute bottom-full left-0 right-0 mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xl z-50 text-slate-800 dark:text-slate-100 w-full"
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
      <header className="lg:hidden glass-panel border-b border-white/20 sticky top-0 z-40 px-4 py-3 flex items-center justify-between text-slate-800 dark:text-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="w-7 h-7 rounded-full overflow-hidden border border-indigo-500/50 shrink-0"
          >
            <img
              src={profilePic}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          </button>
          <span className="font-display font-extrabold text-xs text-indigo-950 dark:text-indigo-100 truncate">
            {loggedInAccount?.name || loggedInAccount?.email.split('@')[0]}
          </span>
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
              className="fixed inset-0 bg-slate-900 z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="fixed top-0 bottom-0 left-0 w-60 glass-panel border-r border-white/20 z-50 py-5 flex flex-col justify-between lg:hidden text-slate-800 dark:text-slate-100 overflow-hidden"
            >
              {/* Header Container (Fixed, Non-Scrollable) */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-200/20 min-w-0 px-5 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-8 h-8 rounded-full overflow-hidden border border-indigo-500/50 shrink-0"
                  >
                    <img
                      src={profilePic}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-xs font-display font-extrabold text-indigo-950 dark:text-indigo-100 truncate" title={loggedInAccount?.name || loggedInAccount?.email.split('@')[0]}>
                      {loggedInAccount?.name || loggedInAccount?.email.split('@')[0]}
                    </h2>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate lowercase leading-none mt-0.5" title={loggedInAccount?.email}>
                      {loggedInAccount?.email}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 rounded-lg text-slate-500 dark:text-slate-400 shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Container (Dynamic & Responsive for Small Heights & Orientations) */}
              <div 
                className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Navigation Tabs */}
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
                        {tab.id === 'terrafirma' && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-indigo-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'}`}>
                            {filteredAssetData.immovableAssets.length}
                          </span>
                        )}
                        {tab.id === 'insurances' && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-indigo-700 text-white' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'}`}>
                            {filteredAssetData.insurances.length}
                          </span>
                        )}
                        {tab.id === 'precious' && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-indigo-700 text-white' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'}`}>
                            {(filteredAssetData.preciousAssets || []).length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Currency Selector Mobile */}
                <div className="pt-3 border-t border-slate-200/20 text-xs">
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

                {/* Appearance Mode Selector Mobile (Brought Above Background Selector!) */}
                <div className="pt-3 border-t border-slate-200/20 text-xs">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[9px] mb-2">
                    Appearance Mode
                  </label>
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="w-full flex items-center justify-between bg-white/30 dark:bg-slate-800/30 hover:bg-white/45 dark:hover:bg-slate-800/45 border border-white/40 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 transition-all cursor-pointer shadow-sm focus:outline-none"
                  >
                    <span className="flex items-center gap-2">
                      {isDarkMode ? (
                        <>
                          <svg className="h-4 w-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.591 1.591m10.91 10.91l1.591 1.591M3 12h2.25m13.5 0H21M4.95 19.05l1.591-1.591m10.91-10.91l1.591-1.591M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                          </svg>
                          <span>Dark Mode</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 text-slate-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                          </svg>
                          <span>Light Mode</span>
                        </>
                      )}
                    </span>
                    <span className="text-[9px] bg-slate-500/10 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-500/10 dark:border-white/10">
                      {isDarkMode ? 'Dark' : 'Light'}
                    </span>
                  </button>
                </div>

                {/* Wallpaper Selector Mobile */}
                <div className="pt-3 border-t border-slate-200/20 text-xs relative">
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
              </div>

              {/* Profile card footer mobile */}
              <div className="pt-4 border-t border-slate-200/20 text-xs relative px-5 shrink-0">
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
      <main className="flex-1 overflow-y-auto px-4 py-6 lg:p-8 z-10 w-full lg:w-auto min-w-0 relative isolate transform-gpu">
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
              <DashboardView data={filteredAssetData} setActiveTab={setActiveTab} selectedCurrency={selectedCurrency} marketRates={marketRates} />
            )}
            {activeTab === 'savings' && (
              <BankSavingsView 
                accounts={filteredAssetData.bankSavings}
                onAddAccount={handleAddSavings}
                onEditAccount={handleEditSavings}
                onDeleteAccount={handleDeleteSavings}
                selectedCurrency={selectedCurrency}
                onBackToDashboard={() => setActiveTab('dashboard')}
                selectedUserIds={selectedUserIds}
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
                selectedUserIds={selectedUserIds}
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
                selectedUserIds={selectedUserIds}
              />
            )}
            {activeTab === 'terrafirma' && (
              <LandedEstatesView
                assets={filteredAssetData.immovableAssets}
                onAddAsset={handleAddImmovableAsset}
                onEditAsset={handleEditImmovableAsset}
                onDeleteAsset={handleDeleteImmovableAsset}
                selectedCurrency={selectedCurrency}
                onBackToDashboard={() => setActiveTab('dashboard')}
                selectedUserIds={selectedUserIds}
              />
            )}
            {activeTab === 'insurances' && (
              <InsureShieldView
                policies={filteredAssetData.insurances}
                onAddPolicy={handleAddInsurance}
                onEditPolicy={handleEditInsurance}
                onDeletePolicy={handleDeleteInsurance}
                selectedCurrency={selectedCurrency}
                onBackToDashboard={() => setActiveTab('dashboard')}
                selectedUserIds={selectedUserIds}
              />
            )}
            {activeTab === 'precious' && (
              <PreciousReservesView
                assets={filteredAssetData.preciousAssets || []}
                onAddAsset={handleAddPreciousAsset}
                onEditAsset={handleEditPreciousAsset}
                onDeleteAsset={handleDeletePreciousAsset}
                selectedCurrency={selectedCurrency}
                onBackToDashboard={() => setActiveTab('dashboard')}
                selectedUserIds={selectedUserIds}
                marketRates={marketRates}
                onRefreshRates={loadMarketRates}
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
                assetData={assetData}
                onImportAssetData={(imported) => {
                  setAssetData(imported);
                  saveToLocalStorage(imported);

                  // Auto-create missing portfolios/profiles from imported ownerIds
                  const uniqueOwnerIds = new Set<string>();
                  imported.bankSavings?.forEach(item => item.ownerIds?.forEach(id => {
                    if (id) uniqueOwnerIds.add(id.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }));
                  imported.fixedDeposits?.forEach(item => item.ownerIds?.forEach(id => {
                    if (id) uniqueOwnerIds.add(id.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }));
                  imported.mutualFunds?.forEach(item => item.ownerIds?.forEach(id => {
                    if (id) uniqueOwnerIds.add(id.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }));

                  const existingIds = users.map(u => u.id);
                  const missingIds = Array.from(uniqueOwnerIds).filter(id => id && !existingIds.includes(id));

                  if (missingIds.length > 0) {
                    const AVATAR_COLORS = [
                      'bg-purple-600 text-white border-purple-500',
                      'bg-teal-600 text-white border-teal-500',
                      'bg-rose-600 text-white border-rose-500',
                      'bg-amber-600 text-white border-amber-500',
                      'bg-emerald-600 text-white border-emerald-500',
                      'bg-cyan-600 text-white border-cyan-500',
                      'bg-indigo-600 text-white border-indigo-500'
                    ];

                    const newUsers: UserProfile[] = missingIds.map((id, index) => {
                      const name = id.charAt(0).toUpperCase() + id.slice(1);
                      const initials = name.slice(0, 2).toUpperCase();
                      const avatarColor = AVATAR_COLORS[(existingIds.length + index) % AVATAR_COLORS.length];
                      return { id, name, initials, avatarColor };
                    });

                    setUsers(prev => [...prev, ...newUsers]);
                    setSelectedUserIds(prev => {
                      const next = [...prev];
                      newUsers.forEach(nu => {
                        if (!next.includes(nu.id)) {
                          next.push(nu.id);
                        }
                      });
                      return next;
                    });
                  }
                }}
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
                    ownerIds: [newUser.id]
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
                    ownerIds: [newUser.id]
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
                    className="w-full bg-slate-50 dark:bg-slate-850 !text-black border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
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

      {/* --- PROFILE PICTURE CHANGER POPUP MODAL --- */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col p-6 text-slate-800 dark:text-slate-100 animate-gpu"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsAvatarModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="text-center mt-2 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500/50 mx-auto mb-3 shadow-md bg-white">
                  <img
                    src={profilePic}
                    alt="Current Profile avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white leading-tight">
                  Choose Profile Picture
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select a classic silhouette or upload your own photo
                </p>
              </div>

              {/* Silhouette choices */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Default Silhouettes
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Man silhouette option */}
                  <button
                    type="button"
                    onClick={() => handleProfilePicChange(SILHOUETTES.man)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 ${
                      profilePic === SILHOUETTES.man 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:border-indigo-500/50' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden shadow-inner shrink-0 bg-white">
                      <img src={SILHOUETTES.man} alt="Man" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 tracking-tight leading-none">Man</span>
                  </button>

                  {/* Woman silhouette option */}
                  <button
                    type="button"
                    onClick={() => handleProfilePicChange(SILHOUETTES.woman)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 ${
                      profilePic === SILHOUETTES.woman 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:border-indigo-500/50' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden shadow-inner shrink-0 bg-white">
                      <img src={SILHOUETTES.woman} alt="Woman" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 tracking-tight leading-none">Woman</span>
                  </button>

                  {/* Family silhouette option */}
                  <button
                    type="button"
                    onClick={() => handleProfilePicChange(SILHOUETTES.family)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 ${
                      profilePic === SILHOUETTES.family 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:border-indigo-500/50' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden shadow-inner shrink-0 bg-white">
                      <img src={SILHOUETTES.family} alt="Family" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 tracking-tight leading-none">Family</span>
                  </button>
                </div>
              </div>

              {/* Custom Image Upload */}
              <div className="mt-5 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Upload Custom Photo
                </label>
                <label className="flex items-center justify-center gap-2.5 w-full py-3 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/30 dark:bg-slate-850/20 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 cursor-pointer transition-colors text-slate-600 dark:text-slate-400">
                  <Upload className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-semibold">Select Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Close Button at bottom */}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="mt-6 w-full py-3 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Confirm Changes</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time AI Assistant Bot Max */}
      <MaxAssistant 
        assetData={filteredAssetData} 
        currency={selectedCurrency} 
        portfolios={users}
      />

    </div>
  );
}
