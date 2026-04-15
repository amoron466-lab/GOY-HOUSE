import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { AlertCircle } from 'lucide-react';

export const Packages = () => {
  const { t } = useLanguage();

  return (
    <section id="packages" className="section-padding bg-stone-950 relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overline mb-4"
          >
            {t.packages.overline}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-serif font-medium text-white mb-4"
          >
            {t.packages.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-stone-300 max-w-2xl mx-auto"
          >
            {t.packages.subtitle}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-12"
        >
          <img
            src="/pricing.jpg"
            alt={t.packages.title}
            className="w-full max-w-2xl rounded-2xl shadow-2xl shadow-black/60 object-contain"
          />
        </motion.div>

        {/* Deposit & cancellation policy notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-amber-900/20 border border-amber-700/30 rounded-2xl p-6"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-stone-400">
              <p>
                <span className="text-stone-200 font-semibold">{t.packages.depositLabel}:</span> {t.packages.depositDesc}
              </p>
              <p>
                <span className="text-stone-200 font-semibold">{t.packages.advanceLabel}:</span> {t.packages.advanceDesc}
              </p>
              <p>
                <span className="text-amber-400 font-semibold">{t.packages.warningLabel}:</span> {t.packages.warningDesc}
              </p>
              <p>
                {t.packages.holidayNote} <span className="text-gold-400 font-semibold">+976 9911 3127</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
