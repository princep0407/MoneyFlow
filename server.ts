import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // ---- Login guard: /api/* sirf logged-in users ke liye ----
  const sbUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const sbKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const authClient =
    sbUrl && sbKey ? createClient(sbUrl, sbKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  const hits = new Map<string, number[]>();

  app.use('/api', async (req: Request, res: Response, next) => {
    if (!authClient) return res.status(503).json({ error: 'Server par Supabase configure nahi hai' });
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Login required' });
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid session' });
    // simple rate limit: 30 requests / minute / user
    const now = Date.now();
    const recent = (hits.get(data.user.id) || []).filter((t) => now - t < 60_000);
    if (recent.length >= 30) return res.status(429).json({ error: 'Bahut zyada requests, thoda ruko' });
    recent.push(now);
    hits.set(data.user.id, recent);
    next();
  });

  // Initialize Gemini AI Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // 1. Financial Insights & Health Checkup Endpoint
  app.post('/api/gemini/insights', async (req: Request, res: Response) => {
    try {
      const { summaryData } = req.body;
      if (!summaryData) {
        return res.status(400).json({ error: 'summaryData is required' });
      }

      if (!ai) {
        // Fallback intelligent rule-based insights if API key is absent
        const ruleInsights = generateRuleBasedInsights(summaryData);
        return res.json({ insights: ruleInsights, source: 'rule-based' });
      }

      const prompt = `You are a certified Indian Chartered Financial Analyst and Wealth Advisor for MoneyFlow.
Analyze the following financial snapshot of a personal/family user in India (amounts in INR ₹):

Total Monthly Income: ₹${summaryData.totalIncome}
Total Monthly Expenses: ₹${summaryData.totalExpenses}
Monthly Savings: ₹${summaryData.monthlySavings} (Savings Rate: ${summaryData.savingsRate}%)
Net Worth: ₹${summaryData.netWorth}
Total Debt (Money Owed): ₹${summaryData.totalDebt}
Money Owed to User: ₹${summaryData.moneyOwedToUser}
Total Recurring Commitments / month: ₹${summaryData.recurringTotal}
Top Expense Categories: ${JSON.stringify(summaryData.topCategories)}
Recent Transactions: ${JSON.stringify(summaryData.recentTransactions?.slice(0, 8))}

Provide a thorough, encouraging, actionable evaluation. Include:
1. Overall Financial Health Score (0 to 100)
2. Executive Summary (2 sentences max)
3. 3-5 Specific, highly practical insights (mix of alerts, savings opportunities, and habit praise)
4. 2-3 specific Indian tax & investment tips (e.g. 80C, ELSS, PPF, NPS 80CCD, Sovereign Gold Bonds, Health Insurance 80D) suited to their financial position.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthScore: { type: Type.INTEGER, description: 'Score from 0 to 100' },
              executiveSummary: { type: Type.STRING },
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    type: { type: Type.STRING, description: 'warning | opportunity | positive | tax' },
                    description: { type: Type.STRING },
                    actionRecommendation: { type: Type.STRING },
                    estimatedMonthlySavingsINR: { type: Type.NUMBER },
                  },
                  required: ['title', 'type', 'description', 'actionRecommendation'],
                },
              },
              taxAndWealthTips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    scheme: { type: Type.STRING },
                    benefit: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                  },
                  required: ['scheme', 'benefit', 'recommendation'],
                },
              },
            },
            required: ['healthScore', 'executiveSummary', 'insights', 'taxAndWealthTips'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ ...parsed, source: 'gemini' });
    } catch (err: any) {
      console.error('Error generating AI insights:', err?.message || err);
      // Fallback cleanly to rule-based insights
      const fallback = generateRuleBasedInsights(req.body?.summaryData || {});
      return res.json({ ...fallback, source: 'rule-based-fallback' });
    }
  });

  // 2. Receipt Scanner / OCR Endpoint
  app.post('/api/gemini/scan-receipt', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType, rawText } = req.body;

      if (!ai) {
        return res.json({
          merchant: 'Scanned Vendor',
          amount: 850,
          date: new Date().toISOString().split('T')[0],
          category: 'Food',
          paymentMethod: 'UPI',
          items: ['Items scanned from invoice'],
          notes: 'Auto-extracted from receipt demo.',
        });
      }

      let parts: any[] = [];
      if (imageBase64) {
        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
        parts.push({
          text: `Extract structured financial transaction data from this receipt/invoice. Amounts are in INR (₹) unless indicated. Guess the best category among: Food, Shopping, Transportation, Education, Medical, Entertainment, Bills, Travel, Other Expenses.`,
        });
      } else if (rawText) {
        parts.push({
          text: `Parse this receipt or SMS message into structured transaction data:\n"${rawText}"\nIdentify merchant name, total amount in INR, transaction date, suggested category, payment mode (UPI, Credit Card, Debit Card, Cash, Net Banking), and individual item line names.`,
        });
      } else {
        return res.status(400).json({ error: 'imageBase64 or rawText is required' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              merchant: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              date: { type: Type.STRING, description: 'YYYY-MM-DD' },
              category: { type: Type.STRING },
              subcategory: { type: Type.STRING },
              paymentMethod: { type: Type.STRING, description: 'UPI, Credit Card, Debit Card, Cash, Net Banking' },
              items: { type: Type.ARRAY, items: { type: Type.STRING } },
              notes: { type: Type.STRING },
            },
            required: ['merchant', 'amount', 'category'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error scanning receipt:', err?.message || err);
      return res.status(500).json({
        error: 'Failed to parse receipt. Please enter transaction details manually.',
      });
    }
  });

  // 3. AI Financial Advisor Chat Endpoint
  app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
    try {
      const { messages, context } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      if (!ai) {
        return res.json({
          reply:
            'Hello! As your MoneyFlow advisor, here is a rule-of-thumb: allocate 50% for needs, 30% for wants, and 20% directly into SIP/PPF. Always maintain at least 3-6 months of emergency funds in a liquid savings account or sweep-in FD.',
        });
      }

      const systemPrompt = `You are "MoneyFlow Advisor", an astute, friendly personal finance expert specializing in Indian personal and family money management.
The user is managing their money in Indian Rupees (₹).
User Context:
- Monthly Income: ₹${context?.totalIncome || 0}
- Monthly Expenses: ₹${context?.totalExpenses || 0}
- Savings Rate: ${context?.savingsRate || 0}%
- Total Debt: ₹${context?.totalDebt || 0}
- Active Goals: ${context?.goalsSummary || 'Emergency fund, vacation'}

Guidelines:
- Give crisp, actionable, realistic advice in INR (use Lakhs/Crores if applicable).
- Support Hindi/Gujarati phrases naturally if the user asks in Hindi or Gujarati.
- Keep answers concise, formatted with clear bullets when recommending steps.
- Avoid vague disclaimers. Give direct financial engineering guidance (e.g. debt payoff snowball/avalanche, SIP compounding, budget limits).`;

      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      return res.json({ reply: response.text || '' });
    } catch (err: any) {
      console.error('Error in advisor chat:', err?.message || err);
      return res.status(500).json({
        reply:
          'I am currently experiencing higher load, but here is a quick rule: prioritize paying down high-interest credit card debt (>36% APR) before expanding discretionary investments.',
      });
    }
  });

  // 4. Natural Language Smart Search Parser Endpoint
  app.post('/api/gemini/natural-filter', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'query string is required' });
      }

      if (!ai) {
        return res.json({
          keyword: query,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Parse this natural language financial search query: "${query}"
Extract search parameters into JSON matching:
- keyword: string
- type: "income" | "expense" | "transfer" | "all"
- minAmount: number (optional)
- maxAmount: number (optional)
- category: string (optional)
- timeRange: "today" | "this_week" | "this_month" | "this_year" | "all"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              type: { type: Type.STRING },
              minAmount: { type: Type.NUMBER },
              maxAmount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              timeRange: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error in smart filter:', err?.message || err);
      return res.json({ keyword: req.body?.query || '' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`MoneyFlow full-stack server running at http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      const altPort = PORT + 1;
      console.log(`Port ${PORT} is in use, trying port ${altPort}...`);
      app.listen(altPort, '0.0.0.0', () => {
        console.log(`MoneyFlow full-stack server running at http://0.0.0.0:${altPort}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

// Fallback rule-based analysis generator
function generateRuleBasedInsights(data: any) {
  const income = Number(data.totalIncome) || 0;
  const expenses = Number(data.totalExpenses) || 0;
  const savings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const recurring = Number(data.recurringTotal) || 0;
  const debt = Number(data.totalDebt) || 0;

  const insights: any[] = [];

  // Savings rate evaluation
  if (savingsRate >= 30) {
    insights.push({
      title: 'Healthy Savings Rate',
      type: 'positive',
      description: `You are currently saving ${savingsRate}% of your monthly income (₹${savings.toLocaleString('en-IN')}), surpassing the recommended 20% benchmark.`,
      actionRecommendation: 'Consider deploying surplus savings into SIPs or indexed funds for long-term compounding.',
    });
  } else if (savingsRate > 0) {
    insights.push({
      title: 'Moderate Savings Margin',
      type: 'opportunity',
      description: `Your monthly savings rate is ${savingsRate}%. Target reaching 25-30% to build an emergency fund faster.`,
      actionRecommendation: 'Audit non-essential shopping and dining expenses this week.',
      estimatedMonthlySavingsINR: Math.round(income * 0.08),
    });
  } else {
    insights.push({
      title: 'Expenses Exceeding Income',
      type: 'warning',
      description: `Your monthly expenses of ₹${expenses.toLocaleString('en-IN')} exceed or match your income.`,
      actionRecommendation: 'Review recurring subscriptions and pause non-critical discretionary spend.',
    });
  }

  // Recurring bills ratio
  const recurringRatio = income > 0 ? Math.round((recurring / income) * 100) : 0;
  if (recurringRatio > 40) {
    insights.push({
      title: 'High Fixed Recurring Commitments',
      type: 'warning',
      description: `Recurring bills take up ${recurringRatio}% of your monthly income (₹${recurring.toLocaleString('en-IN')}).`,
      actionRecommendation: 'Audit auto-debit OTT, broadband plans, or gym memberships to lower fixed monthly drain.',
    });
  }

  // Debt insight
  if (debt > 0) {
    insights.push({
      title: 'Outstanding Liabilities',
      type: 'warning',
      description: `You have ₹${debt.toLocaleString('en-IN')} in active debts or borrowings.`,
      actionRecommendation: 'Prioritize paying off high-interest debts first using the Avalanche method.',
    });
  }

  const taxAndWealthTips = [
    {
      scheme: 'Section 80C Deductions',
      benefit: 'Deduction up to ₹1,50,000 / year',
      recommendation: 'Maximize ELSS mutual funds, PPF, or Employee Provident Fund (EPF) to reduce taxable income.',
    },
    {
      scheme: 'NPS Tier 1 (Section 80CCD 1B)',
      benefit: 'Additional exclusive deduction up to ₹50,000 / year',
      recommendation: 'Contribute to National Pension Scheme for dedicated retirement wealth and tax relief.',
    },
    {
      scheme: 'Health Insurance (Section 80D)',
      benefit: 'Deductions up to ₹25,000 for self/family & ₹50,000 for senior parents',
      recommendation: 'Ensure adequate comprehensive family floater health cover to protect savings against medical emergencies.',
    },
  ];

  const healthScore = Math.min(
    100,
    Math.max(20, Math.round(savingsRate * 1.5 + (debt === 0 ? 25 : 10) + (income > 0 ? 15 : 0)))
  );

  return {
    healthScore,
    executiveSummary: `Your financial profile reflects an active savings rate of ${savingsRate}% with monthly cashflow of ₹${savings.toLocaleString('en-IN')}.`,
    insights,
    taxAndWealthTips,
  };
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
