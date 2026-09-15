'use client';

import { useEffect } from 'react';
import { getErrorMessage } from '@/lib/errors';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorMessage = getErrorMessage(error);

  useEffect(() => {
    console.error('NOVA Global Error Boundary caught:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans antialiased flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#111111] border border-white/10 p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            !
          </div>

          <h1 className="text-xl font-bold tracking-tight mb-2 text-white">
            System Error
          </h1>

          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            {errorMessage}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              Reload application
            </button>
          </div>

          {error?.digest && (
            <p className="mt-6 text-[11px] text-neutral-500 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
