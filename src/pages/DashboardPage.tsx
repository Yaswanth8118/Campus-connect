import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, UserCheck, Building, DoorOpen, CalendarDays,
  BookOpen, Megaphone, Shield, UsersRound, ClipboardCheck, TrendingUp, ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { dbCount } from '../lib/supabase';
import { announcementsRepo, usersWithRole, DBAnnouncement } from '../services/entities';
import { formatDate } from '../lib/utils';

// ── shared bits ───────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: React.ReactNode; icon: React.ReactNode; color: string; loading?: boolean }> = ({
  label, value, icon, color, loading,
}) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl p-5 text-white border border-white/10 bg-gradient-to-br ${color}`}
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} whileHover={{ y: -2 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium opacity-80 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-heading font-bold mt-1">{loading ? '…' : value}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">{icon}</div>
    </div>
  </motion.div>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
      {icon}
    </div>
    <h2 className="font-heading font-bold text-xl text-ink-950 dark:text-dark-100">{children}</h2>
  </div>
);

const AnnouncementsCard: React.FC = () => {
  const [items, setItems] = useState<DBAnnouncement[] | null>(null);
  useEffect(() => {
    announcementsRepo
      .list('select=*&order=created_at.desc&limit=5')
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <section>
      <SectionTitle icon={<Megaphone size={16} />}>Recent Announcements</SectionTitle>
      <Card animated={false}>
        <CardBody className="p-0">
          {items === null ? (
            <div className="py-10 flex justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-500 dark:text-dark-400">No announcements yet.</div>
          ) : (
            <div className="divide-y divide-ink-100 dark:divide-dark-700">
              {items.map((a) => (
                <div key={a.id} className="px-5 py-3.5">
                  <p className="text-sm font-semibold text-ink-900 dark:text-dark-100">{a.title}</p>
                  {a.description && <p className="text-xs text-ink-500 dark:text-dark-400 mt-0.5 line-clamp-2">{a.description}</p>}
                  <p className="text-[11px] text-ink-400 dark:text-dark-500 mt-1">{formatDate(a.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </section>
  );
};

const Welcome: React.FC<{ name?: string; role: string }> = ({ name, role }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div>
      <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Dashboard</h1>
      <p className="text-ink-500 dark:text-dark-400 mt-1">
        Welcome back, <span className="font-semibold text-primary-600 dark:text-primary-400">{name}</span>
      </p>
    </div>
    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-heading font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/40 self-start sm:self-auto">
      {role}
    </span>
  </div>
);

// ── Admin ─────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [students, faculty, coordinators, departments, rooms, events, subjects] = await Promise.all([
        dbCount('students'), dbCount('faculty'), dbCount('coordinators'),
        dbCount('departments'), dbCount('rooms'), dbCount('events'), dbCount('subjects'),
      ]);
      setCounts({ students, faculty, coordinators, departments, rooms, events, subjects });
    })().catch(() => setCounts({}));
    usersWithRole('&limit=6').then(setRecent).catch(() => setRecent([]));
  }, []);

  const loading = counts === null;
  const c = counts || {};

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Students" value={c.students} loading={loading} icon={<GraduationCap className="w-5 h-5" />} color="from-primary-600 to-primary-700" />
        <StatCard label="Faculty" value={c.faculty} loading={loading} icon={<UserCheck className="w-5 h-5" />} color="from-accent-500 to-accent-600" />
        <StatCard label="Coordinators" value={c.coordinators} loading={loading} icon={<UsersRound className="w-5 h-5" />} color="from-gold-500 to-gold-600" />
        <StatCard label="Departments" value={c.departments} loading={loading} icon={<Building className="w-5 h-5" />} color="from-info-500 to-info-600" />
        <StatCard label="Rooms" value={c.rooms} loading={loading} icon={<DoorOpen className="w-5 h-5" />} color="from-ink-600 to-ink-800" />
        <StatCard label="Events" value={c.events} loading={loading} icon={<CalendarDays className="w-5 h-5" />} color="from-success-500 to-success-600" />
        <StatCard label="Subjects" value={c.subjects} loading={loading} icon={<BookOpen className="w-5 h-5" />} color="from-primary-500 to-primary-600" />
        <StatCard label="Manage" value={<Shield className="w-5 h-5" />} icon={<ArrowRight className="w-5 h-5" />} color="from-danger-500 to-danger-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={<Users size={16} />}>Recent Users</SectionTitle>
            <button onClick={() => navigate('/users')} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <Card animated={false}>
            <CardBody className="p-0">
              {recent.length === 0 ? (
                <div className="py-10 text-center text-sm text-ink-500 dark:text-dark-400">No users yet.</div>
              ) : (
                <div className="divide-y divide-ink-100 dark:divide-dark-700">
                  {recent.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                      <Avatar name={u.full_name} src={u.profile_image} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-900 dark:text-dark-100 truncate">{u.full_name}</p>
                        <p className="text-xs text-ink-500 dark:text-dark-400 truncate">{u.email}</p>
                      </div>
                      <Badge size="sm" variant="primary">{u.roles?.role_name ?? 'student'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </section>
        <AnnouncementsCard />
      </div>
    </div>
  );
};

// ── Coordinator ───────────────────────────────────────────────

const CoordinatorDashboard: React.FC<{ department?: string }> = ({ department }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Department" value={department || '—'} icon={<Building className="w-5 h-5" />} color="from-primary-600 to-primary-700" />
        <StatCard label="Events" value={<CalendarDays className="w-5 h-5" />} icon={<ArrowRight className="w-5 h-5" />} color="from-accent-500 to-accent-600" />
        <StatCard label="Reports" value={<TrendingUp className="w-5 h-5" />} icon={<ArrowRight className="w-5 h-5" />} color="from-gold-500 to-gold-600" />
        <StatCard label="Students" value={<GraduationCap className="w-5 h-5" />} icon={<ArrowRight className="w-5 h-5" />} color="from-success-500 to-success-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <SectionTitle icon={<CalendarDays size={16} />}>Quick Actions</SectionTitle>
          <Card animated={false}>
            <CardBody className="space-y-2">
              {[
                { label: 'Manage Events', to: '/events' },
                { label: 'Manage Attendance', to: '/attendance/manage' },
                { label: 'Departments', to: '/departments' },
                { label: 'Reports', to: '/reports' },
              ].map((a) => (
                <button key={a.to} onClick={() => navigate(a.to)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-paper-50 dark:bg-dark-800 hover:bg-paper-100 dark:hover:bg-dark-750 border border-ink-100 dark:border-dark-700 transition-colors text-sm font-medium text-ink-800 dark:text-dark-200">
                  {a.label} <ArrowRight size={15} className="text-primary-500" />
                </button>
              ))}
            </CardBody>
          </Card>
        </section>
        <AnnouncementsCard />
      </div>
    </div>
  );
};

// ── Faculty ───────────────────────────────────────────────────

const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Subjects" value={<BookOpen className="w-5 h-5" />} icon={<ArrowRight className="w-5 h-5" />} color="from-primary-600 to-primary-700" />
        <StatCard label="Attendance" value={<ClipboardCheck className="w-5 h-5" />} icon={<ArrowRight className="w-5 h-5" />} color="from-accent-500 to-accent-600" />
        <StatCard label="Grade Book" value={<TrendingUp className="w-5 h-5" />} icon={<ArrowRight className="w-5 h-5" />} color="from-gold-500 to-gold-600" />
        <StatCard label="Events" value={<CalendarDays className="w-5 h-5" />} icon={<ArrowRight className="w-5 h-5" />} color="from-success-500 to-success-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <SectionTitle icon={<ClipboardCheck size={16} />}>Quick Actions</SectionTitle>
          <Card animated={false}>
            <CardBody className="space-y-2">
              {[
                { label: 'Mark Attendance', to: '/attendance/manage' },
                { label: 'Grade Book', to: '/grades' },
                { label: 'Assignments', to: '/assignments' },
                { label: 'Events', to: '/events' },
              ].map((a) => (
                <button key={a.to} onClick={() => navigate(a.to)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-paper-50 dark:bg-dark-800 hover:bg-paper-100 dark:hover:bg-dark-750 border border-ink-100 dark:border-dark-700 transition-colors text-sm font-medium text-ink-800 dark:text-dark-200">
                  {a.label} <ArrowRight size={15} className="text-primary-500" />
                </button>
              ))}
            </CardBody>
          </Card>
        </section>
        <AnnouncementsCard />
      </div>
    </div>
  );
};

// ── Student ───────────────────────────────────────────────────

const StudentDashboard: React.FC<{ department?: string }> = ({ department }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Attendance" value="—" icon={<ClipboardCheck className="w-5 h-5" />} color="from-primary-600 to-primary-700" />
        <StatCard label="CGPA" value="—" icon={<TrendingUp className="w-5 h-5" />} color="from-gold-500 to-gold-600" />
        <StatCard label="Department" value={department || '—'} icon={<Building className="w-5 h-5" />} color="from-accent-500 to-accent-600" />
        <StatCard label="Events" value={<CalendarDays className="w-5 h-5" />} icon={<ArrowRight className="w-5 h-5" />} color="from-success-500 to-success-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <SectionTitle icon={<GraduationCap size={16} />}>Quick Actions</SectionTitle>
          <Card animated={false}>
            <CardBody className="space-y-2">
              {[
                { label: 'My Attendance', to: '/attendance' },
                { label: 'My Grades', to: '/grades' },
                { label: 'Assignments', to: '/assignments' },
                { label: 'Browse Events', to: '/events' },
              ].map((a) => (
                <button key={a.to} onClick={() => navigate(a.to)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-paper-50 dark:bg-dark-800 hover:bg-paper-100 dark:hover:bg-dark-750 border border-ink-100 dark:border-dark-700 transition-colors text-sm font-medium text-ink-800 dark:text-dark-200">
                  {a.label} <ArrowRight size={15} className="text-primary-500" />
                </button>
              ))}
            </CardBody>
          </Card>
        </section>
        <AnnouncementsCard />
      </div>
    </div>
  );
};

// ── Router by role ────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role ?? 'student';
  const roleLabel = role === 'faculty' ? 'Faculty' : role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="space-y-8">
      <Welcome name={user?.name} role={roleLabel} />
      {role === 'admin' && <AdminDashboard />}
      {role === 'coordinator' && <CoordinatorDashboard department={user?.department} />}
      {role === 'faculty' && <FacultyDashboard />}
      {role === 'student' && <StudentDashboard department={user?.department} />}
    </div>
  );
};

export default DashboardPage;
