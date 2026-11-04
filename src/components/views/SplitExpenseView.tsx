import React, { useState } from 'react';
import { Split, Plus, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

interface SplitPerson {
  id: string;
  name: string;
  share: number;
}

export const SplitExpenseView: React.FC = () => {
  const { currentWorkspace, addTransaction, accounts, categories, currency, numberFormat } = useFinance();

  const [billTitle, setBillTitle] = useState('Weekend Family Dinner');
  const [totalAmount, setTotalAmount] = useState('3600');
  const [taxOrTip, setTaxOrTip] = useState('180');
  const [payerName, setPayerName] = useState(currentWorkspace.members[0]?.name || 'Prince Patel');

  const [people, setPeople] = useState<SplitPerson[]>([
    { id: 'p1', name: 'Prince Patel', share: 0 },
    { id: 'p2', name: 'Priya Patel', share: 0 },
    { id: 'p3', name: 'Aarav Patel', share: 0 },
  ]);

  const [newPersonName, setNewPersonName] = useState('');
  const [recordedSuccess, setRecordedSuccess] = useState(false);

  const billNum = parseFloat(totalAmount) || 0;
  const taxNum = parseFloat(taxOrTip) || 0;
  const grandTotal = billNum + taxNum;

  const equalShare = people.length > 0 ? grandTotal / people.length : 0;

  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;
    setPeople([...people, { id: `p_${Date.now()}`, name: newPersonName.trim(), share: 0 }]);
    setNewPersonName('');
  };

  const handleRemovePerson = (id: string) => {
    setPeople(people.filter((p) => p.id !== id));
  };

  const handleRecordToLedger = () => {
    // Record the full expense for the payer
    addTransaction({
      title: `Split Expense: ${billTitle}`,
      amount: grandTotal,
      type: 'expense',
      categoryId: categories.find((c) => c.name.includes('Food'))?.id || categories[0]?.id || 'cat_food',
      accountId: accounts[0]?.id || 'acc_hdfc',
      paymentMethod: 'upi',
      date: new Date().toISOString().split('T')[0],
      notes: `Split bill with ${people.map((p) => p.name).join(', ')}. ₹${equalShare.toFixed(2)} per person. Paid by ${payerName}.`,
      tags: ['SplitExpense', 'Dining'],
    });

    setRecordedSuccess(true);
    setTimeout(() => setRecordedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Split Expenses Calculator
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Divide dinner, vacation, or grocery bills equally among family & friends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bill inputs */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            1. Bill Details
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Expense Title
            </label>
            <input
              type="text"
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Base Bill ({currency === 'INR' ? '₹' : '$'})
              </label>
              <input
                type="number"
                step="any"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                GST / Tip / Service Charge
              </label>
              <input
                type="number"
                step="any"
                value={taxOrTip}
                onChange={(e) => setTaxOrTip(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Paid by
            </label>
            <input
              type="text"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
            <span className="text-xs font-semibold text-slate-500">Grand Total:</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(grandTotal, currency, numberFormat)}
            </span>
          </div>
        </div>

        {/* Participants & Breakdown */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              2. Split Breakdown ({people.length} people)
            </h2>

            {/* Add person input */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Add member or friend name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPerson();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddPerson}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200"
              >
                + Add
              </button>
            </div>

            {/* List */}
            <div className="mt-4 space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
              {people.map((p) => (
                <div key={p.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {p.name}
                    </span>
                    {p.name === payerName && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded">
                        Paid Bill
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(equalShare, currency, numberFormat)}
                    </span>
                    {people.length > 1 && (
                      <button
                        onClick={() => handleRemovePerson(p.id)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {recordedSuccess ? (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recorded to MoneyFlow Ledger!</span>
              </div>
            ) : (
              <button
                onClick={handleRecordToLedger}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Record Entire Bill to Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
