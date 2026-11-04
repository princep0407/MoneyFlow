import React, { useState } from 'react';
import { Wallet, Shield, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const LoginView: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() || email.split('@')[0] } },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo('Account ban gaya! Apna email check karke verify link par click karo, phir Sign In karo.');
          setMode('signin');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err?.message || 'Kuch galat hua, dobara try karo.');
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/20">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'signin' ? 'Welcome back' : 'Account banao'}
          </h1>
          <p className="text-xs text-slate-400">MoneyFlow — Personal & Family Money Management (₹)</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <input className={input} placeholder="Aapka naam" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg p-2.5">{error}</div>}
          {info && <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded-lg p-2.5">{info}</div>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-sm font-semibold text-white flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {busy ? 'Ruko...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo(''); }}
          className="w-full text-xs text-slate-400 hover:text-emerald-400"
        >
          {mode === 'signin' ? 'Naya account chahiye? Sign Up' : 'Pehle se account hai? Sign In'}
        </button>

        <div className="flex items-start gap-2 text-[11px] text-slate-500">
          <Shield className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>Aapka data cloud database me secure rehta hai aur sirf aap hi dekh sakte ho. Kisi bhi device se login karke wahi data milega.</span>
        </div>
      </div>
    </div>
  );
};
