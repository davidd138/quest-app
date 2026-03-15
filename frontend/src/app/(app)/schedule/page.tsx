'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  CloudMoon,
  Compass,
} from 'lucide-react';
import QuestScheduleCard, {
  type ScheduledQuest,
  type TimeSlot,
} from '@/components/quest/QuestScheduleCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

type ViewMode = 'week' | 'month';

const TIME_SLOTS: { key: TimeSlot; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'morning', label: 'Morning', icon: Sun, color: 'text-amber-400' },
  { key: 'afternoon', label: 'Afternoon', icon: Sunset, color: 'text-emerald-400' },
  { key: 'evening', label: 'Evening', icon: Moon, color: 'text-violet-400' },
  { key: 'night', label: 'Night', icon: CloudMoon, color: 'text-blue-400' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(baseDate: Date): Date[] {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(d);
    date.setDate(d.getDate() + i);
    return date;
  });
}

function getMonthDates(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

// Placeholder quest sidebar items
const AVAILABLE_QUESTS = [
  { id: 'aq1', title: 'Mystery of the Lost Library', category: 'mystery' },
  { id: 'aq2', title: 'Nature Trail Explorer', category: 'nature' },
  { id: 'aq3', title: 'Urban Street Art Tour', category: 'urban' },
  { id: 'aq4', title: 'Culinary Heritage Walk', category: 'culinary' },
];

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [baseDate, setBaseDate] = useState(new Date());
  const [scheduledEvents, setScheduledEvents] = useLocalStorage<ScheduledQuest[]>(
    'quest-schedule',
    [],
  );
  const [dragQuest, setDragQuest] = useState<string | null>(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const today = useMemo(() => new Date(), []);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);

  const monthDates = useMemo(
    () => getMonthDates(baseDate.getFullYear(), baseDate.getMonth()),
    [baseDate],
  );

  const navigatePrev = useCallback(() => {
    setBaseDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'week') d.setDate(d.getDate() - 7);
      else d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setBaseDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'week') d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, [viewMode]);

  const eventsForDate = useCallback(
    (date: Date) => {
      const key = formatDateKey(date);
      return scheduledEvents.filter((e) => e.date.startsWith(key));
    },
    [scheduledEvents],
  );

  const handleCancelEvent = useCallback(
    (eventId: string) => {
      setScheduledEvents((prev) => prev.filter((e) => e.id !== eventId));
    },
    [setScheduledEvents],
  );

  const handleDrop = useCallback(
    (date: Date, timeSlot: TimeSlot) => {
      if (!dragQuest) return;
      const quest = AVAILABLE_QUESTS.find((q) => q.id === dragQuest);
      if (!quest) return;

      const newEvent: ScheduledQuest = {
        id: `sched-${Date.now()}`,
        questId: quest.id,
        questTitle: quest.title,
        questCategory: quest.category,
        date: formatDateKey(date),
        timeSlot,
        reminder: true,
      };

      setScheduledEvents((prev) => [...prev, newEvent]);
      setDragQuest(null);
    },
    [dragQuest, setScheduledEvents],
  );

  const handleAiSuggest = useCallback(() => {
    setAiSuggesting(true);
    // Simulate AI suggestion
    setTimeout(() => {
      const suggestions: ScheduledQuest[] = weekDates
        .filter((d) => d >= today)
        .slice(0, 3)
        .map((date, i) => ({
          id: `ai-${Date.now()}-${i}`,
          questId: AVAILABLE_QUESTS[i % AVAILABLE_QUESTS.length].id,
          questTitle: AVAILABLE_QUESTS[i % AVAILABLE_QUESTS.length].title,
          questCategory: AVAILABLE_QUESTS[i % AVAILABLE_QUESTS.length].category,
          date: formatDateKey(date),
          timeSlot: (['morning', 'afternoon', 'evening'] as TimeSlot[])[i % 3],
          reminder: true,
        }));

      setScheduledEvents((prev) => [...prev, ...suggestions]);
      setAiSuggesting(false);
    }, 1500);
  }, [weekDates, today, setScheduledEvents]);

  const monthLabel = baseDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-violet-400" />
            Quest Schedule
          </h1>
          <p className="text-slate-400 mt-1">Plan your adventures ahead of time</p>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Suggest */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAiSuggest}
            disabled={aiSuggesting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-emerald-600 text-white text-sm font-medium disabled:opacity-50 transition-opacity"
          >
            <Sparkles size={16} className={aiSuggesting ? 'animate-spin' : ''} />
            {aiSuggesting ? 'Planning...' : 'Plan my week'}
          </motion.button>

          {/* View toggle */}
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
            {(['week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === mode
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <button
          onClick={navigatePrev}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-heading text-xl font-semibold text-white">
          {viewMode === 'week' ? weekLabel : monthLabel}
        </h2>
        <button
          onClick={navigateNext}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar area */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          {viewMode === 'week' ? (
            /* Week View */
            <div className="space-y-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, i) => {
                  const isT = isSameDay(date, today);
                  const isPast = date < today && !isT;
                  return (
                    <div
                      key={i}
                      className={`text-center py-3 rounded-xl transition-all ${
                        isT
                          ? 'bg-violet-600/20 border border-violet-500/30'
                          : isPast
                            ? 'opacity-50'
                            : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <p className="text-xs text-slate-500">{WEEKDAYS[i]}</p>
                      <p
                        className={`text-lg font-bold ${
                          isT ? 'text-violet-400' : 'text-white'
                        }`}
                      >
                        {date.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Time slot rows */}
              {TIME_SLOTS.map((slot) => (
                <div key={slot.key}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <slot.icon size={14} className={slot.color} />
                    <span className="text-xs font-medium text-slate-500">{slot.label}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((date, i) => {
                      const dayEvents = eventsForDate(date).filter(
                        (e) => e.timeSlot === slot.key,
                      );
                      const isPast = date < today && !isSameDay(date, today);
                      return (
                        <div
                          key={i}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('ring-2', 'ring-violet-500/50');
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove('ring-2', 'ring-violet-500/50');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('ring-2', 'ring-violet-500/50');
                            handleDrop(date, slot.key);
                          }}
                          className={`min-h-[60px] rounded-xl p-1.5 border border-dashed transition-all ${
                            isPast
                              ? 'border-slate-800 bg-navy-900/30 opacity-50'
                              : 'border-slate-700/30 bg-white/[0.02] hover:border-violet-500/20'
                          }`}
                        >
                          {dayEvents.map((ev) => (
                            <div
                              key={ev.id}
                              className="text-xs p-1.5 rounded-lg bg-white/5 text-slate-300 truncate mb-1 border border-white/5"
                            >
                              {ev.questTitle}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Month View */
            <div className="glass rounded-2xl p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-xs text-slate-500 py-2 font-medium">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDates.map((date, i) => {
                  if (!date) {
                    return <div key={i} className="aspect-square" />;
                  }
                  const isT = isSameDay(date, today);
                  const isPast = date < today && !isT;
                  const dayEvents = eventsForDate(date);
                  return (
                    <div
                      key={i}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('ring-1', 'ring-violet-500/50');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('ring-1', 'ring-violet-500/50');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('ring-1', 'ring-violet-500/50');
                        handleDrop(date, 'morning');
                      }}
                      className={`aspect-square rounded-xl p-1.5 text-center transition-all cursor-default ${
                        isT
                          ? 'bg-violet-600/20 border border-violet-500/30'
                          : isPast
                            ? 'opacity-40'
                            : 'bg-white/[0.02] border border-transparent hover:border-white/10'
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          isT ? 'text-violet-400' : 'text-slate-300'
                        }`}
                      >
                        {date.getDate()}
                      </p>
                      {dayEvents.length > 0 && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <div
                              key={ev.id}
                              className="w-1.5 h-1.5 rounded-full bg-violet-400"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scheduled events list below calendar */}
          <div className="mt-6 space-y-3">
            <h3 className="font-heading text-lg font-semibold text-white">Upcoming Scheduled</h3>
            <AnimatePresence>
              {scheduledEvents
                .filter((e) => new Date(e.date) >= today || isSameDay(new Date(e.date), today))
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((event) => (
                  <QuestScheduleCard
                    key={event.id}
                    event={event}
                    onCancel={handleCancelEvent}
                  />
                ))}
            </AnimatePresence>
            {scheduledEvents.filter(
              (e) => new Date(e.date) >= today || isSameDay(new Date(e.date), today),
            ).length === 0 && (
              <div className="glass rounded-xl p-8 text-center">
                <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No quests scheduled yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Drag quests from the sidebar to plan your week
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quest sidebar for dragging */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="font-heading text-lg font-semibold text-white">Available Quests</h3>
          <p className="text-xs text-slate-500">Drag a quest onto the calendar</p>
          <div className="space-y-2">
            {AVAILABLE_QUESTS.map((quest) => (
              <div
                key={quest.id}
                draggable
                onDragStart={() => setDragQuest(quest.id)}
                onDragEnd={() => setDragQuest(null)}
                className={`glass rounded-xl p-3 cursor-grab active:cursor-grabbing border transition-all ${
                  dragQuest === quest.id
                    ? 'border-violet-500/40 bg-violet-500/10'
                    : 'border-transparent hover:border-white/10'
                }`}
              >
                <p className="text-sm font-medium text-white truncate">{quest.title}</p>
                <p className="text-xs text-slate-500 capitalize mt-0.5">{quest.category}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
