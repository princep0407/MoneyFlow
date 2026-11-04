import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Landmark,
  Tags,
  PieChart,
  Target,
  Repeat,
  CalendarCheck,
  Scale,
  BarChart3,
  Sparkles,
  Users,
  Settings,
  Calendar,
  Split,
  ChevronRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { translations } from '../../utils/formatters';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { activeView, setActiveView, language, currentWorkspace, totalBalance, currency } = useFinance();
  const t = translations[language];

  const navGroups = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'transactions', label: t.transactions, icon: ReceiptText },
        { id: 'accounts', label: t.accounts, icon: Landmark },
        { id: 'categories', label: t.categories, icon: Tags },
      ],
    },
    {
      groupTitle: 'FINANCIAL PLANNING',
      items: [
        { id: 'budgets', label: t.budgets, icon: PieChart },
        { id: 'savings', label: t.savingsGoals, icon: Target },
        { id: 'recurring', label: t.recurringPayments, icon: Repeat },
        { id: 'bills', label: t.billsReminders, icon: CalendarCheck },
        { id: 'debt', label: t.debtManagement, icon: Scale },
      ],
    },
    {
      groupTitle: 'INSIGHTS & MANAGEMENT',
      items: [
        { id: 'analytics', label: t.analytics, icon: BarChart3 },
        { id: 'insights', label: t.smartInsights, icon: Sparkles, badge: 'AI' },
        { id: 'workspace', label: t.workspace, icon: Users },
        { id: 'calendar', label: t.calendar, icon: Calendar },
        { id: 'split', label: t.splitExpense, icon: Split },
        { id: 'settings', label: t.settings, icon: Settings },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    setActiveView(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between py-4 transition-transform duration-200 ease-in-out shrink-0 overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6 px-3">
          {navGroups.map((group) => (
            <div key={group.groupTitle}>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {group.groupTitle}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quiet Balance Footer */}
        <div className="px-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Liquid Balance</div>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
              {currency === 'INR' ? '₹' : '$'}
              {totalBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 capitalize truncate">
              {currentWorkspace.name}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
