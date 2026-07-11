import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, GraduationCap, CalendarDays, Building, BookOpen, DoorOpen } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { dbCount } from '../lib/supabase';

const METRICS = [
  { key: 'students', label: 'Students', icon: GraduationCap, color: 'from-primary-600 to-primary-700' },
  { key: 'faculty', label: 'Faculty', icon: Users, color: 'from-accent-500 to-accent-600' },
  { key: 'departments', label: 'Departments', icon: Building, color: 'from-info-500 to-info-600' },
  { key: 'subjects', label: 'Subjects', icon: BookOpen, color: 'from-gold-500 to-gold-600' },
  { key: 'rooms', label: 'Rooms', icon: DoorOpen, color: 'from-ink-600 to-ink-800' },
  { key: 'events', label: 'Events', icon: CalendarDays, color: 'from-success-500 to-success-600' },
];

export function AnalyticsPage() {
  const { user } = useAuthStore();
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    (async () => {
      const entries = await Promise.all(METRICS.map(async (m) => [m.key, await dbCount(m.key)] as const));
      setCounts(Object.fromEntries(entries));
    })().catch(() => setCounts({}));
  }, []);

  if (user?.role !== 'admin') {
    return <div className="flex items-center justify-center h-64"><p className="text-ink-500 dark:text-dark-400">Access denied. Admin only.</p></div>;
  }

  const loading = counts === null;
  const max = counts ? Math.max(1, ...METRICS.map((m) => counts[m.key] ?? 0)) : 1;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Analytics</h1>
        <p className="text-ink-500 dark:text-dark-400 mt-1">Live platform metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map((m, i) => (
          <motion.div key={m.key} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${m.color}`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-80 uppercase">{m.label}</p>
                <p className="text-2xl font-heading font-bold mt-1">{loading ? '…' : counts?.[m.key] ?? 0}</p>
              </div>
              <m.icon className="w-9 h-9 opacity-30" />
            </div>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart3 size={18} className="text-primary-600" />
            <h2 className="font-heading font-semibold text-lg text-ink-900 dark:text-dark-50">Entity Distribution</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-end gap-3 h-48">
            {METRICS.map((m, i) => (
              <motion.div key={m.key} className="flex-1 flex flex-col items-center gap-2"
                initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ delay: i * 0.06 }} style={{ transformOrigin: 'bottom' }}>
                <div className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg min-h-[4px]"
                  style={{ height: `${((counts?.[m.key] ?? 0) / max) * 100}%` }} />
                <span className="text-[11px] text-ink-500 dark:text-dark-400 font-medium">{m.label}</span>
              </motion.div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
