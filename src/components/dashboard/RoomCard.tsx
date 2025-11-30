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
      className="transition-all duration-200 hover:translate-y-[-2px]"
      onClick={onClick}
    >
      <CardBody>
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">
          {room.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {room.description}
        </p>
        
        <div className="flex justify-between items-center text-gray-500 text-sm">
          <div className="flex items-center">
            <Users size={14} className="mr-1" />
            <span>{room.members.length} members</span>
          </div>
          <span>Created {formatDate(room.createdAt)}</span>
        </div>
      </CardBody>
    </Card>
  );
};

export default RoomCard;