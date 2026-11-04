import React, { useMemo } from 'react';
import { BarChart3, Download, Printer, TrendingUp, TrendingDown, PieChart, ShieldCheck } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatCompactINR } from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const {
    filteredTransactions,
    totalIncome,
    totalExpenses,
    monthlySavings,
    savingsRate,
    netWorth,
    accounts,
    categories,
    debts,
    currency,
    numberFormat,
    currentWorkspace,
  } = useFinance();

  // Category breakdown
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      if (t.type === 'expense') {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      }
    });

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat?.name || 'Other',
          color: cat?.color || '#64748b',
          amount,
          percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories, totalExpenses]);

  // Balance sheet asset vs liability items
  const assets = useMemo(() => {
    const list: Array<{ name: string; amount: number; type: string }> = [];
    accounts.forEach((a) => {
      if (!a.isArchived && a.type !== 'credit_card' && a.balance > 0) {
        list.push({ name: a.name, amount: a.balance, type: a.type });
      }
    });
    debts.forEach((d) => {
      if (d.type === 'owed' && d.status === 'active' && d.outstandingAmount > 0) {
        list.push({ name: `Receivable: ${d.personOrEntity}`, amount: d.outstandingAmount, type: 'receivable' });
      }
    });
    return list;
  }, [accounts, debts]);

  const liabilities = useMemo(() => {
    const list: Array<{ name: string; amount: number; type: string }> = [];
    accounts.forEach((a) => {
      if (!a.isArchived && a.type === 'credit_card' && a.balance < 0) {
        list.push({ name: a.name, amount: Math.abs(a.balance), type: 'credit_card' });
      }
    });
    debts.forEach((d) => {
      if (d.type === 'owe' && d.status === 'active' && d.outstandingAmount > 0) {
        list.push({ name: `Payable: ${d.personOrEntity}`, amount: d.outstandingAmount, type: 'debt' });
      }
    });
    return list;
  }, [accounts, debts]);

  const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics & Financial Statements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentWorkspace.name} · Balance sheet, cash flow margins & category distributions
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export PDF Report</span>
        </button>
      </div>

      {/* High-Level Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block">Total Net Worth</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
            {formatCurrency(netWorth, currency, numberFormat)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Assets - Liabilities</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block">Operating Savings Margin</span>
          <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums mt-1">
            {savingsRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {formatCurrency(monthlySavings, currency, numberFormat)} retained
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block">Expense to Income Ratio</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
            {totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Target benchmark: &lt;70%</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block">Debt-to-Asset Ratio</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
            {totalAssets > 0 ? Math.round((totalLiabilities / totalAssets) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Low leverage indicator</div>
        </div>
      </div>

      {/* Balance Sheet Statement (Assets vs Liabilities) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets column */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Assets & Holdings
              </h2>
              <span className="text-xs text-slate-500">Liquid bank, investments & receivables</span>
            </div>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(totalAssets, currency, numberFormat)}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {assets.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">{item.type}</div>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(item.amount, currency, numberFormat)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities column */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Liabilities & Dues
              </h2>
              <span className="text-xs text-slate-500">Credit cards, borrowings & loans</span>
            </div>
            <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {formatCurrency(totalLiabilities, currency, numberFormat)}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {liabilities.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">{item.type}</div>
                </div>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatCurrency(item.amount, currency, numberFormat)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Category Spending Distribution
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Share %</th>
                <th className="py-2.5 px-3 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categorySpending.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">{cat.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(cat.amount, currency, numberFormat)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
