'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  rangeEnd?: Date | null;
  onRangeChange?: (start: Date, end: Date) => void;
  rangeMode?: boolean;
  placeholder?: string;
}

const DAY_NAMES = ['Lun', 'Mar', 'Mi\u00e9', 'Jue', 'Vie', 'S\u00e1b', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  const d = date.getTime();
  const s = Math.min(start.getTime(), end.getTime());
  const e = Math.max(start.getTime(), end.getTime());
  return d >= s && d <= e;
}

const calendarVariants = {
  initial: { opacity: 0, y: 8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.96 },
};

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  rangeEnd,
  onRangeChange,
  rangeMode = false,
  placeholder = 'Seleccionar fecha',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? new Date().getMonth());
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? new Date().getFullYear());
  const [rangeStart, setRangeStart] = useState<Date | null>(value ?? null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const today = useMemo(() => new Date(), []);

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  const firstDayOfWeek = useMemo(() => {
    // Monday = 0
    const day = new Date(viewYear, viewMonth, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }, [viewYear, viewMonth]);

  const days = useMemo(() => {
    const result: (Date | null)[] = [];
    // Pad leading empty cells
    for (let i = 0; i < firstDayOfWeek; i++) result.push(null);
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(new Date(viewYear, viewMonth, d));
    }
    return result;
  }, [viewYear, viewMonth, daysInMonth, firstDayOfWeek]);

  const goToPrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const goToNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const handleDayClick = useCallback(
    (date: Date) => {
      if (rangeMode && onRangeChange) {
        if (!rangeStart || (rangeStart && rangeEnd)) {
          setRangeStart(date);
          onChange(date);
        } else {
          const start = rangeStart < date ? rangeStart : date;
          const end = rangeStart < date ? date : rangeStart;
          onRangeChange(start, end);
          setRangeStart(null);
        }
      } else {
        onChange(date);
        setIsOpen(false);
      }
    },
    [rangeMode, rangeStart, rangeEnd, onChange, onRangeChange],
  );

  const formatDate = (date: Date) =>
    date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  const displayValue = useMemo(() => {
    if (rangeMode && value && rangeEnd) {
      return `${formatDate(value)} - ${formatDate(rangeEnd)}`;
    }
    if (value) return formatDate(value);
    return placeholder;
  }, [value, rangeEnd, rangeMode, placeholder]);

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        <Calendar size={16} className="text-violet-400" />
        <span>{displayValue}</span>
      </button>

      {/* Calendar dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={calendarVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute left-0 top-full mt-2 z-50 w-[300px] rounded-2xl bg-navy-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 p-4"
          >
            {/* Month/Year navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold text-white">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_NAMES.map((name) => (
                <div key={name} className="text-center text-[10px] font-medium text-slate-500 uppercase tracking-wider py-1">
                  {name}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, i) => {
                if (!date) {
                  return <div key={`empty-${i}`} className="w-full aspect-square" />;
                }

                const isToday = isSameDay(date, today);
                const isSelected = value && isSameDay(date, value);
                const isRangeEndDate = rangeEnd && isSameDay(date, rangeEnd);
                const isInRange =
                  rangeMode &&
                  ((value && rangeEnd && isBetween(date, value, rangeEnd)) ||
                    (rangeStart && hoverDate && isBetween(date, rangeStart, hoverDate)));

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => handleDayClick(date)}
                    onMouseEnter={() => rangeMode && setHoverDate(date)}
                    className={[
                      'w-full aspect-square flex items-center justify-center rounded-lg text-sm transition-all duration-150 relative',
                      isSelected || isRangeEndDate
                        ? 'bg-violet-600 text-white font-semibold shadow-lg shadow-violet-500/20'
                        : isInRange
                        ? 'bg-violet-500/15 text-violet-300'
                        : isToday
                        ? 'bg-white/10 text-white font-medium ring-1 ring-violet-500/50'
                        : 'text-slate-400 hover:bg-white/10 hover:text-white',
                    ].join(' ')}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Today shortcut */}
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setViewMonth(today.getMonth());
                  setViewYear(today.getFullYear());
                  handleDayClick(today);
                }}
                className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Hoy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
