import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChefHat } from 'lucide-react';

export const SpecialTreatments = () => {
  const { t } = useLanguage();

  const treatments = [
    {
      id: 't1',
      title: t.specialTreatments.t1,
      desc: t.specialTreatments.t1Desc,
      icon: <ChefHat className="w-8 h-8 text-gold-400" />,
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1600&auto=format&fit=crop',
      price: t.specialTreatments.pricePerPerson,
    }
  ];

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

        <div className="max-w-4xl mx-auto">
          {treatments.map((treatment, index) => (
            <motion.div
              key={treatment.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="bg-stone-950 rounded-3xl overflow-hidden border border-stone-800 hover:border-gold-400/30 card-shadow transition-all duration-300 flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 relative min-h-[300px]">
                <img
                  src={treatment.image}
                  alt={treatment.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="flex-shrink-0 bg-stone-900 w-16 h-16 rounded-full flex items-center justify-center shadow-inner border border-stone-800 mb-6">
                  {treatment.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-medium text-white mb-4">
                  {treatment.title}
                </h3>
                <p className="text-stone-300 mb-6 text-sm whitespace-pre-line leading-relaxed">
                  {treatment.desc}
                </p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-stone-800">
                  <span className="text-stone-400 text-sm font-medium">{t.specialTreatments.priceLabel}</span>
                  <span className="text-2xl font-bold text-gold-400">{treatment.price}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
