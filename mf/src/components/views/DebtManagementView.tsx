import React, { useState } from 'react';
import { Scale, Plus, ArrowUpRight, ArrowDownRight, CheckCircle2, History, X, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { DebtRecord } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const DebtManagementView: React.FC = () => {
  const {
    debts,
    addDebt,
    recordDebtPayment,
    markDebtSettled,
    deleteDebt,
    accounts,
    currency,
    numberFormat,
    totalDebtOwed,
    totalDebtOwedToMe,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'owe' | 'owed'>('owe');
  const [isAdding, setIsAdding] = useState(false);
  const [personOrEntity, setPersonOrEntity] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Partial Payment Modal State
  const [paymentTargetDebt, setPaymentTargetDebt] = useState<DebtRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState(accounts[0]?.id || '');

  // Ledger History Drawer
  const [historyDebt, setHistoryDebt] = useState<DebtRecord | null>(null);

  const displayDebts = debts.filter((d) => d.type === activeTab);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(principalAmount);
    if (isNaN(principal) || principal <= 0) return;

    addDebt({
      personOrEntity: personOrEntity.trim(),
      type: activeTab,
      principalAmount: principal,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    });

    setPersonOrEntity('');
    setPrincipalAmount('');
    setInterestRate('');
    setDueDate('');
    setNotes('');
    setIsAdding(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTargetDebt) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    recordDebtPayment(
      paymentTargetDebt.id,
      amount,
      paymentNote || 'Partial settlement payment',
      paymentAccountId || undefined
    );

    setPaymentTargetDebt(null);
    setPaymentAmount('');
    setPaymentNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Debt Management (Khaata Ledger)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track money you owe (loans, borrowings) and money others owe you
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Debt Record</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 mb-1">
            <span>Money I Owe (Liabilities)</span>
            <ArrowDownRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            {formatCurrency(totalDebtOwed, currency, numberFormat)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Car loans, credit borrowings</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1">
            <span>Money Owed To Me (Receivables)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(totalDebtOwedToMe, currency, numberFormat)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Loans given to friends/family</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Net Lending Position</span>
            <Scale className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(totalDebtOwedToMe - totalDebtOwed, currency, numberFormat)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Receivables minus liabilities</div>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('owe')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors ${
            activeTab === 'owe'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          <span>Money I Owe ({debts.filter((d) => d.type === 'owe').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('owed')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors ${
            activeTab === 'owed'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          <span>Money Others Owe Me ({debts.filter((d) => d.type === 'owed').length})</span>
        </button>
      </div>

      {/* Add Debt Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Add {activeTab === 'owe' ? 'Debt / Liability Record' : 'Receivable Record'}
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {activeTab === 'owe' ? 'Lender / Institution Name' : 'Borrower / Friend Name'}
              </label>
              <input
                type="text"
                required
                placeholder={activeTab === 'owe' ? 'e.g. SBI Bank Car Loan, Friend Amit' : 'e.g. Rohan Sharma, Cousin Bhavik'}
                value={personOrEntity}
                onChange={(e) => setPersonOrEntity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Principal Amount ({currency === 'INR' ? '₹' : '$'})
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="50000"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Interest Rate % (Optional)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 8.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Repayment Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency medical advance, EMI terms"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
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
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* Debts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayDebts.map((debt) => {
          const isCleared = debt.status === 'cleared' || debt.outstandingAmount === 0;

          return (
            <div
              key={debt.id}
              className={`p-5 bg-white dark:bg-slate-900 border rounded-xl flex flex-col justify-between shadow-2xs ${
                isCleared
                  ? 'border-slate-200 dark:border-slate-800 opacity-70'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {debt.personOrEntity}
                    </h3>
                    {debt.interestRate && (
                      <span className="text-[11px] text-slate-400">
                        {debt.interestRate}% annual interest
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isCleared
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {isCleared ? 'CLEARED' : 'OUTSTANDING'}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[11px] text-slate-400">Remaining Outstanding</div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {formatCurrency(debt.outstandingAmount, currency, numberFormat)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Original Principal: {formatCurrency(debt.principalAmount, currency, numberFormat)}
                  </div>
                </div>

                {debt.notes && (
                  <p className="mt-2 text-xs text-slate-500 italic">{debt.notes}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setHistoryDebt(debt)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{debt.payments.length} Payments</span>
                </button>

                {!isCleared && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setPaymentTargetDebt(debt);
                        setPaymentAmount('');
                      }}
                      className="px-2.5 py-1 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 rounded hover:bg-emerald-100"
                    >
                      {debt.type === 'owe' ? 'Pay Part' : 'Receive Part'}
                    </button>
                    <button
                      onClick={() => markDebtSettled(debt.id)}
                      title="Mark fully settled"
                      className="p-1 text-slate-400 hover:text-emerald-600"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Payment Modal */}
      {paymentTargetDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Record Payment for {paymentTargetDebt.personOrEntity}
              </h3>
              <button
                onClick={() => setPaymentTargetDebt(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Payment Amount ({currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="5000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xl font-bold font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Settlement Account
                </label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. October EMI, partial refund"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentTargetDebt(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {historyDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Payment History: {historyDebt.personOrEntity}
              </h3>
              <button
                onClick={() => setHistoryDebt(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {historyDebt.payments.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No partial payments recorded yet.
                </div>
              ) : (
                historyDebt.payments.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {p.note || 'Settlement payment'}
                      </div>
                      <div className="text-[10px] text-slate-400">{formatDate(p.date, 'short')}</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(p.amount, currency, numberFormat)}
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
