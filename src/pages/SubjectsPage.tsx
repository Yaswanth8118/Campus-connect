import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal, { Select } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { subjectsRepo, subjectsWithNames, departmentsList, facultyWithUser, DBDepartment } from '../services/entities';

const empty = { subject_name: '', subject_code: '', semester: 1, department_id: '', faculty_id: '', credits: 3 };

export function SubjectsPage() {
  const { user } = useAuthStore();
  const canManage = user?.role === 'admin' || user?.role === 'coordinator';
  const [rows, setRows] = useState<any[] | null>(null);
  const [depts, setDepts] = useState<DBDepartment[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => subjectsWithNames().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    load();
    departmentsList().then(setDepts).catch(() => setDepts([]));
    facultyWithUser().then(setFaculty).catch(() => setFaculty([]));
  }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ subject_name: s.subject_name, subject_code: s.subject_code, semester: s.semester ?? 1, department_id: s.department_id ?? '', faculty_id: s.faculty_id ?? '', credits: s.credits ?? 3 });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject_name.trim() || !form.subject_code.trim()) { toast.error('Name and code are required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, semester: Number(form.semester), credits: Number(form.credits), department_id: form.department_id || null, faculty_id: form.faculty_id || null };
      if (editing) await subjectsRepo.update(editing.id, payload);
      else await subjectsRepo.create(payload);
      toast.success(editing ? 'Subject updated' : 'Subject created');
      setOpen(false);
      load();
    } catch { toast.error('Save failed — check your permissions'); }
    finally { setSaving(false); }
  };

  const remove = async (s: any) => {
    if (!confirm(`Delete subject "${s.subject_name}"?`)) return;
    try { await subjectsRepo.remove(s.id); toast.success('Subject deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = (rows ?? []).filter((s) =>
    s.subject_name.toLowerCase().includes(search.toLowerCase()) || s.subject_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Subjects</h1>
          <p className="text-ink-500 dark:text-dark-400 mt-1">Courses offered across departments</p>
        </div>
        {canManage && <Button icon={<Plus size={16} />} onClick={openCreate}>New Subject</Button>}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subjects..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all" />
      </div>

      {rows === null ? (
        <div className="py-16 flex justify-center"><div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card animated={false}><CardBody className="flex flex-col items-center py-14 text-center">
          <BookOpen className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />
          <p className="text-sm text-ink-500 dark:text-dark-400">{search ? 'No matching subjects.' : 'No subjects yet.'}</p>
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card hoverable className="group">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <Badge variant="secondary" size="sm">{s.subject_code}</Badge>
                  </div>
                  <h3 className="font-heading font-bold text-base text-ink-950 dark:text-dark-50 mt-3">{s.subject_name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="default" size="sm">Sem {s.semester}</Badge>
                    <Badge variant="accent" size="sm">{s.credits} credits</Badge>
                  </div>
                  <p className="text-xs text-ink-400 dark:text-dark-500 mt-2">
                    {s.departments?.department_name ?? 'No department'}
                    {s.faculty?.users?.full_name && ` · ${s.faculty.users.full_name}`}
                  </p>
                  {canManage && (
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" icon={<Edit2 size={14} />} onClick={() => openEdit(s)}>Edit</Button>
                      <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => remove(s)}>Delete</Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Subject' : 'New Subject'}>
        <form onSubmit={save} className="space-y-4">
          <Input label="Subject Name" value={form.subject_name} onChange={(e) => setForm({ ...form, subject_name: e.target.value })} placeholder="Data Structures" fullWidth required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Code" value={form.subject_code} onChange={(e) => setForm({ ...form, subject_code: e.target.value.toUpperCase() })} placeholder="CS201" fullWidth required />
            <Input label="Semester" type="number" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} fullWidth />
            <Input label="Credits" type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} fullWidth />
            <Select label="Department" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
              <option value="">— None —</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
            </Select>
          </div>
          <Select label="Assigned Faculty" value={form.faculty_id} onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}>
            <option value="">— None —</option>
            {faculty.map((f) => <option key={f.id} value={f.id}>{f.users?.full_name ?? f.employee_id}</option>)}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={saving}>{editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
