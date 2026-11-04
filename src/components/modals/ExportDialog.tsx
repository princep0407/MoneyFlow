import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, Check, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  const { transactions, accounts, budgets, savingsGoals, currency, numberFormat, currentWorkspace } = useFinance();
  const [format, setFormat] = useState<'pdf' | 'csv' | 'excel'>('csv');
  const [dataType, setDataType] = useState<'transactions' | 'accounts' | 'budgets' | 'all'>('transactions');
  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (format === 'csv' || format === 'excel') {
        let headers = ['Date', 'Title', 'Type', 'Category', 'Account', 'Amount', 'Payment Method'];
        let rows = transactions.map((tx) => [
          tx.date,
          `"${tx.title.replace(/"/g, '""')}"`,
          tx.type,
          tx.categoryId,
          tx.accountId,
          tx.amount,
          tx.paymentMethod,
        ]);

        if (dataType === 'accounts') {
          headers = ['Name', 'Type', 'Balance', 'Institution'];
          rows = accounts.map((acc) => [
            `"${acc.name}"`,
            acc.type,
            acc.balance,
            `"${acc.institutionName || ''}"`,
          ]);
        } else if (dataType === 'budgets') {
          headers = ['Category ID', 'Amount', 'Period', 'Month'];
          rows = budgets.map((b) => [b.categoryId || 'Overall', b.amount, b.period, b.month]);
        }

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const mime = format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8;';
        const ext = format === 'excel' ? 'xls' : 'csv';

        const blob = new Blob([csvContent], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moneyflow-${dataType}-${new Date().toISOString().split('T')[0]}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // PDF Simulation (Print / HTML export)
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>MoneyFlow Report - ${currentWorkspace.name}</title>
                <style>
                  body { font-family: sans-serif; padding: 20px; color: #1e293b; }
                  h1 { font-size: 20px; margin-bottom: 4px; }
                  p { font-size: 12px; color: #64748b; margin-bottom: 20px; }
                  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
                  th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                  th { background: #f1f5f9; }
                </style>
              </head>
              <body>
                <h1>MoneyFlow Financial Report</h1>
                <p>Workspace: ${currentWorkspace.name} | Generated: ${new Date().toLocaleDateString()}</p>
                <table>
                  <thead>
                    <tr><th>Date</th><th>Title</th><th>Type</th><th>Amount</th></tr>
                  </thead>
                  <tbody>
                    ${transactions
                      .slice(0, 50)
                      .map(
                        (t) =>
                          `<tr><td>${t.date}</td><td>${t.title}</td><td>${t.type}</td><td>${t.amount}</td></tr>`
                      )
                      .join('')}
                  </tbody>
                </table>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }

      setIsExporting(false);
      setSuccessMsg(`Successfully exported as ${format.toUpperCase()}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Export Financial Data
              </h3>
              <p className="text-xs text-slate-500">Choose record format & data type</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
              Select Record Dataset
            </label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="transactions">Transactions Ledger ({transactions.length} records)</option>
              <option value="accounts">Accounts & Balances ({accounts.length} accounts)</option>
              <option value="budgets">Budgets & Caps ({budgets.length} budgets)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'csv', label: 'CSV File', icon: FileText },
                { id: 'excel', label: 'Excel (.xls)', icon: FileSpreadsheet },
                { id: 'pdf', label: 'PDF Report', icon: Download },
              ].map((item) => {
                const Icon = item.icon;
                const active = format === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                      active
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating...' : `Export as ${format.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
