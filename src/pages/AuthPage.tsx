import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoadingButton } from '../components/ui/LoadingButton';

type Mode = 'login' | 'signup' | 'forgot';

export function AuthPage() {
  const { user, isGuest, isCloudAvailable, signIn, signUp, resetPassword, continueAsGuest, loading } =
    useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;
  if (!loading && isGuest) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      if (mode === 'forgot') {
        const { error: err } = await resetPassword(email);
        if (err) setError(err);
        else setMessage('Check your email for a password reset link.');
      } else if (mode === 'signup') {
        const { error: err } = await signUp(email, password);
        if (err) setError(err);
        else setMessage('Account created! Check your email to confirm, or sign in.');
      } else {
        const { error: err } = await signIn(email, password, remember);
        if (err) setError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">TaskFlow</h1>
            <p className="text-xs text-slate-500">
              {mode === 'login' ? 'Sign in to sync' : mode === 'signup' ? 'Create account' : 'Reset password'}
            </p>
          </div>
        </div>

        {!isCloudAvailable && (
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            Cloud auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or continue as guest.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs text-slate-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          {mode !== 'forgot' && (
            <div>
              <label htmlFor="password" className="mb-1 block text-xs text-slate-500">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>
          )}
          {mode === 'login' && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
          )}
          {error && (
            <p className="text-sm text-rose-600" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-brand-600" role="status">
              {message}
            </p>
          )}
          <LoadingButton type="submit" loading={submitting} className="w-full">
            {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Sign up' : 'Send reset link'}
          </LoadingButton>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          {mode === 'login' && (
            <>
              <button type="button" onClick={() => setMode('forgot')} className="text-brand-600 hover:underline">
                Forgot password?
              </button>
              <p>
                No account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-brand-600 hover:underline">
                  Sign up
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>
              Have an account?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-brand-600 hover:underline">
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button type="button" onClick={() => setMode('login')} className="text-brand-600 hover:underline">
              Back to sign in
            </button>
          )}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
          <button
            type="button"
            onClick={continueAsGuest}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Continue as guest (local only)
          </button>
          <Link to="/" className="mt-3 block text-center text-xs text-slate-500 hover:underline">
            Back to app
          </Link>
        </div>
      </div>
    </div>
  );
}
