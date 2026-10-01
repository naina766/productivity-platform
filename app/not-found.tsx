import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md text-center">
        {/* 404 badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <span className="text-3xl font-extrabold text-emerald-400">404</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Page not found
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed max-w-xs mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--card-main)] border border-[var(--border-color)] hover:border-[var(--text-muted)] text-sm font-medium text-[var(--text-primary)] transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
