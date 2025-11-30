import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar } from 'lucide-react';
import { useEventStore } from '../store/eventStore';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EventCard from '../components/dashboard/EventCard';
import Badge from '../components/ui/Badge';
import { motion } from 'framer-motion';

const EventsPage: React.FC = () => {
  const { events, fetchEvents } = useEventStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  const canCreateEvent = user?.role === 'admin' || 
                          user?.role === 'coordinator' || 
                          user?.role === 'faculty';
  
  // Filter events based on search query
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Separate events into live and upcoming
  const liveEvents = filteredEvents.filter(event => event.isLive);
  const upcomingEvents = filteredEvents.filter(event => !event.isLive);
  
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
          <h1 className="text-2xl font-bold text-gray-800">Events</h1>
          <p className="text-gray-600">View and participate in campus events</p>
        </div>
        {canCreateEvent && (
          <Button 
            className="mt-4 md:mt-0"
            icon={<Plus size={18} />}
            onClick={() => navigate('/events/new')}
          >
            Create Event
          </Button>
        )}
      </div>
      
      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
          fullWidth
        />
      </div>
      
      {/* Live Events */}
      <section>
        <div className="flex items-center mb-4">
          <Badge variant="danger" className="mr-2 animate-pulse">Live</Badge>
          <h2 className="text-xl font-semibold text-gray-800">Live Events</h2>
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
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">
              {searchQuery 
                ? "No matching live events found." 
                : "No live events at the moment."}
            </p>
          </div>
        )}
      </section>
      
      {/* Upcoming Events */}
      <section>
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-blue-800 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
        </div>
        
        {upcomingEvents.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {upcomingEvents.map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <EventCard
                  event={event}
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">
              {searchQuery 
                ? "No matching upcoming events found." 
                : "No upcoming events scheduled."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default EventsPage;