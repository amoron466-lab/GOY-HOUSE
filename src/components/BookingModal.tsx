import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, User, Phone, FileText,
  ChevronLeft, ChevronRight,
  CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';
import {
  collection, addDoc, getDocs, query, where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../i18n/LanguageContext';

// ─── Property config ──────────────────────────────────────────
const PROPERTY_ID       = 'goy-house';
const WEEKDAY_PRICE     = 1_100_000;
const WEEKEND_PRICE     = 1_300_000;
const DAY_SERVICE_PRICE = 900_000;
const LARGE_GROUP_PRICE = 1_500_000;
const DEPOSIT           = 200_000;

type BookingTypeKey = 'weekday' | 'weekend' | 'day-service' | 'large-group';

// ─── Types ────────────────────────────────────────────────────
interface BookedRange { start: string; end: string; }

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType?: string;
}

// ─── Calendar label sets ─────────────────────────────────────
const CALENDAR_LABELS = {
  mn: {
    months: [
      '1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар',
      '7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар',
    ],
    days: ['Ня','Да','Мя','Лх','Пү','Ба','Бя'],
    yearSuffix: ' оны ',
  },
  en: {
    months: [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ],
    days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    yearSuffix: ' ',
  },
};

// ─── Pure helpers ─────────────────────────────────────────────

const getTodayStr = (): string => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

