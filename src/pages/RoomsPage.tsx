import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DoorOpen, Plus, Edit2, Trash2, Search, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal, { Select } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { roomsRepo, roomsList, DBRoom } from '../services/entities';

const empty = { room_number: '', building: '', floor: 0, capacity: 0, room_type: 'classroom', status: 'available' };
const TYPES = ['classroom', 'lab', 'seminar', 'auditorium', 'office'];
const STATUSES = ['available', 'occupied', 'maintenance'];

const statusVariant = (s: string) => (s === 'available' ? 'success' : s === 'maintenance' ? 'warning' : 'danger') as any;

export function RoomsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [rows, setRows] = useState<DBRoom[] | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DBRoom | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => roomsList().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (r: DBRoom) => {
    setEditing(r);
    setForm({ room_number: r.room_number, building: r.building, floor: r.floor, capacity: r.capacity, room_type: r.room_type, status: r.status });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.room_number.trim()) { toast.error('Room number is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, floor: Number(form.floor) || 0, capacity: Number(form.capacity) || 0 };
      if (editing) await roomsRepo.update(editing.id, payload);
      else await roomsRepo.create(payload);
      toast.success(editing ? 'Room updated' : 'Room created');
      setOpen(false);
      load();
    } catch { toast.error('Save failed — check your permissions'); }
    finally { setSaving(false); }
  };

  const remove = async (r: DBRoom) => {
    if (!confirm(`Delete room "${r.room_number}"?`)) return;
    try { await roomsRepo.remove(r.id); toast.success('Room deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = (rows ?? []).filter((r) =>
    (r.room_number.toLowerCase().includes(search.toLowerCase()) || r.building.toLowerCase().includes(search.toLowerCase())) &&
    (!typeFilter || r.room_type === typeFilter)
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Rooms</h1>
          <p className="text-ink-500 dark:text-dark-400 mt-1">Classrooms, labs and facilities</p>
        </div>
        {isAdmin && <Button icon={<Plus size={16} />} onClick={openCreate}>New Room</Button>}
      </div>

      <div className="flex flex-wrap gap-3 max-w-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rooms..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30">
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {rows === null ? (
        <div className="py-16 flex justify-center"><div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card animated={false}><CardBody className="flex flex-col items-center py-14 text-center">
          <DoorOpen className="w-10 h-10 text-ink-300 dark:text-dark-600 mb-3" />
          <p className="text-sm text-ink-500 dark:text-dark-400">{search || typeFilter ? 'No matching rooms.' : 'No rooms yet.'}</p>
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card hoverable className="group">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-ink-950 dark:text-dark-50">{r.room_number}</h3>
                      <p className="text-xs text-ink-500 dark:text-dark-400">{r.building}{r.building && ' · '}Floor {r.floor}</p>
                    </div>
                    <Badge variant={statusVariant(r.status)} size="sm">{r.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-sm text-ink-600 dark:text-dark-300">
                    <span className="inline-flex items-center gap-1"><Users size={14} className="text-primary-500" /> {r.capacity}</span>
                    <Badge variant="default" size="sm">{r.room_type}</Badge>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" icon={<Edit2 size={14} />} onClick={() => openEdit(r)}>Edit</Button>
                      <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => remove(r)}>Delete</Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Room' : 'New Room'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Room Number" value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} placeholder="A-101" fullWidth required />
            <Input label="Building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} placeholder="Block A" fullWidth />
            <Input label="Floor" type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} fullWidth />
            <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} fullWidth />
            <Select label="Type" value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={saving}>{editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default RoomsPage;
