import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, AlertTriangle, LogOut, Save, Camera, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { usersRepo } from '../services/entities';
import { isSupabaseConfigured, uploadAvatar } from '../lib/supabase';
import { useRef } from 'react';

export function SettingsPage() {
  const { user, logout, refreshProfile } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarPick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file || !user) return;
    if (!isSupabaseConfigured()) { toast.error('Storage not configured'); return; }
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      await usersRepo.update(user.id, { profile_image: url });
      setFormData((f) => ({ ...f, profileImage: url }));
      await refreshProfile(); // propagates avatar to sidebar, navbar, everywhere
      toast.success('Photo updated');
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (isSupabaseConfigured()) {
        await usersRepo.update(user.id, {
          full_name: formData.name,
          phone: formData.phone,
          profile_image: formData.profileImage,
        });
        await refreshProfile();
      }
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
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
      : user?.role === 'faculty'
        ? 'Faculty'
        : user?.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : '';

  const roleVariant = (
    user?.role === 'admin'
      ? 'danger'
      : user?.role === 'coordinator'
        ? 'primary'
        : user?.role === 'faculty'
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={handleAvatarPick}
                disabled={uploading}
                aria-label="Change profile photo"
                className="group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-full"
              >
                <Avatar src={formData.profileImage || user?.profileImage} name={user?.name} size="xl" />
                {/* hover overlay */}
                <span className="absolute inset-0 rounded-full bg-ink-950/50 flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={18} className="text-white" />
                  <span className="text-[10px] font-medium text-white">Change</span>
                </span>
                {uploading && (
                  <span className="absolute inset-0 rounded-full bg-ink-950/60 flex items-center justify-center">
                    <span className="h-6 w-6 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  </span>
                )}
              </button>
              <span
                onClick={handleAvatarPick}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors cursor-pointer"
              >
                <Camera size={13} />
              </span>
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

              <p className="text-xs text-ink-500 dark:text-dark-400">
                To change your profile photo, click your avatar above. JPG, PNG or WEBP, up to 5MB.
              </p>

              <div className="flex justify-end pt-1">
                <Button type="submit" icon={<Save size={16} />} isLoading={saving}>
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
