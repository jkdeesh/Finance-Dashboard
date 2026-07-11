import React, { useState } from 'react';
import { BankAccount, CURRENCIES, CurrencyCode, convertCurrency } from '../types';
import { GlassCard } from './GlassCard';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Sparkles, 
  Coins, 
  Percent, 
  TrendingUp, 
  PiggyBank, 
  X, 
  Check, 
  AlertCircle,
  ArrowLeft,
  Landmark
} from 'lucide-react';

interface BankSavingsViewProps {
  accounts: BankAccount[];
  onAddAccount: (account: BankAccount) => void;
  onEditAccount: (account: BankAccount) => void;
  onDeleteAccount: (id: string) => void;
  selectedCurrency: CurrencyCode;
  onBackToDashboard: () => void;
}

export const BankSavingsView: React.FC<BankSavingsViewProps> = ({
  accounts,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  selectedCurrency,
  onBackToDashboard,
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('High-Yield Savings');
  const [isCustomType, setIsCustomType] = useState(false);
  const [customAccountType, setCustomAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [accountCurrency, setAccountCurrency] = useState<CurrencyCode>('INR');
  const [notes, setNotes] = useState('');
  
  const [formError, setFormError] = useState('');
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null);

  // Calculations
  const totalBalance = accounts.reduce((sum, acc) => sum + convertCurrency(acc.balance, acc.currency || 'INR', selectedCurrency), 0);
  
  // Weighted Interest Rate Calculation
  const totalInterestWeighted = accounts.reduce((sum, acc) => {
    const balanceInBase = convertCurrency(acc.balance, acc.currency || 'INR', selectedCurrency);
    return sum + (balanceInBase * acc.interestRate);
  }, 0);
  const averageInterestRate = totalBalance > 0 ? (totalInterestWeighted / totalBalance) : 0;
  const estimatedAnnualEarnings = totalBalance * (averageInterestRate / 100);

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

  // Filtered accounts
  const filteredAccounts = accounts.filter(acc => 
    acc.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.accountType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.accountNumber.includes(searchTerm)
  );

  const resetForm = () => {
    setBankName('');
    setAccountType('High-Yield Savings');
    setIsCustomType(false);
    setCustomAccountType('');
    setAccountNumber('');
    setBalance('');
    setInterestRate('');
    setAccountCurrency(selectedCurrency);
    setNotes('');
    setFormError('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (acc: BankAccount) => {
    setEditingId(acc.id);
    setBankName(acc.bankName);
    
    const defaults = ["High-Yield Savings", "Savings Account", "Checking Account", "Money Market"];
    if (defaults.includes(acc.accountType)) {
      setAccountType(acc.accountType);
      setIsCustomType(false);
      setCustomAccountType('');
    } else {
      setAccountType('Custom');
      setIsCustomType(true);
      setCustomAccountType(acc.accountType);
    }
    
    setAccountNumber(acc.accountNumber);
    setBalance(acc.balance.toString());
    setInterestRate(acc.interestRate.toString());
    setAccountCurrency(acc.currency || 'INR');
    setNotes(acc.notes || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!bankName.trim()) {
      setFormError('Bank Name is required.');
      return;
    }
    if (!balance || isNaN(Number(balance)) || Number(balance) < 0) {
      setFormError('Please enter a valid positive balance.');
      return;
    }
    if (!interestRate || isNaN(Number(interestRate)) || Number(interestRate) < 0) {
      setFormError('Please enter a valid positive interest rate.');
      return;
    }

    if (accountType === 'Custom' && !customAccountType.trim()) {
      setFormError('Please enter a custom account type.');
      return;
    }

    const finalAccountType = accountType === 'Custom' ? customAccountType.trim() : accountType;

    const accountData: BankAccount = {
      id: editingId || crypto.randomUUID(),
      bankName: bankName.trim(),
      accountType: finalAccountType,
      accountNumber: accountNumber.trim() || '•••• N/A',
      balance: Number(balance),
      interestRate: Number(interestRate),
      currency: accountCurrency,
      notes: notes.trim() || undefined,
    };

    if (editingId) {
      onEditAccount(accountData);
    } else {
      onAddAccount(accountData);
    }

    resetForm();
  };

  return (
    <div className="space-y-6" id="bank-savings-view-root">
      
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
              <Landmark className="h-7 w-7 text-sky-600" /> Bank Savings & Checking
            </h1>
            <div className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium mt-1.5 block max-w-xl">
              Keep track of liquid capital, emergency cash reserve pools, and checking accounts.
            </div>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Account
        </button>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-700 dark:text-sky-400 border border-sky-500/10">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase block">Total Liquid Balance</span>
            <span className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalBalance)}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-700 dark:text-indigo-400 border border-indigo-500/10">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase block">Avg. Interest Rate</span>
            <span className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
              {averageInterestRate.toFixed(2)}% APY
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-700 dark:text-emerald-400 border border-emerald-500/10">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase block">Est. Annual Earnings</span>
            <span className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(estimatedAnnualEarnings)}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Floating Modal Form (Add/Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 shadow-2xl border border-white/40 dark:border-white/10">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-white/10 mb-4">
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                {editingId ? 'Edit Bank Account' : 'Add Bank Account'}
              </h3>
              <button 
                onClick={resetForm}
                className="p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ally Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAccountType(val);
                      setIsCustomType(val === 'Custom');
                      if (val === 'Custom') {
                        setCustomAccountType('');
                      }
                    }}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer text-slate-900 dark:text-slate-100"
                  >
                    <option value="High-Yield Savings" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">High-Yield Savings</option>
                    <option value="Savings Account" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">Regular Savings</option>
                    <option value="Checking Account" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">Checking</option>
                    <option value="Money Market" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">Money Market</option>
                    <option value="Custom" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-medium">Custom Type...</option>
                  </select>
                </div>
              </div>

              {isCustomType && (
                <div className="animate-fade-in">
                  <label className="block text-slate-600 font-semibold mb-1">Custom Account Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Savings Account (Sreenithi)"
                    value={customAccountType}
                    onChange={(e) => setCustomAccountType(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Currency *</label>
                  <select
                    value={accountCurrency}
                    onChange={(e) => setAccountCurrency(e.target.value as CurrencyCode)}
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
                  <label className="block text-slate-600 font-semibold mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 5678"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Balance *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 15000"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Interest Rate (% APY) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 4.25"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="e.g. Emergency fund reserves"
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
                  <Check className="h-4 w-4" /> {editingId ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Main List Table Area */}
      <GlassCard className="overflow-hidden">
        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">Active Bank Balances</h3>
          
          <div className="relative w-full md:w-64 text-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Bank, Account Type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2 bg-white/40 border border-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Desktop List Table */}
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No savings accounts found</p>
            <p className="text-xs text-slate-600 mt-1">Try resetting filters or add a new bank record above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/20 text-slate-500 dark:text-slate-200 text-xs font-bold">
                  <th className="pb-3 pr-4">Bank Institution</th>
                  <th className="pb-3 px-4">Account Type</th>
                  <th className="pb-3 px-4">Acc. Number</th>
                  <th className="pb-3 px-4 text-right">Interest Rate</th>
                  <th className="pb-3 px-4 text-right">Current Balance</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10 text-xs">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-white/10 transition-colors group">
                    <td className="py-4 pr-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">{acc.bankName}</span>
                        {acc.notes && <span className="text-slate-500 dark:text-slate-300 text-[10px] italic mt-0.5 block">{acc.notes}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-200">
                      <span className="px-2 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-[10px] font-semibold border border-slate-200/50 dark:border-slate-700/50">
                        {acc.accountType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {acc.accountNumber.length <= 4 ? `•••• ${acc.accountNumber}` : acc.accountNumber}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {acc.interestRate.toFixed(2)}% APY
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">
                      <div>{formatAccountCurrency(acc.balance, acc.currency)}</div>
                      {acc.currency && acc.currency !== selectedCurrency && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          ≈ {formatCurrency(convertCurrency(acc.balance, acc.currency, selectedCurrency))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(acc)}
                          className="p-1.5 hover:bg-white/40 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingAccount(acc)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Delete Confirmation Modal */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 shadow-2xl border border-white/40 dark:border-white/10 p-6 text-center">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 mb-2">
              Confirm Account Deletion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">{deletingAccount.bankName}</span> - {deletingAccount.accountType}? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingAccount(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-slate-200/40 dark:border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteAccount(deletingAccount.id);
                  setDeletingAccount(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
};
