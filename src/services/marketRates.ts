import { CurrencyCode, EXCHANGE_RATES } from '../types';

// Real-world base benchmark rates in USD (per gram for metals, per carat for diamonds)
export interface BaseMetalRates {
  gold24k: number; // USD per gram
  gold22k: number; // USD per gram
  gold18k: number; // USD per gram
  gold14k: number; // USD per gram
  silver999: number; // USD per gram
  silver925: number; // USD per gram
  platinum: number; // USD per gram
  diamondBase: number; // USD per carat average
}

// Typical current actual benchmarks
const BASE_BENCHMARKS: BaseMetalRates = {
  gold24k: 78.50, // ~$2,440 per troy oz
  gold22k: 72.00, // ~91.6% of 24k
  gold18k: 58.80, // ~75.0% of 24k
  gold14k: 45.80, // ~58.3% of 24k
  silver999: 0.98, // ~$30.50 per troy oz
  silver925: 0.91, // ~92.5% of fine silver
  platinum: 32.50, // ~$1,010 per troy oz
  diamondBase: 4500.00, // Average carat price
};

export interface MarketRatesState {
  exchangeRates: Record<CurrencyCode, number>;
  metalRates: BaseMetalRates;
  lastUpdated: string;
  source: 'api' | 'fallback';
}

// Simple hash of date to get a stable, slightly fluctuating daily multiplier (-1.5% to +1.5%)
function getDailyFluctuation(): number {
  const date = new Date();
  const day = date.getDate() + date.getMonth() * 31;
  const sin = Math.sin(day); // value between -1 and 1
  return 1 + (sin * 0.015); // max 1.5% fluctuation
}

// Calculate custom diamond worth based on specifications (Cuts, Clarity, Colors)
export function getDiamondValuePerCarat(
  cut?: string,
  clarity?: string,
  color?: string,
  type?: 'Natural' | 'Lab-Grown' | 'Other'
): number {
  let value = BASE_BENCHMARKS.diamondBase;

  // Type factor
  if (type === 'Lab-Grown') {
    value *= 0.22; // Lab-grown is usually ~20-25% of natural diamond value
  } else if (type === 'Other') {
    value *= 0.50;
  }

  // Clarity multipliers
  const clarityMultipliers: Record<string, number> = {
    FL: 1.8,
    IF: 1.6,
    VVS1: 1.4,
    VVS2: 1.3,
    VS1: 1.15,
    VS2: 1.0,
    SI1: 0.85,
    SI2: 0.7,
    I1: 0.5,
  };
  if (clarity && clarityMultipliers[clarity]) {
    value *= clarityMultipliers[clarity];
  }

  // Color multipliers
  const colorMultipliers: Record<string, number> = {
    D: 1.4, // Exceptional colorless
    E: 1.3,
    F: 1.2,
    G: 1.1, // Near colorless
    H: 1.0,
    I: 0.9,
    J: 0.8,
    K: 0.7,
    L: 0.6,
    M: 0.5,
  };
  if (color && colorMultipliers[color]) {
    value *= colorMultipliers[color];
  }

  // Cut multipliers
  const cutMultipliers: Record<string, number> = {
    Round: 1.15, // Round brilliant has highest premium
    Princess: 1.0,
    Emerald: 0.95,
    Cushion: 0.9,
    Oval: 1.05,
  };
  if (cut && cutMultipliers[cut]) {
    value *= cutMultipliers[cut];
  }

  return value;
}

// Convert precious metal weight to grams
export function convertToGrams(weight: number, unit: 'grams' | 'kilograms' | 'pavun' | 'carats'): number {
  switch (unit) {
    case 'kilograms':
      return weight * 1000;
    case 'pavun':
      return weight * 8; // 1 pavun/sovereign = 8g of 22k gold
    case 'carats':
      return weight * 0.2; // 1 carat = 0.2g (used primarily for diamond base weights if needed, though we use carat for pricing)
    case 'grams':
    default:
      return weight;
  }
}

