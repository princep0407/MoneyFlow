import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const CalendarView: React.FC = () => {
  const { transactions, billReminders, currency, numberFormat } = useFinance();

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 0-indexed, 10 = November
  const [selectedDay, setSelectedDay] = useState<number | null>(2);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  // Build daily data map
  const dailyDataMap: Record<number, { income: number; expense: number; bills: any[]; txs: any[] }> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyDataMap[d] = { income: 0, expense: 0, bills: [], txs: [] };
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  transactions.forEach((tx) => {
    const dObj = new Date(tx.date);
    if (dObj.getFullYear() === currentYear && dObj.getMonth() === currentMonth) {
      const day = dObj.getDate();
      if (dailyDataMap[day]) {
        dailyDataMap[day].txs.push(tx);
        if (tx.type === 'income' || tx.type === 'refund') {
          dailyDataMap[day].income += tx.amount;
        } else if (tx.type === 'expense') {
          dailyDataMap[day].expense += tx.amount;
        }
      }
    }
  });

  billReminders.forEach((bill) => {
    const dObj = new Date(bill.dueDate);
    if (dObj.getFullYear() === currentYear && dObj.getMonth() === currentMonth) {
      const day = dObj.getDate();
      if (dailyDataMap[day]) {
        dailyDataMap[day].bills.push(bill);
      }
    }
  });

  const selectedDayData = selectedDay ? dailyDataMap[selectedDay] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize income credits, daily spending flow and upcoming bill due dates
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-900 dark:text-white px-2 min-w-[130px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty offset days */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 bg-slate-50/30 dark:bg-slate-800/10 rounded-lg" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const data = dailyDataMap[day];
              const isSelected = selectedDay === day;
              const hasActivity = data.income > 0 || data.expense > 0 || data.bills.length > 0;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs'
                      : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold font-mono ${
                        isSelected
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {day}
                    </span>
                    {data.bills.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Bill Due" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {data.income > 0 && (
                      <div className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate">
                        +{formatCurrency(data.income, currency, numberFormat, false)}
                      </div>
                    )}
                    {data.expense > 0 && (
                      <div className="text-[9px] font-mono text-slate-600 dark:text-slate-400 truncate">
                        -{formatCurrency(data.expense, currency, numberFormat, false)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedDay
                ? `${selectedDay} ${monthNames[currentMonth]} ${currentYear}`
                : 'Select a Date'}
            </h2>
            <p className="text-xs text-slate-400">Day schedule & financial log</p>
          </div>

          {selectedDayData ? (
            <div className="space-y-4">
              {/* Day stats */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Total Income</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedDayData.income, currency, numberFormat)}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Total Expense</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedDayData.expense, currency, numberFormat)}
                  </span>
                </div>
              </div>

              {/* Bills due on this day */}
              {selectedDayData.bills.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-rose-600 block mb-1">
                    Bills Due on this Date ({selectedDayData.bills.length})
                  </span>
                  <div className="space-y-1.5">
                    {selectedDayData.bills.map((b) => (
                      <div
                        key={b.id}
                        className="p-2 rounded bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-900 dark:text-white truncate">
                          {b.title}
                        </span>
                        <span className="font-mono font-bold text-rose-600">
                          {formatCurrency(b.amount, currency, numberFormat)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions logged on this day */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Transactions ({selectedDayData.txs.length})
                </span>
                {selectedDayData.txs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No transactions on this date.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedDayData.txs.map((tx) => (
                      <div key={tx.id} className="pt-2 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {tx.title}
                          </div>
                          <div className="text-[10px] text-slate-400">{tx.paymentMethod}</div>
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatCurrency(tx.amount, currency, numberFormat)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Click any date on the calendar to view its transactions and dues.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
