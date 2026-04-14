import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { Mic2, Disc3, Camera, BedDouble, Waves, ChefHat, Car, Users } from 'lucide-react';

export const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      id: 'karaoke',
      title: t.services.massage,
      desc: t.services.massageDesc,
      icon: <Mic2 className="w-8 h-8 text-gold-400" />,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'billiard',
      title: t.services.facial,
      desc: t.services.facialDesc,
      icon: <Disc3 className="w-8 h-8 text-gold-400" />,
      image: 'https://images.unsplash.com/photo-1611095790444-1dfa35e37b52?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'photo',
      title: t.services.hifu,
      desc: t.services.hifuDesc,
      icon: <Camera className="w-8 h-8 text-gold-400" />,
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'bedroom',
      title: t.services.sauna,
      desc: t.services.saunaDesc,
      icon: <BedDouble className="w-8 h-8 text-gold-400" />,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'shower',
      title: t.services.scrub,
      desc: t.services.scrubDesc,
      icon: <Waves className="w-8 h-8 text-gold-400" />,
      image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'buffet',
      title: t.services.foam,
      desc: t.services.foamDesc,
      icon: <ChefHat className="w-8 h-8 text-gold-400" />,
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'parking',
      title: t.services.headMassage,
      desc: t.services.headMassageDesc,
      icon: <Car className="w-8 h-8 text-gold-400" />,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'capacity',
      title: t.services.cupping,
      desc: t.services.cuppingDesc,
      icon: <Users className="w-8 h-8 text-gold-400" />,
      image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <section id="services" className="section-padding bg-stone-950 relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overline mb-4"
          >
            {t.services.overline}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-serif font-medium text-white mb-4"
          >
            {t.services.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-stone-300 max-w-2xl mx-auto"
          >
            {t.services.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="bg-stone-900 rounded-2xl p-8 border border-stone-800 hover:border-gold-400/25 card-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden relative"
            >
              {service.image && (
                <div className="absolute inset-0 z-0 opacity-10">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
                </div>
              )}
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 bg-stone-800 w-16 h-16 rounded-full flex items-center justify-center shadow-sm ring-1 ring-gold-400/20">
                  {service.icon}
                </div>
                <h3 className="text-xl font-serif font-medium text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-stone-300 flex-grow text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
