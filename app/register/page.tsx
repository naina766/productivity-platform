'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getErrorMessage } from '@/lib/errors';


export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-600/8 blur-[120px] rounded-full"
      />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-[1.5px] shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-[var(--card-main)] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            NOVA
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Build better. Start free.
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-10">
          Create your NOVA workspace in seconds.
        </p>

        <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-8">
          <form className="space-y-4 text-left" onSubmit={handleSubmit} method="POST" action="#" noValidate>

            {error && (
              <div
                role="alert"
                className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--accent-primary)] hover:text-[var(--accent-highlight)] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
