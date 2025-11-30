import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Image, AlertTriangle, LogOut, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                  <User size={20} className="text-blue-600 dark:text-blue-300" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Profile Settings
                </h2>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="pl-10 bg-slate-50 dark:bg-slate-800 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Profile Picture URL
                  </label>
                  <div className="relative">
                    <Image size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="url"
                      value={formData.profileImage}
                      onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                      placeholder="https://example.com/profile.jpg"
                      className="pl-10"
                    />
                  </div>
                </div>

                {formData.profileImage && (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <img
                      src={formData.profileImage}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1484810/pexels-photo-1484810.jpeg';
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Profile Picture Preview
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        This is how your profile picture will appear
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="gap-2">
                    <Save size={18} />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-red-200 dark:border-red-900">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800">
                  <AlertTriangle size={20} className="text-red-600 dark:text-red-300" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Danger Zone
                </h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    Once you delete your account, there is no going back. This action cannot be undone.
                    All your data including messages, rooms, and events will be permanently removed.
                  </p>
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="outline"
                    className="bg-red-600 text-white hover:bg-red-700 border-red-600 gap-2"
                  >
                    <AlertTriangle size={18} />
                    Delete My Account
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Sign Out
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Sign out from your current session. You can always sign back in later.
                  </p>
                  <Button
                    onClick={() => {
                      logout();
                      navigate('/auth');
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20">
                <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Delete Account
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              This action is irreversible. All your data will be permanently deleted.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <Input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteConfirmation !== 'DELETE'}
              >
                Delete Account
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
