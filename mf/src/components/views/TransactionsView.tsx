import React, { useState, useMemo } from 'react';
import { authFetch } from '../../lib/api';
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Eye,
  X,
  FileSpreadsheet,
  Sparkles,
  ReceiptText,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import { formatCurrency, formatDate, translations } from '../../utils/formatters';

interface TransactionsViewProps {
  onOpenAddTx: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenAddTx }) => {
  const {
    filteredTransactions,
    deleteTransaction,
    categories,
    accounts,
    currency,
    numberFormat,
    language,
    addTransaction,
  } = useFinance();

  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Date, Month, Year specific filters
  const [filterMode, setFilterMode] = useState<'all' | 'date' | 'month' | 'year'>('all');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState<string>('2026-11');
  const [filterYear, setFilterYear] = useState<string>('2026');

  // Receipt preview modal state
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // Natural language query filter state
  const [isAiSearching, setIsAiSearching] = useState(false);

  const handleNaturalSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    try {
      const response = await authFetch('/api/gemini/natural-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.type && data.type !== 'all') {
          setSelectedType(data.type);
        }
        if (data.category) {
          const matched = categories.find((c) =>
            c.name.toLowerCase().includes(data.category.toLowerCase())
          );
          if (matched) setSelectedCategory(matched.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Filtered & Sorted transactions list
  const transactionsList = useMemo(() => {
    return filteredTransactions
      .filter((tx) => {
        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) return false;

        // Category filter
        if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) return false;

        // Account filter
        if (selectedAccount !== 'all' && tx.accountId !== selectedAccount) return false;

        // Date, Month, Year filter mode
        if (filterMode === 'date' && filterDate) {
          if (tx.date !== filterDate) return false;
        }
        if (filterMode === 'month' && filterMonth) {
          if (!tx.date.startsWith(filterMonth)) return false;
        }
        if (filterMode === 'year' && filterYear) {
          if (!tx.date.startsWith(filterYear)) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(q);
          const matchNotes = tx.notes?.toLowerCase().includes(q);
          const matchTags = tx.tags?.some((tag) => tag.toLowerCase().includes(q));
          const matchCategory = categories
            .find((c) => c.id === tx.categoryId)
            ?.name.toLowerCase()
            .includes(q);
          if (!matchTitle && !matchNotes && !matchTags && !matchCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [filteredTransactions, selectedType, selectedCategory, selectedAccount, searchQuery, sortBy, categories, filterMode, filterDate, filterMonth, filterYear]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Title', 'Type', 'Category', 'Account', 'Amount', 'Payment Method', 'Notes', 'Tags'];
    const rows = transactionsList.map((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId)?.name || '';
      const acc = accounts.find((a) => a.id === tx.accountId)?.name || '';
      return [
        tx.date,
        `"${tx.title.replace(/"/g, '""')}"`,
        tx.type,
        `"${cat}"`,
        `"${acc}"`,
        tx.amount,
        tx.paymentMethod,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
        `"${(tx.tags || []).join(';')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `moneyflow-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed ledger of all financial activities & receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addTransaction}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        {/* Search row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder='Search by keyword, tag, or "food under 1500"...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNaturalSearch();
              }}
              className="w-full pl-9 pr-24 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleNaturalSearch}
                disabled={isAiSearching}
                className="absolute right-2 top-1.5 px-2 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 rounded flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isAiSearching ? 'Parsing...' : 'Smart Filter'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Account Filter */}
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
              <option value="amount_desc">Amount (Highest First)</option>
              <option value="amount_asc">Amount (Lowest First)</option>
            </select>
          </div>
        </div>

        {/* Date / Month / Year Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500">Date Filter:</span>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Dates</option>
            <option value="date">Specific Date</option>
            <option value="month">Month-wise</option>
            <option value="year">Year-wise</option>
          </select>

          {filterMode === 'date' && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          )}

          {filterMode === 'month' && (
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          )}

          {filterMode === 'year' && (
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          )}
        </div>

        {/* Transaction Type Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'expense', label: 'Expenses' },
            { id: 'income', label: 'Income' },
            { id: 'transfer', label: 'Transfers' },
            { id: 'refund', label: 'Refunds' },
          ].map((tItem) => (
            <button
              key={tItem.id}
              onClick={() => setSelectedType(tItem.id)}
              className={`px-3 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-colors ${
                selectedType === tItem.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        {transactionsList.length === 0 ? (
          <div className="py-16 text-center">
            <ReceiptText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No transactions found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No transactions match your current filters. Add a new transaction or reset search.
            </p>
            <button
              onClick={onOpenAddTx}
              className="mt-4 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 rounded-lg inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record First Transaction</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Transaction</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactionsList.map((tx) => {
                  const isIncome = tx.type === 'income' || tx.type === 'refund';
                  const isTransfer = tx.type === 'transfer';
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  const toAcc = tx.toAccountId ? accounts.find((a) => a.id === tx.toAccountId) : null;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Title & Tags */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="truncate max-w-[200px]">{tx.title}</span>
                          {tx.receiptUrl && (
                            <button
                              onClick={() => setViewingReceipt(tx.receiptUrl!)}
                              title="View Receipt Attachment"
                              className="text-emerald-600 hover:text-emerald-700 p-0.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[240px] mt-0.5">
                            {tx.notes}
                          </div>
                        )}
                        {tx.tags && tx.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {tx.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {cat?.color && (
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                          )}
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {cat?.name || 'General'}
                          </span>
                        </div>
                        {tx.subcategory && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {tx.subcategory}
                          </div>
                        )}
                      </td>

                      {/* Account */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {acc?.name || 'Account'}
                        </div>
                        {toAcc && (
                          <div className="text-[11px] text-blue-500 flex items-center gap-1 mt-0.5">
                            <span>→ {toAcc.name}</span>
                          </div>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 uppercase font-mono">
                          {tx.paymentMethod.replace('_', ' ')}
                        </span>
                        <div className="text-[10px] text-slate-400">{tx.createdByName}</div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        <div>{formatDate(tx.date, 'short')}</div>
                        {tx.time && <div className="text-[10px] text-slate-400">{tx.time}</div>}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm whitespace-nowrap tabular-nums">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isTransfer
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-900 dark:text-white'
                          }
                        >
                          {isIncome ? '+' : isTransfer ? '' : '-'}
                          {formatCurrency(tx.amount, currency, numberFormat)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          title="Delete transaction"
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Viewer Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Receipt Attachment
              </h3>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 max-h-[70vh] overflow-y-auto rounded-lg">
              <img
                src={viewingReceipt}
                alt="Receipt"
                className="w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
