import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, UserCheck, UsersRound, GraduationCap, MoreVertical } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { isSupabaseConfigured, dbSelect } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  created_at: string;
  profile_image: string;
}

export function UsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isSupabaseConfigured()) {
        try {
          const data = await dbSelect('profiles', 'select=*&order=created_at.desc');
          setUsers(data);
        } catch { }
      } else {
        setUsers([
          { id: '1', email: 'admin@campus.edu', name: 'Dr. Sarah Johnson', role: 'admin', department: 'Administration', created_at: new Date().toISOString(), profile_image: '' },
          { id: '2', email: 'coordinator@campus.edu', name: 'Prof. Michael Chen', role: 'coordinator', department: 'Student Affairs', created_at: new Date().toISOString(), profile_image: '' },
          { id: '3', email: 'teamlead@campus.edu', name: 'Alex Rivera', role: 'team_leader', department: 'Computer Science', created_at: new Date().toISOString(), profile_image: '' },
          { id: '4', email: 'student@campus.edu', name: 'Alex Thompson', role: 'student', department: 'Computer Science', created_at: new Date().toISOString(), profile_image: '' },
        ]);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ink-500 dark:text-dark-400">Access denied. Admin only.</p>
      </div>
    );
  }

  const roleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={14} />;
      case 'coordinator': return <UserCheck size={14} />;
      case 'team_leader': return <UsersRound size={14} />;
      default: return <GraduationCap size={14} />;
    }
  };

  const roleVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'danger' as const;
      case 'coordinator': return 'primary' as const;
      case 'team_leader': return 'accent' as const;
      default: return 'success' as const;
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'team_leader': return 'Team Leader';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    coordinators: users.filter((u) => u.role === 'coordinator').length,
    leaders: users.filter((u) => u.role === 'team_leader').length,
    students: users.filter((u) => u.role === 'student').length,
  };

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">User Management</h1>
        <p className="text-ink-500 dark:text-dark-400 mt-1">Manage platform users and their roles</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Users', value: stats.total, color: 'from-ink-700 to-ink-800 text-white' },
          { label: 'Admins', value: stats.admins, color: 'from-danger-500 to-danger-600 text-white' },
          { label: 'Coordinators', value: stats.coordinators, color: 'from-primary-600 to-primary-700 text-white' },
          { label: 'Team Leaders', value: stats.leaders, color: 'from-accent-500 to-accent-600 text-white' },
          { label: 'Students', value: stats.students, color: 'from-success-500 to-success-600 text-white' },
        ].map((s, i) => (
          <motion.div key={s.label} className={`rounded-2xl p-4 bg-gradient-to-br ${s.color} border border-white/10`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <p className="text-xs font-medium opacity-80 uppercase">{s.label}</p>
            <p className="text-2xl font-heading font-bold mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 dark:text-dark-400 w-4 h-4" />
        <input
          type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-xl placeholder:text-ink-400 dark:placeholder:text-dark-400 text-ink-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all"
        />
      </div>

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-ink-300 dark:text-dark-600 mx-auto mb-3" />
              <p className="text-sm text-ink-500 dark:text-dark-400">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-100 dark:divide-dark-700">
              {filtered.map((u, i) => (
                <motion.div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-paper-50 dark:hover:bg-dark-850 transition-colors"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <Avatar name={u.name} src={u.profile_image} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 dark:text-dark-100 truncate">{u.name}</p>
                    <p className="text-xs text-ink-500 dark:text-dark-400 truncate">{u.email}</p>
                  </div>
                  <Badge variant={roleVariant(u.role)} size="sm">{roleLabel(u.role)}</Badge>
                  <span className="text-xs text-ink-400 dark:text-dark-500 hidden sm:block">{u.department}</span>
                  <button className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-dark-800 text-ink-400 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
