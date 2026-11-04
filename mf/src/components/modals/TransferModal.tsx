import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromAccountId?: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  defaultFromAccountId,
}) => {
  const { accounts, transferBetweenAccounts, currency } = useFinance();

  const [fromAccountId, setFromAccountId] = useState(
    defaultFromAccountId || accounts[0]?.id || ''
  );
  const [toAccountId, setToAccountId] = useState(
    accounts.find((a) => a.id !== fromAccountId)?.id || accounts[1]?.id || ''
  );
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || fromAccountId === toAccountId) return;

    transferBetweenAccounts(
      fromAccountId,
      toAccountId,
      numAmount,
      fee ? parseFloat(fee) : 0,
      notes
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Transfer Between Accounts
              </h3>
              <p className="text-xs text-slate-500">Move funds without logging income or expense</p>
            </div>
          </div>
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
              From Account (Debit)
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => {
                setFromAccountId(e.target.value);
                if (e.target.value === toAccountId) {
                  const nextTo = accounts.find((a) => a.id !== e.target.value);
                  if (nextTo) setToAccountId(nextTo.id);
                }
              }}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (₹{a.balance.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              To Account (Credit)
            </label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {accounts
                .filter((a) => a.id !== fromAccountId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (₹{a.balance.toLocaleString('en-IN')})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Transfer Amount ({currency === 'INR' ? '₹' : '$'})
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-lg font-bold font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Transfer Fee (Optional)
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Notes / Reference
            </label>
            <input
              type="text"
              placeholder="e.g. Credit card payment, ATM withdrawal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
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
              className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
