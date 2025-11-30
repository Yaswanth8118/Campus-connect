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
      className="transition-all duration-200 hover:translate-y-[-2px]"
      onClick={onClick}
    >
      <CardBody>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 line-clamp-1">
            {event.title}
          </h3>
          {isLive ? (
            <Badge variant="danger" className="animate-pulse">Live Now</Badge>
          ) : (
            <Badge variant="secondary">Upcoming</Badge>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <Calendar size={14} className="mr-1" />
          <span className="mr-3">{formatDate(event.startTime)}</span>
          <Clock size={14} className="mr-1" />
          <span>{formatTime(event.startTime)}</span>
        </div>
      </CardBody>
    </Card>
  );
};

export default EventCard;