import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Percent, 
  ArrowLeft, 
  Coins, 
  Check, 
  X,
  TrendingDown,
  Info,
  DollarSign
} from 'lucide-react';
import { Liability, CurrencyCode, CURRENCIES, convertCurrency } from '../types';
import { GlassCard } from './GlassCard';

interface LiabilityLedgerViewProps {
  liabilities: Liability[];
  onAddLiability: (liability: Omit<Liability, 'id'>) => void;
  onEditLiability: (liability: Liability) => void;
  onDeleteLiability: (id: string) => void;
  selectedCurrency: CurrencyCode;
  onBackToDashboard: () => void;
  selectedUserIds: string[];
}

export function LiabilityLedgerView({
  liabilities,
  onAddLiability,
  onEditLiability,
  onDeleteLiability,
  selectedCurrency,
  onBackToDashboard,
  selectedUserIds
}: LiabilityLedgerViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [deletingLiability, setDeletingLiability] = useState<Liability | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [lenderName, setLenderName] = useState('');
  const [liabilityType, setLiabilityType] = useState<Liability['liabilityType']>('Personal Loan');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [totalAmount, setTotalAmount] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [ownerIdsInput, setOwnerIdsInput] = useState('');

  // Analytics
  const stats = useMemo(() => {
    let totalOutstanding = 0;
    let totalMonthlyEMI = 0;
    let interestWeightSum = 0;
    let validInterestOutstandingSum = 0;

    liabilities.forEach(lia => {
      const liaCurr = lia.currency || 'INR';
      const outstandingInSelected = convertCurrency(lia.outstandingAmount, liaCurr, selectedCurrency);
      const monthlyInSelected = convertCurrency(lia.monthlyPayment, liaCurr, selectedCurrency);

      totalOutstanding += outstandingInSelected;
      totalMonthlyEMI += monthlyInSelected;

      if (lia.interestRate > 0 && lia.outstandingAmount > 0) {
        interestWeightSum += lia.interestRate * outstandingInSelected;
        validInterestOutstandingSum += outstandingInSelected;
      }
    });

    const averageRate = validInterestOutstandingSum > 0 
      ? (interestWeightSum / validInterestOutstandingSum) 
      : 0;

    return {
      totalOutstanding,
      totalMonthlyEMI,
      averageRate,
      activeCount: liabilities.length
    };
  }, [liabilities, selectedCurrency]);

  const currencySymbol = CURRENCIES[selectedCurrency].symbol;

  const formatCurrency = (val: number, curr?: CurrencyCode) => {
    const config = CURRENCIES[curr || selectedCurrency] || CURRENCIES.INR;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenAddModal = () => {
    setLenderName('');
    setLiabilityType('Personal Loan');
    setCurrency(selectedCurrency);
    setTotalAmount('');
    setOutstandingAmount('');
    setInterestRate('');
    setMonthlyPayment('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setNotes('');
    setOwnerIdsInput(selectedUserIds.join(', '));
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (lia: Liability) => {
    setEditingLiability(lia);
    setLenderName(lia.lenderName);
    setLiabilityType(lia.liabilityType);
    setCurrency(lia.currency || 'INR');
    setTotalAmount(String(lia.totalAmount));
    setOutstandingAmount(String(lia.outstandingAmount));
    setInterestRate(String(lia.interestRate));
    setMonthlyPayment(String(lia.monthlyPayment));
    setStartDate(lia.startDate);
    setEndDate(lia.endDate || '');
    setNotes(lia.notes || '');
    setOwnerIdsInput((lia.ownerIds || []).join(', '));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lenderName || !totalAmount || !outstandingAmount || !interestRate || !monthlyPayment) return;

    onAddLiability({
      lenderName: lenderName.trim(),
      liabilityType,
      currency,
      totalAmount: Number(totalAmount),
      outstandingAmount: Number(outstandingAmount),
      interestRate: Number(interestRate),
      monthlyPayment: Number(monthlyPayment),
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
      ownerIds: ownerIdsInput ? ownerIdsInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [...selectedUserIds]
    });

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLiability || !lenderName || !totalAmount || !outstandingAmount || !interestRate || !monthlyPayment) return;

    onEditLiability({
      ...editingLiability,
      lenderName: lenderName.trim(),
      liabilityType,
      currency,
      totalAmount: Number(totalAmount),
      outstandingAmount: Number(outstandingAmount),
      interestRate: Number(interestRate),
      monthlyPayment: Number(monthlyPayment),
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
      ownerIds: ownerIdsInput ? ownerIdsInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [...editingLiability.ownerIds]
    });

    setEditingLiability(null);
  };

  const filteredLiabilities = useMemo(() => {
    return liabilities.filter(lia => {
      const matchesSearch = 
        lia.lenderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lia.liabilityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lia.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [liabilities, searchTerm]);

  return (
    <div id="liability-ledger-container" className="space-y-6">
      {/* Header Block */}
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
              <CreditCard className="h-7 w-7 text-rose-500" /> Liability Ledger
            </h1>
            <div className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium mt-1.5 block max-w-xl">
              Monitor credit accounts, interest-accruing loans, and EMIs
            </div>
          </div>
        </div>
        <button
          id="add-liability-btn"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 shrink-0 cursor-pointer border border-indigo-500"
        >
          <Plus className="h-4 w-4" /> Add Liability
        </button>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Outstanding */}
        <GlassCard className="p-4 flex flex-col justify-between border-l-4 border-rose-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Outstanding</span>
          <div className="text-lg sm:text-2xl font-display font-black text-rose-600 dark:text-rose-400 mt-2 whitespace-nowrap overflow-x-auto scrollbar-none flex items-center">
            {formatCurrency(stats.totalOutstanding)}
          </div>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 block">Active liabilities burden</span>
        </GlassCard>

        {/* Card 2: Monthly EMIs */}
        <GlassCard className="p-4 flex flex-col justify-between border-l-4 border-orange-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly EMI burden</span>
          <div className="text-lg sm:text-2xl font-display font-black text-orange-600 dark:text-orange-400 mt-2 whitespace-nowrap overflow-x-auto scrollbar-none flex items-center">
            {formatCurrency(stats.totalMonthlyEMI)}
          </div>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 block">Recurring repayments</span>
        </GlassCard>

        {/* Card 3: Avg Interest Rate */}
        <GlassCard className="p-4 flex flex-col justify-between border-l-4 border-indigo-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg Interest Rate</span>
          <div className="text-lg sm:text-2xl font-display font-black text-indigo-600 dark:text-indigo-400 mt-2 whitespace-nowrap overflow-x-auto scrollbar-none flex items-center">
            {stats.averageRate.toFixed(2)}%
          </div>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 block">Weighted by balance</span>
        </GlassCard>

        {/* Card 4: Active Accounts */}
        <GlassCard className="p-4 flex flex-col justify-between border-l-4 border-teal-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Debts</span>
          <div className="text-lg sm:text-2xl font-display font-black text-teal-600 dark:text-teal-400 mt-2 whitespace-nowrap overflow-x-auto scrollbar-none flex items-center">
            {stats.activeCount} <span className="text-xs font-normal text-slate-400 ml-1.5">Accounts</span>
          </div>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 block">Credit lines & loans</span>
        </GlassCard>
      </div>

      {/* Main Body */}
      <div className="space-y-4">
        {/* Search & Stats Banner */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search liabilities by lender, type, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-900/45 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {filteredLiabilities.length === 0 ? (
          <GlassCard className="p-12 text-center border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 mb-4">
              <CreditCard className="h-8 w-8" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No liabilities found</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Track home loans, personal loans, car finance, and outstanding credit card balances.
            </p>
            <button
              id="empty-add-liability-btn"
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2.5 bg-slate-800/10 hover:bg-slate-800/15 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Add Your First Liability
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLiabilities.map((lia) => {
              const liaCurr = lia.currency || 'INR';
              const outstandingInSelected = convertCurrency(lia.outstandingAmount, liaCurr, selectedCurrency);
              const limitInSelected = convertCurrency(lia.totalAmount, liaCurr, selectedCurrency);
              const emiInSelected = convertCurrency(lia.monthlyPayment, liaCurr, selectedCurrency);

              return (
                <motion.div
                  key={lia.id}
                  layoutId={`lia-card-${lia.id}`}
                  className="bg-white/40 dark:bg-white/5 hover:bg-slate-100/60 dark:hover:bg-white/8 border border-slate-200/50 dark:border-white/5 hover:border-slate-300/60 dark:hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 group relative transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/10">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block truncate">
                            {lia.lenderName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold border border-slate-200/50 dark:border-slate-700/50 whitespace-nowrap text-slate-600 dark:text-slate-300 mt-0.5 inline-block uppercase">
                            {lia.liabilityType}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Rate</span>
                        <span className="text-sm font-extrabold font-mono text-slate-800 dark:text-slate-200">
                          {lia.interestRate.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-2 bg-slate-50/50 dark:bg-white/5 px-3 rounded-xl border border-slate-100 dark:border-transparent">
                      <div>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Outstanding</span>
                        <span className="text-sm font-black font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap overflow-x-auto scrollbar-none flex items-center">
                          {formatCurrency(lia.outstandingAmount, liaCurr)}
                        </span>
                        {liaCurr !== selectedCurrency && (
                          <span className="text-[9px] font-medium font-mono text-slate-500 dark:text-slate-400 block truncate">
                            ≈ {formatCurrency(outstandingInSelected)}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Monthly EMI</span>
                        <span className="text-sm font-black font-mono text-orange-600 dark:text-orange-400 whitespace-nowrap overflow-x-auto scrollbar-none flex items-center">
                          {formatCurrency(lia.monthlyPayment, liaCurr)}
                        </span>
                        {liaCurr !== selectedCurrency && (
                          <span className="text-[9px] font-medium font-mono text-slate-500 dark:text-slate-400 block truncate">
                            ≈ {formatCurrency(emiInSelected)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 font-medium">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Total Borrowed / Limit:</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          {formatCurrency(lia.totalAmount, liaCurr)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Repayment Started:</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{lia.startDate}</span>
                      </div>
                      {lia.endDate && (
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Repayment Target:</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">{lia.endDate}</span>
                        </div>
                      )}
                    </div>

                    {lia.notes && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 italic bg-slate-100/50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border-l-2 border-indigo-500 break-words">
                        {lia.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className="text-[8px] uppercase font-bold text-slate-500 dark:text-slate-400">Owners:</span>
                      <div className="flex flex-wrap gap-1">
                        {lia.ownerIds.map((owner) => (
                          <span key={owner} className="px-1.5 py-0.5 bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-full text-[8px] font-semibold uppercase whitespace-nowrap">
                            {owner}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                    <button
                      id={`edit-lia-btn-${lia.id}`}
                      onClick={() => handleOpenEditModal(lia)}
                      className="p-2 bg-slate-200/50 dark:bg-white/5 hover:bg-indigo-500/25 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-xl transition-all cursor-pointer"
                      title="Edit Liability"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      id={`delete-lia-btn-${lia.id}`}
                      onClick={() => setDeletingLiability(lia)}
                      className="p-2 bg-slate-200/50 dark:bg-white/5 hover:bg-rose-500/25 dark:hover:bg-rose-500/20 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                      title="Delete Liability"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add & Edit Modal Dialog */}
      <AnimatePresence>
        {(isAddModalOpen || editingLiability) && (
          <div id="liability-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans text-white my-8"
            >
              <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/55">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-400" />
                  {isAddModalOpen ? 'Add New Liability' : 'Edit Liability'}
                </h3>
                <button
                  onClick={() => (isAddModalOpen ? setIsAddModalOpen(false) : setEditingLiability(null))}
                  className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Lender / Creditor Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBI, Chase Bank"
                      value={lenderName}
                      onChange={(e) => setLenderName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Liability Type *</label>
                    <select
                      value={liabilityType}
                      onChange={(e) => setLiabilityType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Home Loan">Home Loan</option>
                      <option value="Personal Loan">Personal Loan</option>
                      <option value="Car Loan">Car Loan</option>
                      <option value="Education Loan">Education Loan</option>
                      <option value="Credit Card">Credit Card Limits / Repayments</option>
                      <option value="Business Loan">Business Loan</option>
                      <option value="Other">Other Debt</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Currency *</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {Object.values(CURRENCIES).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.symbol} &nbsp; {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Interest Rate (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 8.5"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Total Borrowed / Limit *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000000"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Outstanding Debt *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4200000"
                      value={outstandingAmount}
                      onChange={(e) => setOutstandingAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Monthly Repayment (EMI) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 35000"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">End Date / Target Repay Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Owner IDs (comma separated)</label>
                    <input
                      type="text"
                      value={ownerIdsInput}
                      onChange={(e) => setOwnerIdsInput(e.target.value)}
                      placeholder="e.g. ramesh, anita"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold font-semibold block">Notes</label>
                    <input
                      type="text"
                      placeholder="e.g., Collateral used, loan protection cover details"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Outstanding debt and monthly payment sums will be automatically converted to your active base currency ({selectedCurrency}) in real-time across your main Net Worth dashboard.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                  <button
                    type="button"
                    onClick={() => (isAddModalOpen ? setIsAddModalOpen(false) : setEditingLiability(null))}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-indigo-500"
                  >
                    <Check className="h-4 w-4" />
                    <span>{isAddModalOpen ? 'Create Account' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingLiability && (
          <div id="delete-liability-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-center text-white"
            >
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/10">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-display font-bold text-slate-100 mb-2">
                Confirm Liability Deletion
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-medium">
                Are you sure you want to delete <span className="font-semibold text-slate-200">{deletingLiability.lenderName}</span> ({deletingLiability.liabilityType})? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeletingLiability(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteLiability(deletingLiability.id);
                    setDeletingLiability(null);
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
