import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Plus,
  ArrowRightLeft,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatCompactINR, formatDate, translations } from '../../utils/formatters';

interface DashboardViewProps {
  onOpenAddTx: () => void;
  onOpenTransfer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddTx, onOpenTransfer }) => {
  const {
    filteredTransactions,
    totalIncome,
    totalExpenses,
    totalBalance,
    monthlySavings,
    savingsRate,
    netWorth,
    accounts,
    categories,
    budgets,
    billReminders,
    savingsGoals,
    dateFilter,
    setDateFilter,
    selectedMonth,
    setSelectedMonth,
    setActiveView,
    currency,
    numberFormat,
    language,
    currentWorkspace,
  } = useFinance();

  const t = translations[language];

  // Category breakdown for current filtered expenses
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      if (t.type === 'expense') {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      }
    });

    const list = Object.entries(map).map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Other',
        color: cat?.color || '#64748b',
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      };
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories, totalExpenses]);

  // Overall Budget status
  const overallBudget = budgets.find((b) => b.isOverall);
  const budgetAmount = overallBudget?.amount || 95000;
  const budgetSpent = totalExpenses;
  const budgetPercent = Math.min(100, Math.round((budgetSpent / budgetAmount) * 100));
  const isBudgetWarning = budgetPercent >= 80 && budgetPercent < 100;
  const isBudgetExceeded = budgetPercent >= 100;

  // Upcoming unpaid bills
  const upcomingBills = useMemo(() => {
    return billReminders
      .filter((b) => !b.isPaid)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 3);
  }, [billReminders]);

  // Recent 6 transactions
  const recentTransactions = useMemo(() => {
    return filteredTransactions.slice(0, 6);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentWorkspace.name} · Real-time cashflow & net balance
          </p>
        </div>

        {/* Date Segmented Control */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            {(['today', 'week', 'month', 'year', 'specific_month', 'all'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setDateFilter(filterKey)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  dateFilter === filterKey
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {filterKey === 'today'
                  ? t.today
                  : filterKey === 'week'
                  ? t.thisWeek
                  : filterKey === 'month'
                  ? t.thisMonth
                  : filterKey === 'year'
                  ? t.thisYear
                  : filterKey === 'specific_month'
                  ? 'Month'
                  : t.allTime}
              </button>
            ))}
          </div>

          {dateFilter === 'specific_month' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-medium text-slate-900 dark:text-white shadow-2xs"
            />
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Net Worth */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{t.netWorth}</span>
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatCurrency(netWorth, currency, numberFormat)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Assets minus liabilities</div>
        </div>

        {/* Total Liquid Balance */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{t.totalBalance}</span>
            <PiggyBank className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatCurrency(totalBalance, currency, numberFormat)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {accounts.filter((a) => !a.isArchived).length} active accounts
          </div>
        </div>

        {/* Total Income */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1">
            <span>{t.totalIncome}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
            {formatCurrency(totalIncome, currency, numberFormat)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Salary & receipts</div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
            <span>{t.totalExpenses}</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatCurrency(totalExpenses, currency, numberFormat)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Rent, bills & living</div>
        </div>

        {/* Monthly Savings */}
        <div className="col-span-2 lg:col-span-1 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
            <span>{t.monthlySavings}</span>
            <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 px-1 rounded">
              {savingsRate}% rate
            </span>
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums tracking-tight">
            {formatCurrency(monthlySavings, currency, numberFormat)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Surplus retained</div>
        </div>
      </div>

      {/* Main 2-Column Split: Cashflow Comparison & Category Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cashflow Bar Comparison */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Income vs Expense Flow
              </h2>
              <p className="text-xs text-slate-500">Period net cash generation</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Income</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 dark:bg-slate-600" />
                <span>Expense</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Bar Chart */}
          <div className="h-56 w-full flex items-end gap-6 pt-6 pb-2 px-4 border-b border-slate-100 dark:border-slate-800">
            {/* Visual Bar 1: Income */}
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 opacity-90 group-hover:opacity-100 transition-opacity">
                {formatCompactINR(totalIncome, currency)}
              </span>
              <div
                className="w-full max-w-[64px] bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all duration-300"
                style={{
                  height: `${Math.max(
                    12,
                    Math.min(100, Math.round((totalIncome / (totalIncome + totalExpenses || 1)) * 100)) * 1.5
                  )}%`,
                }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Income</span>
            </div>

            {/* Visual Bar 2: Expense */}
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 opacity-90 group-hover:opacity-100 transition-opacity">
                {formatCompactINR(totalExpenses, currency)}
              </span>
              <div
                className="w-full max-w-[64px] bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 rounded-t-lg transition-all duration-300"
                style={{
                  height: `${Math.max(
                    12,
                    Math.min(100, Math.round((totalExpenses / (totalIncome + totalExpenses || 1)) * 100)) * 1.5
                  )}%`,
                }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Expenses</span>
            </div>

            {/* Visual Bar 3: Savings */}
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 opacity-90 group-hover:opacity-100 transition-opacity">
                {formatCompactINR(monthlySavings, currency)}
              </span>
              <div
                className="w-full max-w-[64px] bg-blue-500 hover:bg-blue-600 rounded-t-lg transition-all duration-300"
                style={{
                  height: `${Math.max(
                    10,
                    Math.min(100, Math.round((monthlySavings / (totalIncome || 1)) * 100)) * 1.5
                  )}%`,
                }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Net Saved</span>
            </div>
          </div>

          {/* Quick Sub-Stats */}
          <div className="grid grid-cols-3 gap-2 pt-3 text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Savings Rate</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{savingsRate}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Daily Avg Spend</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(Math.round(totalExpenses / 30), currency, numberFormat)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Expense/Income</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Category Spending Breakdown */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Expense Breakdown
              </h2>
              <button
                onClick={() => setActiveView('categories')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                All Categories →
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {categorySpending.slice(0, 5).map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-slate-900 dark:text-white font-semibold">
                        {formatCurrency(cat.amount, currency, numberFormat)}
                      </span>
                      <span className="text-[11px] text-slate-400 w-8 text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Total Categories: {categorySpending.length}</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {formatCurrency(totalExpenses, currency, numberFormat)}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Accounts Overview & Monthly Budget Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts Overview */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Accounts & Wallets
              </h2>
              <p className="text-xs text-slate-500">Live bank balances & credit dues</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenTransfer}
                className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
              >
                Transfer
              </button>
              <button
                onClick={() => setActiveView('accounts')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Manage →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {accounts
              .filter((a) => !a.isArchived)
              .slice(0, 6)
              .map((acc) => {
                const isCredit = acc.type === 'credit_card';
                return (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {acc.name}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: acc.color }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {acc.institutionName || acc.accountNumber || acc.type}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-[10px] text-slate-400 block">
                        {isCredit ? 'Outstanding Due' : 'Balance'}
                      </span>
                      <span
                        className={`text-sm font-bold font-mono tabular-nums ${
                          isCredit
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatCurrency(acc.balance, currency, numberFormat)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Monthly Budget Tracker */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Monthly Budget
              </h2>
              <button
                onClick={() => setActiveView('budgets')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Details →
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Target limit for current month</p>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(budgetSpent, currency, numberFormat)}
                </span>
                <span className="text-xs text-slate-500">
                  of {formatCurrency(budgetAmount, currency, numberFormat)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isBudgetExceeded
                      ? 'bg-rose-500'
                      : isBudgetWarning
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Utilization: {budgetPercent}%</span>
                <span
                  className={`font-semibold ${
                    isBudgetExceeded
                      ? 'text-rose-600'
                      : isBudgetWarning
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {isBudgetExceeded
                    ? 'Budget Exceeded!'
                    : isBudgetWarning
                    ? '80% Warning Limit'
                    : 'Within Safe Limits'}
                </span>
              </div>
            </div>

            {/* Upcoming Bills Mini-List */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Upcoming Due Bills
                </span>
                <button
                  onClick={() => setActiveView('bills')}
                  className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  View all ({billReminders.filter((b) => !b.isPaid).length})
                </button>
              </div>

              <div className="space-y-2">
                {upcomingBills.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {b.title}
                      </div>
                      <div className="text-[10px] text-slate-400">Due {formatDate(b.dueDate, 'short')}</div>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(b.amount, currency, numberFormat)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions Table & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-500">Latest recorded income & expenses</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddTx}
                className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 px-2 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
              <button
                onClick={() => setActiveView('transactions')}
                className="text-xs text-slate-600 dark:text-slate-400 hover:underline"
              >
                View all ({filteredTransactions.length}) →
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income' || tx.type === 'refund';
              const isTransfer = tx.type === 'transfer';
              const acc = accounts.find((a) => a.id === tx.accountId);
              const cat = categories.find((c) => c.id === tx.categoryId);

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : isTransfer
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : isTransfer ? (
                        <ArrowRightLeft className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {tx.title}
                      </div>
                      {/* Zero-Pill Unboxed Metadata with · separator */}
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{cat?.name || 'General'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{acc?.name || 'Account'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDate(tx.date, 'short')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-bold font-mono tabular-nums ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isTransfer
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '' : '-'}
                      {formatCurrency(tx.amount, currency, numberFormat)}
                    </span>
                    <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                      {tx.paymentMethod.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Savings Goals Card (1 col) */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Savings Goals
                </h2>
                <p className="text-xs text-slate-500">Progress toward financial milestones</p>
              </div>
              <button
                onClick={() => setActiveView('savings')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-4">
              {savingsGoals.slice(0, 3).map((goal) => {
                const percent = Math.min(
                  100,
                  Math.round((goal.currentAmount / goal.targetAmount) * 100)
                );
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {goal.name}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {percent}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{formatCurrency(goal.currentAmount, currency, numberFormat)}</span>
                      <span>Target: {formatCurrency(goal.targetAmount, currency, numberFormat)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveView('savings')}
              className="w-full py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contribute to Goal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
