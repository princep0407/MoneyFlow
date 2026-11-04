# MoneyFlow — Free hosting setup (Supabase + Render)

## 1. Supabase (free database + login)
1. supabase.com -> New project (free plan). Database password save kar lo.
2. **SQL Editor** -> New query -> `supabase/schema.sql` ka poora content paste -> **Run**.
3. **Authentication -> Sign In / Providers -> Email** me "Confirm email" OFF kar do (taaki signup par turant login ho jaye).
4. **Project Settings -> API** se copy karo: `Project URL` aur `anon public` key.

## 2. GitHub
Is folder ko GitHub repo me push karo (`.env` push mat karna).

## 3. Render (free hosting)
New -> Web Service -> repo select. Settings:
- Build Command: `npm install --include=dev && npm run build`
- Start Command: `npm start`
- Environment Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `GEMINI_API_KEY` (optional)

Deploy ke baad jo link mile wahi aapki live site hai.

## 4. Supabase me site URL
Supabase -> Authentication -> URL Configuration -> **Site URL** = aapka Render link.

## Local chalane ke liye
`.env.example` ko `.env` naam se copy karo, values bharo, phir `npm install` aur `npm run dev`.
