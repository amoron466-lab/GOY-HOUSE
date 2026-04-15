import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';

export const SpecialTreatments = () => {
  const { t } = useLanguage();

  return (
    <section id="special-treatments" className="section-padding bg-stone-900 relative border-t border-stone-800">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overline mb-4"
          >
            {t.specialTreatments.overline}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-serif font-medium text-white mb-4"
          >
            {t.specialTreatments.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-stone-300 max-w-2xl mx-auto"
          >
            {t.specialTreatments.subtitle}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <img
            src="/menu.jpg"
            alt="Цэс"
            className="w-full max-w-2xl rounded-2xl shadow-2xl shadow-black/60 object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
};
