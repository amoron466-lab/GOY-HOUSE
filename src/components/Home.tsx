import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Services } from './Services';
import { SpecialTreatments } from './SpecialTreatments';
import { Packages } from './Packages';
import { Gallery } from './Gallery';
import { Reviews } from './Reviews';
import { Contact } from './Contact';
import { Footer } from './Footer';
import { BookingModal } from './BookingModal';
import { BackgroundEffect } from './BackgroundEffect';

export const Home = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingType, setBookingType] = useState('weekday');

  useEffect(() => {
    const handleOpenBooking = (e: Event) => {
      const type = (e as CustomEvent<{ type: string }>).detail?.type ?? 'weekday';
      setBookingType(type);
      setIsBookingOpen(true);
    };

    window.addEventListener('open-booking', handleOpenBooking);
    return () => window.removeEventListener('open-booking', handleOpenBooking);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-300 bg-transparent relative selection:bg-gold-400/30 selection:text-white">
      <BackgroundEffect />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Services />
        <SpecialTreatments />
        <Packages />
        <Gallery />
        <Reviews />
        <Contact />
      </main>
      <Footer />
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => { setIsBookingOpen(false); setBookingType('weekday'); }}
        bookingType={bookingType}
      />
    </div>
  );
};
