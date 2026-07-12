import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Building, Phone, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    role: 'student' as UserRole,
    department: '',
    phone: '',
  });

  const { login, register, isLoading } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !userInfo.name) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await register({ email, password, ...userInfo });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUserInfo({ name: '', role: 'student', department: '', phone: '' });
  };

  return (
    <div className="w-full">
      <motion.div
        className="mb-7"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-heading font-bold text-2xl text-ink-950 dark:text-dark-50">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-ink-500 dark:text-dark-400 mt-1">
          {isSignUp
            ? 'Join Campus Connect to get started'
            : 'Sign in with your email and password'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isSignUp ? (
          <motion.form
            key="login"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <Input
              label="Email / Gmail"
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              fullWidth
              autoFocus
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="pointer-events-auto text-ink-400 hover:text-ink-700 dark:hover:text-dark-200 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              fullWidth
              error={error}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              size="lg"
            >
              Sign In
            </Button>

            <p className="text-center text-sm text-ink-500 dark:text-dark-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline transition-colors"
              >
                Sign Up
              </button>
            </p>
          </motion.form>
        ) : (
          <motion.form
            key="signup"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSignUp}
            className="space-y-3.5"
          >
            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Smith"
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              icon={<User size={16} />}
              fullWidth
              autoFocus
            />

            <Input
              label="Email / Gmail"
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              fullWidth
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-800 dark:text-dark-200">
                Role
              </label>
              <select
                value={userInfo.role}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, role: e.target.value as UserRole })
                }
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-dark-900 border border-ink-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400 text-ink-950 dark:text-dark-100 transition-all"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="coordinator">Coordinator</option>
              </select>
            </div>

            <Input
              label="Department"
              type="text"
              placeholder="Computer Science"
              value={userInfo.department}
              onChange={(e) => setUserInfo({ ...userInfo, department: e.target.value })}
              icon={<Building size={16} />}
              fullWidth
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              placeholder="+91 98765 43210"
              value={userInfo.phone}
              onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              icon={<Phone size={16} />}
              fullWidth
            />

            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="pointer-events-auto text-ink-400 hover:text-ink-700 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              fullWidth
              hint="Must include uppercase, lowercase, number, and special character"
            />

            <Input
              label="Confirm Password"
              type={showConfirmPass ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={16} />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowConfirmPass((v) => !v)}
                  className="pointer-events-auto text-ink-400 hover:text-ink-700 transition-colors"
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              fullWidth
              error={error}
            />

            <Button type="submit" fullWidth isLoading={isLoading} size="lg">
              Create Account
            </Button>

            <p className="text-center text-sm text-ink-500 dark:text-dark-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </motion.form>
        )}
      </AnimatePresence>

      {!isSignUp && (
        <>
          {/* Demo accounts */}
          <motion.div
            className="mt-7 p-4 bg-paper-100 dark:bg-dark-900/60 rounded-2xl border border-paper-200 dark:border-dark-700/40"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs font-heading font-semibold text-ink-900 dark:text-dark-200 mb-2.5">
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { role: 'Admin', email: 'admin@campus.edu', pw: 'Admin@123' },
                { role: 'Coordinator', email: 'coordinator@campus.edu', pw: 'Coord@123' },
                { role: 'Faculty', email: 'faculty@campus.edu', pw: 'Lead@1234' },
                { role: 'Student', email: 'student@campus.edu', pw: 'Student@1' },
              ].map((a) => (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(a.pw);
                    setIsSignUp(false);
                  }}
                  className="text-left p-2 rounded-xl bg-white/60 dark:bg-dark-800/60 hover:bg-white dark:hover:bg-dark-800 border border-paper-200/60 dark:border-dark-600/40 transition-all hover:border-primary-300 dark:hover:border-primary-600 group"
                >
                  <p className="font-semibold text-primary-700 dark:text-primary-400 group-hover:text-primary-600 transition-colors">
                    {a.role}
                  </p>
                  <p className="text-ink-500 dark:text-dark-500 truncate">{a.email}</p>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs text-ink-500 dark:text-dark-500">
              Passwords shown on hover. Click to auto-fill.
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AuthForm;
