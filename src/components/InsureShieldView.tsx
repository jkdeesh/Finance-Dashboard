import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Award, 
  ArrowLeft, 
  Coins, 
  Check, 
  X,
  CreditCard,
  Percent,
  FileText,
  TrendingUp
} from 'lucide-react';
import { InsurancePolicy, CurrencyCode, CURRENCIES, convertCurrency } from '../types';
import { GlassCard } from './GlassCard';

interface InsureShieldViewProps {
  policies: InsurancePolicy[];
  onAddPolicy: (policy: Omit<InsurancePolicy, 'id'>) => void;
  onEditPolicy: (policy: InsurancePolicy) => void;
  onDeletePolicy: (id: string) => void;
  selectedCurrency: CurrencyCode;
  onBackToDashboard: () => void;
  selectedUserIds: string[];
}

export function InsureShieldView({
  policies,
  onAddPolicy,
  onEditPolicy,
  onDeletePolicy,
  selectedCurrency,
  onBackToDashboard,
  selectedUserIds
}: InsureShieldViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<InsurancePolicy | null>(null);

  // Form states
  const [policyName, setPolicyName] = useState('');
  const [policyType, setPolicyType] = useState('Life (LIC)');
  const [policyNumber, setPolicyNumber] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annually'>('Annually');
  const [sumAssured, setSumAssured] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'Active' | 'Lapsed' | 'Matured'>('Active');
  const [notes, setNotes] = useState('');
  const [ownerIdsInput, setOwnerIdsInput] = useState('');

  // Analytics
  const stats = useMemo(() => {
    let totalCover = 0;
    let monthlyOutgo = 0;

    policies.forEach(policy => {
      const policyCurr = policy.currency || 'INR';
      
      // Calculate Sum Assured cover in selected currency
      const sumAssuredInSelected = convertCurrency(policy.sumAssured, policyCurr, selectedCurrency);
      totalCover += sumAssuredInSelected;

      // Calculate Premium Outgo converted to a Monthly Equivalent
      const premiumInSelected = convertCurrency(policy.premiumAmount, policyCurr, selectedCurrency);
      let factor = 12; // default annually = P/12
      if (policy.frequency === 'Monthly') factor = 1;
      else if (policy.frequency === 'Quarterly') factor = 3;
      else if (policy.frequency === 'Half-Yearly') factor = 6;
      else if (policy.frequency === 'Annually') factor = 12;

      monthlyOutgo += (premiumInSelected / factor);
    });

    return { totalCover, monthlyOutgo };
  }, [policies, selectedCurrency]);

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
    setPolicyName('');
    setPolicyType('Life (LIC)');
    setPolicyNumber('');
    setPremiumAmount('');
    setFrequency('Annually');
    setSumAssured('');
    setStartDate(new Date().toISOString().split('T')[0]);
    
    // Set due date one year from now as default
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setDueDate(nextYear.toISOString().split('T')[0]);
    
    setStatus('Active');
    setNotes('');
    setOwnerIdsInput(selectedUserIds.join(', '));
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setPolicyName(policy.policyName);
    setPolicyType(policy.policyType);
    setPolicyNumber(policy.policyNumber);
    setPremiumAmount(String(policy.premiumAmount));
    setFrequency(policy.frequency);
    setSumAssured(String(policy.sumAssured));
    setStartDate(policy.startDate);
    setDueDate(policy.dueDate);
    setStatus(policy.status);
    setNotes(policy.notes || '');
    setOwnerIdsInput(policy.ownerIds.join(', '));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyName || !policyNumber || !premiumAmount || !sumAssured) return;

    onAddPolicy({
      policyName,
      policyType,
      policyNumber,
      premiumAmount: Number(premiumAmount),
      frequency,
      sumAssured: Number(sumAssured),
      startDate,
      dueDate,
      status,
      notes: notes || undefined,
      currency: selectedCurrency,
      ownerIds: ownerIdsInput ? ownerIdsInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [...selectedUserIds]
    });

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy || !policyName || !policyNumber || !premiumAmount || !sumAssured) return;

    onEditPolicy({
      ...editingPolicy,
      policyName,
      policyType,
      policyNumber,
      premiumAmount: Number(premiumAmount),
      frequency,
      sumAssured: Number(sumAssured),
      startDate,
      dueDate,
      status,
      notes: notes || undefined,
      currency: editingPolicy.currency || selectedCurrency,
      ownerIds: ownerIdsInput ? ownerIdsInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [...editingPolicy.ownerIds]
    });

    setEditingPolicy(null);
  };

  return (
    <div id="insure-shield-container" className="space-y-6">
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
              <ShieldAlert className="h-7 w-7 text-indigo-600" /> InsureShield
            </h1>
            <div className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium mt-1.5 block max-w-xl">
              Protection Coverages & Insurance Policies
            </div>
          </div>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Policy
        </button>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
          <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-700 dark:text-emerald-400 border border-emerald-500/10 shrink-0">
            <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 w-full">
            <span className="text-slate-500 dark:text-slate-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase block" title="Total Active Cover">Total Active Cover</span>
            <span className="text-lg sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100 block whitespace-nowrap">
              {formatCurrency(stats.totalCover)}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
          <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-700 dark:text-indigo-400 border border-indigo-500/10 shrink-0">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 w-full">
            <span className="text-slate-500 dark:text-slate-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase block" title="Monthly Premium Burden">Monthly Premium Burden</span>
            <span className="text-lg sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100 block whitespace-nowrap">
              {formatCurrency(stats.monthlyOutgo)}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
          <div className="p-2.5 bg-sky-500/10 rounded-2xl text-sky-700 dark:text-sky-400 border border-sky-500/10 shrink-0">
            <Coins className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 w-full">
            <span className="text-slate-500 dark:text-slate-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase block" title="Policies Tracked">Policies Tracked</span>
            <span className="text-lg sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100 block whitespace-nowrap">
              {policies.length} Active Policies
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Main content grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          Active Protection Policies ({policies.length})
        </h3>

        {policies.length === 0 ? (
          <GlassCard id="empty-policies-card" className="p-12 text-center border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No insurance policies found</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Track LIC endowment plans, corporate medical benefits, vehicle insurance coverages, and term life protections.
            </p>
            <button
              id="empty-add-btn"
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2.5 bg-slate-800/10 hover:bg-slate-800/15 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Add First Policy
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map((policy) => {
              const policyCurr = policy.currency || 'INR';
              const sumAssuredInSelected = convertCurrency(policy.sumAssured, policyCurr, selectedCurrency);
              const premiumInSelected = convertCurrency(policy.premiumAmount, policyCurr, selectedCurrency);
              
              // Find due alerts (within 30 days)
              const today = new Date();
              const due = new Date(policy.dueDate);
              const diffTime = due.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isUrgent = diffDays > 0 && diffDays <= 30 && policy.status === 'Active';

              return (
                <motion.div
                  key={policy.id}
                  layoutId={`policy-card-${policy.id}`}
                  className="bg-white/40 dark:bg-white/5 hover:bg-slate-100/60 dark:hover:bg-white/8 border border-slate-200/50 dark:border-white/5 hover:border-slate-300/60 dark:hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 group relative transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2.5 rounded-xl ${
                          policy.status === 'Active' 
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : policy.status === 'Lapsed' 
                            ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' 
                            : 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs tracking-wide text-slate-900 dark:text-white">{policy.policyName}</h4>
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{policy.policyType}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        policy.status === 'Active' 
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : policy.status === 'Lapsed' 
                          ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                          : 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {policy.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1.5 border-t border-slate-200 dark:border-white/5">
                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Policy Number</p>
                        <p className="text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 mt-0.5 truncate">{policy.policyNumber}</p>
                      </div>

                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Sum Assured</p>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                          {formatCurrency(sumAssuredInSelected)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Premium ({policy.frequency})</p>
                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                          {formatCurrency(premiumInSelected)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Renewal Due Date</p>
                        <p className={`text-[10px] font-bold mt-0.5 flex items-center gap-1 ${
                          isUrgent ? 'text-amber-600 dark:text-amber-400 animate-pulse font-extrabold' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                          {policy.dueDate || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {isUrgent && (
                      <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full animate-ping" />
                        <span className="text-[8px] font-extrabold uppercase text-amber-600 dark:text-amber-300 tracking-wider">
                          Premium Due in {diffDays} Days!
                        </span>
                      </div>
                    )}

                    {policy.notes && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 italic bg-slate-100/50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border-l-2 border-indigo-500">
                        {policy.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className="text-[8px] uppercase font-bold text-slate-500 dark:text-slate-400">Owners:</span>
                      <div className="flex flex-wrap gap-1">
                        {policy.ownerIds.map((owner) => (
                          <span key={owner} className="px-1.5 py-0.5 bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-full text-[8px] font-semibold uppercase">
                            {owner}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`edit-policy-btn-${policy.id}`}
                      onClick={() => handleOpenEditModal(policy)}
                      className="p-2 bg-slate-200/50 dark:bg-white/5 hover:bg-indigo-500/25 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-xl transition-all cursor-pointer"
                      title="Edit Policy"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      id={`delete-policy-btn-${policy.id}`}
                      onClick={() => setDeletingPolicy(policy)}
                      className="p-2 bg-slate-200/50 dark:bg-white/5 hover:bg-rose-500/25 dark:hover:bg-rose-500/20 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                      title="Delete Policy"
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

      {/* Add & Edit Modal Dialogs */}
      <AnimatePresence>
        {(isAddModalOpen || editingPolicy) && (
          <div id="policy-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans text-white"
            >
              <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/55">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-indigo-400" />
                  {isAddModalOpen ? 'Create Insurance Policy' : 'Edit Insurance Policy'}
                </h3>
                <button
                  id="close-modal-btn"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPolicy(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Policy Name *</label>
                    <input
                      type="text"
                      required
                      value={policyName}
                      onChange={(e) => setPolicyName(e.target.value)}
                      placeholder="e.g. LIC Jeevan Anand Endowment Plan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Policy Type</label>
                    <select
                      value={policyType}
                      onChange={(e) => setPolicyType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Life (LIC)">Life (LIC)</option>
                      <option value="Health">Health</option>
                      <option value="Vehicle">Vehicle</option>
                      <option value="Home">Home</option>
                      <option value="Term Insurance">Term Insurance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Policy Number *</label>
                    <input
                      type="text"
                      required
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      placeholder="e.g. LIC-98765432"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Premium Amount ({currencySymbol}) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={premiumAmount}
                      onChange={(e) => setPremiumAmount(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Payment Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Half-Yearly">Half-Yearly</option>
                      <option value="Annually">Annually</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Sum Assured Cover *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={sumAssured}
                      onChange={(e) => setSumAssured(e.target.value)}
                      placeholder="e.g. 500000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Coverage Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Lapsed">Lapsed</option>
                      <option value="Matured">Matured</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Policy Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Renewal Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Owner IDs (comma separated)</label>
                    <input
                      type="text"
                      value={ownerIdsInput}
                      onChange={(e) => setOwnerIdsInput(e.target.value)}
                      placeholder="e.g. Ramesh"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Cover details / Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Full accidental cover. Riders include premium waiver option."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-850 bg-slate-900/50">
                  <button
                    id="cancel-modal-btn"
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingPolicy(null);
                    }}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-300 rounded-xl cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-modal-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    <span>{isAddModalOpen ? 'Create Policy' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingPolicy && (
          <div id="delete-policy-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
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
                Confirm Policy Deletion
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-200">{deletingPolicy.policyName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeletingPolicy(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeletePolicy(deletingPolicy.id);
                    setDeletingPolicy(null);
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  Delete Policy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
