import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { attendanceWithNames } from '../services/entities';
import { formatDate } from '../lib/utils';

const statusVariant = (s: string) =>
  (s === 'present' ? 'success' : s === 'late' ? 'warning' : s === 'excused' ? 'accent' : 'danger') as any;

const AttendancePage: React.FC = () => {
  const [rows, setRows] = useState<any[] | null>(null);

  useEffect(() => {
    attendanceWithNames().then(setRows).catch(() => setRows([]));
  }, []);

  const present = (rows ?? []).filter((r) => r.status === 'present' || r.status === 'late').length;
  const pct = rows && rows.length ? Math.round((present / rows.length) * 100) : null;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">My Attendance</h1>
        <p className="text-ink-500 dark:text-dark-400 mt-1">Your attendance record across subjects</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <p className="text-xs uppercase opacity-80">Attendance</p>
          <p className="text-2xl font-heading font-bold mt-1">{pct === null ? '—' : `${pct}%`}</p>
        </div>
        <div className="rounded-2xl p-5 bg-gradient-to-br from-accent-500 to-accent-600 text-white">
          <p className="text-xs uppercase opacity-80">Records</p>
          <p className="text-2xl font-heading font-bold mt-1">{rows?.length ?? '—'}</p>
        </div>
      </div>

      {rows === null ? (
        <div className="py-16 flex justify-center"><div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <Card animated={false}><CardBody className="flex flex-col items-center py-14 text-center">
          <ClipboardCheck className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />
          <p className="text-sm text-ink-500 dark:text-dark-400">No attendance recorded yet.</p>
        </CardBody></Card>
      ) : (
        <Card animated={false}><CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-dark-700 text-left text-xs uppercase text-ink-500 dark:text-dark-400">
                <th className="py-3 px-5">Subject</th><th className="py-3 px-5">Date</th><th className="py-3 px-5">Status</th><th className="py-3 px-5">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink-50 dark:border-dark-800 hover:bg-paper-50 dark:hover:bg-dark-850">
                  <td className="py-3 px-5 font-medium text-ink-900 dark:text-dark-100">{r.subjects?.subject_name ?? '—'}</td>
                  <td className="py-3 px-5 text-ink-600 dark:text-dark-300">{formatDate(r.date)}</td>
                  <td className="py-3 px-5"><Badge variant={statusVariant(r.status)} size="sm">{r.status}</Badge></td>
                  <td className="py-3 px-5 text-ink-500 dark:text-dark-400">{r.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody></Card>
      )}
    </div>
  );
};

export default AttendancePage;
