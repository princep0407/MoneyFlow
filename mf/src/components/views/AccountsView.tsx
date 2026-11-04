import React, { useState } from 'react';
import {
  Building2,
  Wallet,
  CreditCard,
  Smartphone,
  Landmark,
  TrendingUp,
  Plus,
  ArrowRightLeft,
  Archive,
  History,
  Check,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface AccountsViewProps {
  onOpenAddAccount: () => void;
  onOpenTransfer: (fromAccountId?: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  onOpenAddAccount,
  onOpenTransfer,
}) => {
  const {
    accounts,
    editAccount,
    transactions,
    currency,
    numberFormat,
    totalBalance,
  } = useFinance();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Group accounts by type or active state
  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const archivedAccounts = accounts.filter((a) => a.isArchived);

  // Account specific transactions
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId || t.toAccountId === selectedAccountId
  );

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return Building2;
      case 'savings':
        return Landmark;
      case 'credit_card':
        return CreditCard;
      case 'cash':
        return Wallet;
      case 'digital_wallet':
        return Smartphone;
      case 'investment':
        return TrendingUp;
      default:
        return Building2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Accounts & Wallets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage bank accounts, physical cash, digital UPI wallets and investments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTransfer()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Money</span>
          </button>
          <button
            onClick={onOpenAddAccount}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeAccounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          const isCredit = acc.type === 'credit_card';

          return (
            <div
              key={acc.id}
              className={`p-5 rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs ${
                selectedAccountId === acc.id
                  ? 'ring-2 ring-emerald-500 border-transparent'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {acc.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {acc.institutionName || acc.accountNumber || acc.type}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {acc.type.replace('_', ' ')}
                </span>
              </div>

              {/* Balance */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">
                  {isCredit ? 'Outstanding Credit Due' : 'Current Available Balance'}
                </div>
                <div
                  className={`text-xl font-bold font-mono tabular-nums tracking-tight mt-0.5 ${
                    isCredit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {formatCurrency(acc.balance, currency, numberFormat)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Opening Balance: {formatCurrency(acc.openingBalance, currency, numberFormat)}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedAccountId(acc.id === selectedAccountId ? null : acc.id)}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{selectedAccountId === acc.id ? 'Close Ledger' : 'View Ledger'}</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenTransfer(acc.id)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => editAccount(acc.id, { isArchived: true })}
                    title="Archive Account"
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Specific Ledger Drawer (If Selected) */}
      {selectedAccount && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Ledger: {selectedAccount.name}
              </h2>
              <p className="text-xs text-slate-500">
                {accountTransactions.length} transaction(s) recorded on this account
              </p>
            </div>
            <button
              onClick={() => setSelectedAccountId(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {accountTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions recorded for this account yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {accountTransactions.map((tx) => {
                    const isDebit = tx.accountId === selectedAccount.id && tx.type === 'expense';
                    const isCredit = tx.accountId === selectedAccount.id && (tx.type === 'income' || tx.type === 'refund');

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {formatDate(tx.date, 'short')}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                          {tx.title}
                        </td>
                        <td className="py-2.5 px-3 capitalize text-slate-500">{tx.type}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                          <span
                            className={
                              isCredit
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isDebit
                                ? 'text-slate-900 dark:text-white'
                                : 'text-blue-600'
                            }
                          >
                            {isCredit ? '+' : isDebit ? '-' : ''}
                            {formatCurrency(tx.amount, currency, numberFormat)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Archived Accounts (if any) */}
      {archivedAccounts.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Archived Accounts ({archivedAccounts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 opacity-60">
            {archivedAccounts.map((a) => (
              <div
                key={a.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-xs"
              >
                <span>{a.name}</span>
                <button
                  onClick={() => editAccount(a.id, { isArchived: false })}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
