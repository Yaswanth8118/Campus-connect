import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, GraduationCap, Building, BookOpen, CalendarDays, ClipboardCheck, Award } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { dbCount } from '../lib/supabase';

const CARDS = [
  { key: 'students', label: 'Students', icon: GraduationCap, color: 'from-primary-600 to-primary-700' },
  { key: 'faculty', label: 'Faculty', icon: Users, color: 'from-accent-500 to-accent-600' },
  { key: 'departments', label: 'Departments', icon: Building, color: 'from-info-500 to-info-600' },
  { key: 'subjects', label: 'Subjects', icon: BookOpen, color: 'from-gold-500 to-gold-600' },
  { key: 'events', label: 'Events', icon: CalendarDays, color: 'from-success-500 to-success-600' },
  { key: 'attendance', label: 'Attendance Records', icon: ClipboardCheck, color: 'from-ink-600 to-ink-800' },
  { key: 'grades', label: 'Grade Records', icon: Award, color: 'from-primary-500 to-primary-600' },
];

export function ReportsPage() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        CARDS.map(async (c) => [c.key, await dbCount(c.key)] as const)
      );
      setCounts(Object.fromEntries(entries));
    })().catch(() => setCounts({}));
  }, []);

  const loading = counts === null;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Reports</h1>
        <p className="text-ink-500 dark:text-dark-400 mt-1">Institution-wide summary across all modules</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((c, i) => (
          <motion.div key={c.key} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${c.color}`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-80 uppercase">{c.label}</p>
                <p className="text-2xl font-heading font-bold mt-1">{loading ? '…' : counts?.[c.key] ?? 0}</p>
              </div>
              <c.icon className="w-9 h-9 opacity-30" />
            </div>
          </motion.div>
        ))}
      </div>

      <Card animated={false}>
        <CardBody className="flex items-center gap-3 text-sm text-ink-500 dark:text-dark-400">
          <FileText size={18} className="text-primary-500" />
          These figures are computed live from the database and reflect current, permission-scoped data.
        </CardBody>
      </Card>
    </div>
  );
}
