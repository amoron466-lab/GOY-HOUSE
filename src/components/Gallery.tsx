import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';

export const Gallery = () => {
  const { t } = useLanguage();

  const images = [
    { src: '/outside.jpg',              alt: 'VIP HOUSE-ийн гадна тал' },       // #1
    { src: '/event-hall.jpg',           alt: 'Арга хэмжээний танхим' },         // #2
    { src: '/gallery/goy-house-04.jpg', alt: 'Арга хэмжээний танхим' },         // #10
    { src: '/gallery/goy-house-12.jpg', alt: 'Арга хэмжээний танхим' },         // #17
    { src: '/karaoke-new.jpg',          alt: 'Каракое' },                        // #3
    { src: '/gallery/goy-house-05.jpg', alt: 'Каракое' },                        // #11
    { src: '/buffet-new.jpg',           alt: 'Буфет хоол' },                    // #6
    { src: '/gallery/goy-house-02.jpg', alt: 'Гал тогоо' },                     // #8
    { src: '/gallery/goy-house-03.jpg', alt: 'Гал тогоо' },                     // #9
    { src: '/gallery/goy-house-01.jpg', alt: 'Зургийн талбай' },                // #7
    { src: '/billiard-new.jpg',         alt: 'Биллиард' },                      // #5
    { src: '/gallery/goy-house-07.jpg', alt: 'Биллиард' },                      // #12
    { src: '/gallery/goy-house-08.jpg', alt: 'Биллиард' },                      // #13
    { src: '/bedroom-new.jpg',          alt: 'Унтлагын өрөө #1' },              // #4
    { src: '/gallery/goy-house-09.jpg', alt: 'Унтлагын өрөө #2' },              // #14
    { src: '/gallery/goy-house-10.jpg', alt: 'Унтлагын өрөө #3' },              // #15
    { src: '/gallery/goy-house-13.jpg', alt: 'Унтлагын өрөө #4' },              // #18
    { src: '/gallery/goy-house-14.jpg', alt: 'Ширээний хөл бөмбөг' },           // #19
    { src: '/gallery/goy-house-11.jpg', alt: 'Амрах талбай' },                  // #16
  ];

  return (
    <section id="gallery" className="section-padding bg-stone-950 relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overline mb-4"
          >
            HOUSE
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-serif font-medium text-stone-100 mb-4"
          >
            {t.gallery.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-stone-400 max-w-2xl mx-auto"
          >
            {t.gallery.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] card-shadow"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 flex items-end justify-start opacity-0 group-hover:opacity-100 transition-all duration-500 p-5 translate-y-2 group-hover:translate-y-0">
                <span className="text-white font-medium text-sm tracking-wide bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/15">
                  {img.alt}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
