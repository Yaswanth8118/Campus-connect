import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Radio, Filter } from 'lucide-react';
import { useEventStore } from '../store/eventStore';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import EventCard from '../components/dashboard/EventCard';
import { Card, CardBody } from '../components/ui/Card';
import { motion } from 'framer-motion';

const EventsPage: React.FC = () => {
  const { events, fetchEvents } = useEventStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const canCreate = ['admin', 'coordinator', 'team_leader'].includes(user?.role ?? '');

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const live = filtered.filter((e) => e.isLive);
  const upcoming = filtered.filter((e) => !e.isLive);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

  const EmptyState = ({ forLive }: { forLive: boolean }) => (
    <Card animated={false}>
      <CardBody className="flex flex-col items-center py-10 text-center">
        {forLive
          ? <Radio className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />
          : <Calendar className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />}
        <p className="text-sm text-ink-500 dark:text-dark-400">
          {searchQuery
            ? `No matching ${forLive ? 'live' : 'upcoming'} events found.`
            : forLive ? 'No live events at the moment.' : 'No upcoming events scheduled.'}
        </p>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Events</h1>
          <p className="text-ink-500 dark:text-dark-400 mt-1">View and participate in campus events</p>
        </div>
        {canCreate && (
          <Button icon={<Plus size={16} />} onClick={() => navigate('/events/new')}>
            Create Event
          </Button>
        )}
      </div>

      <div className="flex gap-3 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 dark:text-dark-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl placeholder:text-ink-400 dark:placeholder:text-dark-400 text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all"
          />
        </div>
        <button className="p-2.5 rounded-xl border border-ink-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:bg-paper-100 dark:hover:bg-dark-750 transition-colors text-ink-500 dark:text-dark-300">
          <Filter size={18} />
        </button>
      </div>

      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger-100 dark:bg-danger-600/20 text-danger-600 dark:text-danger-400 text-xs font-semibold border border-danger-200 dark:border-danger-600/30">
            <span className="w-1.5 h-1.5 rounded-full bg-danger-500 animate-pulse" />
            LIVE
          </span>
          <h2 className="font-heading font-bold text-xl text-ink-950 dark:text-dark-100">Live Events</h2>
          {live.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-danger-100 dark:bg-danger-600/20 text-danger-600 dark:text-danger-400 text-xs font-bold">{live.length}</span>
          )}
        </div>
        {live.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.map((e) => (
              <motion.div key={e.id} variants={itemVariants}>
                <EventCard event={e} onClick={() => navigate(`/events/${e.id}`)} />
              </motion.div>
            ))}
          </motion.div>
        ) : <EmptyState forLive />}
      </section>

      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <Calendar className="w-5 h-5 text-accent-500 dark:text-accent-400" />
          <h2 className="font-heading font-bold text-xl text-ink-950 dark:text-dark-100">Upcoming Events</h2>
          {upcoming.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 text-xs font-bold">{upcoming.length}</span>
          )}
        </div>
        {upcoming.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((e) => (
              <motion.div key={e.id} variants={itemVariants}>
                <EventCard event={e} onClick={() => navigate(`/events/${e.id}`)} />
              </motion.div>
            ))}
          </motion.div>
        ) : <EmptyState forLive={false} />}
      </section>
    </div>
  );
};

export default EventsPage;
