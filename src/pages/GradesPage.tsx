import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal, { Select } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  gradesRepo, gradesWithNames, studentsWithUser, subjectsWithNames, myFacultyId, DBGrade,
} from '../services/entities';

const GRADES = ['A+', 'A', 'B', 'C', 'D', 'E', 'F'];
const empty = { student_id: '', subject_id: '', internal_marks: 0, external_marks: 0, assignment_marks: 0, lab_marks: 0, final_grade: 'A', cgpa: 0 };
const gradeVariant = (g: string) => (['A+', 'A'].includes(g) ? 'success' : ['B', 'C'].includes(g) ? 'primary' : g === 'D' ? 'warning' : 'danger') as any;

export function GradesPage() {
  const { user } = useAuthStore();
  const canManage = user?.role === 'admin' || user?.role === 'faculty';
  const isStudent = user?.role === 'student';
  const [rows, setRows] = useState<any[] | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => gradesWithNames('&order=updated_at.desc').then(setRows).catch(() => setRows([]));
  useEffect(() => {
    load();
    if (canManage) {
      studentsWithUser().then(setStudents).catch(() => setStudents([]));
      subjectsWithNames().then(setSubjects).catch(() => setSubjects([]));
    }
  }, [canManage]);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (g: DBGrade) => {
    setEditing(g);
    setForm({ student_id: g.student_id, subject_id: g.subject_id, internal_marks: g.internal_marks, external_marks: g.external_marks, assignment_marks: g.assignment_marks, lab_marks: g.lab_marks, final_grade: g.final_grade || 'A', cgpa: g.cgpa });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.subject_id) { toast.error('Student and subject are required'); return; }
    setSaving(true);
    try {
      const faculty_id = user?.role === 'faculty' ? await myFacultyId(user.id) : null;
      const num = (v: any) => Number(v) || 0;
      const payload = {
        student_id: form.student_id, subject_id: form.subject_id,
        internal_marks: num(form.internal_marks), external_marks: num(form.external_marks),
        assignment_marks: num(form.assignment_marks), lab_marks: num(form.lab_marks),
        final_grade: form.final_grade, cgpa: num(form.cgpa),
        ...(faculty_id ? { faculty_id } : {}),
      };
      if (editing) await gradesRepo.update(editing.id, payload);
      else await gradesRepo.create(payload);
      toast.success(editing ? 'Grade updated' : 'Grade recorded');
      setOpen(false);
      load();
    } catch { toast.error('Save failed — check your permissions'); }
    finally { setSaving(false); }
  };

  const remove = async (g: DBGrade) => {
    if (!confirm('Delete this grade record?')) return;
    try { await gradesRepo.remove(g.id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const avgCgpa = rows && rows.length ? (rows.reduce((a, g) => a + Number(g.cgpa || 0), 0) / rows.length).toFixed(2) : '—';

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">{isStudent ? 'My Grades' : 'Grade Book'}</h1>
          <p className="text-ink-500 dark:text-dark-400 mt-1">{isStudent ? 'Your academic performance' : 'Record and manage student grades'}</p>
        </div>
        {canManage && <Button icon={<Plus size={16} />} onClick={openCreate}>Add Grade</Button>}
      </div>

      {isStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 bg-gradient-to-br from-gold-500 to-gold-600 text-white">
            <p className="text-xs uppercase opacity-80">Average CGPA</p>
            <p className="text-2xl font-heading font-bold mt-1">{avgCgpa}</p>
          </div>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
            <p className="text-xs uppercase opacity-80">Subjects</p>
            <p className="text-2xl font-heading font-bold mt-1">{rows?.length ?? '—'}</p>
          </div>
        </div>
      )}

      {rows === null ? (
        <div className="py-16 flex justify-center"><div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <Card animated={false}><CardBody className="flex flex-col items-center py-14 text-center">
          <Award className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />
          <p className="text-sm text-ink-500 dark:text-dark-400">No grades recorded yet.</p>
        </CardBody></Card>
      ) : (
        <Card animated={false}><CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-dark-700 text-left text-xs uppercase text-ink-500 dark:text-dark-400">
                {!isStudent && <th className="py-3 px-5">Student</th>}
                <th className="py-3 px-5">Subject</th>
                <th className="py-3 px-3">Int</th><th className="py-3 px-3">Ext</th>
                <th className="py-3 px-3">Asg</th><th className="py-3 px-3">Lab</th>
                <th className="py-3 px-3">Grade</th><th className="py-3 px-3">CGPA</th>
                {canManage && <th className="py-3 px-5"></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id} className="border-b border-ink-50 dark:border-dark-800 hover:bg-paper-50 dark:hover:bg-dark-850">
                  {!isStudent && <td className="py-3 px-5 text-ink-900 dark:text-dark-100">{g.students?.users?.full_name ?? g.students?.roll_number ?? '—'}</td>}
                  <td className="py-3 px-5 font-medium text-ink-900 dark:text-dark-100">{g.subjects?.subject_name ?? '—'}</td>
                  <td className="py-3 px-3 text-ink-600 dark:text-dark-300">{g.internal_marks}</td>
                  <td className="py-3 px-3 text-ink-600 dark:text-dark-300">{g.external_marks}</td>
                  <td className="py-3 px-3 text-ink-600 dark:text-dark-300">{g.assignment_marks}</td>
                  <td className="py-3 px-3 text-ink-600 dark:text-dark-300">{g.lab_marks}</td>
                  <td className="py-3 px-3"><Badge variant={gradeVariant(g.final_grade)} size="sm">{g.final_grade || '—'}</Badge></td>
                  <td className="py-3 px-3 font-semibold text-ink-900 dark:text-dark-100">{g.cgpa}</td>
                  {canManage && (
                    <td className="py-3 px-5">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-dark-700"><Edit2 size={14} /></button>
                        <button onClick={() => remove(g)} className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-600/10"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody></Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Grade' : 'Add Grade'}>
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
            <Input label="Internal" type="number" value={form.internal_marks} onChange={(e) => setForm({ ...form, internal_marks: e.target.value })} fullWidth />
            <Input label="External" type="number" value={form.external_marks} onChange={(e) => setForm({ ...form, external_marks: e.target.value })} fullWidth />
            <Input label="Assignment" type="number" value={form.assignment_marks} onChange={(e) => setForm({ ...form, assignment_marks: e.target.value })} fullWidth />
            <Input label="Lab" type="number" value={form.lab_marks} onChange={(e) => setForm({ ...form, lab_marks: e.target.value })} fullWidth />
            <Select label="Final Grade" value={form.final_grade} onChange={(e) => setForm({ ...form, final_grade: e.target.value })}>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select>
            <Input label="CGPA" type="number" step="0.01" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} fullWidth />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={saving}>{editing ? 'Save Changes' : 'Record'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
