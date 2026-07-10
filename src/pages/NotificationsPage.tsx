import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Calendar, MessageSquare, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { isSupabaseConfigured, dbSelect, dbUpdate } from '../lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

export function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isSupabaseConfigured() && user?.id) {
        try {
          const data = await dbSelect('notifications', `user_id=eq.${user.id}&select=*&order=created_at.desc`);
          setNotifications(data);
        } catch { }
      } else {
        setNotifications([
          { id: '1', title: 'New Event: Tech Seminar', message: 'A new tech seminar has been scheduled for next week.', is_read: false, link: '/events', created_at: new Date(Date.now() - 300000).toISOString() },
          { id: '2', title: 'Room Invitation', message: 'You have been invited to join "Project Alpha" room.', is_read: false, link: '/rooms', created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: '3', title: 'Grade Posted', message: 'Your grade for Mathematics has been posted.', is_read: true, link: '/grades', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: '4', title: 'Assignment Due', message: 'Data Structures assignment is due tomorrow.', is_read: true, link: '/assignments', created_at: new Date(Date.now() - 172800000).toISOString() },
        ]);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('event')) return Calendar;
    if (title.toLowerCase().includes('room')) return MessageSquare;
    if (title.toLowerCase().includes('member') || title.toLowerCase().includes('invite')) return Users;
    return Bell;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Notifications</h1>
          <p className="text-ink-500 dark:text-dark-400 mt-1">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" icon={<CheckCheck size={14} />} onClick={markAllRead}>
            Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <Card animated={false}>
          <CardBody className="flex flex-col items-center py-12 text-center">
            <Bell className="w-12 h-12 text-ink-300 dark:text-dark-600 mb-3" />
            <p className="text-sm text-ink-500 dark:text-dark-400">No notifications yet</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = getIcon(n.title);
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card animated={false}>
                  <CardBody className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        n.is_read ? 'bg-ink-100 dark:bg-dark-800' : 'bg-primary-100 dark:bg-primary-950/40'
                      }`}>
                        <Icon size={18} className={n.is_read ? 'text-ink-400 dark:text-dark-400' : 'text-primary-600 dark:text-primary-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                          <p className={`text-sm font-semibold ${n.is_read ? 'text-ink-600 dark:text-dark-300' : 'text-ink-900 dark:text-dark-50'}`}>
                            {n.title}
                          </p>
                        </div>
                        <p className="text-xs text-ink-500 dark:text-dark-400 mt-1">{n.message}</p>
                      </div>
                      <span className="text-xs text-ink-400 dark:text-dark-500 flex-shrink-0">{timeAgo(n.created_at)}</span>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
