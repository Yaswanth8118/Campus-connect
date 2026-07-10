import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import { formatDate, formatTime } from '../../lib/utils';
import { Event } from '../../types';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const isLive = event.isLive;

  return (
    <motion.div
      className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 ${
        isLive
          ? 'bg-gradient-to-br from-white to-danger-50/40 dark:from-dark-800 dark:to-danger-600/5 border-danger-200/60 dark:border-danger-600/20 hover:border-danger-300 dark:hover:border-danger-600/40 hover:shadow-lg'
          : 'bg-white dark:bg-dark-800 border-ink-100 dark:border-dark-700/60 hover:border-primary-200 dark:hover:border-primary-800/50 hover:shadow-card-hover'
      }`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
        isLive ? 'bg-gradient-to-b from-danger-500 to-danger-600' : 'bg-gradient-to-b from-primary-600 to-primary-700'
      }`} />

      <div className="pl-5 pr-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="font-heading font-bold text-base text-ink-950 dark:text-dark-50 line-clamp-1 flex-1 tracking-tight">
            {event.title}
          </h3>
          {isLive ? (
            <Badge variant="danger" dot className="shrink-0 animate-pulse">Live Now</Badge>
          ) : (
            <Badge variant="accent" dot className="shrink-0">Upcoming</Badge>
          )}
        </div>

        <p className="text-sm text-ink-500 dark:text-dark-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {event.description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-ink-100/80 dark:border-dark-700/50">
          <div className="flex items-center gap-4 text-xs text-ink-500 dark:text-dark-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-primary-500 dark:text-primary-400" />
              {formatDate(event.startTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-primary-500 dark:text-primary-400" />
              {formatTime(event.startTime)}
            </span>
          </div>
          <ArrowRight size={14} className="text-ink-300 dark:text-dark-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
