import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const Packages = () => {
  const { t } = useLanguage();

  const packages = [
    {
      id: 'p1',
      title: t.packages.p1,
      price: '1,100,000₮',
      priceNote: t.packages.perNight,
      features: t.packages.p1Desc.split(', '),
      popular: false,
      tag: t.packages.tag1,
      bookingType: 'weekday',
    },
    {
      id: 'p2',
      title: t.packages.p2,
      price: '1,300,000₮',
      priceNote: t.packages.perNight,
      features: t.packages.p2Desc.split(', '),
      popular: true,
      tag: t.packages.tag2,
      bookingType: 'weekend',
    },
    {
      id: 'p3',
      title: t.packages.p3,
      price: '900,000₮',
      priceNote: t.packages.per8h,
      features: t.packages.p3Desc.split(', '),
      popular: false,
      tag: t.packages.tag3,
      bookingType: 'day-service',
    },
    {
      id: 'p4',
      title: t.packages.p4,
      price: '1,500,000₮',
      priceNote: t.packages.perNight,
      features: t.packages.p4Desc.split(', '),
      popular: false,
      tag: t.packages.tag4,
      bookingType: 'large-group',
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col h-full card-shadow hover:-translate-y-1 transition-all duration-300 ${
                pkg.popular
                  ? 'bg-stone-900 border-2 border-gold-400/70 transform md:-translate-y-4'
                  : 'bg-stone-900 border border-stone-800 hover:border-gold-400/20'
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gold-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {t.packages.popular}
                </div>
              )}

              {/* Day tag */}
              <div className={`text-xs font-semibold rounded-full px-3 py-1 inline-block w-fit mb-4 ${
                pkg.popular
                  ? 'text-blue-700 bg-blue-100 border border-blue-200'
                  : 'text-gold-400 bg-gold-400/10 border border-gold-400/20'
              }`}>
                {pkg.tag}
              </div>

              <h3 className="text-xl font-serif font-medium mb-4 text-white">
                {pkg.title}
              </h3>

              <div className="mb-6">
                <span className="text-3xl font-bold text-white">
                  {pkg.price}
                </span>
                <span className="text-stone-300 text-sm ml-1">{pkg.priceNote}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${pkg.popular ? 'text-blue-500' : 'text-gold-400'}`} />
                    <span className="text-sm text-stone-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('open-booking', { detail: { type: pkg.bookingType } }),
                  )
                }
                className={`block w-full text-center py-3 rounded-full font-medium transition-colors ${
                  pkg.popular
                    ? 'bg-gold-400 hover:bg-gold-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-stone-800 hover:bg-gold-400 hover:text-white text-stone-300'
                }`}
              >
                {t.packages.book}
              </button>
            </motion.div>
          ))}
        </div>

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