// Load current rates (using cached localstorage or fetching from free API)
export async function fetchMarketRates(): Promise<MarketRatesState> {
  const cacheKey = 'asset_tracker_market_rates_v1';
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as MarketRatesState;
      if (parsed.lastUpdated === todayStr) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached rates', e);
  }

  // Live currency fetch from completely free open-access API
  let fetchedRates: Record<CurrencyCode, number> = { ...EXCHANGE_RATES };
  let source: 'api' | 'fallback' = 'fallback';

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        const rates = data.rates;
        fetchedRates = {
          USD: 1.0,
          INR: rates.INR || EXCHANGE_RATES.INR,
          EUR: rates.EUR || EXCHANGE_RATES.EUR,
          GBP: rates.GBP || EXCHANGE_RATES.GBP,
          JPY: rates.JPY || EXCHANGE_RATES.JPY,
        };
        source = 'api';
      }
    }
  } catch (error) {
    console.warn('Could not fetch exchange rates from API, using fallback exchange rates:', error);
  }

  // Adjust precious metal rates with today's mild fluctuations
  const fluctuation = getDailyFluctuation();
  const metalRates: BaseMetalRates = {
    gold24k: Number((BASE_BENCHMARKS.gold24k * fluctuation).toFixed(2)),
    gold22k: Number((BASE_BENCHMARKS.gold22k * fluctuation).toFixed(2)),
    gold18k: Number((BASE_BENCHMARKS.gold18k * fluctuation).toFixed(2)),
    gold14k: Number((BASE_BENCHMARKS.gold14k * fluctuation).toFixed(2)),
    silver999: Number((BASE_BENCHMARKS.silver999 * fluctuation).toFixed(3)),
    silver925: Number((BASE_BENCHMARKS.silver925 * fluctuation).toFixed(3)),
    platinum: Number((BASE_BENCHMARKS.platinum * fluctuation).toFixed(2)),
    diamondBase: Number((BASE_BENCHMARKS.diamondBase * fluctuation).toFixed(2)),
  };

  const state: MarketRatesState = {
    exchangeRates: fetchedRates,
    metalRates,
    lastUpdated: todayStr,
    source,
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save market rates state to local storage', e);
  }

  return state;
}

// Calculate current USD value of a precious asset
export function calculatePreciousAssetUSD(asset: any, metalRates: BaseMetalRates): number {
  if (asset.purchasePrice && asset.purchaseCurrency && !asset.weight) {
    // Fallback if they only specified custom purchase details
    const fromRate = EXCHANGE_RATES[asset.purchaseCurrency as CurrencyCode] || 1;
    return asset.purchasePrice / fromRate;
  }

  let valueInUSD = 0;

  if (asset.type === 'Gold') {
    const grams = convertToGrams(asset.weight, asset.unit);
    let rate = metalRates.gold24k;
    if (asset.karat === '22K' || asset.unit === 'pavun') rate = metalRates.gold22k;
    else if (asset.karat === '18K') rate = metalRates.gold18k;
    else if (asset.karat === '14K') rate = metalRates.gold14k;
    
    valueInUSD = grams * rate;
  } else if (asset.type === 'Silver') {
    const grams = convertToGrams(asset.weight, asset.unit);
    let rate = metalRates.silver999;
    if (asset.purity === 'Sterling 92.5%') rate = metalRates.silver925;
    
    valueInUSD = grams * rate;
  } else if (asset.type === 'Platinum') {
    const grams = convertToGrams(asset.weight, asset.unit);
    valueInUSD = grams * metalRates.platinum;
  } else if (asset.type === 'Diamond') {
    // For diamonds, weight is entered in carats
    const caratWeight = asset.weight; // standard for diamonds
    const pricePerCarat = getDiamondValuePerCarat(
      asset.diamondSpecifics?.cut,
      asset.diamondSpecifics?.clarity,
      asset.diamondSpecifics?.color,
      asset.diamondSpecifics?.diamondType
    );
    valueInUSD = caratWeight * pricePerCarat;
  } else {
    // Other / custom ornaments
    if (asset.purchasePrice) {
      const fromCurr = asset.purchaseCurrency || 'INR';
      // Convert purchase price to USD
      valueInUSD = asset.purchasePrice / (EXCHANGE_RATES[fromCurr as CurrencyCode] || 1);
    } else {
      valueInUSD = 100; // baseline fallback
    }
  }

  return valueInUSD;
}
