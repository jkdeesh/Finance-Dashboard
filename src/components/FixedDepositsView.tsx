import React, { useState } from 'react';
import { FixedDeposit, CURRENCIES, CurrencyCode, convertCurrency, safeRandomUUID } from '../types';
import { GlassCard } from './GlassCard';
import { InstitutionLogo } from './InstitutionLogo';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Calendar, 
  TrendingUp, 
  BadgePercent, 
  Clock, 
  X, 
  Check, 
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  IndianRupee
} from 'lucide-react';

const RupeeCoin = ({ className, ...props }: any) => {
  return (
    <div className={`inline-flex items-center justify-center rounded-full border border-current shrink-0 p-[1px] aspect-square ${className || ''}`}>
      <IndianRupee className="h-[70%] w-[70%] stroke-[2.5]" {...props} />
    </div>
  );
};

interface FixedDepositsViewProps {
  deposits: FixedDeposit[];
  onAddDeposit: (deposit: FixedDeposit) => void;
  onEditDeposit: (deposit: FixedDeposit) => void;
  onDeleteDeposit: (id: string) => void;
  selectedCurrency: CurrencyCode;
  onBackToDashboard: () => void;
  selectedUserIds?: string[];
}

export const FixedDepositsView: React.FC<FixedDepositsViewProps> = ({
  deposits,
  onAddDeposit,
  onEditDeposit,
  onDeleteDeposit,
  selectedCurrency,
  onBackToDashboard,
  selectedUserIds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [bankName, setBankName] = useState('');
  const [depositNumber, setDepositNumber] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [depositCurrency, setDepositCurrency] = useState<CurrencyCode>('INR');
  const [notes, setNotes] = useState('');
  
  const [formError, setFormError] = useState('');
  const [deletingDeposit, setDeletingDeposit] = useState<FixedDeposit | null>(null);

  // Calculations
  const totalPrincipal = deposits.reduce((sum, dep) => sum + convertCurrency(dep.principal, dep.currency || 'INR', selectedCurrency), 0);

  // Helper: calculate maturity value (simple or annual compound interest)
  const getCDCalculations = (dep: FixedDeposit) => {
    const start = new Date(dep.startDate);
    const end = new Date(dep.maturityDate);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const years = timeDiff / (1000 * 60 * 60 * 24 * 365.25);
    
    const simpleInterest = dep.principal * (dep.interestRate / 100) * years;
    const maturityVal = dep.principal + simpleInterest;

    // Days remaining
    const today = new Date();
    const totalDays = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    const percentageElapsed = Math.min(100, (elapsedDays / totalDays) * 100);

    return {
      interestEarned: simpleInterest,
      maturityValue: maturityVal,
      remainingDays,
      totalDays,
      percentageElapsed,
      isMatured: remainingDays <= 0,
    };
  };

  const totalMaturityValue = deposits.reduce((sum, dep) => {
    const cdCalculations = getCDCalculations(dep);
    return sum + convertCurrency(cdCalculations.maturityValue, dep.currency || 'INR', selectedCurrency);
  }, 0);

  const totalInterestExpected = totalMaturityValue - totalPrincipal;

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

  const filteredDeposits = deposits.filter(dep =>
    dep.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dep.depositNumber.includes(searchTerm)
  );

  const resetForm = () => {
    setBankName('');
    setDepositNumber('');
    setPrincipal('');
    setInterestRate('');
    setStartDate('');
    setMaturityDate('');
    setDepositCurrency(selectedCurrency);
    setNotes('');
    setFormError('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (dep: FixedDeposit) => {
    setEditingId(dep.id);
    setBankName(dep.bankName);
    setDepositNumber(dep.depositNumber);
    setPrincipal(dep.principal.toString());
    setInterestRate(dep.interestRate.toString());
    setStartDate(dep.startDate);
    setMaturityDate(dep.maturityDate);
    setDepositCurrency(dep.currency || 'INR');
    setNotes(dep.notes || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!bankName.trim()) {
      setFormError('Bank Name is required.');
      return;
    }
    if (!principal || isNaN(Number(principal)) || Number(principal) <= 0) {
      setFormError('Please enter a valid positive principal amount.');
      return;
    }
    if (!interestRate || isNaN(Number(interestRate)) || Number(interestRate) <= 0) {
      setFormError('Please enter a valid positive interest rate.');
      return;
    }
    if (!startDate || !maturityDate) {
      setFormError('Start date and maturity date are required.');
      return;
    }
    if (new Date(maturityDate) <= new Date(startDate)) {
      setFormError('Maturity date must be after start date.');
      return;
    }

    const depositData: FixedDeposit = {
      id: editingId || safeRandomUUID(),
      bankName: bankName.trim(),
      depositNumber: depositNumber.trim() || '•••• N/A',
      principal: Number(principal),
      interestRate: Number(interestRate),
      startDate,
      maturityDate,
      currency: depositCurrency,
      notes: notes.trim() || undefined,
      ownerIds: editingId
        ? deposits.find(d => d.id === editingId)?.ownerIds || []
        : (selectedUserIds && selectedUserIds.length > 0 ? [selectedUserIds[0]] : ['jagadeesh'])
    };

    if (editingId) {
      onEditDeposit(depositData);
    } else {
      onAddDeposit(depositData);
    }

    resetForm();
  };

  return (
    <div className="space-y-6" id="fixed-deposits-view-root">
      
      {/* Header Panel */}
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
              <RupeeCoin className="h-7 w-7 text-amber-600" /> Certificates of Deposit (CDs / FDs)
            </h1>
            <div className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium mt-1.5 block max-w-xl">
              Track fixed-term, low-risk interest-accruing banking certificates.
            </div>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Certificate
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-700 dark:text-amber-400 border border-amber-500/10">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase block">Total CD Capital</span>
            <span className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalPrincipal)}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-700 dark:text-emerald-400 border border-emerald-500/10">
            <BadgePercent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase block">Expected CD Earnings</span>
            <span className="text-2xl font-display font-bold text-emerald-800 dark:text-emerald-400">
              {formatCurrency(totalInterestExpected)}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-700 dark:text-indigo-400 border border-indigo-500/10">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase block">Estimated Maturity Pool</span>
            <span className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalMaturityValue)}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Floating Add/Edit Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 shadow-2xl border border-white/40 dark:border-white/10">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-white/10 mb-4">
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                {editingId ? 'Edit CD / Certificate' : 'Add CD / Certificate'}
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
                <label className="block text-slate-600 font-semibold mb-1">Bank / Issuer *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capital One"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Currency *</label>
                  <select
                    value={depositCurrency}
                    onChange={(e) => setDepositCurrency(e.target.value as CurrencyCode)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer text-slate-900 dark:text-slate-100"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">
                        {c.symbol} &nbsp; {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">CD Certificate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CD-4412"
                    value={depositNumber}
                    onChange={(e) => setDepositNumber(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Principal Invested *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 10000"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Interest Rate (% APY) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 5.10"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono cursor-pointer text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Maturity Date *</label>
                  <input
                    type="date"
                    required
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono cursor-pointer text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="e.g. Auto-renew is disabled"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

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
                  <Check className="h-4 w-4" /> {editingId ? 'Save Certificate' : 'Issue CD Record'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Grid of CD Cards & Table */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Table of Certificate details */}
        <GlassCard>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">Certificate Ledgers</h3>
            <div className="relative w-full md:w-64 text-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Issuer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl pl-9 pr-4 py-2 bg-white/40 border border-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {filteredDeposits.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Search className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No certificates of deposit found</p>
              <p className="text-xs text-slate-600 mt-1">Add a new fixed certificate using the button above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeposits.map((dep) => {
                const calcs = getCDCalculations(dep);
                return (
                  <div 
                    key={dep.id} 
                    className="p-5 rounded-2xl bg-white/20 hover:bg-white/35 transition-all border border-white/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-sm group"
                  >
                    {/* Left: Info Details */}
                    <div className="space-y-3 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-3">
                        <InstitutionLogo name={dep.bankName} size="md" />
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-950 dark:text-slate-100 text-sm block truncate">{dep.bankName}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30 text-[9px] font-mono font-bold uppercase whitespace-nowrap">
                              No. {dep.depositNumber}
                            </span>
                            {calcs.isMatured ? (
                              <span className="px-1.5 py-0.5 rounded-full bg-slate-500/20 text-slate-800 dark:text-slate-200 text-[9px] font-bold whitespace-nowrap">Matured</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-950/40 dark:text-emerald-300 text-[9px] font-bold whitespace-nowrap">Active</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tenure Progress bar */}
                      <div className="w-full">
                        <div className="w-full bg-slate-200/40 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full" 
                            style={{ width: `${calcs.percentageElapsed}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap justify-between items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-300 mt-1 font-mono">
                          <span className="whitespace-nowrap">Start: {dep.startDate}</span>
                          <span className="font-bold text-amber-800 dark:text-amber-400 whitespace-nowrap">{calcs.isMatured ? 'Matured' : `${calcs.remainingDays} Days Left`}</span>
                          <span className="whitespace-nowrap">Matures: {dep.maturityDate}</span>
                        </div>
                      </div>

                      {dep.notes && <p className="text-slate-500 dark:text-slate-300 text-[10px] italic">{dep.notes}</p>}
                    </div>

                    {/* Middle: Yield values - Responsive grid on mobile, row on desktop */}
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto md:flex md:items-center md:gap-8 md:px-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200/10 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Principal & APY</span>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm whitespace-nowrap">
                          {formatAccountCurrency(dep.principal, dep.currency)} 
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold ml-1">@{dep.interestRate}%</span>
                        </div>
                        {dep.currency && dep.currency !== selectedCurrency && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium font-mono whitespace-nowrap">
                            ≈ {formatCurrency(convertCurrency(dep.principal, dep.currency, selectedCurrency))}
                          </div>
                        )}
                      </div>

                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Maturity Return</span>
                        <div className="font-mono font-bold text-emerald-800 dark:text-emerald-400 text-sm whitespace-nowrap">
                          {formatAccountCurrency(calcs.maturityValue, dep.currency)}
                        </div>
                        {dep.currency && dep.currency !== selectedCurrency && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium font-mono whitespace-nowrap">
                            ≈ {formatCurrency(convertCurrency(calcs.maturityValue, dep.currency, selectedCurrency))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex justify-end gap-1 w-full md:w-auto pt-2 md:pt-0 opacity-80 group-hover:opacity-100 transition-opacity border-t md:border-t-0 border-slate-200/10 shrink-0">
                      <button
                        onClick={() => handleEditClick(dep)}
                        className="p-2 hover:bg-white/40 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Edit CD"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingDeposit(dep)}
                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl transition-colors cursor-pointer"
                        title="Delete CD"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

      </div>

      {/* Delete Confirmation Modal */}
      {deletingDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 shadow-2xl border border-white/40 dark:border-white/10 p-6 text-center">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 mb-2">
              Confirm Deposit Deletion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete the Fixed Deposit at <span className="font-semibold text-slate-900 dark:text-slate-100">{deletingDeposit.bankName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingDeposit(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-slate-200/40 dark:border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteDeposit(deletingDeposit.id);
                  setDeletingDeposit(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Delete Deposit
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
};
