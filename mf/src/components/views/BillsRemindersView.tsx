import React, { useState } from 'react';
import { CalendarCheck, Plus, Check, Clock, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate, formatRelativeDay } from '../../utils/formatters';

export const BillsRemindersView: React.FC = () => {
  const {
    billReminders,
    addBillReminder,
    markBillPaid,
    deleteBillReminder,
    categories,
    accounts,
    currency,
    numberFormat,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid'>('unpaid');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-20');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [autoPay, setAutoPay] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBills = billReminders.filter((b) => {
    if (activeTab === 'unpaid') return !b.isPaid;
    if (activeTab === 'paid') return b.isPaid;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addBillReminder({
      title: title.trim(),
      amount: numAmount,
      dueDate,
      reminderDate: dueDate,
      categoryId,
      accountId,
      autoPay,
    });

    setTitle('');
    setAmount('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bills & Payment Reminders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Never miss utility, credit card, insurance, or subscription deadlines
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Bill Reminder</span>
        </button>
      </div>

      {/* Tab filter */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs font-medium">
        {(['unpaid', 'paid', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab === 'unpaid'
              ? `Unpaid (${billReminders.filter((b) => !b.isPaid).length})`
              : tab === 'paid'
              ? `Paid (${billReminders.filter((b) => b.isPaid).length})`
              : `All Bills (${billReminders.length})`}
          </button>
        ))}
      </div>

      {/* Add Bill Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Add Scheduled Bill Due
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Bill Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Torrent Electricity, ICICI Credit Card"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Amount ({currency === 'INR' ? '₹' : '$'})
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="3500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Payment Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="autopay"
                checked={autoPay}
                onChange={(e) => setAutoPay(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="autopay" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                Auto-debit / Auto-pay configured
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 rounded-lg"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {/* Bills Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBills.map((bill) => {
          const isOverdue = !bill.isPaid && bill.dueDate < todayStr;
          const cat = categories.find((c) => c.id === bill.categoryId);
          const acc = accounts.find((a) => a.id === bill.accountId);

          return (
            <div
              key={bill.id}
              className={`p-5 bg-white dark:bg-slate-900 border rounded-xl flex flex-col justify-between shadow-2xs ${
                bill.isPaid
                  ? 'border-slate-200 dark:border-slate-800 opacity-75'
                  : isOverdue
                  ? 'border-rose-300 dark:border-rose-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="truncate pr-2">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                      {cat?.name || 'Bill'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {bill.title}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      bill.isPaid
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : isOverdue
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {bill.isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : 'DUE SOON'}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[11px] text-slate-400">Amount Due</div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {formatCurrency(bill.amount, currency, numberFormat)}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDate(bill.dueDate, 'short')} ({formatRelativeDay(bill.dueDate)})
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Payment Account:</span>
                    <span>{acc?.name || 'Account'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => deleteBillReminder(bill.id)}
                  title="Delete bill"
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {!bill.isPaid && (
                  <button
                    onClick={() => markBillPaid(bill.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Paid</span>
                  </button>
                )}
                {bill.isPaid && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Paid on {formatDate(bill.paidDate || todayStr, 'short')}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
