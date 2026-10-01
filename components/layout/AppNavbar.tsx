'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Zap,
  LayoutDashboard,
  ListTodo,
  Calendar,
  LogOut,
  Menu,
  X,
  Keyboard,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { GlobalSearchTrigger } from '@/components/search/GlobalSearchTrigger';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useTheme } from '@/lib/hooks/useTheme';
import { useKeyboardShortcuts } from '@/components/command/KeyboardShortcutsProvider';

export interface AppNavbarBreadcrumb {
  label: string;
  href?: string;
}

export interface AppNavbarProps {
  breadcrumbs?: AppNavbarBreadcrumb[];
}

export function AppNavbar({ breadcrumbs }: AppNavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, workspace, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { openShortcutsModal } = useKeyboardShortcuts();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeView = searchParams.get('view');

  const navLinks = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
      active: pathname === '/dashboard',
    },
    {
      label: 'My Tasks',
      href: '/my-tasks',
      icon: <ListTodo className="w-3.5 h-3.5" />,
      active: pathname === '/my-tasks' && !activeView,
    },
    {
      label: 'Calendar',
      href: '/calendar',
      icon: <Calendar className="w-3.5 h-3.5" />,
      active: pathname === '/calendar',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-main)]/90 backdrop-blur-xl border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          {/* Left: Logo & optional Breadcrumbs */}
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
              aria-label="NOVA Dashboard"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-[1.5px] shadow-sm shadow-emerald-500/20">
                <div className="w-full h-full bg-[var(--card-main)] rounded-[9px] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <span className="font-bold tracking-tight text-base sm:text-lg">NOVA</span>
            </Link>

            {breadcrumbs && breadcrumbs.length > 0 ? (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-[var(--text-muted)] min-w-0">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3 h-3 text-[var(--border-color)] shrink-0" />
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-[var(--text-primary)] transition-colors truncate max-w-[140px]"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-[var(--text-primary)] font-medium truncate max-w-[180px]">
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : workspace ? (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                <span className="text-[var(--text-primary)] font-medium truncate max-w-[140px]">
                  {workspace.name}
                </span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold uppercase">
                  {workspace.role}
                </span>
              </div>
            ) : null}
          </div>

          {/* Center: Main Navigation */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Workspace navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.active ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  link.active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)] border border-transparent'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: Actions, Notifications, Search, Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Command & Search */}
            <GlobalSearchTrigger compact />

            {/* Shortcuts cheat sheet button */}
            <button
              type="button"
              onClick={() => openShortcutsModal()}
              aria-label="Keyboard Shortcuts"
              title="Keyboard Shortcuts (?)"
              className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-xl border border-[var(--border-color)] bg-[var(--card-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 text-xs font-mono"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme Toggle */}
            <ThemeToggle theme={theme} onThemeChange={setTheme} />

            {/* User profile & Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-1 border-l border-[var(--border-color)]">
                <div
                  className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-emerald-400"
                  title={`${user.name} (${user.email})`}
                  aria-label={`Current user: ${user.name}`}
                >
                  {user.name.slice(0, 2).toUpperCase()}
                </div>

                <button
                  type="button"
                  onClick={() => void logout()}
                  aria-label="Sign out"
                  title="Sign out of NOVA"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--card-main)] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-app-nav"
            className="md:hidden py-3 border-t border-[var(--border-color)] space-y-1 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={link.active ? 'page' : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                  link.active
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--card-main)]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            {workspace && (
              <div className="pt-2 mt-2 border-t border-[var(--border-color)] px-3 py-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="truncate">{workspace.name}</span>
                <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                  {workspace.role}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
