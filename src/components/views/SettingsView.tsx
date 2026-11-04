import React, { useState } from 'react';
import {
  Settings,
  User,
  Sun,
  Moon,
  Globe,
  Database,
  Download,
  Upload,
  RefreshCw,
  Check,
  Shield,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CurrencyCode, NumberFormatType, Language } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    allUsers,
    isDarkMode,
    toggleDarkMode,
    currency,
    setCurrency,
    numberFormat,
    setNumberFormat,
    language,
    setLanguage,
    resetToDemoData,
    clearAllData,
    exportAllDataJSON,
    importDataJSON,
  } = useFinance();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Invalid backup file. Restoration failed.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage currency, localization, profile settings, and data exports
        </p>
      </div>

      {/* User Profile & Google Sign-In Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Google Account & Profile
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                  {currentUser.role}
                </span>
              </div>
              <span className="text-xs text-slate-500">{currentUser.email}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Signed In
            </span>
          </div>
        </div>

      </div>

      {/* Localization Preferences */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5 shadow-2xs">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Regional & Display Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Currency */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Primary Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              <option value="INR">Indian Rupee (₹ INR)</option>
              <option value="USD">US Dollar ($ USD)</option>
              <option value="EUR">Euro (€ EUR)</option>
              <option value="GBP">British Pound (£ GBP)</option>
            </select>
          </div>

          {/* Number Notation */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Number Grouping Notation
            </label>
            <select
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value as NumberFormatType)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              <option value="indian">Indian Notation (₹1,25,000 / Lakhs & Crores)</option>
              <option value="international">International Notation ($125,000.00)</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Application Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              <option value="en">English</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Interface Theme
            </label>
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 transition-colors"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                <span>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Data Backup & Reset
        </h2>
        <p className="text-xs text-slate-500">
          Export full financial records as portable JSON or restore demo data
        </p>

        {importStatus && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportAllDataJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup JSON</span>
          </button>

          <label className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore JSON Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={resetToDemoData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all financial data? This action cannot be undone.')) {
                clearAllData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
