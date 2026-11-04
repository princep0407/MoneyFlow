import { CurrencyCode, NumberFormatType, Language } from '../types';

/**
 * Format currency amount with Indian numbering system (e.g. ₹1,25,450.00) or International
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  numberFormat: NumberFormatType = 'indian',
  showSymbol: boolean = true
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let symbol = '₹';
  if (currency === 'USD') symbol = '$';
  else if (currency === 'EUR') symbol = '€';
  else if (currency === 'GBP') symbol = '£';

  let formattedNumber = '';

  if (numberFormat === 'indian') {
    formattedNumber = formatIndianNumber(absAmount);
  } else {
    formattedNumber = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  const sign = isNegative ? '-' : '';
  return showSymbol ? `${sign}${symbol}${formattedNumber}` : `${sign}${formattedNumber}`;
}

/**
 * Converts numbers to Indian notation (e.g. 12,34,567.89)
 */
export function formatIndianNumber(num: number): string {
  const parts = num.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] === '00' ? '' : `.${parts[1]}`;

  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const rest = integerPart.substring(0, integerPart.length - 3);
    const restWithCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return `${restWithCommas},${lastThree}${decimalPart}`;
  }

  return `${integerPart}${decimalPart}`;
}

/**
 * Short Indian denomination (e.g. ₹1.5L, ₹3.4Cr, ₹45K)
 */
