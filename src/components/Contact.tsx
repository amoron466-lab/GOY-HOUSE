import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { MapPin, Phone, Clock, Send } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contactMessages');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-stone-950 relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overline mb-4"
          >
            {t.contact.overline}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-serif font-medium text-white mb-4"
          >
            {t.contact.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-stone-300 max-w-2xl mx-auto"
          >
            {t.contact.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center flex-shrink-0 card-shadow">
                <MapPin className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-medium text-white mb-2">{t.contact.addressLabel}</h3>
                <p className="text-stone-300 leading-relaxed max-w-md">
                  {t.contact.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center flex-shrink-0 card-shadow">
                <Phone className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-medium text-white mb-2">{t.contact.phoneLabel}</h3>
                <a
                  href="tel:+97699113127"
                  className="text-gold-400 text-2xl font-bold hover:text-gold-500 transition-colors"
                >
                  {t.contact.phone}
                </a>
              </div>
            </div>


            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center flex-shrink-0 card-shadow">
                <Clock className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-medium text-white mb-2">{t.contact.hoursLabel}</h3>
                <p className="text-stone-300">
                  {t.contact.openHours}
                </p>
                <p className="text-stone-400 text-sm mt-1">
                  {t.contact.schedule1}
                </p>
                <p className="text-stone-400 text-sm">
                  {t.contact.schedule2}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            {/* Google Maps embed */}
            <div className="h-[300px] w-full rounded-2xl overflow-hidden shadow-lg border border-stone-800">
              <iframe
                src="https://www.google.com/maps?q=48.1486,106.9176&z=18&t=m&hl=en&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t.contact.iframeTitle}
              ></iframe>
            </div>

            {/* Contact form */}
            <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800 card-shadow">
              <h3 className="text-2xl font-serif font-medium text-white mb-6">{t.contact.title}</h3>
              {isSuccess ? (
                <div className="bg-blue-900/20 text-blue-300 p-4 rounded-xl flex items-center gap-3 border border-blue-800/30">
                  <div className="w-8 h-8 bg-blue-900/40 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium">{t.contact.success}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-1">{t.contact.name}</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-800 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all bg-stone-950 text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-1">{t.contact.email}</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-800 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all bg-stone-950 text-stone-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">{t.contact.message}</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-800 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all bg-stone-950 text-stone-100 resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gold-400 hover:bg-gold-500 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? t.contact.sending : (
                      <>
                        {t.contact.send}
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
