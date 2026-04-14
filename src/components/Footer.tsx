import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Facebook, Instagram, MapPin, Phone } from 'lucide-react';
import { LOGO_URL } from '../constants';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-stone-950 text-stone-400 py-16 border-t border-stone-800/60">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={LOGO_URL}
                alt="Goy House"
                className="h-14 w-14 object-cover rounded-full ring-2 ring-gold-400/30 shadow-lg"
              />
              <span className="font-serif font-semibold text-2xl text-stone-100">
                Goy House
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              {t.hero.subtitle}
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/goyhouseturees"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-full bg-stone-800 border-2 border-gold-400/60 text-stone-100 flex items-center justify-center hover:bg-gold-400 hover:border-gold-400 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-8 h-8" />
              </a>
              <a
                href="https://www.instagram.com/goy.house?igsh=end2OXlmemlibzFm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-full bg-stone-800 border-2 border-gold-400/60 text-stone-100 flex items-center justify-center hover:bg-gold-400 hover:border-gold-400 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-8 h-8" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-stone-100 font-serif font-medium text-lg mb-6">{t.footer.links}</h4>
            <ul className="space-y-3">
              <li><a href="#services" className="hover:text-gold-400 transition-colors">{t.nav.services}</a></li>
              <li><a href="#packages" className="hover:text-gold-400 transition-colors">{t.nav.packages}</a></li>
              <li><a href="#gallery" className="hover:text-gold-400 transition-colors">{t.nav.gallery}</a></li>
              <li><a href="#reviews" className="hover:text-gold-400 transition-colors">{t.nav.reviews}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-stone-100 font-serif font-medium text-lg mb-6">{t.footer.contact}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{t.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <a href="tel:+97699113127" className="text-sm hover:text-gold-400 transition-colors">
                  {t.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 text-gold-400 flex-shrink-0 text-sm font-bold">@</span>
                <a href="mailto:bayaka99@yahoo.com" className="text-sm hover:text-gold-400 transition-colors">
                  bayaka99@yahoo.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 text-center text-sm text-stone-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Goy House. {t.footer.rights}</p>
          <div className="flex items-center gap-4">
            <p>{t.footer.designedFor}</p>
            <span className="text-stone-600">•</span>
            <a href="/admin" className="hover:text-gold-400 transition-colors">
              {t.footer.adminLogin}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
