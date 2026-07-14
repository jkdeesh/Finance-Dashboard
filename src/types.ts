export interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  balance: number;
  interestRate: number;
  currency?: CurrencyCode;
  notes?: string;
  ownerIds: string[]; // Change from ownerId: string
}

// ... Do the same for FixedDeposit and MutualFund interfaces ...

export interface FixedDeposit {
  id: string;
  bankName: string;
  depositNumber: string;
  principal: number;
  interestRate: number; // e.g. 6.5
  startDate: string;
  maturityDate: string;
  notes?: string;
  currency?: CurrencyCode; // Currency per FD
  ownerIds: string[];
}

export interface MutualFund {
  id: string;
  fundName: string;
  category: string; // e.g. "Equity", "Debt", "Index", "Sector"
  units: number;
  averageNav: number; // Buy Price
  currentNav: number; // Current Price
  currency?: CurrencyCode; // Currency per MF
  ownerIds: string[];
  investmentType?: 'Lumpsum' | 'SIP' | 'SWP' | 'Other';
}

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  avatarColor: string; // Tailwind class background
}

export interface PreciousAsset {
  id: string;
  name: string; // e.g. "Bridal Gold Necklace", "Heritage Diamond Ring"
  type: 'Gold' | 'Silver' | 'Platinum' | 'Diamond' | 'Other';
  weight: number; // weight or amount
  unit: 'grams' | 'kilograms' | 'pavun' | 'carats'; // pavun/sovereign = 8g, carats for diamonds
  karat?: '24K' | '22K' | '18K' | '14K'; // Gold purity
  purity?: 'Fine 99.9%' | 'Sterling 92.5%' | 'Other'; // Silver purity
  diamondSpecifics?: {
    caratWeight?: number;
    cut?: 'Round' | 'Princess' | 'Emerald' | 'Cushion' | 'Oval' | 'Other';
    clarity?: 'FL' | 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'I1';
    color?: 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'Other';
    diamondType?: 'Natural' | 'Lab-Grown' | 'Other';
  };
  purchasePrice?: number; // what they bought it for
  purchaseCurrency?: CurrencyCode;
  notes?: string;
  ownerIds: string[];
}

export interface Liability {
  id: string;
  lenderName: string; // e.g. "HDFC Bank", "Chase"
  liabilityType: 'Home Loan' | 'Personal Loan' | 'Car Loan' | 'Education Loan' | 'Credit Card' | 'Business Loan' | 'Other';
  totalAmount: number; // Total limit or total loan amount
  interestRate: number; // e.g. 8.5
  monthlyPayment: number; // EMI or average repayment
  startDate: string;
  endDate?: string;
  outstandingAmount: number; // Remaining debt
  notes?: string;
  currency?: CurrencyCode;
  ownerIds: string[];
}

export interface AssetData {
  bankSavings: BankAccount[];
  fixedDeposits: FixedDeposit[];
  mutualFunds: MutualFund[];
  immovableAssets: ImmovableAsset[];
  insurances: InsurancePolicy[];
  preciousAssets?: PreciousAsset[]; // Vault Reserves
  liabilities?: Liability[]; // Credit cards, loans, repayments
}

export type TabType = 'dashboard' | 'savings' | 'deposits' | 'funds' | 'terrafirma' | 'insurances' | 'precious' | 'account' | 'liabilities';

export interface ImmovableAsset {
  id: string;
  propertyName: string;
  propertyType: string; // e.g. "Residential", "Commercial", "Agricultural", "Vacant Land"
  area: number;
  unit: 'sqft' | 'cents' | 'grounds' | 'acres' | 'hectares';
  locationName: string;
  latitude: number;
  longitude: number;
  estimatedValue: number;
  currency?: CurrencyCode;
  notes?: string;
  ownerIds: string[];
}

export interface InsurancePolicy {
  id: string;
  policyName: string;
  policyType: string; // e.g. "Life (LIC)", "Health", "Vehicle", "Home", "Other"
  policyNumber: string;
  premiumAmount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annually';
  sumAssured: number;
  startDate: string;
  dueDate: string;
  status: 'Active' | 'Lapsed' | 'Matured';
  notes?: string;
  currency?: CurrencyCode;
  ownerIds: string[];
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', locale: 'ja-JP' },
};

export interface Wallpaper {
  id: string;
  name: string;
  url: string;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'misty-forest',
    name: 'Misty Pine Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop'
  },
  {
    id: 'alpine-lake',
    name: 'Alpine Reflection',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1920&auto=format&fit=crop'
  },
  {
    id: 'coastal-cliff',
    name: 'Coastal Sunset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop'
  },
  {
    id: 'aurora-borealis',
    name: 'Northern Aurora',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop'
  },
  {
    id: 'sahara-dunes',
    name: 'Golden Sahara',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1920&auto=format&fit=crop'
  },
  {
    id: 'starry-milkyway',
    name: 'Cosmic Sky',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1920&auto=format&fit=crop'
  },
  {
    id: 'fuji-cherry',
    name: 'Mount Fuji',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1920&auto=format&fit=crop'
  },
  {
    id: 'bamboo-kyoto',
    name: 'Arashiyama Bamboo',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1920&auto=format&fit=crop'
  }
];

export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 161.0,
};

export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const usdAmount = amount / EXCHANGE_RATES[from];
  return usdAmount * EXCHANGE_RATES[to];
}

export function safeRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'uuid-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);
}
