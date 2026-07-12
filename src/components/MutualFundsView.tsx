import React, { useState } from 'react';
import { MutualFund, CURRENCIES, CurrencyCode, convertCurrency, safeRandomUUID } from '../types';
import { GlassCard } from './GlassCard';
import { InstitutionLogo } from './InstitutionLogo';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  TrendingUp, 
  BarChart4, 
  Percent, 
  DollarSign, 
  X, 
  Check, 
  AlertCircle,
  TrendingDown,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

interface MutualFundsViewProps {
  funds: MutualFund[];
  onAddFund: (fund: MutualFund) => void;
  onEditFund: (fund: MutualFund) => void;
  onDeleteFund: (id: string) => void;
  selectedCurrency: CurrencyCode;
  onBackToDashboard: () => void;
  selectedUserIds?: string[];
}

export const MutualFundsView: React.FC<MutualFundsViewProps> = ({
  funds,
  onAddFund,
  onEditFund,
  onDeleteFund,
  selectedCurrency,
  onBackToDashboard,
  selectedUserIds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [fundName, setFundName] = useState('');
  const [category, setCategory] = useState('Index Funds');
  const [units, setUnits] = useState('');
  const [averageNav, setAverageNav] = useState('');
  const [currentNav, setCurrentNav] = useState('');
  const [fundCurrency, setFundCurrency] = useState<CurrencyCode>('INR');
  
  const [formError, setFormError] = useState('');
  const [deletingFund, setDeletingFund] = useState<MutualFund | null>(null);

  // Calculations
  const totalInvested = funds.reduce((sum, f) => sum + convertCurrency(f.units * f.averageNav, f.currency || 'INR', selectedCurrency), 0);
  const totalCurrent = funds.reduce((sum, f) => sum + convertCurrency(f.units * f.currentNav, f.currency || 'INR', selectedCurrency), 0);
  const totalGainLoss = totalCurrent - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const filteredFunds = funds.filter(f =>
    f.fundName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFundName('');
    setCategory('Index Funds');
    setUnits('');
    setAverageNav('');
    setCurrentNav('');
    setFundCurrency(selectedCurrency);
    setFormError('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (f: MutualFund) => {
    setEditingId(f.id);
    setFundName(f.fundName);
    setCategory(f.category);
    setUnits(f.units.toString());
    setAverageNav(f.averageNav.toString());
    setCurrentNav(f.currentNav.toString());
    setFundCurrency(f.currency || 'INR');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fundName.trim()) {
      setFormError('Fund Name is required.');
      return;
    }
    if (!units || isNaN(Number(units)) || Number(units) <= 0) {
      setFormError('Units must be a valid positive number.');
      return;
    }
    if (!averageNav || isNaN(Number(averageNav)) || Number(averageNav) <= 0) {
      setFormError('Average Purchase NAV must be a positive number.');
      return;
    }
    if (!currentNav || isNaN(Number(currentNav)) || Number(currentNav) <= 0) {
      setFormError('Current NAV must be a positive number.');
      return;
    }

    const fundData: MutualFund = {
      id: editingId || safeRandomUUID(),
      fundName: fundName.trim(),
      category,
      units: Number(units),
      averageNav: Number(averageNav),
      currentNav: Number(currentNav),
      currency: fundCurrency,
      ownerIds: editingId
        ? funds.find(f => f.id === editingId)?.ownerIds || []
        : (selectedUserIds && selectedUserIds.length > 0 ? [selectedUserIds[0]] : ['jagadeesh'])
    };

    if (editingId) {
      onEditFund(fundData);
    } else {
      onAddFund(fundData);
    }

    resetForm();
  };

  const currencyConfig = CURRENCIES[selectedCurrency] || CURRENCIES.INR;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatAccountCurrency = (val: number, currencyCode?: CurrencyCode) => {
    const code = currencyCode || 'INR';
    const config = CURRENCIES[code] || CURRENCIES.INR;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6" id="mutual-funds-view-root">
      
      {/* Header Banner */}
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
              <TrendingUp className="h-7 w-7 text-indigo-600" /> Mutual Funds & Equity
            </h1>
            <div className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium mt-1.5 block max-w-xl">
              Monitor open market index funds, equity portfolios, and active investment capital.
            </div>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Investment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-slate-500/10 rounded-2xl text-slate-700 dark:text-slate-300 border border-slate-500/10">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase block">Total Cost Basis</span>
            <span className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalInvested)}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-700 dark:text-indigo-400 border border-indigo-500/10">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase block">Current Market Value</span>
            <span className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalCurrent)}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 col-span-1 lg:col-span-2">
          <div className={`p-3 rounded-2xl border ${totalGainLoss >= 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/10' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/10'}`}>
            {totalGainLoss >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase block">Total Net Returns</span>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-display font-extrabold ${totalGainLoss >= 0 ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${totalGainLoss >= 0 ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 dark:bg-emerald-500/15' : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 dark:bg-rose-500/15'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Floating Add/Edit investment Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 shadow-2xl border border-white/40 dark:border-white/10">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-white/10 mb-4">
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                {editingId ? 'Edit Mutual Fund Asset' : 'Add Mutual Fund Asset'}
              </h3>
              <button onClick={resetForm} className="p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Fund Name / Ticker *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vanguard S&P 500 ETF (VOO)"
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer text-slate-900 dark:text-slate-100"
                  >
                    <option value="Index Funds" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">Index Funds</option>
                    <option value="Equity Growth" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">Equity Growth</option>
                    <option value="Dividend Yield" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">Dividend Yield</option>
                    <option value="Debt & Bond" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">Debt & Bond</option>
                    <option value="Hybrid Balanced" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">Hybrid Balanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Currency *</label>
                  <select
                    value={fundCurrency}
                    onChange={(e) => setFundCurrency(e.target.value as CurrencyCode)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer text-slate-900 dark:text-slate-100"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">
                        {c.symbol} &nbsp; {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Units Owned *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 45.2"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Buy Price *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 120"
                    value={averageNav}
                    onChange={(e) => setAverageNav(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Current NAV *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 472.30"
                    value={currentNav}
                    onChange={(e) => setCurrentNav(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Real-time projection inside form to help users */}
              {units && averageNav && currentNav && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-1">
                  <span className="font-semibold text-indigo-950 text-[10px] uppercase block tracking-wider">Dynamic Projection</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Total Cost:</span>
                      <span className="text-slate-800 font-bold">{formatAccountCurrency(Number(units) * Number(averageNav), fundCurrency)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Current Value:</span>
                      <span className="text-slate-800 font-bold">{formatAccountCurrency(Number(units) * Number(currentNav), fundCurrency)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Net Gains:</span>
                      <span className={`font-bold ${(Number(currentNav) - Number(averageNav)) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatAccountCurrency(Number(units) * (Number(currentNav) - Number(averageNav)), fundCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <Check className="h-4 w-4" /> {editingId ? 'Save Fund Record' : 'Log Investment'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Visual Cards of Mutual Funds */}
      <GlassCard>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">Fund Holdings</h3>
          
          <div className="relative w-full md:w-64 text-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search holding name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2 bg-white/40 border border-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {filteredFunds.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No mutual fund assets found</p>
            <p className="text-xs text-slate-600 mt-1">Add a mutual fund holding to your portfolio above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFunds.map((fund) => {
              const invested = fund.units * fund.averageNav;
              const currentVal = fund.units * fund.currentNav;
              const profit = currentVal - invested;
              const returnPct = invested > 0 ? (profit / invested) * 100 : 0;
              const isProfit = profit >= 0;

              return (
                <div 
                  key={fund.id} 
                  className="p-5 rounded-2xl bg-white/20 hover:bg-white/35 border border-white/30 shadow-sm transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <InstitutionLogo name={fund.fundName} size="md" className="mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-indigo-950 dark:text-indigo-200 font-extrabold text-sm block group-hover:text-indigo-900 dark:group-hover:text-indigo-300 truncate" title={fund.fundName}>{fund.fundName}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/85 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 text-[9px] font-bold mt-1.5 inline-block whitespace-nowrap">
                            {fund.category}
                          </span>
                        </div>
                      </div>
                      
                      <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${isProfit ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 dark:bg-emerald-500/10' : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 dark:bg-rose-500/10'}`}>
                        {isProfit ? '+' : ''}{returnPct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-200/10 text-xs font-mono">
                      <div className="min-w-0">
                        <span className="text-slate-500 dark:text-slate-300 text-[10px] block uppercase font-sans font-semibold truncate">Cost Basis</span>
                        <div className="text-slate-800 dark:text-slate-200 font-bold truncate">
                          {formatAccountCurrency(invested, fund.currency)}
                        </div>
                        {fund.currency && fund.currency !== selectedCurrency && (
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                            ≈ {formatCurrency(convertCurrency(invested, fund.currency, selectedCurrency))}
                          </div>
                        )}
                        <span className="text-slate-500 dark:text-slate-400 text-[9px] block font-sans mt-0.5 truncate">{fund.units} units @ {formatAccountCurrency(fund.averageNav, fund.currency)}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-slate-500 dark:text-slate-300 text-[10px] block uppercase font-sans font-semibold truncate">Market Value</span>
                        <div className="text-indigo-950 dark:text-indigo-100 font-extrabold truncate">
                          {formatAccountCurrency(currentVal, fund.currency)}
                        </div>
                        {fund.currency && fund.currency !== selectedCurrency && (
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                            ≈ {formatCurrency(convertCurrency(currentVal, fund.currency, selectedCurrency))}
                          </div>
                        )}
                        <span className="text-slate-500 dark:text-slate-400 text-[9px] block font-sans mt-0.5 truncate">Current NAV: {formatAccountCurrency(fund.currentNav, fund.currency)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-semibold">Unrealized returns</span>
                      <div className={`font-mono font-bold ${isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                        {isProfit ? '+' : ''}{formatAccountCurrency(profit, fund.currency)}
                      </div>
                      {fund.currency && fund.currency !== selectedCurrency && (
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold font-mono">
                          ≈ {formatCurrency(convertCurrency(profit, fund.currency, selectedCurrency))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(fund)}
                        className="p-1.5 hover:bg-white/40 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingFund(fund)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Delete Confirmation Modal */}
      {deletingFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 shadow-2xl border border-white/40 dark:border-white/10 p-6 text-center">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 mb-2">
              Confirm Investment Deletion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete your investment in <span className="font-semibold text-slate-900 dark:text-slate-100">{deletingFund.fundName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingFund(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-slate-200/40 dark:border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteFund(deletingFund.id);
                  setDeletingFund(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Delete Investment
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
};
