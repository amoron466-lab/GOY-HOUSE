import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { Users, Mic2, BedDouble } from 'lucide-react';

export const Hero = () => {
  const { t } = useLanguage();

  const highlights = [
    { icon: <Users className="w-4 h-4" />, label: t.hero.highlight1 },
    { icon: <Mic2 className="w-4 h-4" />, label: t.hero.highlight2 },
    { icon: <BedDouble className="w-4 h-4" />, label: t.hero.highlight3 },
  ];

  return (
    <section id="home" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/outside.jpg"
          alt="Goy House VIP"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25"></div>
      </div>

      <div className="container-custom relative z-10 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto"
        >
          {/* VIP Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
          >
            {t.hero.badge}
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium mb-4 leading-tight text-white drop-shadow-lg">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl font-light mb-10 text-white/95 max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>

          {/* Quick highlights */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm px-4 py-2 rounded-full"
              >
                {h.icon}
                <span>{h.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById('packages');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-gold-400 hover:bg-gold-500 text-white rounded-full font-semibold transition-all w-full sm:w-auto text-center shadow-xl shadow-black/30 hover:scale-[1.03] active:scale-100"
            >
              {t.nav.bookNow}
            </button>
            <a
              href="#services"
              className="px-8 py-4 bg-transparent border border-white/60 hover:bg-white/10 text-white rounded-full font-medium transition-colors w-full sm:w-auto text-center backdrop-blur-sm"
            >
              {t.hero.cta}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/50 text-xs font-medium tracking-widest uppercase">{t.hero.scrollDown}</span>
        <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
          <motion.div
            animate={{ y: [0, 48] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="w-full h-1/2 bg-white/70 absolute top-0"
          />
        </div>
      </motion.div>
    </section>
  );
};
