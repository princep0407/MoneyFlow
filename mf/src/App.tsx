import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { AccountsView } from './components/views/AccountsView';
import { CategoriesView } from './components/views/CategoriesView';
import { BudgetsView } from './components/views/BudgetsView';
import { SavingsGoalsView } from './components/views/SavingsGoalsView';
import { RecurringPaymentsView } from './components/views/RecurringPaymentsView';
import { BillsRemindersView } from './components/views/BillsRemindersView';
import { DebtManagementView } from './components/views/DebtManagementView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SmartInsightsView } from './components/views/SmartInsightsView';
import { FamilyWorkspaceView } from './components/views/FamilyWorkspaceView';
import { CalendarView } from './components/views/CalendarView';
import { SplitExpenseView } from './components/views/SplitExpenseView';
import { SettingsView } from './components/views/SettingsView';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { TransferModal } from './components/modals/TransferModal';
import { AddAccountModal } from './components/modals/AddAccountModal';
import { ExportDialog } from './components/modals/ExportDialog';
import { LoginView } from './components/views/LoginView';
import { Menu } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeView } = useFinance();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferFromAccId, setTransferFromAccId] = useState<string | undefined>(undefined);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleOpenTransfer = (fromAccountId?: string) => {
    setTransferFromAccId(fromAccountId);
    setIsTransferOpen(true);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenAddTx={() => setIsAddTxOpen(true)}
            onOpenTransfer={() => handleOpenTransfer()}
          />
        );
      case 'transactions':
        return <TransactionsView onOpenAddTx={() => setIsAddTxOpen(true)} />;
      case 'accounts':
        return (
          <AccountsView
            onOpenAddAccount={() => setIsAddAccountOpen(true)}
            onOpenTransfer={handleOpenTransfer}
          />
        );
      case 'categories':
        return <CategoriesView />;
      case 'budgets':
        return <BudgetsView />;
      case 'savings':
        return <SavingsGoalsView />;
      case 'recurring':
        return <RecurringPaymentsView />;
      case 'bills':
        return <BillsRemindersView />;
      case 'debt':
        return <DebtManagementView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'insights':
        return <SmartInsightsView />;
      case 'workspace':
        return <FamilyWorkspaceView />;
      case 'calendar':
        return <CalendarView />;
      case 'split':
        return <SplitExpenseView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onOpenAddTx={() => setIsAddTxOpen(true)}
            onOpenTransfer={() => handleOpenTransfer()}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-x-hidden">
      {/* Top Navbar */}
      <TopNavbar
        onOpenAddTx={() => setIsAddTxOpen(true)}
        onOpenTransfer={() => handleOpenTransfer()}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Mobile Menu Bar Strip */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
        <span className="text-xs font-medium text-slate-500 capitalize">
          {activeView}
        </span>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex w-full relative">
        <Sidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        defaultFromAccountId={transferFromAccId}
      />

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6 text-center text-sm">
        Supabase set nahi hai. <code className="mx-1">VITE_SUPABASE_URL</code> aur
        <code className="mx-1">VITE_SUPABASE_ANON_KEY</code> environment variables add karo.
      </div>
    );
  }
  if (session === undefined) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-sm">Loading...</div>;
  }
  if (!session) return <LoginView />;

  const u = session.user;
  const authUser = {
    id: u.id,
    email: u.email || '',
    name: (u.user_metadata?.name as string) || (u.email || 'User').split('@')[0],
  };

  return (
    <FinanceProvider key={u.id} authUser={authUser} onSignOut={() => supabase.auth.signOut()}>
      <MainAppContent />
    </FinanceProvider>
  );
}
