'use client';

import React, { useState } from 'react';
import { Zap, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setStatus('error');
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('success');
    setErrorMessage('');
    setEmail('');
  };

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Integrations', href: '#product' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Changelog', href: '#product' },
    ],
    Solutions: [
      { name: 'Product Teams', href: '#solutions' },
      { name: 'Engineering', href: '#solutions' },
      { name: 'Marketing', href: '#solutions' },
      { name: 'Startups', href: '#solutions' },
    ],
    Resources: [
      { name: 'Documentation', href: '#faq' },
      { name: 'Help Center', href: '#faq' },
      { name: 'Blog', href: '#features' },
      { name: 'Community', href: '#solutions' },
    ],
    Company: [
      { name: 'About', href: '#product' },
      { name: 'Careers', href: '#solutions' },
      { name: 'Contact', href: '#faq' },
      { name: 'Privacy Policy', href: '#faq' },
    ],
  };

  return (
    <footer className="bg-[#050505] dark:bg-[#050505] light:bg-neutral-100 border-t border-white/8 dark:border-white/8 light:border-neutral-300 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="pb-12 mb-12 border-b border-white/5 dark:border-white/5 light:border-neutral-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white dark:text-white light:text-neutral-900 tracking-tight">
                Get product insights in your inbox.
              </h3>
              <p className="text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600 mt-1">
                Bi-weekly dispatch on AI productivity, sprint velocity benchmarks, and NOVA product updates.
              </p>
            </div>

            <div className="lg:col-span-6">
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      placeholder="Enter your email address"
                      aria-label="Email address for newsletter"
                      aria-invalid={status === 'error'}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-white border text-sm text-white dark:text-white light:text-neutral-900 placeholder:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all ${
                        status === 'error'
                          ? 'border-rose-500'
                          : 'border-white/8 dark:border-white/8 light:border-neutral-300'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium pt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {status === 'success' && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>You're subscribed! Check your inbox shortly.</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Multi-Column Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white dark:text-white light:text-neutral-900">
                NOVA
              </span>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-500 light:text-neutral-600 leading-relaxed mb-4">
              Build Better. Work Smarter. The all-in-one AI workspace for ambitious teams.
            </p>

            <div className="flex items-center gap-3 text-neutral-500">
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="NOVA GitHub repository"
                className="p-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-neutral-200 hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="NOVA on Twitter / X"
                className="p-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-neutral-200 hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="NOVA on LinkedIn"
                className="p-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-neutral-200 hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 4 Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-bold text-white dark:text-white light:text-neutral-900 uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-xs text-neutral-500 dark:text-neutral-500 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-neutral-900 hover:text-emerald-400 dark:hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 dark:border-white/5 light:border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-500 light:text-neutral-600">
          <p>© 2026 NOVA, Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a
              href="#faq"
              className="hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#faq"
              className="hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#faq"
              className="hover:text-white dark:hover:text-white light:hover:text-neutral-900 transition-colors"
            >
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};