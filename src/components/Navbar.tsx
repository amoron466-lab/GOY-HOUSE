import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LOGO_URL } from '../constants';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: '#home' },
    { name: t.nav.services, href: '#services' },
    { name: t.nav.specialTreatments, href: '#special-treatments' },
    { name: t.nav.packages, href: '#packages' },
    { name: t.nav.gallery, href: '#gallery' },
    { name: t.nav.reviews, href: '#reviews' },
    { name: t.nav.contact, href: '#contact' },
  ];

  const LangToggle = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={`flex items-center rounded-full border overflow-hidden text-xs font-semibold tracking-wide select-none ${
        isScrolled || compact
          ? 'border-stone-600 bg-stone-800/60'
          : 'border-white/30 bg-white/10'
      }`}
    >
      {(['mn', 'en'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-2.5 py-1 transition-all duration-200 ${
            language === lang
              ? 'bg-gold-400 text-white'
              : isScrolled || compact
              ? 'text-stone-400 hover:text-stone-100'
              : 'text-white/70 hover:text-white'
          }`}
          aria-label={lang === 'mn' ? 'Монгол' : 'English'}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-stone-900/95 backdrop-blur-md shadow-[0_1px_24px_rgba(60,40,10,0.10)] py-3 border-b border-stone-800'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom flex justify-between items-center">
        <a href="#home" className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="Goy House"
            className="h-12 w-12 object-cover rounded-full ring-2 ring-white/60 shadow-lg bg-white"
          />
          <span className={`font-serif font-semibold text-xl hidden sm:block transition-colors ${
            isScrolled ? 'text-stone-100' : 'text-white'
          }`}>
            Goy House
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-gold-400 ${
                    isScrolled ? 'text-stone-400' : 'text-white/90'
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <LangToggle />

          <a
            href="#packages"
            className="bg-gold-400 hover:bg-gold-500 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm"
          >
            {t.nav.bookNow}
          </a>
        </div>

        {/* Mobile right-side controls */}
        <div className="lg:hidden flex items-center gap-2">
          <LangToggle compact />
          <a
            href="#packages"
            className="bg-gold-400 hover:bg-gold-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            {t.nav.bookNow}
          </a>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`transition-colors ${isScrolled ? 'text-stone-300' : 'text-white'}`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-stone-900/97 backdrop-blur-md shadow-lg py-4 px-4 flex flex-col gap-4 border-b border-stone-800">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-stone-400 font-medium hover:text-gold-400 transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};
