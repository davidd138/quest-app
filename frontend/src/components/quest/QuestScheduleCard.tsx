'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Bell, X, Play, Compass } from 'lucide-react';
import Link from 'next/link';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ScheduledQuest {
  id: string;
  questId: string;
  questTitle: string;
  questCategory?: string;
  date: string; // ISO date string
  timeSlot: TimeSlot;
  reminder: boolean;
}

interface QuestScheduleCardProps {
  event: ScheduledQuest;
  onCancel?: (id: string) => void;
  className?: string;
}

const timeSlotConfig: Record<
  TimeSlot,
  { label: string; time: string; color: string; border: string; bg: string; icon: string }
> = {
  morning: {
    label: 'Morning',
    time: '8:00 - 12:00',
    color: 'text-amber-400',
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
  },
  afternoon: {
    label: 'Afternoon',
    time: '12:00 - 17:00',
    color: 'text-emerald-400',
    border: 'border-emerald-500/25',
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
  },
  evening: {
    label: 'Evening',
    time: '17:00 - 21:00',
    color: 'text-violet-400',
    border: 'border-violet-500/25',
    bg: 'bg-violet-500/10',
    icon: 'text-violet-400',
  },
  night: {
    label: 'Night',
    time: '21:00 - 00:00',
    color: 'text-blue-400',
    border: 'border-blue-500/25',
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
  },
};

const QuestScheduleCard: React.FC<QuestScheduleCardProps> = ({
  event,
  onCancel,
  className = '',
}) => {
  const config = timeSlotConfig[event.timeSlot];

  const isPast = useMemo(() => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  }, [event.date]);

  const isToday = useMemo(() => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return (
      eventDate.getFullYear() === today.getFullYear() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getDate() === today.getDate()
    );
  }, [event.date]);

  const formattedDate = useMemo(() => {
    const d = new Date(event.date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, [event.date]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isPast ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="schedule-card"
      className={[
        'glass rounded-xl p-4 border transition-all duration-200',
        config.border,
        isPast ? 'opacity-50 grayscale' : 'hover:shadow-lg hover:shadow-black/10',
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Time slot indicator */}
          <div
            className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}
          >
            <Compass size={18} className={config.icon} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-semibold text-white text-sm truncate">
              {event.questTitle}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className={config.color}>{config.label}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock size={11} />
                {config.time}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {event.reminder && (
            <div
              className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center"
              title="Reminder set"
            >
              <Bell size={13} className="text-violet-400" />
            </div>
          )}

          {onCancel && !isPast && (
            <button
              onClick={() => onCancel(event.id)}
              className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              aria-label="Cancel scheduled quest"
              data-testid="cancel-button"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Action */}
      {isToday && !isPast && (
        <Link href={`/quest-play/${event.questId}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-emerald-600 text-white text-xs font-medium cursor-pointer"
          >
            <Play size={13} />
            Start Now
          </motion.div>
        </Link>
      )}

      {!isToday && !isPast && (
        <div className="mt-3 text-center text-xs text-slate-500">
          Scheduled for {formattedDate}
        </div>
      )}
    </motion.div>
  );
};

export default QuestScheduleCard;
