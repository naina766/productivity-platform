import Link from 'next/link';
import type { Metadata } from 'next';
import { Zap, ArrowRight } from 'lucide-react';

// oxlint-disable-next-line react/only-export-components
export const metadata: Metadata = {
  title: 'Create your account — NOVA',
  description: 'Create a NOVA workspace and start building better.',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#050505] dark:bg-[#050505] light:bg-[#F7F7F5] text-[#F5F5F5] light:text-[#171717] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-600/8 blur-[120px] rounded-full"
      />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-[1.5px] shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-[#050505] dark:bg-[#050505] light:bg-white rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white dark:text-white light:text-neutral-900">
            NOVA
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Build better. Start free.
        </h1>
        <p className="text-base text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed mb-10">
          Authentication is a separate phase. This page is reserved for the upcoming sign-up experience.
        </p>

        <div className="rounded-2xl bg-[#111111] dark:bg-[#111111] light:bg-white border border-white/8 light:border-neutral-200 p-8">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-lg font-bold mb-2">Coming soon</h2>
          <p className="text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600 mb-6">
            Account creation, free trials, and workspaces land with the authentication and backend phases.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
          >
            <span>Back to home</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}