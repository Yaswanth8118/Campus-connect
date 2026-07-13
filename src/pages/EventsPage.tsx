import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, Edit2, Trash2, Search, MapPin, Building } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal, { Select } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { eventsRepo, eventsWithNames, roomsList, departmentsList, DBRoom, DBDepartment } from '../services/entities';
import { formatDate } from '../lib/utils';

const STATUSES = ['upcoming', 'live', 'completed', 'cancelled'];
const empty = { event_name: '', description: '', department_id: '', room_id: '', start_date: '', end_date: '', status: 'upcoming' };
const statusVariant = (s: string) =>
  (s === 'live' ? 'danger' : s === 'completed' ? 'default' : s === 'cancelled' ? 'warning' : 'accent') as any;

const EventsPage: React.FC = () => {
  const { user } = useAuthStore();
  const canManage = user?.role === 'admin' || user?.role === 'coordinator';
  const [rows, setRows] = useState<any[] | null>(null);
  const [rooms, setRooms] = useState<DBRoom[]>([]);
  const [depts, setDepts] = useState<DBDepartment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => eventsWithNames().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    load();
    roomsList().then(setRooms).catch(() => setRooms([]));
    departmentsList().then(setDepts).catch(() => setDepts([]));
  }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (ev: any) => {
    setEditing(ev);
    setForm({
      event_name: ev.event_name, description: ev.description ?? '', department_id: ev.department_id ?? '',
      room_id: ev.room_id ?? '', start_date: ev.start_date?.slice(0, 16) ?? '', end_date: ev.end_date?.slice(0, 16) ?? '', status: ev.status,
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_name.trim() || !form.start_date || !form.end_date) { toast.error('Name, start and end are required'); return; }
    if (new Date(form.end_date) < new Date(form.start_date)) { toast.error('End must be after start'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        department_id: form.department_id || null,
        room_id: form.room_id || null,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      };
      if (editing) await eventsRepo.update(editing.id, payload);
      else await eventsRepo.create(payload);
      toast.success(editing ? 'Event updated' : 'Event created');
      setOpen(false);
      load();
    } catch { toast.error('Save failed — check your permissions'); }
    finally { setSaving(false); }
  };

  const remove = async (ev: any) => {
    if (!confirm(`Delete event "${ev.event_name}"?`)) return;
    try { await eventsRepo.remove(ev.id); toast.success('Event deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = (rows ?? []).filter((ev) =>
    (ev.event_name.toLowerCase().includes(search.toLowerCase()) || (ev.description ?? '').toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || ev.status === statusFilter)
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Events</h1>
          <p className="text-ink-500 dark:text-dark-400 mt-1">Campus events and schedules</p>
        </div>
        {canManage && <Button icon={<Plus size={16} />} onClick={openCreate}>New Event</Button>}
      </div>

      <div className="flex flex-wrap gap-3 max-w-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {rows === null ? (
        <div className="py-16 flex justify-center"><div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card animated={false}><CardBody className="flex flex-col items-center py-14 text-center">
          <CalendarDays className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />
          <p className="text-sm text-ink-500 dark:text-dark-400">{search || statusFilter ? 'No matching events.' : 'No events yet.'}</p>
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card hoverable className="group">
                <CardBody>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-bold text-base text-ink-950 dark:text-dark-50 line-clamp-1">{ev.event_name}</h3>
                    <Badge variant={statusVariant(ev.status)} size="sm" dot>{ev.status}</Badge>
                  </div>
                  {ev.description && <p className="text-sm text-ink-500 dark:text-dark-400 mt-1 line-clamp-2">{ev.description}</p>}
                  <div className="mt-3 space-y-1 text-xs text-ink-500 dark:text-dark-400">
                    <p className="flex items-center gap-1.5"><CalendarDays size={13} className="text-primary-500" /> {formatDate(ev.start_date)} → {formatDate(ev.end_date)}</p>
                    {ev.rooms?.room_number && <p className="flex items-center gap-1.5"><MapPin size={13} className="text-primary-500" /> {ev.rooms.room_number}</p>}
                    {ev.departments?.department_name && <p className="flex items-center gap-1.5"><Building size={13} className="text-primary-500" /> {ev.departments.department_name}</p>}
                  </div>
                  {canManage && (
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" icon={<Edit2 size={14} />} onClick={() => openEdit(ev)}>Edit</Button>
                      <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => remove(ev)}>Delete</Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Event' : 'New Event'}>
        <form onSubmit={save} className="space-y-4">
          <Input label="Event Name" value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} placeholder="Tech Symposium" fullWidth required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" fullWidth />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Start" type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} fullWidth required />
            <Input label="End" type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} fullWidth required />
            <Select label="Department" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
              <option value="">— None —</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
            </Select>
            <Select label="Room" value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })}>
              <option value="">— None —</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.room_number}</option>)}
            </Select>
          </div>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={saving}>{editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsPage;
