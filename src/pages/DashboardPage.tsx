import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, Radio, ArrowRight, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import { useRoomStore } from '../store/roomStore';
import EventCard from '../components/dashboard/EventCard';
import RoomCard from '../components/dashboard/RoomCard';
import { Card, CardBody } from '../components/ui/Card';

const statCard = (label: string, value: string | number, icon: React.ReactNode, color: string) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl p-5 ${color} border`}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ y: -2 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-heading font-bold mt-0.5">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">{icon}</div>
    </div>
  </motion.div>
);

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
  const userRooms = rooms.filter((room) => room.members.includes(user?.id || ''));
  const upcoming = events.filter((e) => !e.isLive);

  const roleLabel =
    user?.role === 'student'
      ? 'Student'
      : user?.role === 'team_leader'
        ? 'Team Leader'
        : user?.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : '';

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">
            Dashboard
          </h1>
          <p className="text-ink-500 dark:text-dark-400 mt-1">
            Welcome back, <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.name}</span>
          </p>
        </div>
        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-heading font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/40 self-start sm:self-auto">
          {roleLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCard(
          'Live Events',
          liveEvents.length,
          <Radio className="w-5 h-5 text-white" />,
          liveEvents.length > 0
            ? 'bg-gradient-to-br from-danger-500 to-danger-600 text-white border-danger-400/30'
            : 'bg-gradient-to-br from-paper-100 to-paper-200 dark:from-dark-800 dark:to-dark-750 text-ink-700 dark:text-dark-200 border-ink-200 dark:border-dark-600'
        )}
        {statCard(
          'Your Rooms',
          userRooms.length,
          <MessageSquare className="w-5 h-5 text-white" />,
          'bg-gradient-to-br from-primary-700 to-primary-600 text-white border-primary-500/30'
        )}
        {statCard(
          'Upcoming Events',
          upcoming.length,
          <Calendar className="w-5 h-5 text-white" />,
          'bg-gradient-to-br from-accent-600 to-accent-500 text-white border-accent-400/30'
        )}
        {statCard(
          'All Rooms',
          rooms.length,
          <Users className="w-5 h-5 text-white" />,
          'bg-gradient-to-br from-success-600 to-success-500 text-white border-success-400/30'
        )}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger-100 dark:bg-danger-600/20 text-danger-600 dark:text-danger-400 text-xs font-semibold border border-danger-200 dark:border-danger-600/30">
              <span className="w-1.5 h-1.5 rounded-full bg-danger-500 animate-pulse" />
              LIVE
            </span>
            <h2 className="font-heading font-bold text-xl text-ink-950 dark:text-dark-100">Live Now</h2>
          </div>
          {liveEvents.length > 0 && (
            <button
              onClick={() => navigate('/events')}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          )}
        </div>

        {liveEvents.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveEvents.map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card animated={false}>
            <CardBody className="flex flex-col items-center py-10 text-center">
              <Radio className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />
              <p className="text-sm text-ink-500 dark:text-dark-400">No live events at the moment.</p>
            </CardBody>
          </Card>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="font-heading font-bold text-xl text-ink-950 dark:text-dark-100">Your Rooms</h2>
            </div>
            <button
              onClick={() => navigate('/rooms')}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
            {userRooms.slice(0, 3).map((room) => (
              <motion.div key={room.id} variants={itemVariants}>
                <RoomCard room={room} onClick={() => navigate(`/rooms/${room.id}`)} />
              </motion.div>
            ))}
            {userRooms.length === 0 && (
              <Card animated={false}>
                <CardBody className="flex flex-col items-center py-8 text-center">
                  <Users className="w-9 h-9 text-ink-300 dark:text-dark-600 mb-2" />
                  <p className="text-sm text-ink-500 dark:text-dark-400">You're not a member of any rooms yet.</p>
                  <button onClick={() => navigate('/rooms')} className="mt-3 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                    Browse Rooms
                  </button>
                </CardBody>
              </Card>
            )}
          </motion.div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent-100 dark:bg-accent-950/50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-accent-600 dark:text-accent-400" />
              </div>
              <h2 className="font-heading font-bold text-xl text-ink-950 dark:text-dark-100">Upcoming Events</h2>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
            {upcoming.slice(0, 3).map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} />
              </motion.div>
            ))}
            {upcoming.length === 0 && (
              <Card animated={false}>
                <CardBody className="flex flex-col items-center py-8 text-center">
                  <TrendingUp className="w-9 h-9 text-ink-300 dark:text-dark-600 mb-2" />
                  <p className="text-sm text-ink-500 dark:text-dark-400">No upcoming events scheduled.</p>
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
