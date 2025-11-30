import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
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
    <Card
      hoverable
      onClick={onClick}
    >
      <CardBody className="space-y-4">
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-bold text-xl text-gray-900 dark:text-dark-50 line-clamp-1 flex-1 tracking-tight">
            {event.title}
          </h3>
          {isLive ? (
            <Badge variant="danger" className="animate-pulse shrink-0">
              Live Now
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0">
              Upcoming
            </Badge>
          )}
        </div>

        <p className="text-gray-600 dark:text-dark-300 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {event.description}
        </p>

        <div className="flex items-center gap-4 pt-2 border-t border-gray-200/50 dark:border-dark-700/50 text-sm font-medium">
          <div className="flex items-center gap-2 text-gray-500 dark:text-dark-400">
            <Calendar size={16} className="text-primary-500 dark:text-primary-400" />
            <span>{formatDate(event.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-dark-400">
            <Clock size={16} className="text-primary-500 dark:text-primary-400" />
            <span>{formatTime(event.startTime)}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EventCard;
