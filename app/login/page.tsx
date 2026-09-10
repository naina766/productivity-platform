import Link from 'next/link';
import type { Metadata } from 'next';
import { Zap, ArrowRight } from 'lucide-react';

// oxlint-disable-next-line react/only-export-components
export const metadata: Metadata = {
  title: 'Log in — NOVA',
  description: 'Log in to your NOVA workspace.',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-600/8 blur-[120px] rounded-full"
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
          Welcome back.
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-10">
          Sign in to access your NOVA workspace.
        </p>

        <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-8">
          <form className="space-y-4 text-left">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[var(--accent-primary)] hover:text-[var(--accent-highlight)] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
