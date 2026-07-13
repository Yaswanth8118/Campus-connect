import { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal, { Select } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  attendanceRepo, attendanceWithNames, studentsWithUser, subjectsWithNames, myFacultyId,
} from '../services/entities';
import { formatDate } from '../lib/utils';

const STATUSES = ['present', 'absent', 'late', 'excused'];
const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({ student_id: '', subject_id: '', date: today(), status: 'present', remarks: '' });
const statusVariant = (s: string) =>
  (s === 'present' ? 'success' : s === 'late' ? 'warning' : s === 'excused' ? 'accent' : 'danger') as any;

export function CoordinatorAttendancePage() {
  const { user } = useAuthStore();
  const canManage = user?.role === 'admin' || user?.role === 'faculty' || user?.role === 'coordinator';
  const [rows, setRows] = useState<any[] | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  const load = () => attendanceWithNames().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    load();
    studentsWithUser().then(setStudents).catch(() => setStudents([]));
    subjectsWithNames().then(setSubjects).catch(() => setSubjects([]));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.subject_id) { toast.error('Student and subject are required'); return; }
    setSaving(true);
    try {
      const faculty_id = user?.role === 'faculty' ? await myFacultyId(user.id) : null;
      await attendanceRepo.create({ ...form, ...(faculty_id ? { faculty_id } : {}) });
      toast.success('Attendance marked');
      setOpen(false);
      setForm(empty());
      load();
    } catch { toast.error('Save failed — check your permissions (or duplicate entry)'); }
    finally { setSaving(false); }
  };

  const remove = async (r: any) => {
    if (!confirm('Delete this record?')) return;
    try { await attendanceRepo.remove(r.id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Manage Attendance</h1>
          <p className="text-ink-500 dark:text-dark-400 mt-1">Mark and review student attendance</p>
        </div>
        {canManage && <Button icon={<Plus size={16} />} onClick={() => { setForm(empty()); setOpen(true); }}>Mark Attendance</Button>}
      </div>

      {rows === null ? (
        <div className="py-16 flex justify-center"><div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <Card animated={false}><CardBody className="flex flex-col items-center py-14 text-center">
          <ClipboardCheck className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />
          <p className="text-sm text-ink-500 dark:text-dark-400">No attendance records yet.</p>
        </CardBody></Card>
      ) : (
        <Card animated={false}><CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-dark-700 text-left text-xs uppercase text-ink-500 dark:text-dark-400">
                <th className="py-3 px-5">Student</th><th className="py-3 px-5">Subject</th><th className="py-3 px-5">Date</th><th className="py-3 px-5">Status</th>
                {canManage && <th className="py-3 px-5"></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink-50 dark:border-dark-800 hover:bg-paper-50 dark:hover:bg-dark-850">
                  <td className="py-3 px-5 text-ink-900 dark:text-dark-100">{r.students?.users?.full_name ?? r.students?.roll_number ?? '—'}</td>
                  <td className="py-3 px-5 font-medium text-ink-900 dark:text-dark-100">{r.subjects?.subject_name ?? '—'}</td>
                  <td className="py-3 px-5 text-ink-600 dark:text-dark-300">{formatDate(r.date)}</td>
                  <td className="py-3 px-5"><Badge variant={statusVariant(r.status)} size="sm">{r.status}</Badge></td>
                  {canManage && (
                    <td className="py-3 px-5 text-right">
                      <button onClick={() => remove(r)} className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-600/10"><Trash2 size={14} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody></Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Mark Attendance">
        <form onSubmit={save} className="space-y-4">
          <Select label="Student" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
            <option value="">— Select student —</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.users?.full_name ?? s.roll_number} ({s.roll_number})</option>)}
          </Select>
          <Select label="Subject" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })}>
            <option value="">— Select subject —</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
          </Select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} fullWidth />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <Input label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Optional" fullWidth />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
