import React, { useState } from 'react';
import { Plus, AlertTriangle, CheckCircle2, AlertOctagon, TrendingUp, PieChart } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    setBudget,
    deleteBudget,
    categories,
    filteredTransactions,
    currency,
    numberFormat,
    totalExpenses,
  } = useFinance();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>('overall');
  const [budgetAmountInput, setBudgetAmountInput] = useState('');

  // Overall budget calculations
  const overallBudget = budgets.find((b) => b.isOverall);
  const overallAmount = overallBudget?.amount || 95000;
  const overallPercent = Math.min(100, Math.round((totalExpenses / overallAmount) * 100));
  const overallRemaining = Math.max(0, overallAmount - totalExpenses);

  // Category budgets
  const categoryBudgets = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const budgetObj = budgets.find((b) => b.categoryId === cat.id);
      const spent = filteredTransactions
        .filter((t) => t.categoryId === cat.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const allocated = budgetObj?.amount || 0;
      const percent = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
      const remaining = allocated - spent;

      return {
        id: budgetObj?.id,
        category: cat,
        allocated,
        spent,
        percent,
        remaining,
        hasBudget: !!budgetObj,
      };
    });

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetAmountInput);
    if (isNaN(amount) || amount <= 0) return;

    if (selectedCatId === 'overall') {
      setBudget(amount, undefined, true);
    } else {
      setBudget(amount, selectedCatId, false);
    }

    setBudgetAmountInput('');
    setIsEditingBudget(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Budgets & Expense Caps
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor monthly limits with proactive 80% warning and 100% breach alerts
          </p>
        </div>

        <button
          onClick={() => setIsEditingBudget(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Set Budget Limit</span>
        </button>
      </div>

      {/* Set Budget Inline Card */}
      {isEditingBudget && (
        <form
          onSubmit={handleSaveBudget}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Configure Monthly Budget Cap
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingBudget(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Target Scope
              </label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="overall">Overall Total Monthly Budget</option>
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      Category: {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Monthly Cap ({currency === 'INR' ? '₹' : '$'})
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 25000"
                value={budgetAmountInput}
                onChange={(e) => setBudgetAmountInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingBudget(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 rounded-lg"
            >
              Save Budget Limit
            </button>
          </div>
        </form>
      )}

      {/* Overall Total Monthly Budget Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Overall Monthly Budget
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(totalExpenses, currency, numberFormat)}
              </span>
              <span className="text-sm text-slate-500 font-mono">
                / {formatCurrency(overallAmount, currency, numberFormat)}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-500">Remaining Cushion:</div>
            <div
              className={`text-lg font-bold font-mono tabular-nums ${
                overallRemaining === 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatCurrency(overallRemaining, currency, numberFormat)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                overallPercent >= 100
                  ? 'bg-rose-500'
                  : overallPercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Utilization: {overallPercent}%</span>
            <span
              className={
                overallPercent >= 100
                  ? 'text-rose-600 font-bold'
                  : overallPercent >= 80
                  ? 'text-amber-600 font-bold'
                  : 'text-emerald-600 font-medium'
              }
            >
              {overallPercent >= 100
                ? 'Alert: Overall Monthly Budget Exceeded'
                : overallPercent >= 80
                ? 'Warning: Reached 80% Threshold'
                : 'Pacing Nominal'}
            </span>
          </div>
        </div>
      </div>

      {/* Category-Wise Budgets Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Category Budgets ({categoryBudgets.filter((cb) => cb.hasBudget).length} active)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBudgets.map((item) => {
            const isExceeded = item.spent > item.allocated && item.allocated > 0;
            const isWarning = item.percent >= 80 && !isExceeded;

            return (
              <div
                key={item.category.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.category.name}
                    </h3>
                  </div>

                  {item.hasBudget ? (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isExceeded
                          ? 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                          : isWarning
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-600'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                      }`}
                    >
                      {item.percent}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">No Cap Set</span>
                  )}
                </div>

                <div className="flex items-baseline justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-900 dark:text-white font-bold">
                    {formatCurrency(item.spent, currency, numberFormat)}
                  </span>
                  <span className="text-slate-400">
                    of {item.hasBudget ? formatCurrency(item.allocated, currency, numberFormat) : '—'}
                  </span>
                </div>

                {/* Progress bar */}
                {item.hasBudget && (
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, item.percent)}%` }}
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {item.hasBudget
                      ? isExceeded
                        ? `Over by ${formatCurrency(Math.abs(item.remaining), currency, numberFormat)}`
                        : `${formatCurrency(item.remaining, currency, numberFormat)} left`
                      : 'Unrestricted spending'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCatId(item.category.id);
                      setBudgetAmountInput(item.allocated > 0 ? item.allocated.toString() : '');
                      setIsEditingBudget(true);
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    {item.hasBudget ? 'Edit Cap' : '+ Set Cap'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
