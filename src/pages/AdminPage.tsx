import { motion } from 'framer-motion';
import { Shield, Database, Settings, Activity, Server, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';

export function AdminPage() {
  const { user } = useAuthStore();

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ink-500 dark:text-dark-400">Access denied. Admin only.</p>
      </div>
    );
  }

  const panels = [
    { icon: Database, title: 'Database Status', value: 'Connected', desc: 'Supabase PostgreSQL', color: 'text-success-500' },
    { icon: Server, title: 'API Health', value: 'Operational', desc: 'All endpoints responding', color: 'text-success-500' },
    { icon: Activity, title: 'Active Sessions', value: '24', desc: 'Users currently online', color: 'text-primary-600' },
    { icon: Lock, title: 'Security', value: 'RLS Active', desc: 'Row-level security enabled', color: 'text-accent-600' },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">System Administration</h1>
        <p className="text-ink-500 dark:text-dark-400 mt-1">Platform health, security, and configuration</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {panels.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ink-100 dark:bg-dark-800 flex items-center justify-center">
                    <p.icon size={20} className={p.color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-500 dark:text-dark-400">{p.title}</p>
                    <p className={`text-lg font-heading font-bold ${p.color}`}>{p.value}</p>
                    <p className="text-xs text-ink-400 dark:text-dark-500 mt-0.5">{p.desc}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-primary-600" />
            <h2 className="font-heading font-semibold text-lg text-ink-900 dark:text-dark-50">Platform Settings</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {[
            { label: 'User Registration', desc: 'Allow new users to sign up', enabled: true },
            { label: 'Email Verification', desc: 'Require email confirmation', enabled: true },
            { label: 'Maintenance Mode', desc: 'Temporarily disable platform access', enabled: false },
            { label: 'Debug Logging', desc: 'Enable verbose application logging', enabled: false },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-4 rounded-xl bg-paper-50 dark:bg-dark-800 border border-ink-100 dark:border-dark-700">
              <div>
                <p className="text-sm font-semibold text-ink-900 dark:text-dark-100">{setting.label}</p>
                <p className="text-xs text-ink-500 dark:text-dark-400 mt-0.5">{setting.desc}</p>
              </div>
              <button className={`relative w-11 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-primary-600' : 'bg-ink-200 dark:bg-dark-600'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${setting.enabled ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
