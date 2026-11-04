import { supabase } from '../lib/supabase';
import { makeAvatar } from '../lib/avatar';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Workspace,
  Account,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  RecurringPayment,
  BillReminder,
  DebtRecord,
  NotificationItem,
  CurrencyCode,
  NumberFormatType,
  Language,
  Role,
} from '../types';
import {
  initialUsers,
  initialWorkspaces,
  initialAccounts,
  initialCategories,
  initialTransactions,
  initialBudgets,
  initialSavingsGoals,
  initialRecurringPayments,
  initialBillReminders,
  initialDebts,
  initialNotifications,
} from '../data/seedData';

interface FinanceContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, type: 'personal' | 'family') => void;
  inviteWorkspaceMember: (email: string, name: string, role: Role) => void;
  removeWorkspaceMember: (userId: string) => void;

  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurringPayments: RecurringPayment[];
  billReminders: BillReminder[];
  debts: DebtRecord[];
  notifications: NotificationItem[];

  activeView: string;
  setActiveView: (view: string) => void;

  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;

  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  numberFormat: NumberFormatType;
  setNumberFormat: (nf: NumberFormatType) => void;
  language: Language;
  setLanguage: (l: Language) => void;

  dateFilter: 'today' | 'week' | 'month' | 'year' | 'all' | 'custom' | 'specific_month';
  setDateFilter: (f: 'today' | 'week' | 'month' | 'year' | 'all' | 'custom' | 'specific_month') => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  customDateRange: { start: string; end: string };
  setCustomDateRange: (r: { start: string; end: string }) => void;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'workspaceId' | 'createdByUserId' | 'createdByName'>) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Account Actions
  addAccount: (acc: Omit<Account, 'id' | 'workspaceId'>) => void;
  editAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferBetweenAccounts: (fromId: string, toId: string, amount: number, fee?: number, note?: string) => void;

  // Category Actions
  addCategory: (cat: Omit<Category, 'id'>) => void;
  editCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Budget Actions
  setBudget: (amount: number, categoryId?: string, isOverall?: boolean) => void;
  deleteBudget: (id: string) => void;

  // Savings Goal Actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'workspaceId' | 'currentAmount' | 'contributions'>) => void;
  contributeToSavingsGoal: (goalId: string, amount: number, accountId?: string, note?: string) => void;
  deleteSavingsGoal: (id: string) => void;

  // Recurring Payment Actions
  addRecurringPayment: (rec: Omit<RecurringPayment, 'id' | 'workspaceId'>) => void;
  toggleRecurringPayment: (id: string) => void;
  deleteRecurringPayment: (id: string) => void;
  processDueRecurring: () => { count: number; totalAmount: number };

  // Bill Actions
  addBillReminder: (bill: Omit<BillReminder, 'id' | 'workspaceId' | 'isPaid'>) => void;
  markBillPaid: (id: string, accountId?: string) => void;
  deleteBillReminder: (id: string) => void;

  // Debt Actions
  addDebt: (debt: Omit<DebtRecord, 'id' | 'workspaceId' | 'outstandingAmount' | 'status' | 'payments'>) => void;
  recordDebtPayment: (id: string, amount: number, note?: string, accountId?: string) => void;
  markDebtSettled: (id: string) => void;
  deleteDebt: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Backup & Reset
  resetToDemoData: () => void;
  clearAllData: () => void;
  exportAllDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;

  // Calculations
  filteredTransactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  monthlySavings: number;
  savingsRate: number;
  netWorth: number;
  totalDebtOwed: number;
  totalDebtOwedToMe: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export interface AuthUser { id: string; email: string; name: string }

