import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useRoomStore } from '../store/roomStore';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import RoomCard from '../components/dashboard/RoomCard';
import { motion } from 'framer-motion';

const RoomsPage: React.FC = () => {
  const { rooms, fetchRooms } = useRoomStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);
  
  const canCreateRoom = user?.role === 'admin' || 
                         user?.role === 'coordinator' || 
                         user?.role === 'faculty';
  
  // Filter rooms based on search query
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Separate rooms where user is a member
  const userRooms = filteredRooms.filter(room => room.members.includes(user?.id || ''));
  const otherRooms = filteredRooms.filter(room => !room.members.includes(user?.id || ''));
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rooms</h1>
          <p className="text-gray-600">Browse and join rooms for communication and events</p>
        </div>
        {canCreateRoom && (
          <Button 
            className="mt-4 md:mt-0"
            icon={<Plus size={18} />}
            onClick={() => navigate('/rooms/new')}
          >
            Create Room
          </Button>
        )}
      </div>
      
      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
          fullWidth
        />
      </div>
      
      {/* Your Rooms */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Rooms</h2>
        {userRooms.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {userRooms.map((room) => (
              <motion.div key={room.id} variants={itemVariants}>
                <RoomCard
                  room={room}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">
              {searchQuery 
                ? "No matching rooms found where you're a member." 
                : "You're not a member of any rooms yet."}
            </p>
          </div>
        )}
      </section>
      
      {/* Discover Rooms */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Discover Rooms</h2>
        {otherRooms.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {otherRooms.map((room) => (
              <motion.div key={room.id} variants={itemVariants}>
                <RoomCard
                  room={room}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">
              {searchQuery 
                ? "No matching rooms found." 
                : "No other rooms available to discover."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default RoomsPage;