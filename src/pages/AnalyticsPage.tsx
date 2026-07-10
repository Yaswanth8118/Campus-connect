import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Calendar, MessageSquare, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';

export function AnalyticsPage() {
  const { user } = useAuthStore();

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ink-500 dark:text-dark-400">Access denied. Admin only.</p>
      </div>
    );
  }

  const metrics = [
    { label: 'Total Users', value: '2,847', change: '+12%', icon: Users, color: 'from-primary-600 to-primary-700' },
    { label: 'Active Rooms', value: '156', change: '+8%', icon: MessageSquare, color: 'from-accent-500 to-accent-600' },
    { label: 'Events This Month', value: '42', change: '+23%', icon: Calendar, color: 'from-gold-500 to-gold-600' },
    { label: 'Messages Today', value: '1,204', change: '+5%', icon: Activity, color: 'from-info-500 to-info-600' },
  ];

  const activityData = [
    { day: 'Mon', value: 65 }, { day: 'Tue', value: 78 }, { day: 'Wed', value: 92 },
    { day: 'Thu', value: 85 }, { day: 'Fri', value: 70 }, { day: 'Sat', value: 45 }, { day: 'Sun', value: 30 },
  ];
  const maxVal = Math.max(...activityData.map((d) => d.value));

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Analytics</h1>
        <p className="text-ink-500 dark:text-dark-400 mt-1">Platform usage and engagement metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} className={`rounded-2xl p-5 bg-gradient-to-br ${m.color} text-white border border-white/10`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-80 uppercase">{m.label}</p>
                <p className="text-2xl font-heading font-bold mt-1">{m.value}</p>
                <p className="text-xs mt-1 opacity-90 flex items-center gap-1">
                  <TrendingUp size={12} /> {m.change} this month
                </p>
              </div>
              <m.icon className="w-10 h-10 opacity-30" />
            </div>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart3 size={18} className="text-primary-600" />
            <h2 className="font-heading font-semibold text-lg text-ink-900 dark:text-dark-50">Weekly Activity</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-end gap-3 h-48">
            {activityData.map((d, i) => (
              <motion.div key={d.day} className="flex-1 flex flex-col items-center gap-2"
                initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4 }} style={{ transformOrigin: 'bottom' }}>
                <div className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all"
                  style={{ height: `${(d.value / maxVal) * 100}%` }} />
                <span className="text-xs text-ink-500 dark:text-dark-400 font-medium">{d.day}</span>
              </motion.div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
