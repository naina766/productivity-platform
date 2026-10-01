'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { apiGetInvitationDetails, apiAcceptInvitation } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/errors';
import type { PublicInvitationDetails } from '@/types/invitation';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default function InviteAcceptPage({ params }: InvitePageProps) {
  const { token } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, loadUser } = useAuth();

  const [details, setDetails] = useState<PublicInvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [accepting, setAccepting] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGetInvitationDetails(token);
      setDetails(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchDetails();
  }, [fetchDetails]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    setAccepting(true);
    setError(null);
    try {
      await apiAcceptInvitation(token);
      setAcceptSuccess(true);
      await loadUser(); // refresh workspaces in context
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAccepting(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-500/10 via-lime-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-[var(--card-main)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-[1.5px] shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-[var(--card-main)] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            NOVA
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
            <p className="text-xs text-[var(--text-secondary)]">Loading invitation details...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && !details && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
              Invalid Invitation
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mb-6">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--card-main)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Success animation state */}
        {acceptSuccess && (
          <div className="py-8 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              Welcome to the Team!
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mb-2">
              You are now a member of {details?.workspaceName}.
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Redirecting to workspace dashboard...
            </p>
          </div>
        )}

        {/* Invitation Content */}
        {!loading && details && !acceptSuccess && (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                <Building2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Join {details.workspaceName}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                <span className="font-medium text-[var(--text-primary)]">{details.invitedByName}</span> invited you to collaborate as a{' '}
                <span className="font-semibold text-emerald-400 uppercase tracking-wide text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {details.role}
                </span>
              </p>
            </div>

            {/* Expired warning if applicable */}
            {details.isExpired && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>This invitation link has expired. Please ask an administrator to send a new invite.</span>
              </div>
            )}

            {/* Error banner during accept */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={accepting || details.isExpired}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all duration-150 shadow-md shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {accepting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Joining Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Accept & Join as {user?.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-[var(--text-muted)]">
                    Logged in as {user?.email}
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href={`/login?redirect=/invite/${token}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all duration-150 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <span>Log In to Accept</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/register?redirect=/invite/${token}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--card-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium text-xs transition-colors flex items-center justify-center"
                  >
                    Create New Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}
