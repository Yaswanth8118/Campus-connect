import React from 'react';
import { Users, ArrowRight, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { Room } from '../../types';
import { formatDate } from '../../lib/utils';

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden border cursor-pointer bg-white dark:bg-dark-800 border-ink-100 dark:border-dark-700/60 hover:border-primary-200 dark:hover:border-primary-800/50 hover:shadow-card-hover transition-all duration-300"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-primary-600 to-accent-500" />

      <div className="pl-5 pr-5 pt-4 pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Hash size={14} className="text-primary-400 dark:text-primary-500 flex-shrink-0" />
          <h3 className="font-heading font-bold text-base text-ink-950 dark:text-dark-50 line-clamp-1 tracking-tight">
            {room.name}
          </h3>
        </div>

        <p className="text-sm text-ink-500 dark:text-dark-400 line-clamp-2 leading-relaxed min-h-[2.5rem] ml-5">
          {room.description}
        </p>

        <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-ink-100/80 dark:border-dark-700/50">
          <div className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-dark-400 font-medium">
            <Users size={13} className="text-primary-500 dark:text-primary-400" />
            <span>{room.members.length} member{room.members.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-400 dark:text-dark-500">{formatDate(room.createdAt)}</span>
            <ArrowRight size={14} className="text-ink-300 dark:text-dark-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;
