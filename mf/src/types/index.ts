export type Role = 'super_admin' | 'owner' | 'admin' | 'member' | 'personal_user';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
  status: 'active' | 'suspended';
}

export type WorkspaceType = 'personal' | 'family';

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  currency: string;
  members: WorkspaceMember[];
}

export type AccountType =
  | 'cash'
  | 'bank'
  | 'savings'
  | 'credit_card'
  | 'digital_wallet'
  | 'investment'
  | 'other';

export interface Account {
  id: string;
  workspaceId: string;
  name: string;
  type: AccountType;
  balance: number;
  openingBalance: number;
  accountNumber?: string;
  institutionName?: string;
  color: string;
  icon: string;
  isArchived: boolean;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund' | 'adjustment';

export type PaymentMethod =
  | 'upi'
  | 'net_banking'
  | 'credit_card'
  | 'debit_card'
  | 'cash'
  | 'cheque';

export interface Transaction {
  id: string;
  workspaceId: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  subcategory?: string;
  accountId: string;
  toAccountId?: string; // used when type === 'transfer'
  transferFee?: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: PaymentMethod;
  notes?: string;
  receiptUrl?: string;
  tags: string[];
  createdByUserId: string;
  createdByName: string;
  isRecurring?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  subcategories: string[];
  isCustom?: boolean;
}

export interface Budget {
  id: string;
  workspaceId: string;
  categoryId?: string; // undefined means overall monthly budget
  isOverall?: boolean;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  month: string; // e.g. "2026-11"
}

export interface SavingsContribution {
  id: string;
  amount: number;
  date: string;
  note?: string;
  accountId?: string;
}

export interface SavingsGoal {
  id: string;
  workspaceId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  notes?: string;
  contributions: SavingsContribution[];
}

export interface RecurringPayment {
  id: string;
  workspaceId: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  accountId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextDate: string;
  status: 'active' | 'paused';
  lastProcessedDate?: string;
}

export interface BillReminder {
  id: string;
  workspaceId: string;
  title: string;
  amount: number;
  dueDate: string;
  reminderDate: string;
  categoryId: string;
  accountId: string;
  isPaid: boolean;
  paidDate?: string;
  autoPay?: boolean;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface DebtRecord {
  id: string;
  workspaceId: string;
  personOrEntity: string;
  type: 'owe' | 'owed'; // 'owe' = liability (I owe), 'owed' = asset (owed to me)
  principalAmount: number;
  outstandingAmount: number;
  interestRate?: number;
  dueDate?: string;
  status: 'active' | 'cleared';
  notes?: string;
  payments: DebtPayment[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'alert' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  actionView?: string;
}

export type Language = 'en' | 'gu' | 'hi';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';
export type NumberFormatType = 'indian' | 'international';
