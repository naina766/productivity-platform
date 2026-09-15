'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, LogIn } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorMessage = getErrorMessage(error);

  useEffect(() => {
    // Safely log the real error for diagnostics
    console.error('NOVA Application Error Boundary caught:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-6 sm:p-8 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">
          Something went wrong
        </h1>

        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          {errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--card-elevated)] border border-[var(--border-color)] text-sm font-medium text-[var(--text-primary)] transition-all"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--card-elevated)] border border-[var(--border-color)] text-sm font-medium text-[var(--text-primary)] transition-all"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-6 text-[11px] text-[var(--text-muted)] font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
