import React, { useState } from 'react';
import { Target, Plus, Sparkles, CheckCircle2, History, X, ChevronRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SavingsGoalsView: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    contributeToSavingsGoal,
    deleteSavingsGoal,
    accounts,
    currency,
    numberFormat,
  } = useFinance();

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-03-31');
  const [goalCategory, setGoalCategory] = useState('Personal Savings');
  const [goalNotes, setGoalNotes] = useState('');

  // Contribute Modal State
  const [selectedGoalForContrib, setSelectedGoalForContrib] = useState<SavingsGoal | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribAccountId, setContribAccountId] = useState(accounts[0]?.id || '');
  const [contribNote, setContribNote] = useState('');

  // History Drawer State
  const [historyGoal, setHistoryGoal] = useState<SavingsGoal | null>(null);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(targetAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addSavingsGoal({
      name: goalName.trim(),
      targetAmount: numAmount,
      targetDate,
      category: goalCategory,
      notes: goalNotes.trim() || undefined,
    });

    setGoalName('');
    setTargetAmount('');
    setIsAddingGoal(false);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForContrib) return;
    const amount = parseFloat(contribAmount);
    if (isNaN(amount) || amount <= 0) return;

    contributeToSavingsGoal(
      selectedGoalForContrib.id,
      amount,
      contribAccountId || undefined,
      contribNote || 'Savings allocation'
    );

    setSelectedGoalForContrib(null);
    setContribAmount('');
    setContribNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Savings Goals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Target capital milestones, emergency cushions & dream purchases
          </p>
        </div>

        <button
          onClick={() => setIsAddingGoal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Add Goal Form */}
      {isAddingGoal && (
        <form
          onSubmit={handleCreateGoal}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Create Financial Target Goal
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingGoal(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Goal Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Emergency Fund, New MacBook, Goa Trip"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Target Amount ({currency === 'INR' ? '₹' : '$'})
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="500000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Safety">Safety & Emergency</option>
                <option value="Gadgets">Gadgets & Tech</option>
                <option value="Travel">Travel & Vacations</option>
                <option value="Automobile">Vehicle / Downpayment</option>
                <option value="Education">Education & Courses</option>
                <option value="Personal Savings">General Savings</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Kept in liquid sweep FD"
              value={goalNotes}
              onChange={(e) => setGoalNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingGoal(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 rounded-lg"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((goal) => {
          const percent = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className={`p-5 bg-white dark:bg-slate-900 border rounded-xl flex flex-col justify-between shadow-2xs transition-all ${
                isCompleted
                  ? 'border-emerald-300 dark:border-emerald-800'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                      {goal.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {goal.name}
                    </h3>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-baseline justify-between text-xs font-mono tabular-nums">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(goal.currentAmount, currency, numberFormat)}
                    </span>
                    <span className="text-slate-400">
                      Goal: {formatCurrency(goal.targetAmount, currency, numberFormat)}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Remaining to save:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(remaining, currency, numberFormat)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Target Date:</span>
                    <span>{formatDate(goal.targetDate, 'short')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setHistoryGoal(goal)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{goal.contributions.length} Contributions</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedGoalForContrib(goal);
                    setContribAmount('');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Funds</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribute Funds Modal */}
      {selectedGoalForContrib && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Add Funds to Goal
                  </h3>
                  <p className="text-xs text-slate-500">{selectedGoalForContrib.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGoalForContrib(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleContribute} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Contribution Amount ({currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="5000"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xl font-bold font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Deduct from Account
                </label>
                <select
                  value={contribAccountId}
                  onChange={(e) => setContribAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">Do not deduct from account</option>
                  {accounts
                    .filter((a) => !a.isArchived && a.type !== 'credit_card')
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Balance: ₹{a.balance.toLocaleString('en-IN')})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Note / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly SIP surplus, festival bonus"
                  value={contribNote}
                  onChange={(e) => setContribNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForContrib(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs"
                >
                  Save Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Contributions History Drawer */}
      {historyGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Contribution Ledger: {historyGoal.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Total saved: {formatCurrency(historyGoal.currentAmount, currency, numberFormat)}
                </p>
              </div>
              <button
                onClick={() => setHistoryGoal(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {historyGoal.contributions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No contributions recorded yet.
                </div>
              ) : (
                historyGoal.contributions.map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {c.note || 'Contribution'}
                      </div>
                      <div className="text-[10px] text-slate-400">{formatDate(c.date, 'short')}</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatCurrency(c.amount, currency, numberFormat)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