export const FinanceProvider: React.FC<{
  children: React.ReactNode;
  authUser: AuthUser;
  onSignOut: () => void;
}> = ({ children, authUser, onSignOut }) => {
  const me: User = {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    avatarUrl: makeAvatar(authUser.name),
    role: 'owner',
    status: 'active',
  };
  const myWorkspace: Workspace = {
    id: 'ws_personal',
    name: 'Personal Finances',
    type: 'personal',
    currency: 'INR',
    members: [{
      userId: me.id, name: me.name, email: me.email, role: 'owner',
      avatarUrl: me.avatarUrl, joinedAt: new Date().toISOString().split('T')[0],
    }],
  };
  const [cloudReady, setCloudReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [syncError, setSyncError] = useState('');

  const isLoggedIn = true;
  const setIsLoggedIn = (v: boolean) => {
    if (!v) onSignOut();
  };

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('moneyflow_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('moneyflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('moneyflow_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Localization settings
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [numberFormat, setNumberFormat] = useState<NumberFormatType>('indian');
  const [language, setLanguage] = useState<Language>('en');

  // Navigation
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Date Filtering
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'year' | 'all' | 'custom' | 'specific_month'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '2026-11-01',
    end: '2026-11-30',
  });

  // Data states (cloud database se sync hote hain)
  const [allUsers, setAllUsers] = useState<User[]>([me]);

  const [currentUser, setCurrentUser] = useState<User>(me);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([myWorkspace]);

  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('ws_personal');

  const currentWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];
  }, [workspaces, currentWorkspaceId]);

  const [accounts, setAccounts] = useState<Account[]>([]);

  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);

  const [billReminders, setBillReminders] = useState<BillReminder[]>([]);

  const [debts, setDebts] = useState<DebtRecord[]>([]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // ---- Cloud database (Supabase) sync ----
  const defaultsFor = () => ({
    allUsers: [me], workspaces: [myWorkspace], currentWorkspaceId: 'ws_personal',
    accounts: [], categories: initialCategories, transactions: [], budgets: [],
    savingsGoals: [], recurringPayments: [], billReminders: [], debts: [], notifications: [],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('user_data').select('data').eq('user_id', authUser.id).maybeSingle();
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        return;
      }
      const d: any = { ...defaultsFor(), ...(data?.data || {}) };
      if (!d.workspaces?.length) d.workspaces = [myWorkspace];
      setAllUsers(d.allUsers?.length ? d.allUsers : [me]);
      setWorkspaces(d.workspaces);
      setCurrentWorkspaceId(d.currentWorkspaceId);
      setAccounts(d.accounts);
      setCategories(d.categories);
      setTransactions(d.transactions);
      setBudgets(d.budgets);
      setSavingsGoals(d.savingsGoals);
      setRecurringPayments(d.recurringPayments);
      setBillReminders(d.billReminders);
      setDebts(d.debts);
      setNotifications(d.notifications);
      setCloudReady(true);
    })();
    return () => { cancelled = true; };
  }, [authUser.id]);

  useEffect(() => {
    if (!cloudReady) return;
    const timer = setTimeout(async () => {
      const payload = {
        allUsers, workspaces, currentWorkspaceId, accounts, categories, transactions,
        budgets, savingsGoals, recurringPayments, billReminders, debts, notifications,
      };
      const { error } = await supabase.from('user_data').upsert({
        user_id: authUser.id, data: payload, updated_at: new Date().toISOString(),
      });
      setSyncError(error ? error.message : '');
    }, 700);
    return () => clearTimeout(timer);
  }, [cloudReady, allUsers, workspaces, currentWorkspaceId, accounts, categories, transactions,
      budgets, savingsGoals, recurringPayments, billReminders, debts, notifications]);

  // Workspace controls
  const switchWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
  };

  const createWorkspace = (name: string, type: 'personal' | 'family') => {
    const newWs: Workspace = {
      id: `ws_${Date.now()}`,
      name,
      type,
      currency: 'INR',
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: 'owner',
          avatarUrl: currentUser.avatarUrl,
          joinedAt: new Date().toISOString().split('T')[0],
        },
      ],
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setCurrentWorkspaceId(newWs.id);
  };

  const inviteWorkspaceMember = (email: string, name: string, role: Role) => {
    const existingUser = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const memberUserId = existingUser ? existingUser.id : `user_${Date.now()}`;

    if (!existingUser) {
      const newUser: User = {
        id: memberUserId,
        name: name || email.split('@')[0],
        email,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
        role: role,
        status: 'active',
      };
      setAllUsers((prev) => [...prev, newUser]);
    }

    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === currentWorkspaceId) {
          const alreadyMember = ws.members.some((m) => m.email.toLowerCase() === email.toLowerCase());
          if (alreadyMember) return ws;
          return {
            ...ws,
            members: [
              ...ws.members,
              {
                userId: memberUserId,
                name: name || email.split('@')[0],
                email,
                role,
                avatarUrl: existingUser?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
                joinedAt: new Date().toISOString().split('T')[0],
              },
            ],
          };
        }
        return ws;
      })
    );
  };

  const removeWorkspaceMember = (userId: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === currentWorkspaceId) {
          return {
            ...ws,
            members: ws.members.filter((m) => m.userId !== userId),
          };
        }
        return ws;
      })
    );
  };

  // Transaction Management with automatic account balance updates
  const addTransaction = (txData: Omit<Transaction, 'id' | 'workspaceId' | 'createdByUserId' | 'createdByName'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspaceId: currentWorkspaceId,
      createdByUserId: currentUser.id,
      createdByName: currentUser.name,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (newTx.type === 'income' || newTx.type === 'refund') {
          if (acc.id === newTx.accountId) {
            return { ...acc, balance: acc.balance + newTx.amount };
          }
        } else if (newTx.type === 'expense') {
          if (acc.id === newTx.accountId) {
            return { ...acc, balance: acc.balance - newTx.amount };
          }
        } else if (newTx.type === 'transfer') {
          const fee = newTx.transferFee || 0;
          if (acc.id === newTx.accountId) {
            return { ...acc, balance: acc.balance - (newTx.amount + fee) };
          }
          if (acc.id === newTx.toAccountId) {
            return { ...acc, balance: acc.balance + newTx.amount };
          }
        }
        return acc;
      })
    );
  };

  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Accounts
  const addAccount = (accData: Omit<Account, 'id' | 'workspaceId'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}`,
      workspaceId: currentWorkspaceId,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const editAccount = (id: string, updated: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const transferBetweenAccounts = (
    fromId: string,
    toId: string,
    amount: number,
    fee: number = 0,
    note?: string
  ) => {
    const fromAcc = accounts.find((a) => a.id === fromId);
    const toAcc = accounts.find((a) => a.id === toId);
    if (!fromAcc || !toAcc) return;

    addTransaction({
      title: `Transfer to ${toAcc.name}`,
      amount,
      type: 'transfer',
      categoryId: 'cat_other_income',
      accountId: fromId,
      toAccountId: toId,
      transferFee: fee,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      paymentMethod: fromAcc.type === 'bank' || fromAcc.type === 'savings' ? 'net_banking' : 'upi',
      notes: note || `Inter-account transfer from ${fromAcc.name} to ${toAcc.name}`,
      tags: ['Transfer'],
    });
  };

  // Categories
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const editCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Budgets
  const setBudget = (amount: number, categoryId?: string, isOverall?: boolean) => {
    const nowMonth = new Date().toISOString().substring(0, 7); // "2026-11"
    setBudgets((prev) => {
      const existingIndex = prev.findIndex((b) =>
        isOverall ? b.isOverall : b.categoryId === categoryId
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          amount,
        };
        return copy;
      }
      return [
        ...prev,
        {
          id: `bg_${Date.now()}`,
          workspaceId: currentWorkspaceId,
          categoryId,
          isOverall: !!isOverall,
          amount,
          period: 'monthly',
          month: nowMonth,
        },
      ];
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Savings Goals
  const addSavingsGoal = (
    goalData: Omit<SavingsGoal, 'id' | 'workspaceId' | 'currentAmount' | 'contributions'>
  ) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      workspaceId: currentWorkspaceId,
      currentAmount: 0,
      contributions: [],
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const contributeToSavingsGoal = (
    goalId: string,
    amount: number,
    accountId?: string,
    note?: string
  ) => {
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const newContrib = {
      id: `c_${Date.now()}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      note: note || 'Contribution towards goal',
      accountId,
    };

    const newAmount = targetGoal.currentAmount + amount;

    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            currentAmount: newAmount,
            contributions: [newContrib, ...g.contributions],
          };
        }
        return g;
      })
    );

    // If goal hit 100%, trigger celebratory confetti
    if (newAmount >= targetGoal.targetAmount) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          title: 'Goal Achieved! 🎉',
          message: `Congratulations! You reached 100% of your "${targetGoal.name}" goal!`,
          type: 'success',
          timestamp: 'Just now',
          read: false,
          actionView: 'savings',
        },
        ...prev,
      ]);
    }

    // Deduct from chosen account if provided
    if (accountId) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, balance: a.balance - amount } : a))
      );
    }
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Recurring Payments
  const addRecurringPayment = (recData: Omit<RecurringPayment, 'id' | 'workspaceId'>) => {
    const newRec: RecurringPayment = {
      ...recData,
      id: `rec_${Date.now()}`,
      workspaceId: currentWorkspaceId,
    };
    setRecurringPayments((prev) => [...prev, newRec]);
  };

  const toggleRecurringPayment = (id: string) => {
    setRecurringPayments((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r
      )
    );
  };

  const deleteRecurringPayment = (id: string) => {
    setRecurringPayments((prev) => prev.filter((r) => r.id !== id));
  };

  const processDueRecurring = () => {
    const today = new Date().toISOString().split('T')[0];
    let count = 0;
    let total = 0;

    recurringPayments.forEach((rec) => {
      if (rec.status === 'active' && rec.nextDate <= today) {
        addTransaction({
          title: `[Recurring] ${rec.title}`,
          amount: rec.amount,
          type: rec.type,
          categoryId: rec.categoryId,
          accountId: rec.accountId,
          paymentMethod: 'upi',
          date: today,
          time: '09:00',
          notes: `Auto-generated recurring execution (${rec.frequency})`,
          tags: ['Recurring', 'AutoDebit'],
          isRecurring: true,
        });
        count++;
        total += rec.amount;
      }
    });

    if (count > 0) {
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          title: 'Recurring Payments Processed',
          message: `Successfully executed ${count} due recurring payments totaling ₹${total.toLocaleString('en-IN')}.`,
          type: 'info',
          timestamp: 'Just now',
          read: false,
          actionView: 'transactions',
        },
        ...prev,
      ]);
    }

    return { count, totalAmount: total };
  };

  // Bills & Reminders
  const addBillReminder = (billData: Omit<BillReminder, 'id' | 'workspaceId' | 'isPaid'>) => {
    const newBill: BillReminder = {
      ...billData,
      id: `bill_${Date.now()}`,
      workspaceId: currentWorkspaceId,
      isPaid: false,
    };
    setBillReminders((prev) => [...prev, newBill]);
  };

  const markBillPaid = (id: string, accountId?: string) => {
    const bill = billReminders.find((b) => b.id === id);
    if (!bill) return;

    setBillReminders((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              isPaid: true,
              paidDate: new Date().toISOString().split('T')[0],
            }
          : b
      )
    );

    // Auto-create expense transaction for the bill
    addTransaction({
      title: `Bill: ${bill.title}`,
      amount: bill.amount,
      type: 'expense',
      categoryId: bill.categoryId,
      accountId: accountId || bill.accountId,
      paymentMethod: 'upi',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      notes: `Bill payment for ${bill.title}`,
      tags: ['Bill', 'Utility'],
    });
  };

  const deleteBillReminder = (id: string) => {
    setBillReminders((prev) => prev.filter((b) => b.id !== id));
  };

  // Debt Management
  const addDebt = (
    debtData: Omit<DebtRecord, 'id' | 'workspaceId' | 'outstandingAmount' | 'status' | 'payments'>
  ) => {
    const newDebt: DebtRecord = {
      ...debtData,
      id: `debt_${Date.now()}`,
      workspaceId: currentWorkspaceId,
      outstandingAmount: debtData.principalAmount,
      status: 'active',
      payments: [],
    };
    setDebts((prev) => [...prev, newDebt]);
  };

  const recordDebtPayment = (id: string, amount: number, note?: string, accountId?: string) => {
    const targetDebt = debts.find((d) => d.id === id);
    if (!targetDebt) return;

    const newPayment = {
      id: `dp_${Date.now()}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      note: note || 'Partial settlement payment',
    };

    const newOutstanding = Math.max(0, targetDebt.outstandingAmount - amount);
    const newStatus = newOutstanding === 0 ? 'cleared' : 'active';

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            outstandingAmount: newOutstanding,
            status: newStatus,
            payments: [newPayment, ...d.payments],
          };
        }
        return d;
      })
    );

    // Record transaction
    if (targetDebt.type === 'owe') {
      // Paying off money I owe -> Expense or Liability reduction
      addTransaction({
        title: `Debt Repayment: ${targetDebt.personOrEntity}`,
        amount,
        type: 'expense',
        categoryId: 'cat_other_expense',
        accountId: accountId || accounts[0]?.id || 'acc_hdfc',
        paymentMethod: 'net_banking',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        notes: note || `Debt payment to ${targetDebt.personOrEntity}`,
        tags: ['DebtPayment', 'Repayment'],
      });
    } else {
      // Received money someone owed me -> Income or Asset recovery
      addTransaction({
        title: `Debt Received: ${targetDebt.personOrEntity}`,
        amount,
        type: 'income',
        categoryId: 'cat_other_income',
        accountId: accountId || accounts[0]?.id || 'acc_hdfc',
        paymentMethod: 'upi',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        notes: note || `Recovered repayment from ${targetDebt.personOrEntity}`,
        tags: ['DebtRecovery'],
      });
    }
  };

  const markDebtSettled = (id: string) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, outstandingAmount: 0, status: 'cleared' } : d))
    );
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Backup & Restore
  const resetToDemoData = () => {
    const remap = (x: any) =>
      JSON.parse(JSON.stringify(x).split('user_prince').join(me.id), function (this: any, key, value) {
        if (key === 'avatarUrl' && typeof value === 'string' && value.startsWith('/src/')) {
          return makeAvatar(this.name || '?');
        }
        return value;
      });
    const ws: Workspace[] = remap(initialWorkspaces).map((w: Workspace) => ({
      ...w,
      members: w.members.map((m) =>
        m.userId === me.id ? { ...m, name: me.name, email: me.email, avatarUrl: me.avatarUrl } : m
      ),
    }));
    setAllUsers([me, ...remap(initialUsers).filter((u: User) => u.id !== me.id)]);
    setWorkspaces(ws);
    setCurrentWorkspaceId('ws_personal');
    setAccounts(remap(initialAccounts));
    setCategories(initialCategories);
    setTransactions(remap(initialTransactions));
    setBudgets(remap(initialBudgets));
    setSavingsGoals(remap(initialSavingsGoals));
    setRecurringPayments(remap(initialRecurringPayments));
    setBillReminders(remap(initialBillReminders));
    setDebts(remap(initialDebts));
    setNotifications(remap(initialNotifications));
  };

  const clearAllData = () => {
    setTransactions([]);
    setAccounts([]);
    setBudgets([]);
    setSavingsGoals([]);
    setRecurringPayments([]);
    setBillReminders([]);
    setDebts([]);
    setNotifications([]);
  };

  const exportAllDataJSON = () => {
    const backupData = {
      users: allUsers,
      currentUser,
      workspaces,
      accounts,
      categories,
      transactions,
      budgets,
      savingsGoals,
      recurringPayments,
      billReminders,
      debts,
      exportTimestamp: new Date().toISOString(),
      app: 'MoneyFlow',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneyflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.accounts && data.transactions) {
        if (data.users) setAllUsers(data.users);
        if (data.workspaces) setWorkspaces(data.workspaces);
        if (data.accounts) setAccounts(data.accounts);
        if (data.categories) setCategories(data.categories);
        if (data.transactions) setTransactions(data.transactions);
        if (data.budgets) setBudgets(data.budgets);
        if (data.savingsGoals) setSavingsGoals(data.savingsGoals);
        if (data.recurringPayments) setRecurringPayments(data.recurringPayments);
        if (data.billReminders) setBillReminders(data.billReminders);
        if (data.debts) setDebts(data.debts);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid backup file', e);
      return false;
    }
  };

  // Filtered Transactions according to Workspace and Date Filter
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    return transactions.filter((t) => {
      // Workspace filter
      if (currentWorkspace.type === 'personal') {
        // Personal workspace shows items created by current user
        if (t.workspaceId !== 'ws_personal' && t.createdByUserId !== currentUser.id) return false;
      }

      const txDate = new Date(t.date);

      if (dateFilter === 'today') {
        return t.date === todayStr;
      }

      if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return txDate >= weekAgo;
      }

      if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setDate(today.getDate() - 30);
        return txDate >= monthAgo;
      }

      if (dateFilter === 'year') {
        const yearAgo = new Date();
        yearAgo.setDate(today.getDate() - 365);
        return txDate >= yearAgo;
      }

      if (dateFilter === 'specific_month') {
        return t.date.startsWith(selectedMonth);
      }

      if (dateFilter === 'custom') {
        if (customDateRange.start && t.date < customDateRange.start) return false;
        if (customDateRange.end && t.date > customDateRange.end) return false;
        return true;
      }

      return true; // 'all'
    });
  }, [transactions, currentWorkspace, currentUser, dateFilter, selectedMonth, customDateRange]);

  // Financial Metrics Calculations
  const { totalIncome, totalExpenses, monthlySavings, savingsRate } = useMemo(() => {
    let inc = 0;
    let exp = 0;

    filteredTransactions.forEach((t) => {
      if (t.type === 'income' || t.type === 'refund') {
        inc += t.amount;
      } else if (t.type === 'expense') {
        exp += t.amount;
      }
    });

    const savings = Math.max(0, inc - exp);
    const rate = inc > 0 ? Math.round((savings / inc) * 100) : 0;

    return {
      totalIncome: inc,
      totalExpenses: exp,
      monthlySavings: savings,
      savingsRate: rate,
    };
  }, [filteredTransactions]);

  // Total Balance (Liquid/Bank/Cash/Digital accounts)
  const totalBalance = useMemo(() => {
    return accounts
      .filter((a) => !a.isArchived && a.type !== 'credit_card')
      .reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  // Debt Calculations
  const { totalDebtOwed, totalDebtOwedToMe } = useMemo(() => {
    let owe = 0;
    let owed = 0;
    debts.forEach((d) => {
      if (d.status === 'active') {
        if (d.type === 'owe') owe += d.outstandingAmount;
        else owed += d.outstandingAmount;
      }
    });
    return { totalDebtOwed: owe, totalDebtOwedToMe: owed };
  }, [debts]);

  // Net Worth = (Accounts Assets + Money Owed To Me) - (Credit Card Outstanding + Money I Owe)
  const netWorth = useMemo(() => {
    let assets = 0;
    let liabilities = 0;

    accounts.forEach((a) => {
      if (a.isArchived) return;
      if (a.type === 'credit_card') {
        liabilities += Math.abs(a.balance);
      } else if (a.balance > 0) {
        assets += a.balance;
      } else {
        liabilities += Math.abs(a.balance);
      }
    });

    assets += totalDebtOwedToMe;
    liabilities += totalDebtOwed;

    return assets - liabilities;
  }, [accounts, totalDebtOwedToMe, totalDebtOwed]);

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers,
        currentWorkspace,
        workspaces,
        switchWorkspace,
        createWorkspace,
        inviteWorkspaceMember,
        removeWorkspaceMember,

        accounts,
        transactions,
        categories,
        budgets,
        savingsGoals,
        recurringPayments,
        billReminders,
        debts,
        notifications,

        activeView,
        setActiveView,
        isLoggedIn,
        setIsLoggedIn,

        isDarkMode,
        toggleDarkMode,
        currency,
        setCurrency,
        numberFormat,
        setNumberFormat,
        language,
        setLanguage,

        dateFilter,
        setDateFilter,
        selectedMonth,
        setSelectedMonth,
        customDateRange,
        setCustomDateRange,

        addTransaction,
        editTransaction,
        deleteTransaction,

        addAccount,
        editAccount,
        deleteAccount,
        transferBetweenAccounts,

        addCategory,
        editCategory,
        deleteCategory,

        setBudget,
        deleteBudget,

        addSavingsGoal,
        contributeToSavingsGoal,
        deleteSavingsGoal,

        addRecurringPayment,
        toggleRecurringPayment,
        deleteRecurringPayment,
        processDueRecurring,

        addBillReminder,
        markBillPaid,
        deleteBillReminder,

        addDebt,
        recordDebtPayment,
        markDebtSettled,
        deleteDebt,

        markNotificationRead,
        clearAllNotifications,

        resetToDemoData,
        clearAllData,
        exportAllDataJSON,
        importDataJSON,

        filteredTransactions,
        totalIncome,
        totalExpenses,
        totalBalance,
        monthlySavings,
        savingsRate,
        netWorth,
        totalDebtOwed,
        totalDebtOwedToMe,
      }}
    >
      {loadError ? (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center gap-3 p-6 text-center text-sm">
          <div>Data load nahi ho paya: {loadError}</div>
          <div className="text-xs text-slate-500">Check karo ki supabase/schema.sql run kiya hai ya nahi.</div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold">Retry</button>
        </div>
      ) : !cloudReady ? (
        <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-sm">Aapka data load ho raha hai...</div>
      ) : (
        <>
          {children}
          {syncError && (
            <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg">
              Cloud me save nahi hua: {syncError}
            </div>
          )}
        </>
      )}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