const formatDisplayMn = (s: string): string => {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${y} оны ${parseInt(m)}-р сарын ${parseInt(d)}`;
};

const formatDisplayEn = (s: string): string => {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  const months = CALENDAR_LABELS.en.months;
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
};

const calcNights = (ci: string, co: string): number => {
  if (!ci || !co) return 0;
  const diff =
    new Date(co + 'T00:00:00').getTime() -
    new Date(ci + 'T00:00:00').getTime();
  return Math.round(diff / 86_400_000);
};


const formatMoney = (n: number) => n.toLocaleString() + '₮';

const addOneDay = (s: string): string => {
  const d = new Date(s + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

const hasOverlapWith = (
  newIn: string,
  newOut: string,
  ranges: BookedRange[],
): boolean => ranges.some(r => newIn < r.end && newOut > r.start);

const isValidPhone = (raw: string): boolean => {
  const s = raw.replace(/[\s\-().]/g, '');
  return /^(\+976)?[0-9]{8}$/.test(s);
};

// ─── Config resolver ─────────────────────────────────────────
const resolveNightlyRate = (type: string): number => {
  switch (type) {
    case 'weekend':     return WEEKEND_PRICE;
    case 'day-service': return DAY_SERVICE_PRICE;
    case 'large-group': return LARGE_GROUP_PRICE;
    default:            return WEEKDAY_PRICE;
  }
};

const isDay = (type: string) => type === 'day-service';

const blockedDays = (type: string): ReadonlySet<number> | null => {
  if (type === 'weekday') return new Set([5, 6]);
  if (type === 'weekend') return new Set([0, 1, 2, 3, 4]);
  return null;
};

// ─── Component ───────────────────────────────────────────────

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, bookingType = 'weekday' }) => {
  const { t, language } = useLanguage();
  const b = t.booking;

  const nightlyRate  = resolveNightlyRate(bookingType);
  const isDayService = isDay(bookingType);
  const blocked      = blockedDays(bookingType);
  const today        = useRef(getTodayStr()).current;
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Localised helpers ────────────────────────────────────────
  const cal      = CALENDAR_LABELS[language] ?? CALENDAR_LABELS.mn;
  const formatDisplay = language === 'en' ? formatDisplayEn : formatDisplayMn;

  // ── Localised package label + schedule tag ───────────────────
  const pkgLabel = () => {
    switch (bookingType as BookingTypeKey) {
      case 'weekend':     return b.pkgWeekendLabel;
      case 'day-service': return b.pkgDayServiceLabel;
      case 'large-group': return b.pkgLargeGroupLabel;
      default:            return b.pkgWeekdayLabel;
    }
  };
  const pkgTag = () => {
    switch (bookingType as BookingTypeKey) {
      case 'weekend':     return b.pkgWeekendTag;
      case 'day-service': return b.pkgDayServiceTag;
      case 'large-group': return b.pkgLargeGroupTag;
      default:            return b.pkgWeekdayTag;
    }
  };

  // ── Calendar state ───────────────────────────────────────────
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [checkIn,      setCheckIn]      = useState('');
  const [checkOut,     setCheckOut]     = useState('');
  const [hovered,      setHovered]      = useState('');
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [calLoading,   setCalLoading]   = useState(false);

  // ── Form state ───────────────────────────────────────────────
  const [fullName,     setFullName]     = useState('');
  const [phone,        setPhone]        = useState('');
  const [note,         setNote]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Validation errors ────────────────────────────────────────
  const [nameErr,   setNameErr]   = useState('');
  const [phoneErr,  setPhoneErr]  = useState('');
  const [submitErr, setSubmitErr] = useState('');

  // ── Derived numbers ──────────────────────────────────────────
  const nights     = isDayService ? 0 : calcNights(checkIn, checkOut);
  const totalPrice = isDayService ? nightlyRate : nights * nightlyRate;

  // ── Fetch booked dates ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setCalLoading(true);
      try {
        const q = query(
          collection(db, 'bookings'),
          where('status', 'in', ['pending', 'confirmed']),
        );
        const snap = await getDocs(q);
        const ranges: BookedRange[] = snap.docs
          .map(d => d.data())
          .filter(d => (d.checkIn || d.date) && (d.checkOut || d.time))
          .map(d => ({
            start: (d.checkIn ?? d.date) as string,
            end:   (d.checkOut ?? d.time) as string,
          }));
        setBookedRanges(ranges);
      } catch (err) {
        console.error('BookingModal: failed to load booked dates', err);
      } finally {
        setCalLoading(false);
      }
    };
    load();
  }, [isOpen]);

  // ── Date helpers ─────────────────────────────────────────────
  const isDateBooked = useCallback(
    (s: string) => bookedRanges.some(r => s >= r.start && s < r.end),
    [bookedRanges],
  );

  const isInRange = useCallback(
    (s: string) => {
      const end = checkOut || hovered;
      if (!checkIn || !end) return false;
      const [a, bb] = checkIn <= end ? [checkIn, end] : [end, checkIn];
      return s > a && s < bb;
    },
    [checkIn, checkOut, hovered],
  );

  const isDayBlocked = useCallback(
    (s: string): boolean => {
      if (!blocked) return false;
      if (checkIn && !checkOut) return false;
      return blocked.has(new Date(s + 'T00:00:00').getDay());
    },
    [blocked, checkIn, checkOut],
  );

  // ── Calendar interaction ─────────────────────────────────────
  const handleDateClick = (dateStr: string) => {
    if (dateStr < today || isDateBooked(dateStr) || isDayBlocked(dateStr)) return;

    if (!checkIn || checkOut) {
      setCheckIn(dateStr);
      setCheckOut('');
      return;
    }

    if (dateStr <= checkIn) {
      setCheckIn(dateStr);
      setCheckOut('');
      return;
    }

    if (!hasOverlapWith(checkIn, dateStr, bookedRanges)) {
      setCheckOut(dateStr);
    } else {
      setCheckIn(dateStr);
      setCheckOut('');
    }
  };

  // ── Form validation ──────────────────────────────────────────
  const validate = (): boolean => {
    let ok = true;

    if (!fullName.trim() || fullName.trim().length < 2) {
      setNameErr(b.validNameErr);
      ok = false;
    } else {
      setNameErr('');
    }

    if (!isValidPhone(phone)) {
      setPhoneErr(b.validPhoneErr);
      ok = false;
    } else {
      setPhoneErr('');
    }

    return ok;
  };

  // ── Submit booking ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || !validate()) return;

    setIsSubmitting(true);
    setSubmitErr('');

    try {
      const freshSnap = await getDocs(
        query(collection(db, 'bookings'), where('status', 'in', ['pending', 'confirmed']))
      );
      const freshRanges: BookedRange[] = freshSnap.docs
        .map(d => d.data())
        .filter(d => (d.checkIn || d.date) && (d.checkOut || d.time))
        .map(d => ({
          start: (d.checkIn ?? d.date) as string,
          end:   (d.checkOut ?? d.time) as string,
        }));

      if (hasOverlapWith(checkIn, checkOut, freshRanges)) {
        setBookedRanges(freshRanges);
        setSubmitErr(b.submitErrConflict);
        setIsSubmitting(false);
        return;
      }

      const now = new Date().toISOString();
      await addDoc(collection(db, 'bookings'), {
        propertyId:  PROPERTY_ID,
        bookingType: bookingType,
        fullName:    fullName.trim(),
        phone:       phone.trim(),
        note:        note.trim(),
        checkIn,
        checkOut,
        nights,
        totalPrice,
        status:     'pending',
        createdAt:   now,
        updatedAt:   now,
      });

      setStep(3);
    } catch (err: any) {
      console.error('BookingModal: submit error', err);
      if (err?.code === 'permission-denied') {
        setSubmitErr(b.submitErrPermission);
      } else {
        setSubmitErr(b.submitErrGeneric);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reset & close ────────────────────────────────────────────
  const handleClose = () => {
    setStep(1);
    setCheckIn('');
    setCheckOut('');
    setHovered('');
    setFullName('');
    setPhone('');
    setNote('');
    setNameErr('');
    setPhoneErr('');
    setSubmitErr('');
    onClose();
  };

  // ── Month navigation guard ───────────────────────────────────
  const canGoPrev = (): boolean => {
    const now = new Date();
    return (
      calendarMonth.getFullYear() > now.getFullYear() ||
      calendarMonth.getMonth() > now.getMonth()
    );
  };

  // ── Calendar render ──────────────────────────────────────────
  const renderDays = () => {
    const year  = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const total = new Date(year, month + 1, 0).getDate();
    const start = new Date(year, month, 1).getDay();
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < start; i++) {
      cells.push(<div key={`pad-${i}`} />);
    }

    for (let d = 1; d <= total; d++) {
      const mm  = String(month + 1).padStart(2, '0');
      const dd  = String(d).padStart(2, '0');
      const str = `${year}-${mm}-${dd}`;

      const isPast     = str < today;
      const booked     = isDateBooked(str);
      const dayBlocked = isDayBlocked(str);
      const isStart    = str === checkIn;
      const isEnd      = str === checkOut;
      const inRange    = isInRange(str);
      const isToday    = str === today;
      const disabled   = isPast || booked || dayBlocked;

      let cls =
        'h-9 w-9 flex items-center justify-center text-sm font-medium ' +
        'transition-all select-none ';

      if (isStart || isEnd) {
        cls += 'bg-blue-500 text-white rounded-full shadow-md cursor-pointer z-10 ';
      } else if (booked) {
        cls += 'bg-red-50 text-red-300 line-through rounded-full cursor-not-allowed ';
      } else if (dayBlocked) {
        cls += 'text-gray-200 rounded-full cursor-not-allowed ';
      } else if (inRange) {
        cls += 'bg-blue-100 text-blue-800 cursor-pointer ';
      } else if (isPast) {
        cls += 'text-gray-300 rounded-full cursor-not-allowed ';
      } else {
        cls +=
          'text-gray-700 hover:bg-blue-50 hover:text-blue-700 ' +
          'rounded-full cursor-pointer ';
      }

      if (isToday && !isStart && !isEnd && !booked && !dayBlocked) {
        cls += 'ring-2 ring-blue-400 ring-offset-1 ';
      }

      const title = booked
        ? b.titleTooltipBooked
        : dayBlocked
        ? b.titleTooltipBlocked
        : isPast
        ? b.titleTooltipPast
        : undefined;

      cells.push(
        <div
          key={str}
          className={cls}
          onClick={() => !disabled && handleDateClick(str)}
          onMouseEnter={() => {
            if (!disabled && checkIn && !checkOut) setHovered(str);
          }}
          onMouseLeave={() => setHovered('')}
          title={title}
          role="button"
          aria-disabled={disabled}
          aria-label={`${year}-${mm}-${dd}${booked ? ` ${b.ariaBooked}` : dayBlocked ? ` ${b.ariaBlocked}` : ''}`}
        >
          {d}
        </div>
      );
    }

    return cells;
  };

  // ── Month header string ──────────────────────────────────────
  const monthHeaderStr = language === 'en'
    ? `${cal.months[calendarMonth.getMonth()]} ${calendarMonth.getFullYear()}`
    : `${calendarMonth.getFullYear()}${cal.yearSuffix}${cal.months[calendarMonth.getMonth()]}`;

  // ────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* ── Header ────────────────────────────────────── */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-serif font-medium text-gray-900">
                  {b.bookHouse}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {step === 1 && (isDayService ? `${pkgLabel()} — ${pkgTag()}` : b.selectCheckinCheckout)}
                  {step === 2 && b.enterDetails}
                  {step === 3 && b.bookingRegistered}
                </p>
              </div>
              <button
                onClick={handleClose}
                aria-label={b.ariaClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center
                           text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Progress bar ──────────────────────────────── */}
            {step < 3 && (
              <div className="flex gap-1 px-6 pt-4">
                {[1, 2].map(s => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      step >= s ? 'bg-blue-500' : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* ── Scrollable body ────────────────────────────── */}
            <div className="p-6 md:p-8 max-h-[78vh] overflow-y-auto">

              {/* ══════════════════════════════════════════════
                  STEP 1 — Calendar
              ══════════════════════════════════════════════ */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Date chips */}
                  {isDayService ? (
                    <div className="grid grid-cols-1 gap-3">
                      <div className={`rounded-xl p-3 border-2 transition-colors ${checkIn ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                        <p className="text-xs font-medium text-blue-600 mb-1">{b.serviceDate}</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {checkIn ? formatDisplay(checkIn) : '—'}
                        </p>
                      </div>
                      {checkIn && (
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">{pkgLabel()} · {pkgTag()}</span>
                            <span className="font-bold text-blue-600">{formatMoney(nightlyRate)}</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {b.depositNote.replace('{deposit}', formatMoney(DEPOSIT))}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: b.checkIn,  value: checkIn  },
                          { label: b.checkOut, value: checkOut },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className={`rounded-xl p-3 border-2 transition-colors ${
                              value ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <p className="text-xs font-medium text-blue-600 mb-1">{label}</p>
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {value ? formatDisplay(value) : '—'}
                            </p>
                          </div>
                        ))}
                      </div>

                      {checkIn && checkOut && (
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">{nights} {b.nights} · {pkgTag()}</span>
                            <span className="font-bold text-blue-600">{formatMoney(totalPrice)}</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {formatMoney(nightlyRate)} / {b.perNight} · {b.depositLabel} {formatMoney(DEPOSIT)}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Day-of-week restriction hint */}
                  {blocked && (
                    <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                      {bookingType === 'weekend' ? b.weekendOnly : b.weekdayOnly}
                    </div>
                  )}

                  {/* Calendar widget */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        disabled={!canGoPrev()}
                        onClick={() =>
                          canGoPrev() &&
                          setCalendarMonth(
                            new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
                          )
                        }
                        aria-label={b.ariaPrevMonth}
                        className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400
                                   hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="font-semibold text-gray-800 text-sm">
                        {monthHeaderStr}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth(
                            new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
                          )
                        }
                        aria-label={b.ariaNextMonth}
                        className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-700"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {calLoading ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">{b.loadingCalendar}</span>
                      </div>
                    ) : (
                      <>
                        {/* Day-of-week headers */}
                        <div className="grid grid-cols-7 mb-1">
                          {cal.days.map(name => (
                            <div
                              key={name}
                              className="h-8 flex items-center justify-center text-xs font-medium text-gray-400"
                            >
                              {name}
                            </div>
                          ))}
                        </div>
                        {/* Day cells */}
                        <div className="grid grid-cols-7 gap-y-1">
                          {renderDays()}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                      {b.legendSelected}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-100 inline-block border border-blue-300" />
                      {b.legendRange}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-100 inline-block border border-red-200" />
                      {b.legendBooked}
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    disabled={isDayService ? !checkIn : (!checkIn || !checkOut)}
                    onClick={() => {
                      if (isDayService && checkIn) {
                        setCheckOut(addOneDay(checkIn));
                      }
                      setStep(2);
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40
                               disabled:cursor-not-allowed text-white py-4 rounded-xl
                               font-medium transition-colors"
                  >
                    {isDayService
                      ? (!checkIn ? b.selectDay : b.continueBtn)
                      : (!checkIn ? b.selectCheckin : !checkOut ? b.selectCheckout : b.continueBtn)
                    }
                  </button>
                </motion.div>
              )}

              {/* ══════════════════════════════════════════════
                  STEP 2 — Personal info
              ══════════════════════════════════════════════ */}
              {step === 2 && (
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5"
                >
                  {/* Booking summary card */}
                  <div className="bg-blue-50 rounded-2xl p-4 space-y-2 border border-blue-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{b.serviceLabel}</span>
                      <span className="font-semibold text-gray-800">{pkgLabel()}</span>
                    </div>
                    {isDayService ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{b.dateLabel}</span>
                          <span className="font-semibold text-gray-800">{formatDisplay(checkIn)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{b.timeLabel}</span>
                          <span className="font-semibold text-gray-800">{pkgTag()}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-blue-100 pt-2">
                          <span className="text-gray-500">{b.priceLabel}</span>
                          <span className="font-bold text-blue-600">{formatMoney(nightlyRate)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{b.arrivalLabel}</span>
                          <span className="font-semibold text-gray-800">{formatDisplay(checkIn)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{b.departureLabel}</span>
                          <span className="font-semibold text-gray-800">{formatDisplay(checkOut)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-blue-100 pt-2">
                          <span className="text-gray-500">{b.priceLabel} ({nights} {b.nights} · {formatMoney(nightlyRate)}/{b.perNight})</span>
                          <span className="font-bold text-blue-600">{formatMoney(totalPrice)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{b.depositLabel}</span>
                      <span className="font-semibold text-gray-700">{formatMoney(DEPOSIT)}</span>
                    </div>
                  </div>

                  {/* Deposit warning */}
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-700 leading-relaxed">
                    ⚠️ <strong>{b.depositWarningBold}</strong> {b.depositWarningMain}{' '}
                    <strong>{b.depositWarningPct}</strong>{' '}
                    {b.depositWarningRest}
                  </div>

                  {/* Full name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {b.fullNameLabel} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder={b.fullNamePlaceholder}
                        value={fullName}
                        onChange={e => { setFullName(e.target.value); if (nameErr) setNameErr(''); }}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all
                          bg-white text-gray-800 placeholder-gray-400
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${nameErr ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`}
                      />
                    </div>
                    {nameErr && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {nameErr}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {b.phoneLabel} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        placeholder={b.phonePlaceholder2}
                        value={phone}
                        onChange={e => { setPhone(e.target.value); if (phoneErr) setPhoneErr(''); }}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all
                          bg-white text-gray-800 placeholder-gray-400
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${phoneErr ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`}
                      />
                    </div>
                    {phoneErr && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {phoneErr}
                      </p>
                    )}
                  </div>

                  {/* Note (optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {b.noteLabel}{' '}
                      <span className="text-gray-400 font-normal text-xs">{b.noteOptional}</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                      <textarea
                        rows={3}
                        placeholder={b.notePlaceholder}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none
                          transition-all bg-white text-gray-800 placeholder-gray-400 resize-none
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Submit error */}
                  {submitErr && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{submitErr}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => { setSubmitErr(''); setStep(1); }}
                      className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-600
                                 py-4 rounded-xl font-medium transition-colors"
                    >
                      {b.backBtn}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-2/3 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl
                                 font-medium transition-colors disabled:opacity-70
                                 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {b.submittingBtn}
                        </>
                      ) : (
                        b.submitBtn
                      )}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* ══════════════════════════════════════════════
                  STEP 3 — Success
              ══════════════════════════════════════════════ */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-serif font-medium text-gray-900 mb-2">
                    {b.successTitle}
                  </h3>
                  <p className="text-gray-500 mb-3">
                    {b.successBody}
                  </p>

                  {/* ── Payment instructions card ── */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-8 text-left">

                    {/* Header */}
                    <p className="text-center text-amber-700 font-bold text-sm tracking-wide uppercase mb-4">
                      {b.paymentInfoTitle}
                    </p>

                    {/* 30% amount block */}
                    <div className="bg-white rounded-xl p-4 mb-4 border border-amber-100 text-center shadow-sm">
                      <p className="text-stone-400 text-xs mb-1">{b.advanceLabel}</p>
                      <p className="text-3xl font-bold text-amber-600">
                        {formatMoney(Math.round(totalPrice * 0.3))}
                      </p>
                      <p className="text-stone-400 text-xs mt-1">
                        {b.totalLabel} {formatMoney(totalPrice)}
                      </p>
                    </div>

                    {/* Bank details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-amber-100">
                        <span className="text-stone-400 text-xs">{b.bankLabel}</span>
                        <span className="text-stone-800 font-semibold text-sm">{b.bankName}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-amber-100">
                        <span className="text-stone-400 text-xs">{b.accountLabel}</span>
                        <span className="text-stone-800 font-semibold text-sm tracking-wide">{b.accountNumber}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-amber-100">
                        <span className="text-stone-400 text-xs">{b.accountOwnerLabel}</span>
                        <span className="text-stone-800 font-semibold text-sm">{b.accountOwner}</span>
                      </div>
                    </div>

                    {/* Call instruction */}
                    <div className="bg-amber-100 rounded-xl px-4 py-3 text-center">
                      <p className="text-amber-800 text-sm font-medium leading-snug">
                        {b.callInstruction}
                      </p>
                      <a
                        href="tel:+97699113127"
                        className="inline-block text-amber-700 font-bold text-xl mt-1 hover:text-amber-900 transition-colors"
                      >
                        +976 9911 3127
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-3
                               rounded-full font-medium transition-colors"
                  >
                    {b.closeBtn}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
