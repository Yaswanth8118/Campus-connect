import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Room } from '../../types';
import { formatDate } from '../../lib/utils';

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
  return (
    <Card
      hoverable
      onClick={onClick}
    >
      <CardBody className="space-y-4">
        <h3 className="font-bold text-xl text-gray-900 dark:text-dark-50 line-clamp-1 tracking-tight">
          {room.name}
        </h3>

        <p className="text-gray-600 dark:text-dark-300 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {room.description}
        </p>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200/50 dark:border-dark-700/50">
          <div className="flex items-center gap-2 text-gray-500 dark:text-dark-400 text-sm font-medium">
            <Users size={16} className="text-primary-500 dark:text-primary-400" />
            <span>{room.members.length} members</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-dark-400">
            {formatDate(room.createdAt)}
          </span>
        </div>
      </CardBody>
    </Card>
  );
};

export default RoomCard;
