import React, { useState, useMemo } from 'react';
import { PreciousAsset, CURRENCIES, CurrencyCode, safeRandomUUID } from '../types';
import { GlassCard } from './GlassCard';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  X, 
  Check, 
  ArrowLeft,
  Coins,
  Scale,
  Award,
  Gem,
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BaseMetalRates, calculatePreciousAssetUSD, convertToGrams } from '../services/marketRates';

interface PreciousReservesViewProps {
  assets: PreciousAsset[];
  onAddAsset: (asset: PreciousAsset) => void;
  onEditAsset: (asset: PreciousAsset) => void;
  onDeleteAsset: (id: string) => void;
  selectedCurrency: CurrencyCode;
  onBackToDashboard: () => void;
  selectedUserIds: string[];
  marketRates: {
    exchangeRates: Record<CurrencyCode, number>;
    metalRates: BaseMetalRates;
    lastUpdated: string;
    source: 'api' | 'fallback';
  } | null;
  onRefreshRates?: () => void;
}

export const PreciousReservesView: React.FC<PreciousReservesViewProps> = ({
  assets,
  onAddAsset,
  onEditAsset,
  onDeleteAsset,
  selectedCurrency,
  onBackToDashboard,
  selectedUserIds,
  marketRates,
  onRefreshRates,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'Gold' | 'Silver' | 'Platinum' | 'Diamond' | 'Other'>('Gold');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'grams' | 'kilograms' | 'pavun' | 'carats'>('grams');
  const [karat, setKarat] = useState<'24K' | '22K' | '18K' | '14K'>('22K');
  const [purity, setPurity] = useState<'Fine 99.9%' | 'Sterling 92.5%' | 'Other'>('Fine 99.9%');
  
  // Diamond details
  const [diamondCut, setDiamondCut] = useState<'Round' | 'Princess' | 'Emerald' | 'Cushion' | 'Oval' | 'Other'>('Round');
  const [diamondClarity, setDiamondClarity] = useState<'FL' | 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'I1'>('VS1');
  const [diamondColor, setDiamondColor] = useState<'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'Other'>('G');
  const [diamondType, setDiamondType] = useState<'Natural' | 'Lab-Grown' | 'Other'>('Natural');

  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseCurrency, setPurchaseCurrency] = useState<CurrencyCode>('INR');
  const [notes, setNotes] = useState('');
  const [ownerIds, setOwnerIds] = useState<string[]>([]);

  const [formError, setFormError] = useState('');
  const [deletingAsset, setDeletingAsset] = useState<PreciousAsset | null>(null);

  // Extract base values from market rates
  const currentRates = useMemo(() => {
    if (marketRates) return marketRates;
    // Fallbacks
    return {
      exchangeRates: { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.78, JPY: 161.0 },
      metalRates: {
        gold24k: 78.50,
        gold22k: 72.00,
        gold18k: 58.80,
        gold14k: 45.80,
        silver999: 0.98,
        silver925: 0.91,
        platinum: 32.50,
        diamondBase: 4500.00
      },
      lastUpdated: new Date().toISOString().split('T')[0],
      source: 'fallback' as const
    };
  }, [marketRates]);

  // Convert USD to base active currency
  const convertUSDToSelected = (amountUSD: number) => {
    const rate = currentRates.exchangeRates[selectedCurrency] || 1;
    return amountUSD * rate;
  };

  // Format currency nicely
  const formatCurrency = (val: number) => {
    const config = CURRENCIES[selectedCurrency] || CURRENCIES.INR;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatSpecificCurrency = (val: number, code: CurrencyCode) => {
    const config = CURRENCIES[code] || CURRENCIES.INR;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Dynamic calculations for assets
  const calculatedAssets = useMemo(() => {
    return assets.map(asset => {
      const usdValue = calculatePreciousAssetUSD(asset, currentRates.metalRates);
      const convertedValue = convertUSDToSelected(usdValue);
      return {
        ...asset,
        currentValueUSD: usdValue,
        currentValueSelected: convertedValue
      };
    });
  }, [assets, currentRates, selectedCurrency]);

  // Aggregate stats
  const totalValuation = calculatedAssets.reduce((sum, a) => sum + a.currentValueSelected, 0);
  const goldValuation = calculatedAssets.filter(a => a.type === 'Gold').reduce((sum, a) => sum + a.currentValueSelected, 0);
  const silverValuation = calculatedAssets.filter(a => a.type === 'Silver').reduce((sum, a) => sum + a.currentValueSelected, 0);
  const gemValuation = calculatedAssets.filter(a => a.type === 'Diamond' || a.type === 'Platinum' || a.type === 'Other').reduce((sum, a) => sum + a.currentValueSelected, 0);

  // Filter & Search
  const filteredAssets = useMemo(() => {
    return calculatedAssets.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (a.notes && a.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'All' || a.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [calculatedAssets, searchTerm, filterType]);

  const resetForm = () => {
    setName('');
    setType('Gold');
    setWeight('');
    setUnit('grams');
    setKarat('22K');
    setPurity('Fine 99.9%');
    setDiamondCut('Round');
    setDiamondClarity('VS1');
    setDiamondColor('G');
    setDiamondType('Natural');
    setPurchasePrice('');
    setPurchaseCurrency(selectedCurrency);
    setNotes('');
    setOwnerIds(selectedUserIds.length > 0 ? [selectedUserIds[0]] : []);
    setFormError('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (asset: PreciousAsset) => {
    setEditingId(asset.id);
    setName(asset.name);
    setType(asset.type);
    setWeight(asset.weight.toString());
    setUnit(asset.unit);
    if (asset.karat) setKarat(asset.karat);
    if (asset.purity) setPurity(asset.purity);
    if (asset.diamondSpecifics) {
      if (asset.diamondSpecifics.cut) setDiamondCut(asset.diamondSpecifics.cut);
      if (asset.diamondSpecifics.clarity) setDiamondClarity(asset.diamondSpecifics.clarity);
      if (asset.diamondSpecifics.color) setDiamondColor(asset.diamondSpecifics.color);
      if (asset.diamondSpecifics.diamondType) setDiamondType(asset.diamondSpecifics.diamondType);
    }
    setPurchasePrice(asset.purchasePrice ? asset.purchasePrice.toString() : '');
    setPurchaseCurrency(asset.purchaseCurrency || selectedCurrency);
    setNotes(asset.notes || '');
    setOwnerIds(asset.ownerIds || []);
    setIsFormOpen(true);
  };

  const handleOpenNewForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Asset description name is required.');
      return;
    }

    if (type !== 'Other' && (!weight || isNaN(Number(weight)) || Number(weight) <= 0)) {
      setFormError('Please enter a valid weight.');
      return;
    }

    if (ownerIds.length === 0) {
      setFormError('Please select at least one portfolio owner.');
      return;
    }

    const payload: PreciousAsset = {
      id: editingId || safeRandomUUID(),
      name: name.trim(),
      type,
      weight: type === 'Other' ? 0 : Number(weight),
      unit: type === 'Diamond' ? 'carats' : unit,
      karat: type === 'Gold' ? karat : undefined,
      purity: type === 'Silver' ? purity : undefined,
      diamondSpecifics: type === 'Diamond' ? {
        caratWeight: Number(weight),
        cut: diamondCut,
        clarity: diamondClarity,
        color: diamondColor,
        diamondType: diamondType
      } : undefined,
      purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      purchaseCurrency: purchasePrice ? purchaseCurrency : undefined,
      notes: notes.trim() || undefined,
      ownerIds,
    };

    if (editingId) {
      onEditAsset(payload);
    } else {
      onAddAsset(payload);
    }

    resetForm();
  };

  const toggleOwner = (ownerId: string) => {
    setOwnerIds(prev => 
      prev.includes(ownerId) 
        ? prev.filter(id => id !== ownerId) 
        : [...prev, ownerId]
    );
  };

  return (
    <div className="space-y-6" id="precious-reserves-view-root">
      
      {/* Header Info Block */}
      <div className="glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
        <div className="space-y-3">
          <button
            onClick={onBackToDashboard}
            className="group flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer bg-slate-100/55 dark:bg-slate-800/55 hover:bg-slate-200/55 dark:hover:bg-slate-700/55 px-3 py-1.5 rounded-xl border border-slate-200/40 dark:border-white/10 shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 text-indigo-700" /> Back to Dashboard
          </button>
          <div>
            <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Coins className="h-7 w-7 text-amber-500 shrink-0" /> Vault Reserves & Precious Metals
            </h1>
            <div className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium mt-1.5 block max-w-xl">
              Manage physical gold, sterling silver, certified diamonds, and family jewelry with live dynamic valuations.
            </div>
          </div>
        </div>
        <button
          onClick={handleOpenNewForm}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Deposit Asset
        </button>
      </div>

      {/* Real-time Ticker Ticker */}
      <GlassCard className="border border-amber-500/25 dark:border-amber-500/10 overflow-hidden bg-gradient-to-r from-amber-500/5 to-yellow-500/5 dark:from-amber-500/10 dark:to-yellow-500/5">
        <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <div className="text-indigo-950 dark:text-amber-300 font-bold uppercase tracking-wider text-[9px]">Live Market Rates Indicator</div>
              <div className="text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                Precious metals globally trade in USD; conversion is active for <span className="font-extrabold text-indigo-950 dark:text-white">{selectedCurrency}</span>. Updated daily.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 md:justify-end text-[11px] font-mono text-slate-700 dark:text-slate-200">
            <div>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Gold (24K):</span> {formatCurrency(convertUSDToSelected(currentRates.metalRates.gold24k))}/g
            </div>
            <div>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Gold (22K):</span> {formatCurrency(convertUSDToSelected(currentRates.metalRates.gold22k))}/g
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold">Silver:</span> {formatCurrency(convertUSDToSelected(currentRates.metalRates.silver999))}/g
            </div>
            <div>
              <span className="text-sky-500 dark:text-sky-400 font-bold">Platinum:</span> {formatCurrency(convertUSDToSelected(currentRates.metalRates.platinum))}/g
            </div>
          </div>
          {onRefreshRates && (
            <button 
              onClick={onRefreshRates} 
              className="p-1.5 hover:bg-slate-100/15 rounded-lg border border-slate-300/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              title="Refresh rates"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="text-[10px]">Refresh</span>
            </button>
          )}
        </div>
      </GlassCard>

      {/* Summary Stats Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex flex-col justify-between min-w-0 w-full">
          <div className="min-w-0">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block" title="Total Vault Valuation">Total Vault Valuation</span>
            <span className="text-xl md:text-2xl font-display font-black text-amber-500 dark:text-amber-400 mt-1 block whitespace-nowrap">
              {formatCurrency(totalValuation)}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-3 block border-t border-slate-200/10 pt-1.5 whitespace-nowrap">
            Sum of all physical items
          </span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between min-w-0 w-full">
          <div className="min-w-0">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block" title="Gold Portfolio">Gold Portfolio</span>
            <span className="text-xl font-display font-bold text-yellow-600 dark:text-yellow-400 mt-1 block whitespace-nowrap">
              {formatCurrency(goldValuation)}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-3 block border-t border-slate-200/10 pt-1.5 whitespace-nowrap">
            {calculatedAssets.filter(a => a.type === 'Gold').length} items • {calculatedAssets.filter(a => a.type === 'Gold').reduce((sum, a) => sum + convertToGrams(a.weight, a.unit), 0).toFixed(1)}g total
          </span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between min-w-0 w-full">
          <div className="min-w-0">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block" title="Silver Portfolio">Silver Portfolio</span>
            <span className="text-xl font-display font-bold text-slate-600 dark:text-slate-300 mt-1 block whitespace-nowrap">
              {formatCurrency(silverValuation)}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-3 block border-t border-slate-200/10 pt-1.5 whitespace-nowrap">
            {calculatedAssets.filter(a => a.type === 'Silver').length} items • {calculatedAssets.filter(a => a.type === 'Silver').reduce((sum, a) => sum + convertToGrams(a.weight, a.unit), 0).toFixed(1)}g total
          </span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between min-w-0 w-full">
          <div className="min-w-0">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block" title="Gems & Platinum">Gems & Platinum</span>
            <span className="text-xl font-display font-bold text-sky-600 dark:text-sky-300 mt-1 block whitespace-nowrap">
              {formatCurrency(gemValuation)}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-3 block border-t border-slate-200/10 pt-1.5 whitespace-nowrap">
            Diamonds, Platinum, and custom items
          </span>
        </GlassCard>
      </div>

      {/* Core Lists / Management */}
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ornaments, bars, or coins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/30 dark:bg-slate-800/30 text-slate-900 dark:text-slate-100 border border-white/40 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Type Filters */}
          <div className="flex gap-1 bg-white/20 dark:bg-slate-900/30 p-1 rounded-xl border border-white/20 w-full md:w-auto overflow-x-auto scrollbar-none">
            {['All', 'Gold', 'Silver', 'Platinum', 'Diamond', 'Other'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === t 
                    ? 'bg-amber-500 text-slate-950 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Listing cards */}
        {filteredAssets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center glass-panel border-dashed border-white/20 rounded-2xl">
            <Coins className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3 animate-bounce" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">No Precious Items Found</p>
            <p className="text-[10px] text-slate-405 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
              Add your precious metals or stones, wedding jewelry, or physical gold/silver reserves to track their dynamic appreciation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
            {filteredAssets.map(asset => {
              const displayWeight = asset.type === 'Other' ? '' : `${asset.weight} ${asset.unit}`;
              const hasPurity = asset.karat || asset.purity;

              return (
                <GlassCard key={asset.id} className="p-5 flex flex-col justify-between hover:scale-[1.01] transition-transform relative group border border-slate-200/10 hover:border-amber-500/20">
                  <div>
                    {/* Icon and Type Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                        asset.type === 'Gold' ? 'bg-yellow-500/15 border-yellow-500/25 text-yellow-600 dark:text-yellow-400' :
                        asset.type === 'Silver' ? 'bg-slate-500/15 border-slate-500/25 text-slate-700 dark:text-slate-350' :
                        asset.type === 'Diamond' ? 'bg-sky-500/15 border-sky-500/25 text-sky-600 dark:text-sky-350' :
                        'bg-purple-500/15 border-purple-500/25 text-purple-600 dark:text-purple-350'
                      }`}>
                        {asset.type === 'Gold' && <Coins className="h-3 w-3" />}
                        {asset.type === 'Silver' && <Scale className="h-3 w-3" />}
                        {asset.type === 'Platinum' && <Award className="h-3 w-3" />}
                        {asset.type === 'Diamond' && <Gem className="h-3 w-3" />}
                        {asset.type === 'Other' && <Sparkles className="h-3 w-3" />}
                        <span>{asset.type}</span>
                      </span>

                      {/* Controls */}
                      <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEditClick(asset)}
                          className="p-1.5 text-indigo-950 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                          title="Edit Ornament details"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingAsset(asset)}
                          className="p-1.5 text-rose-550 dark:text-rose-450 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-all"
                          title="Purge Item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                      {asset.name}
                    </h3>

                    {/* Specific details (Karat/Diamond info) */}
                    <div className="mt-2.5 space-y-1 text-[10px] font-medium text-slate-550 dark:text-slate-400">
                      {asset.type === 'Gold' && (
                        <div className="flex items-center gap-1.5">
                          <Award className="h-3 w-3 text-amber-500 shrink-0" />
                          <span>Purity: <strong className="text-slate-900 dark:text-slate-200">{asset.karat} Gold</strong></span>
                        </div>
                      )}
                      {asset.type === 'Silver' && (
                        <div className="flex items-center gap-1.5">
                          <Award className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>Grade: <strong className="text-slate-900 dark:text-slate-200">{asset.purity}</strong></span>
                        </div>
                      )}
                      {asset.type === 'Diamond' && asset.diamondSpecifics && (
                        <div className="p-2 bg-slate-100/40 dark:bg-slate-950/20 rounded-xl space-y-1 text-[9px] font-mono leading-relaxed mt-2 text-slate-600 dark:text-slate-300 border border-slate-200/20">
                          <div><span className="font-bold">Type:</span> {asset.diamondSpecifics.diamondType} ({asset.weight} ct)</div>
                          <div><span className="font-bold">Cut:</span> {asset.diamondSpecifics.cut}</div>
                          <div><span className="font-bold">Clarity & Color:</span> {asset.diamondSpecifics.clarity} • {asset.diamondSpecifics.color}</div>
                        </div>
                      )}
                      {displayWeight && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Scale className="h-3 w-3 text-indigo-500 shrink-0" />
                          <span>Quantity: <strong className="text-slate-900 dark:text-slate-200">{displayWeight}</strong></span>
                        </div>
                      )}
                      {asset.notes && (
                        <p className="text-[10px] italic leading-normal text-slate-400 dark:text-slate-500 line-clamp-2 mt-2">
                          "{asset.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Valuation */}
                  <div className="mt-5 pt-3.5 border-t border-slate-200/10 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Estimated Worth</span>
                      <span className="text-sm font-display font-black text-amber-500 dark:text-amber-400 mt-0.5 block">
                        {formatCurrency(asset.currentValueSelected)}
                      </span>
                    </div>

                    {asset.purchasePrice && asset.purchaseCurrency && (
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Bought For</span>
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5 block">
                          {formatSpecificCurrency(asset.purchasePrice, asset.purchaseCurrency)}
                        </span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Sliding Side Form Panel */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-slate-950 z-45"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 shadow-2xl flex flex-col text-slate-850 dark:text-slate-100 h-full"
            >
              {/* Form Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-500" />
                  <h2 className="text-base font-display font-extrabold text-slate-900 dark:text-white">
                    {editingId ? 'Edit Vault Asset' : 'Deposit Ornament or Bar/Coin'}
                  </h2>
                </div>
                <button 
                  onClick={resetForm}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {formError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Asset Label / Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bridal 22K Gold Aaram, Heritage Diamond Ring"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                  />
                </div>

                {/* Type & Unit Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Asset Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => {
                        const newT = e.target.value as any;
                        setType(newT);
                        // Sensible default unit based on type choice
                        if (newT === 'Diamond') {
                          setUnit('carats');
                        } else if (newT === 'Gold' || newT === 'Silver' || newT === 'Platinum') {
                          setUnit('grams');
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                    >
                      <option value="Gold" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Gold</option>
                      <option value="Silver" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Silver</option>
                      <option value="Platinum" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Platinum</option>
                      <option value="Diamond" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Diamond</option>
                      <option value="Other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Other Ornament</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Measuring Unit
                    </label>
                    <select
                      disabled={type === 'Diamond' || type === 'Other'}
                      value={type === 'Diamond' ? 'carats' : unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold disabled:opacity-50"
                    >
                      {type === 'Diamond' ? (
                        <option value="carats" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">carats (ct)</option>
                      ) : (
                        <>
                          <option value="grams" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Grams (g)</option>
                          <option value="kilograms" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Kilograms (kg)</option>
                          {type === 'Gold' && <option value="pavun" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pavun / Sovereign (8g)</option>}
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Conditional Purity selections */}
                {type === 'Gold' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Gold Purity (Karat)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['24K', '22K', '18K', '14K'] as const).map(k => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setKarat(k)}
                          className={`py-2 text-xs font-bold border rounded-xl transition-all cursor-pointer ${
                            karat === k 
                              ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm' 
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {type === 'Silver' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Silver Purity Grade
                    </label>
                    <select
                      value={purity}
                      onChange={(e) => setPurity(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                    >
                      <option value="Fine 99.9%" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Fine 99.9% (Pure Bars & Coins)</option>
                      <option value="Sterling 92.5%" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Sterling 92.5% (Heirlooms/Utensils)</option>
                      <option value="Other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Other Purity / Alloy</option>
                    </select>
                  </div>
                )}

                {/* Conditional Diamond Details */}
                {type === 'Diamond' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 space-y-3.5">
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Gem className="h-3.5 w-3.5" />
                      <span>Certified Diamond Specifications</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Diamond Origin Type */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Diamond Type</label>
                        <select
                          value={diamondType}
                          onChange={(e) => setDiamondType(e.target.value as any)}
                          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="Natural">Natural Diamond</option>
                          <option value="Lab-Grown">Lab-Grown</option>
                          <option value="Other">Other Synthetic</option>
                        </select>
                      </div>

                      {/* Cut Shape */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Cut / Shape</label>
                        <select
                          value={diamondCut}
                          onChange={(e) => setDiamondCut(e.target.value as any)}
                          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="Round">Round Brilliant</option>
                          <option value="Princess">Princess</option>
                          <option value="Emerald">Emerald</option>
                          <option value="Cushion">Cushion</option>
                          <option value="Oval">Oval</option>
                          <option value="Other">Other Cut</option>
                        </select>
                      </div>

                      {/* Clarity */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Clarity Grade</label>
                        <select
                          value={diamondClarity}
                          onChange={(e) => setDiamondClarity(e.target.value as any)}
                          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="FL">FL (Flawless)</option>
                          <option value="IF">IF (Internally Flawless)</option>
                          <option value="VVS1">VVS1 (Very Very Slightly Included 1)</option>
                          <option value="VVS2">VVS2 (Very Very Slightly Included 2)</option>
                          <option value="VS1">VS1 (Very Slightly Included 1)</option>
                          <option value="VS2">VS2 (Very Slightly Included 2)</option>
                          <option value="SI1">SI1 (Slightly Included 1)</option>
                          <option value="SI2">SI2 (Slightly Included 2)</option>
                          <option value="I1">I1 (Included 1)</option>
                        </select>
                      </div>

                      {/* Color */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Color Grade</label>
                        <select
                          value={diamondColor}
                          onChange={(e) => setDiamondColor(e.target.value as any)}
                          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="D">D (Colorless - Premium)</option>
                          <option value="E">E (Colorless)</option>
                          <option value="F">F (Colorless)</option>
                          <option value="G">G (Near Colorless)</option>
                          <option value="H">H (Near Colorless)</option>
                          <option value="I">I (Near Colorless)</option>
                          <option value="J">J (Near Colorless)</option>
                          <option value="K">K (Faint Color)</option>
                          <option value="L">L (Faint Color)</option>
                          <option value="M">M (Faint Color)</option>
                          <option value="Other">Other Fancy</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weight Input (Hide for Type: Other) */}
                {type !== 'Other' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {type === 'Diamond' ? 'Weight in Carats' : `Weight in ${unit}`}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder={type === 'Diamond' ? 'e.g. 1.25' : 'e.g. 32'}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-24 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 font-mono text-[10px] pointer-events-none select-none">
                        {type === 'Diamond' ? 'ct' : unit}
                      </div>
                    </div>
                    {unit === 'pavun' && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-1">
                        💡 1 Pavun/Sovereign is equivalent to 8 grams of 22K gold.
                      </span>
                    )}
                  </div>
                )}

                {/* Custom Purchase cost (optional, help override custom value if other ornament) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Purchase Price & Currency <span className="text-[10px] text-slate-400 dark:text-slate-500">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="col-span-2 w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                    />
                    <select
                      value={purchaseCurrency}
                      onChange={(e) => setPurchaseCurrency(e.target.value as CurrencyCode)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                    >
                      {Object.keys(CURRENCIES).map(code => (
                        <option key={code} value={code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{code}</option>
                      ))}
                    </select>
                  </div>
                  {type === 'Other' && (
                    <span className="text-[9px] text-amber-550 dark:text-amber-400 font-semibold block leading-normal mt-1">
                      * Since custom ornaments don't have direct metal weight formulas, their valuation is derived directly from the converted purchase price.
                    </span>
                  )}
                </div>

                {/* Owner IDs */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Vault Owner / Custodians
                  </label>
                  <div className="space-y-1.5">
                    {selectedUserIds.length === 0 ? (
                      <p className="text-[10px] text-rose-500 font-medium">Please select a user in the sidebar to allocate ownership.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedUserIds.map((userId) => (
                          <button
                            key={userId}
                            type="button"
                            onClick={() => toggleOwner(userId)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              ownerIds.includes(userId)
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span className="capitalize">{userId}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Heirloom Context / Custody Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Gifted during marriage, stored in Bank Vault Locker #2."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-medium resize-none"
                  />
                </div>
              </form>

              {/* Form Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-250 font-extrabold rounded-2xl text-xs transition-all cursor-pointer border border-slate-300/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs transition-all cursor-pointer border border-amber-300/10"
                >
                  {editingId ? 'Save Changes' : 'Deposit to Vault'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deletingAsset && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingAsset(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 flex flex-col text-slate-800 dark:text-slate-100"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400 border border-rose-200/50">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
                  Confirm Removal
                </h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Are you absolutely certain you want to remove <strong className="text-slate-900 dark:text-white">"{deletingAsset.name}"</strong> from your precious vault records?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingAsset(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteAsset(deletingAsset.id);
                    setDeletingAsset(null);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