export function formatCompactINR(amount: number, currency: CurrencyCode = 'INR'): string {
  const symbol = currency === 'INR' ? '₹' : '$';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (currency === 'INR') {
    if (abs >= 10000000) {
      return `${sign}${symbol}${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}${symbol}${(abs / 100000).toFixed(2)} Lakh`;
    }
    if (abs >= 1000) {
      return `${sign}${symbol}${(abs / 1000).toFixed(1)}k`;
    }
    return `${sign}${symbol}${abs}`;
  }

  if (abs >= 1000000) {
    return `${sign}${symbol}${(abs / 1000000).toFixed(1)}M`;
  }
  if (abs >= 1000) {
    return `${sign}${symbol}${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}${symbol}${abs}`;
}

/**
 * Format dates
 */
export function formatDate(dateString: string, formatStyle: 'short' | 'medium' | 'full' = 'medium'): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (formatStyle === 'short') {
    // DD/MM/YYYY
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  if (formatStyle === 'full') {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Human-friendly relative date or day
 */
export function formatRelativeDay(dateString: string): string {
  if (!dateString) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return formatDate(dateString, 'medium');
}

/**
 * Multi-Language Dictionary
 */
export const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    accounts: 'Accounts',
    categories: 'Categories',
    budgets: 'Budgets',
    savingsGoals: 'Savings Goals',
    recurringPayments: 'Recurring Payments',
    billsReminders: 'Bills & Reminders',
    debtManagement: 'Debt Management',
    analytics: 'Analytics & Reports',
    smartInsights: 'Smart Insights',
    workspace: 'Family Workspace',
    settings: 'Settings',
    calendar: 'Financial Calendar',
    splitExpense: 'Split Expense',
    totalBalance: 'Total Balance',
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    monthlySavings: 'Monthly Savings',
    netWorth: 'Net Worth',
    quickAdd: 'Quick Add',
    addTransaction: 'Add Transaction',
    transferMoney: 'Transfer',
    personalWorkspace: 'Personal Workspace',
    familyWorkspace: 'Family Workspace',
    searchPlaceholder: 'Search transactions, notes, tags...',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    allTime: 'All Time',
    income: 'Income',
    expense: 'Expense',
    transfer: 'Transfer',
    refund: 'Refund',
    adjustment: 'Adjustment',
    moneyIOwe: 'Money I Owe',
    moneyOwedToMe: 'Money Owed To Me',
    exportCSV: 'Export CSV',
    scanReceipt: 'AI Scan Receipt',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
  },
  gu: {
    dashboard: 'ડેશબોર્ડ',
    transactions: 'વ્યવહારો',
    accounts: 'ખાતાઓ',
    categories: 'કેટેગરીઝ',
    budgets: 'બજેટ',
    savingsGoals: 'બચત લક્ષ્યો',
    recurringPayments: 'રિકરિંગ પેમેન્ટ્સ',
    billsReminders: 'બિલ અને રીમાઇન્ડર',
    debtManagement: 'દેવાની વ્યવસ્થા (ખાતાવહી)',
    analytics: 'વિશ્લેષણ અને અહેવાલો',
    smartInsights: 'સ્માર્ટ નાણાકીય સલાહ',
    workspace: 'પરિવાર વર્કસ્પેસ',
    settings: 'સેટિંગ્સ',
    calendar: 'નાણાકીય કેલેન્ડર',
    splitExpense: 'ખર્ચ વહેંચો',
    totalBalance: 'કુલ સિલક',
    totalIncome: 'કુલ આવક',
    totalExpenses: 'કુલ ખર્ચ',
    monthlySavings: 'માસિક બચત',
    netWorth: 'નેટ વર્થ (ચોખ્ખી સંપત્તિ)',
    quickAdd: 'ઝડપી ઉમેરો',
    addTransaction: 'વ્યવહાર ઉમેરો',
    transferMoney: 'ટ્રાન્સફર કરો',
    personalWorkspace: 'વ્યક્તિગત વર્કસ્પેસ',
    familyWorkspace: 'પરિવાર વર્કસ્પેસ',
    searchPlaceholder: 'શોધો વ્યવહારો, નોંધ, ટેગ્સ...',
    today: 'આજે',
    thisWeek: 'આ અઠવાડિયે',
    thisMonth: 'આ મહિને',
    thisYear: 'આ વર્ષે',
    allTime: 'બધા સમય',
    income: 'આવક',
    expense: 'ખર્ચ',
    transfer: 'ટ્રાન્સફર',
    refund: 'રીફંડ',
    adjustment: 'સમાયોજન',
    moneyIOwe: 'મારે આપવાના નાણાં',
    moneyOwedToMe: 'મને મળવાના નાણાં',
    exportCSV: 'CSV ડાઉનલોડ',
    scanReceipt: 'AI રસીદ સ્કેન',
    save: 'સાચવો',
    cancel: 'રદ કરો',
    delete: 'કાઢી નાખો',
    edit: 'સુધારો',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    transactions: 'लेन-देन',
    accounts: 'खाते',
    categories: 'श्रेणियां',
    budgets: 'बजट',
    savingsGoals: 'बचत लक्ष्य',
    recurringPayments: 'आवर्ती भुगतान',
    billsReminders: 'बिल और अनुस्मारक',
    debtManagement: 'ऋण प्रबंधन (खाता)',
    analytics: 'एनालिटिक्स व रिपोर्ट्स',
    smartInsights: 'स्मार्ट अंतर्दृष्टि',
    workspace: 'परिवार कार्यक्षेत्र',
    settings: 'सेटिंग्स',
    calendar: 'वित्तीय कैलेंडर',
    splitExpense: 'खर्च विभाजित करें',
    totalBalance: 'कुल शेष राशि',
    totalIncome: 'कुल आय',
    totalExpenses: 'कुल व्यय',
    monthlySavings: 'मासिक बचत',
    netWorth: 'नेट वर्थ (कुल संपत्ति)',
    quickAdd: 'त्वरित जोड़ें',
    addTransaction: 'लेन-देन जोड़ें',
    transferMoney: 'पैसे ट्रांसफर करें',
    personalWorkspace: 'व्यक्तिगत कार्यक्षेत्र',
    familyWorkspace: 'पारिवारिक कार्यक्षेत्र',
    searchPlaceholder: 'लेन-देन, नोट्स, टैग खोजें...',
    today: 'आज',
    thisWeek: 'इस सप्ताह',
    thisMonth: 'इस महीने',
    thisYear: 'इस वर्ष',
    allTime: 'सभी समय',
    income: 'आय',
    expense: 'खर्च',
    transfer: 'ट्रांसफर',
    refund: 'रिफंड',
    adjustment: 'समायोजन',
    moneyIOwe: 'मुझे जो चुकाना है',
    moneyOwedToMe: 'जो मुझे मिलना है',
    exportCSV: 'CSV डाउनलोड',
    scanReceipt: 'AI रसीद स्कैन',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
  },
};
