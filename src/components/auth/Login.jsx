import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { C, FONT_IMPORT } from '../../theme.js';
import { signIn, signUp } from '../../lib/auth.js';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) return;
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
        // onAuthStateChange in main.jsx picks up the new session from here.
      } else {
        await signUp(email.trim(), password);
        setNotice('Account created — check your email to confirm, then sign in.');
        setMode('signin');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", color: C.ink, padding: 20 }}>
      <style>{FONT_IMPORT}</style>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 360, background: C.panelSolid, border: `1px solid ${C.line}`, borderRadius: 18, padding: 28 }}>
        <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Dopamine Ledger</div>
        <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 22 }}>
          {mode === 'signin' ? 'Sign in to your ledger' : 'Create your ledger account'}
        </div>

        <label style={{ fontSize: 11.5, color: C.sub }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 11px', color: C.ink, fontSize: 13, margin: '6px 0 14px', outline: 'none', boxSizing: 'border-box' }}
        />

        <label style={{ fontSize: 11.5, color: C.sub }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 11px', color: C.ink, fontSize: 13, margin: '6px 0 18px', outline: 'none', boxSizing: 'border-box' }}
        />

        {error && <div style={{ fontSize: 12, color: C.bad, marginBottom: 14 }}>{error}</div>}
        {notice && <div style={{ fontSize: 12, color: C.good, marginBottom: 14 }}>{notice}</div>}

        <button type="submit" disabled={busy} className="hs-btn" style={{ width: '100%', padding: '11px', borderRadius: 11, border: 'none', background: C.tealDark, color: '#fff', fontWeight: 700, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: busy ? 0.7 : 1 }}>
          {busy && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <button
          type="button"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setNotice(null); }}
          style={{ width: '100%', background: 'none', border: 'none', color: C.sub, fontSize: 12, marginTop: 14, cursor: 'pointer' }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
