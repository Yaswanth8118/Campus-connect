import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, UserCheck, UsersRound, GraduationCap, Edit2, Info } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Modal, { Select } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { usersWithRole, usersRepo, rolesRepo, departmentsList, DBRole, DBDepartment } from '../services/entities';

const roleVariant = (r: string) => (r === 'admin' ? 'danger' : r === 'coordinator' ? 'primary' : r === 'faculty' ? 'accent' : 'success') as any;
const roleLabel = (r: string) => (r === 'faculty' ? 'Faculty' : r.charAt(0).toUpperCase() + r.slice(1));
const roleIcon = (r: string) => (r === 'admin' ? Shield : r === 'coordinator' ? UserCheck : r === 'faculty' ? UsersRound : GraduationCap);

export function UsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[] | null>(null);
  const [roles, setRoles] = useState<DBRole[]>([]);
  const [depts, setDepts] = useState<DBDepartment[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ role_id: '', department_id: '', status: 'active' });
  const [saving, setSaving] = useState(false);

  const load = () => usersWithRole().then(setUsers).catch(() => setUsers([]));
  useEffect(() => {
    load();
    rolesRepo.list().then(setRoles).catch(() => setRoles([]));
    departmentsList().then(setDepts).catch(() => setDepts([]));
  }, []);

  if (user?.role !== 'admin') {
    return <div className="flex items-center justify-center h-64"><p className="text-ink-500 dark:text-dark-400">Access denied. Admin only.</p></div>;
  }

  const openEdit = (u: any) => {
    const role = roles.find((r) => r.role_name === (u.roles?.role_name ?? 'student'));
    const dept = depts.find((d) => d.department_name === u.departments?.department_name);
    setForm({ role_id: String(role?.id ?? ''), department_id: dept?.id ?? '', status: u.status ?? 'active' });
    setEditing(u);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersRepo.update(editing.id, {
        role_id: Number(form.role_id),
        department_id: form.department_id || null,
        status: form.status,
      });
      toast.success('User updated');
      setEditing(null);
      load();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const filtered = (users ?? []).filter((u) =>
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.roles?.role_name === roleFilter)
  );

  const stats = {
    total: users?.length ?? 0,
    admins: (users ?? []).filter((u) => u.roles?.role_name === 'admin').length,
    coordinators: (users ?? []).filter((u) => u.roles?.role_name === 'coordinator').length,
    faculty: (users ?? []).filter((u) => u.roles?.role_name === 'faculty').length,
    students: (users ?? []).filter((u) => u.roles?.role_name === 'student').length,
  };

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">User Management</h1>
        <p className="text-ink-500 dark:text-dark-400 mt-1">Manage users, roles and departments</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'from-ink-700 to-ink-800' },
          { label: 'Admins', value: stats.admins, color: 'from-danger-500 to-danger-600' },
          { label: 'Coordinators', value: stats.coordinators, color: 'from-primary-600 to-primary-700' },
          { label: 'Faculty', value: stats.faculty, color: 'from-accent-500 to-accent-600' },
          { label: 'Students', value: stats.students, color: 'from-success-500 to-success-600' },
        ].map((s, i) => (
          <motion.div key={s.label} className={`rounded-2xl p-4 bg-gradient-to-br ${s.color} text-white`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <p className="text-xs font-medium opacity-80 uppercase">{s.label}</p>
            <p className="text-2xl font-heading font-bold mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-start gap-2 text-xs text-ink-500 dark:text-dark-400 bg-paper-100 dark:bg-dark-800 border border-ink-100 dark:border-dark-700 rounded-xl px-4 py-2.5">
        <Info size={15} className="text-primary-500 flex-shrink-0 mt-0.5" />
        New accounts are created by self sign-up. Admin provisioning (create account) requires a Supabase Edge Function using the service-role key — see README. Here you can assign roles, departments and activate/deactivate users.
      </div>

      <div className="flex flex-wrap gap-3 max-w-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30">
          <option value="">All roles</option>
          {['admin', 'coordinator', 'faculty', 'student'].map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
        </select>
      </div>

      <Card>
        <CardBody className="p-0">
          {users === null ? (
            <div className="py-12 flex justify-center"><div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12"><Users className="w-10 h-10 text-ink-300 dark:text-dark-600 mx-auto mb-3" /><p className="text-sm text-ink-500 dark:text-dark-400">No users found</p></div>
          ) : (
            <div className="divide-y divide-ink-100 dark:divide-dark-700">
              {filtered.map((u, i) => {
                const RIcon = roleIcon(u.roles?.role_name ?? 'student');
                return (
                  <motion.div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-paper-50 dark:hover:bg-dark-850 transition-colors"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <Avatar name={u.full_name} src={u.profile_image} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 dark:text-dark-100 truncate">{u.full_name}</p>
                      <p className="text-xs text-ink-500 dark:text-dark-400 truncate">{u.email}</p>
                    </div>
                    {u.status === 'inactive' && <Badge variant="warning" size="sm">inactive</Badge>}
                    <span className="text-xs text-ink-400 dark:text-dark-500 hidden md:block">{u.departments?.department_name ?? '—'}</span>
                    <Badge variant={roleVariant(u.roles?.role_name ?? 'student')} size="sm"><RIcon size={11} className="mr-1" />{roleLabel(u.roles?.role_name ?? 'student')}</Badge>
                    <button onClick={() => openEdit(u)} className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-dark-700 transition-colors"><Edit2 size={15} /></button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit User" subtitle={editing?.email}>
        <form onSubmit={save} className="space-y-4">
          <Select label="Role" value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })}>
            {roles.map((r) => <option key={r.id} value={r.id}>{roleLabel(r.role_name)}</option>)}
          </Select>
          <Select label="Department" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">— None —</option>
            {depts.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
          </Select>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive (deactivated)</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
