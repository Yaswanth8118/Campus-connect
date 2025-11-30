import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import { useRoomStore } from '../store/roomStore';
import EventCard from '../components/dashboard/EventCard';
import RoomCard from '../components/dashboard/RoomCard';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { events, fetchEvents, getLiveEvents } = useEventStore();
  const { rooms, fetchRooms } = useRoomStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    fetchRooms();
  }, [fetchEvents, fetchRooms]);

  const liveEvents = getLiveEvents();
  const userRooms = rooms.filter(room => room.members.includes(user?.id || ''));

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.name}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Badge variant="primary" size="md" className="mr-2">
            {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
          </Badge>
          <Badge variant="secondary" size="md">
            {userRooms.length} Rooms
          </Badge>
        </div>
      </div>

      {/* Live Events Section */}
      <section>
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Live Now</h2>
        </div>
        
        {liveEvents.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {liveEvents.map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <EventCard
                  event={event}
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-gray-500">No live events at the moment.</p>
            </CardBody>
          </Card>
        )}
      </section>

      {/* Quick Access Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Rooms */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-800 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Your Rooms</h2>
            </div>
            <button
              onClick={() => navigate('/rooms')}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {userRooms.slice(0, 3).map((room) => (
              <motion.div key={room.id} variants={itemVariants}>
                <RoomCard
                  room={room}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                />
              </motion.div>
            ))}
            
            {userRooms.length === 0 && (
              <Card>
                <CardBody className="text-center py-6">
                  <p className="text-gray-500">You're not a member of any rooms yet.</p>
                </CardBody>
              </Card>
            )}
          </motion.div>
        </section>

        {/* Upcoming Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-teal-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Upcoming Events</h2>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {events
              .filter(event => !event.isLive)
              .slice(0, 3)
              .map((event) => (
                <motion.div key={event.id} variants={itemVariants}>
                  <EventCard
                    event={event}
                    onClick={() => navigate(`/events/${event.id}`)}
                  />
                </motion.div>
              ))}
            
            {events.filter(event => !event.isLive).length === 0 && (
              <Card>
                <CardBody className="text-center py-6">
                  <p className="text-gray-500">No upcoming events scheduled.</p>
                </CardBody>
              </Card>
            )}
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;