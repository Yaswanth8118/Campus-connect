import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, ImageIcon, AlertTriangle, LogOut, Save, Camera, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      toast.success('Account deleted successfully');
      logout();
      navigate('/auth');
    } catch {
      toast.error('Failed to delete account');
    }
  };

  const roleLabel =
    user?.role === 'student'
      ? 'Student'
      : user?.role === 'team_leader'
        ? 'Team Leader'
        : user?.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : '';

  const roleVariant = (
    user?.role === 'admin'
      ? 'danger'
      : user?.role === 'coordinator'
        ? 'primary'
        : user?.role === 'team_leader'
          ? 'accent'
          : 'success'
  ) as 'danger' | 'primary' | 'accent' | 'success';

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-heading font-bold text-3xl text-ink-950 dark:text-dark-50 tracking-tight">Settings</h1>
        <p className="text-ink-500 dark:text-dark-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card variant="warm">
          <CardBody className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative flex-shrink-0">
              <Avatar src={formData.profileImage || user?.profileImage} name={user?.name} size="xl" />
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors">
                <Camera size={13} />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="font-heading font-bold text-xl text-ink-950 dark:text-dark-50">{user?.name}</h2>
              <p className="text-sm text-ink-500 dark:text-dark-400 mb-2">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <Badge variant={roleVariant}>{roleLabel}</Badge>
                {user?.department && <Badge variant="default">{user.department}</Badge>}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                <User size={18} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg text-ink-950 dark:text-dark-50">Profile Settings</h2>
                <p className="text-sm text-ink-500 dark:text-dark-400">Update your personal information</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Smith"
                  icon={<User size={16} />}
                  fullWidth
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  icon={<Phone size={16} />}
                  fullWidth
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={user?.email || ''}
                disabled
                icon={<Mail size={16} />}
                hint="Email address cannot be changed"
                fullWidth
              />

              <Input
                label="Profile Picture URL"
                type="url"
                value={formData.profileImage}
                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                icon={<ImageIcon size={16} />}
                fullWidth
              />

              {formData.profileImage && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-paper-100 dark:bg-dark-800 border border-paper-200 dark:border-dark-700">
                  <img
                    src={formData.profileImage}
                    alt="Profile preview"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/1484810/pexels-photo-1484810.jpeg';
                    }}
                  />
                  <div>
                    <p className="text-sm font-heading font-semibold text-ink-900 dark:text-dark-100">Preview</p>
                    <p className="text-xs text-ink-500 dark:text-dark-400">This is how your profile picture will appear</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <Button type="submit" icon={<Save size={16} />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-paper-100 dark:bg-dark-700 flex items-center justify-center">
                <Shield size={18} className="text-ink-500 dark:text-dark-300" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg text-ink-950 dark:text-dark-50">Account Actions</h2>
                <p className="text-sm text-ink-500 dark:text-dark-400">Manage your session and account</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-paper-50 dark:bg-dark-800 border border-ink-100 dark:border-dark-700">
              <div>
                <p className="text-sm font-heading font-semibold text-ink-900 dark:text-dark-100">Sign Out</p>
                <p className="text-xs text-ink-500 dark:text-dark-400 mt-0.5">Sign out from your current session</p>
              </div>
              <Button variant="outline" icon={<LogOut size={16} />} onClick={() => { logout(); navigate('/auth'); }}>
                Sign Out
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-danger-50/50 dark:bg-danger-600/5 border border-danger-200/60 dark:border-danger-600/20">
              <div>
                <p className="text-sm font-heading font-semibold text-danger-600 dark:text-danger-400">Delete Account</p>
                <p className="text-xs text-danger-500/70 dark:text-danger-400/60 mt-0.5">Permanently delete your account and all data</p>
              </div>
              <Button variant="danger" icon={<AlertTriangle size={16} />} onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl max-w-md w-full p-7 border border-ink-100 dark:border-dark-700"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-danger-100 dark:bg-danger-600/20 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-danger-600 dark:text-danger-400" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl text-ink-950 dark:text-dark-50">Delete Account</h2>
                  <p className="text-xs text-ink-500 dark:text-dark-400">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-ink-700 dark:text-dark-300 mb-5 leading-relaxed">
                All your data including messages, rooms, and events will be permanently removed.
              </p>

              <div className="mb-5">
                <Input
                  label={<span>Type <strong className="text-danger-600">DELETE</strong> to confirm</span> as any}
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="font-mono"
                  fullWidth
                />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }}>
                  Cancel
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleDeleteAccount} disabled={deleteConfirmation !== 'DELETE'}>
                  Delete Account
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
