import React, { useState, useEffect } from 'react';
import { authFetch } from '../../lib/api';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Upload,
  Send,
  CheckCircle2,
  Receipt,
  MessageSquare,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

interface AdvisorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const SmartInsightsView: React.FC = () => {
  const {
    filteredTransactions,
    totalIncome,
    totalExpenses,
    monthlySavings,
    savingsRate,
    netWorth,
    totalDebtOwed,
    totalDebtOwedToMe,
    recurringPayments,
    categories,
    accounts,
    addTransaction,
    currency,
    numberFormat,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'insights' | 'scanner' | 'advisor'>('insights');

  // AI Health Checkup State
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

  // Receipt Scanner State
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptRawText, setReceiptRawText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedReceipt, setExtractedReceipt] = useState<any>(null);
  const [receiptAddedSuccess, setReceiptAddedSuccess] = useState(false);

  // Advisor Chat State
  const [advisorInput, setAdvisorInput] = useState('');
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your MoneyFlow AI Financial Advisor. Ask me anything about optimizing your monthly budget, saving taxes under Section 80C/NPS, or planning your ₹10 Lakh emergency corpus.',
    },
  ]);

  // Fetch AI Insights
  const fetchAiInsights = async () => {
    setIsLoadingInsights(true);

    const recurringTotal = recurringPayments
      .filter((r) => r.status === 'active' && r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    const topCats = categories
      .map((c) => ({
        name: c.name,
        spent: filteredTransactions
          .filter((t) => t.categoryId === c.id && t.type === 'expense')
          .reduce((s, t) => s + t.amount, 0),
      }))
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 4);

    const payload = {
      summaryData: {
        totalIncome,
        totalExpenses,
        monthlySavings,
        savingsRate,
        netWorth,
        totalDebt: totalDebtOwed,
        moneyOwedToUser: totalDebtOwedToMe,
        recurringTotal,
        topCategories: topCats,
        recentTransactions: filteredTransactions.slice(0, 8),
      },
    };

    try {
      const response = await authFetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setAiData(data);
      }
    } catch (err) {
      console.error('Error fetching insights', err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchAiInsights();
  }, []);

  // Handle Receipt Scan
  const handleScanReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptImage && !receiptRawText.trim()) return;

    setIsScanning(true);
    setExtractedReceipt(null);
    setReceiptAddedSuccess(false);

    try {
      const response = await authFetch('/api/gemini/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: receiptImage || undefined,
          rawText: receiptRawText.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedReceipt(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddScannedTx = () => {
    if (!extractedReceipt) return;

    let catId = categories[0]?.id;
    if (extractedReceipt.category) {
      const match = categories.find((c) =>
        c.name.toLowerCase().includes(extractedReceipt.category.toLowerCase())
      );
      if (match) catId = match.id;
    }

    addTransaction({
      title: extractedReceipt.merchant || 'Scanned Receipt Expense',
      amount: extractedReceipt.amount || 500,
      type: 'expense',
      categoryId: catId,
      subcategory: extractedReceipt.subcategory || undefined,
      accountId: accounts[0]?.id || 'acc_hdfc',
      paymentMethod: 'upi',
      date: extractedReceipt.date || new Date().toISOString().split('T')[0],
      notes: extractedReceipt.notes || 'Imported via AI Receipt Scanner',
      tags: ['ReceiptScan'],
      receiptUrl: receiptImage || undefined,
    });

    setReceiptAddedSuccess(true);
    setTimeout(() => {
      setExtractedReceipt(null);
      setReceiptImage(null);
      setReceiptRawText('');
      setReceiptAddedSuccess(false);
    }, 2500);
  };

  // Advisor Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorInput.trim() || isAdvisorLoading) return;

    const userMsg: AdvisorMessage = { role: 'user', content: advisorInput.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setAdvisorInput('');
    setIsAdvisorLoading(true);

    try {
      const response = await authFetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          context: {
            totalIncome,
            totalExpenses,
            savingsRate,
            totalDebt: totalDebtOwed,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Focus on maintaining at least 3-6 months of liquid emergency fund before aggressively expanding long-term equity allocations.',
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to reach advisory service right now. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Smart Financial Insights
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">
              AI Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rule-based intelligence, Gemini AI financial health doctor, and receipt OCR
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'insights'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Health Checkup</span>
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'scanner'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Receipt Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'advisor'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Advisor</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Financial Health & Smart Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Executive Health Banner */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  MoneyFlow Health Evaluation
                </span>
                {aiData?.source === 'gemini' && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    ✓ Verified by Gemini 3.8 Flash
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 max-w-xl leading-relaxed">
                {aiData?.executiveSummary ||
                  'Your financial habits demonstrate solid surplus accumulation with proactive savings and disciplined debt management.'}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Health Index</span>
                <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {aiData?.healthScore || 85}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <button
                onClick={fetchAiInsights}
                disabled={isLoadingInsights}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoadingInsights ? 'Analyzing...' : 'Refresh AI Checkup'}</span>
              </button>
            </div>
          </div>

          {/* Actionable Insights Cards */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Actionable Observations & Habits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(aiData?.insights || []).map((item: any, idx: number) => {
                const isWarning = item.type === 'warning';
                const isPositive = item.type === 'positive';

                return (
                  <div
                    key={idx}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : isPositive ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Lightbulb className="w-4 h-4 text-blue-500" />
                        )}
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                        Recommendation:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {item.actionRecommendation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tax & Indian Wealth Tips */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Tax Deductions & Wealth Engineering (India)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(aiData?.taxAndWealthTips || []).map((tip: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{tip.scheme}</h3>
                  </div>
                  <div className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    {tip.benefit}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tip.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI Receipt Scanner */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload and Input Side */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5 shadow-2xs">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Scan Receipt or Bill
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload image receipt or paste SMS transaction text to auto-extract details
              </p>
            </div>

            <form onSubmit={handleScanReceipt} className="space-y-4">
              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Receipt Photo / Document
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {receiptImage ? (
                    <div className="space-y-3">
                      <img
                        src={receiptImage}
                        alt="Receipt preview"
                        className="max-h-44 mx-auto rounded-lg object-contain shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setReceiptImage(null)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-2 block">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        Click to upload receipt image
                      </div>
                      <div className="text-[11px] text-slate-400">PNG, JPG up to 10MB</div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setReceiptImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Or Paste SMS text */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Or Paste Bank / UPI SMS Alert
                </label>
                <textarea
                  rows={3}
                  placeholder='e.g. "Sent Rs 1,450 to Swiggy on 02-Nov-26 via UPI ref 489219"'
                  value={receiptRawText}
                  onChange={(e) => setReceiptRawText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isScanning || (!receiptImage && !receiptRawText.trim())}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isScanning ? 'Extracting with Gemini AI...' : 'Scan & Extract Data'}</span>
              </button>
            </form>
          </div>

          {/* Results Side */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Extracted Transaction
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review parsed information before saving to your ledger
              </p>

              {extractedReceipt ? (
                <div className="mt-5 space-y-3.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Merchant / Vendor</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {extractedReceipt.merchant}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Total Amount</span>
                    <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatCurrency(extractedReceipt.amount, currency, numberFormat)}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Suggested Category</span>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {extractedReceipt.category}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Date</span>
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      {extractedReceipt.date || 'Today'}
                    </span>
                  </div>

                  {extractedReceipt.items && extractedReceipt.items.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] text-slate-400 block mb-1">Detected Items:</span>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5">
                        {extractedReceipt.items.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-slate-400">
                  Upload an image or paste message on the left to extract transaction data automatically.
                </div>
              )}
            </div>

            {extractedReceipt && (
              <div>
                {receiptAddedSuccess ? (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Transaction successfully added to ledger!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddScannedTx}
                    className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Add to Ledger</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Financial Advisor Interactive Chat */}
      {activeTab === 'advisor' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-2xs max-w-3xl mx-auto flex flex-col h-[600px]">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                MoneyFlow Wealth Advisor
              </h2>
              <p className="text-xs text-slate-400">
                Context-aware guidance for Indian personal & family finance
              </p>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-xl max-w-[80%] whitespace-pre-line ${
                      isUser
                        ? 'bg-slate-900 text-white dark:bg-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
            {isAdvisorLoading && (
              <div className="flex gap-2 text-xs text-slate-400 items-center">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Advisor is calculating recommendations...</span>
              </div>
            )}
          </div>

          {/* Input Row */}
          <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0 pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              placeholder="Ask about 50/30/20 rule, debt avalanche, or PPF vs ELSS..."
              value={advisorInput}
              onChange={(e) => setAdvisorInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isAdvisorLoading || !advisorInput.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
