import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, ArrowRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../types';

interface NavbarProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  isScrolled: boolean;
  onOpenDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onThemeChange,
  isScrolled,
  onOpenDemo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Product', href: '#product' },
    { label: 'Features', href: '#features' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Resources', href: '#faq' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050505]/85 dark:bg-[#050505]/90 light:bg-[#F7F7F5]/90 backdrop-blur-xl border-b border-white/8 dark:border-white/8 light:border-neutral-200/80 shadow-lg shadow-black/20 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
            aria-label="NOVA Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-[1.5px] shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <div className="w-full h-full bg-[#050505] dark:bg-[#050505] light:bg-white rounded-[10px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400 group-hover:text-lime-400 group-hover:rotate-12 transition-all duration-300" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white dark:text-white light:text-neutral-900 font-sans">
              NOVA
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3.5 py-2 text-sm font-medium text-neutral-400 dark:text-neutral-400 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors rounded-lg hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side CTAs & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3.5">
            <ThemeToggle theme={theme} onThemeChange={onThemeChange} />

            <button
              type="button"
              onClick={onOpenDemo}
              className="px-3.5 py-2 text-sm font-medium text-neutral-300 dark:text-neutral-300 light:text-neutral-700 hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors rounded-lg hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-neutral-100"
            >
              Log in
            </button>

            <a
              href="#pricing"
              onClick={(e) => handleLinkClick(e, '#pricing')}
              className="relative group inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Mobile Hamburger & Theme toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-300 dark:text-neutral-300 light:text-neutral-700 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-neutral-200 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
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
            className="md:hidden bg-[#050505]/95 dark:bg-[#050505]/95 light:bg-white/95 border-b border-white/10 dark:border-white/10 light:border-neutral-200 backdrop-blur-2xl overflow-hidden px-4 pt-3 pb-6 shadow-2xl"
          >
            <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="px-4 py-3 rounded-lg text-base font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-neutral-100 transition-colors flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </a>
              ))}

              <div className="pt-4 mt-2 border-t border-white/10 dark:border-white/10 light:border-neutral-200 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenDemo) onOpenDemo();
                  }}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-center text-neutral-300 dark:text-neutral-300 light:text-neutral-700 bg-white/5 dark:bg-white/5 light:bg-neutral-100 border border-white/10 dark:border-white/10 light:border-neutral-200 hover:bg-white/10 transition-colors"
                >
                  Log in
                </button>
                <a
                  href="#pricing"
                  onClick={(e) => handleLinkClick(e, '#pricing')}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-center text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/25 transition-all"
                >
                  Get Started Free
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
