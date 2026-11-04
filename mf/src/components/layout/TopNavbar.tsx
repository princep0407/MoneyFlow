import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet,
  Plus,
  ArrowRightLeft,
  Bell,
  Sun,
  Moon,
  Users,
  ChevronDown,
  Check,
  Sparkles,
  Search,
  Download,
  ReceiptText,
  Landmark,
  PieChart,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { translations, formatCurrency } from '../../utils/formatters';

interface TopNavbarProps {
  onOpenAddTx: () => void;
  onOpenTransfer: () => void;
  onOpenExport: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenAddTx, onOpenTransfer, onOpenExport }) => {
  const {
    currentUser,
    setCurrentUser,
    allUsers,
    currentWorkspace,
    workspaces,
    switchWorkspace,
    isDarkMode,
    toggleDarkMode,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setActiveView,
    language,
    setIsLoggedIn,
    transactions,
    accounts,
    budgets,
    currency,
    numberFormat,
  } = useFinance();

  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Global search state
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);
  const t = translations[language];

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search results filtering
  const searchResults = useMemoFilteredSearch(globalSearch, transactions, accounts, budgets);

  function useMemoFilteredSearch(query: string, txs: any[], accs: any[], bgs: any[]) {
    if (!query.trim() || query.length < 2) return { transactions: [], accounts: [], budgets: [] };
    const q = query.toLowerCase();

    const matchedTxs = txs.filter((t) => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q)).slice(0, 4);
    const matchedAccs = accs.filter((a) => a.name.toLowerCase().includes(q) || a.institutionName?.toLowerCase().includes(q)).slice(0, 3);
    const matchedBgs = bgs.filter((b) => b.id.toLowerCase().includes(q)).slice(0, 2);

    return { transactions: matchedTxs, accounts: matchedAccs, budgets: matchedBgs };
  }

  const hasSearchResults =
    searchResults.transactions.length > 0 ||
    searchResults.accounts.length > 0 ||
    searchResults.budgets.length > 0;

  return (
    <header className="h-16 px-3 sm:px-6 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 md:gap-6 sticky top-0 z-40 shrink-0 w-full overflow-hidden">
      {/* Zone 1: Brand Wordmark & Workspace Selector */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            MoneyFlow
          </span>
        </div>

        {/* Workspace Switcher Pill */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate max-w-[120px]">{currentWorkspace.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    ws.id === currentWorkspace.id
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="capitalize truncate">{ws.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">({ws.type})</span>
                  </div>
                  {ws.id === currentWorkspace.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    setActiveView('workspace');
                    setShowWorkspaceMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-medium"
                >
                  Manage Workspaces →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Global Search Bar */}
      <div className="flex-1 max-w-md relative hidden sm:block" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transactions, accounts, budgets..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-slate-300 dark:focus:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden transition-all"
          />
        </div>

        {/* Global Search Dropdown Results */}
        {isSearchFocused && globalSearch.trim().length >= 2 && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 max-h-96 overflow-y-auto">
            {!hasSearchResults ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching records found for "{globalSearch}"
              </div>
            ) : (
              <div className="space-y-3">
                {/* Transactions */}
                {searchResults.transactions.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Transactions
                    </div>
                    {searchResults.transactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        onClick={() => {
                          setActiveView('transactions');
                          setIsSearchFocused(false);
                          setGlobalSearch('');
                        }}
                        className="px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <ReceiptText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {tx.title}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                          {formatCurrency(tx.amount, currency, numberFormat)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Accounts */}
                {searchResults.accounts.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Accounts
                    </div>
                    {searchResults.accounts.map((acc: any) => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          setActiveView('accounts');
                          setIsSearchFocused(false);
                          setGlobalSearch('');
                        }}
                        className="px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Landmark className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {acc.name}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-slate-500 shrink-0">
                          {formatCurrency(acc.balance, currency, numberFormat)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Export Data Button */}
        <button
          onClick={onOpenExport}
          title="Export Data Dialog"
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Quick Add Transaction CTA */}
        <button
          onClick={onOpenAddTx}
          className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.addTransaction}</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {showNotifDrawer && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Notifications ({unreadNotifs.length})
                </span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.actionView) setActiveView(n.actionView);
                        setShowNotifDrawer(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        !n.read ? 'bg-slate-50/60 dark:bg-slate-800/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Google Sign-In Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-700 transition-all"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              referrerPolicy="no-referrer"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {currentUser.name}
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1 space-y-0.5">
                <button
                  onClick={() => {
                    setActiveView('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Settings & Preferences
                </button>
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
