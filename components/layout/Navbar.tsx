'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '@/types';

interface NavbarProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  isScrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onThemeChange,
  isScrolled,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Product', href: '#product' },
    { label: 'Features', href: '#features' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen, closeMobileMenu]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[var(--bg-main)]/90 backdrop-blur-xl border-b border-[var(--border-color)] shadow-lg shadow-black/5 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
            aria-label="NOVA Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-[1.5px] shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <div className="w-full h-full bg-[var(--card-main)] rounded-[10px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400 group-hover:text-lime-400 group-hover:rotate-12 transition-all duration-300" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-sans">
              NOVA
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)]/50 transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side CTAs & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3.5">
            <ThemeToggle theme={theme} onThemeChange={onThemeChange} />

            <Link
              href="/login"
              className="px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)]/50 transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="relative group inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Hamburger & Theme toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--card-main)]/50 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-[var(--bg-main)]/95 border-b border-[var(--border-color)] backdrop-blur-2xl overflow-hidden px-4 pt-3 pb-6 shadow-2xl"
          >
            <nav id="mobile-navigation" className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="px-4 py-3 rounded-lg text-base font-medium text-[var(--text-primary)] hover:bg-[var(--card-main)]/50 transition-colors flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                </a>
              ))}

              <div className="pt-4 mt-2 border-t border-[var(--border-color)] flex flex-col gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-center text-[var(--text-secondary)] bg-[var(--card-main)]/50 border border-[var(--border-color)] hover:bg-[var(--card-main)] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-center text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/25 transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
