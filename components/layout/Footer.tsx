import React from 'react';
import { Zap } from 'lucide-react';

const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'FAQ', href: '#faq' },
  ],
  Company: [
    { name: 'About NOVA', href: '#product' },
    { name: 'Contact', href: '#faq' },
  ],
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Multi-Column Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                NOVA
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4 max-w-xs">
              Project management and task tracking for modern teams.
              One workspace for projects, tasks, and collaboration.
            </p>

            <div className="flex items-center gap-3 text-[var(--text-muted)]">
              <a
                href="https://github.com/naina766/productivity-platform"
                target="_blank"
                rel="noreferrer"
                aria-label="NOVA GitHub repository"
                className="p-2 rounded-lg hover:bg-[var(--card-main)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-xs text-[var(--text-muted)] hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
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
        <div className="pt-8 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
          <p>&copy; 2026 NOVA. A portfolio demo project.</p>
        </div>
      </div>
    </footer>
  );
};