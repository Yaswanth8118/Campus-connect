import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal, { Select } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { departmentsRepo, departmentsList, usersWithRole, DBDepartment } from '../services/entities';

const empty = { department_name: '', department_code: '', hod_id: '', description: '' };

export function DepartmentsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [rows, setRows] = useState<DBDepartment[] | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DBDepartment | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => departmentsList().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    load();
    if (isAdmin) usersWithRole().then(setUsers).catch(() => setUsers([]));
  }, [isAdmin]);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (d: DBDepartment) => {
    setEditing(d);
    setForm({ department_name: d.department_name, department_code: d.department_code, hod_id: d.hod_id ?? '', description: d.description ?? '' });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.department_name.trim() || !form.department_code.trim()) { toast.error('Name and code are required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, hod_id: form.hod_id || null };
      if (editing) await departmentsRepo.update(editing.id, payload);
      else await departmentsRepo.create(payload);
      toast.success(editing ? 'Department updated' : 'Department created');
      setOpen(false);
      load();
    } catch { toast.error('Save failed — check your permissions'); }
    finally { setSaving(false); }
  };

  const remove = async (d: DBDepartment) => {
    if (!confirm(`Delete department "${d.department_name}"?`)) return;
    try { await departmentsRepo.remove(d.id); toast.success('Department deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = (rows ?? []).filter((d) =>
    d.department_name.toLowerCase().includes(search.toLowerCase()) ||
    d.department_code.toLowerCase().includes(search.toLowerCase())
  );
  const hodName = (id: string | null) => users.find((u) => u.id === id)?.full_name;

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Departments</h1>
          <p className="text-ink-500 dark:text-dark-400 mt-1">Manage academic departments</p>
        </div>
        {isAdmin && <Button icon={<Plus size={16} />} onClick={openCreate}>New Department</Button>}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all" />
      </div>

      {rows === null ? (
        <div className="py-16 flex justify-center"><div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card animated={false}><CardBody className="flex flex-col items-center py-14 text-center">
          <Building className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />
          <p className="text-sm text-ink-500 dark:text-dark-400">{search ? 'No matching departments.' : 'No departments yet.'}</p>
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card hoverable className="group">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                      <Building className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <Badge variant="secondary" size="sm">{d.department_code}</Badge>
                  </div>
                  <h3 className="font-heading font-bold text-base text-ink-950 dark:text-dark-50 mt-3">{d.department_name}</h3>
                  {d.description && <p className="text-sm text-ink-500 dark:text-dark-400 mt-1 line-clamp-2">{d.description}</p>}
                  {hodName(d.hod_id) && <p className="text-xs text-ink-400 dark:text-dark-500 mt-2">HOD: {hodName(d.hod_id)}</p>}
                  {isAdmin && (
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" icon={<Edit2 size={14} />} onClick={() => openEdit(d)}>Edit</Button>
                      <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => remove(d)}>Delete</Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Department' : 'New Department'}>
        <form onSubmit={save} className="space-y-4">
          <Input label="Department Name" value={form.department_name} onChange={(e) => setForm({ ...form, department_name: e.target.value })} placeholder="Computer Science & Engineering" fullWidth required />
          <Input label="Department Code" value={form.department_code} onChange={(e) => setForm({ ...form, department_code: e.target.value.toUpperCase() })} placeholder="CSE" fullWidth required />
          <Select label="Head of Department" value={form.hod_id} onChange={(e) => setForm({ ...form, hod_id: e.target.value })}>
            <option value="">— None —</option>
            {users.filter((u) => u.roles?.role_name === 'faculty' || u.roles?.role_name === 'coordinator').map((u) => (
              <option key={u.id} value={u.id}>{u.full_name} ({u.roles?.role_name})</option>
            ))}
          </Select>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" fullWidth />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={saving}>{editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
