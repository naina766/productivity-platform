import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useScrollProgress } from './hooks/useScrollProgress';

// Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustedCompanies } from './components/TrustedCompanies';
import { Features } from './components/Features';
import { ProductShowcase } from './components/ProductShowcase';
import { HowItWorks } from './components/HowItWorks';
import { Stats } from './components/Stats';
import { Solutions } from './components/Solutions';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { DemoModal } from './components/DemoModal';
import { BackToTop } from './components/BackToTop';

export const App: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { isScrolled, showBackToTop } = useScrollProgress();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleOpenDemo = () => {
    setIsDemoModalOpen(true);
  };

  const handleCloseDemo = () => {
    setIsDemoModalOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] dark:bg-[#050505] text-[#F5F5F5] dark:text-[#F5F5F5] transition-colors duration-200 light:bg-[#F7F7F5] light:text-[#171717]">
      {/* 1. Navigation Bar */}
      <Navbar
        theme={theme}
        onThemeChange={setTheme}
        isScrolled={isScrolled}
        onOpenDemo={handleOpenDemo}
      />

      <main id="main-content">
        {/* 2. Hero Section */}
        <Hero onOpenDemo={handleOpenDemo} />

        {/* 3. Trusted By / Company Logos */}
        <TrustedCompanies />

        {/* 4. Features */}
        <Features />

        {/* 5. Product / About Section */}
        <ProductShowcase />

        {/* 6. How It Works */}
        <HowItWorks />

        {/* 7. Statistics */}
        <Stats />

        {/* 8. Solutions / Use Cases */}
        <Solutions />

        {/* 9. Testimonials */}
        <Testimonials />

        {/* 10. Pricing */}
        <Pricing onOpenDemo={handleOpenDemo} />

        {/* 11. FAQ */}
        <FAQ />

        {/* 12. Final CTA */}
        <CTA onOpenDemo={handleOpenDemo} />
      </main>

      {/* 13. Footer */}
      <Footer />

      {/* Interactive Demo Walkthrough Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseDemo} />

      {/* Floating Back to Top Button */}
      <BackToTop show={showBackToTop} />
    </div>
  );
};

export default App;
