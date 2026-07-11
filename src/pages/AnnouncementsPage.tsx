import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Edit2, Trash2, Search, Globe } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal, { Select } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { announcementsRepo, announcementsWithDept, departmentsList, DBDepartment } from '../services/entities';
import { formatDate } from '../lib/utils';

const empty = { title: '', description: '', department_id: '' };

export function AnnouncementsPage() {
  const { user } = useAuthStore();
  const canManage = user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'faculty';
  const [rows, setRows] = useState<any[] | null>(null);
  const [depts, setDepts] = useState<DBDepartment[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => announcementsWithDept().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    load();
    departmentsList().then(setDepts).catch(() => setDepts([]));
  }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (a: any) => {
    setEditing(a);
    setForm({ title: a.title, description: a.description ?? '', department_id: a.department_id ?? '' });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, department_id: form.department_id || null, created_by: user?.id ?? null };
      if (editing) await announcementsRepo.update(editing.id, { title: form.title, description: form.description, department_id: form.department_id || null });
      else await announcementsRepo.create(payload);
      toast.success(editing ? 'Announcement updated' : 'Announcement posted');
      setOpen(false);
      load();
    } catch { toast.error('Save failed — check your permissions'); }
    finally { setSaving(false); }
  };

  const remove = async (a: any) => {
    if (!confirm(`Delete "${a.title}"?`)) return;
    try { await announcementsRepo.remove(a.id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = (rows ?? []).filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) || (a.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Announcements</h1>
          <p className="text-ink-500 dark:text-dark-400 mt-1">Campus-wide and department notices</p>
        </div>
        {canManage && <Button icon={<Plus size={16} />} onClick={openCreate}>New Announcement</Button>}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search announcements..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all" />
      </div>

      {rows === null ? (
        <div className="py-16 flex justify-center"><div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card animated={false}><CardBody className="flex flex-col items-center py-14 text-center">
          <Megaphone className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />
          <p className="text-sm text-ink-500 dark:text-dark-400">{search ? 'No matching announcements.' : 'No announcements yet.'}</p>
        </CardBody></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card animated={false} className="group">
                <CardBody className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center flex-shrink-0">
                    <Megaphone size={18} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-semibold text-base text-ink-950 dark:text-dark-50">{a.title}</h3>
                      {a.departments?.department_name
                        ? <Badge variant="secondary" size="sm">{a.departments.department_name}</Badge>
                        : <Badge variant="accent" size="sm"><Globe size={11} className="mr-1" />Campus-wide</Badge>}
                    </div>
                    {a.description && <p className="text-sm text-ink-500 dark:text-dark-400 mt-1">{a.description}</p>}
                    <p className="text-xs text-ink-400 dark:text-dark-500 mt-1.5">{formatDate(a.created_at)}</p>
                  </div>
                  {canManage && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(a)} className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-dark-700"><Edit2 size={15} /></button>
                      <button onClick={() => remove(a)} className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-600/10"><Trash2 size={15} /></button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Announcement' : 'New Announcement'}>
        <form onSubmit={save} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Exam schedule released" fullWidth required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-800 dark:text-dark-200">Message</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Details…"
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none" />
          </div>
          <Select label="Audience" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">Campus-wide (all departments)</option>
            {depts.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={saving}>{editing ? 'Save Changes' : 'Post'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
