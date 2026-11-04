import React, { useState } from 'react';
import { X, Building2, CreditCard, Wallet, Smartphone, Landmark, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { AccountType } from '../../types';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const colorOptions = [
  '#0284c7', // Sky Blue
  '#0d9488', // Teal
  '#16a34a', // Emerald
  '#d97706', // Amber
  '#e11d48', // Crimson/Rose
  '#4f46e5', // Indigo
  '#8b5cf6', // Purple
  '#475569', // Slate
];

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount, currency } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [color, setColor] = useState(colorOptions[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseFloat(balance) || 0;

    let icon = 'Building2';
    if (type === 'cash') icon = 'Wallet';
    else if (type === 'credit_card') icon = 'CreditCard';
    else if (type === 'digital_wallet') icon = 'Smartphone';
    else if (type === 'savings') icon = 'Landmark';
    else if (type === 'investment') icon = 'TrendingUp';

    addAccount({
      name: name.trim(),
      type,
      balance: type === 'credit_card' ? -Math.abs(numBalance) : numBalance,
      openingBalance: numBalance,
      accountNumber: accountNumber.trim() || undefined,
      institutionName: institutionName.trim() || undefined,
      color,
      icon,
      isArchived: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Add New Account
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Account Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Salary, SBI Savings, Zerodha, Cash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Account Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white capitalize"
              >
                <option value="bank">Bank Account</option>
                <option value="savings">Savings Account</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash Wallet</option>
                <option value="digital_wallet">Digital Wallet (UPI/GPay)</option>
                <option value="investment">Investment Account</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Opening Balance ({currency === 'INR' ? '₹' : '$'})
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Institution / Bank Name
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Bank, SBI, ICICI, Zerodha, Paytm"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Account Number / UPI ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. •••• 4821 or user@okhdfc"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Theme Color
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
