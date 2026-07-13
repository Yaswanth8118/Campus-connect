import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Building, Phone, Eye, EyeOff, MailCheck, Shield, UserCheck, UsersRound, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { rpcCall } from '../../lib/supabase';
import { UserRole } from '../../types';

// Demo accounts — passwords are NOT displayed; buttons sign in directly.
// These must exist in Supabase Auth with these exact credentials (see README).
const DEMO = [
  { role: 'Admin',       email: 'admin@demo.campus',       password: 'Demo@Admin1',   icon: Shield,        color: 'from-danger-500 to-danger-600' },
  { role: 'Coordinator', email: 'coordinator@demo.campus', password: 'Demo@Coord1',   icon: UserCheck,     color: 'from-primary-600 to-primary-700' },
  { role: 'Faculty',     email: 'faculty@demo.campus',     password: 'Demo@Faculty1', icon: UsersRound,    color: 'from-accent-500 to-accent-600' },
  { role: 'Student',     email: 'student@demo.campus',     password: 'Demo@Student1', icon: GraduationCap, color: 'from-success-500 to-success-600' },
];

const AuthForm: React.FC = () => {
  const [identifier, setIdentifier] = useState(''); // email OR username
  const [email, setEmail] = useState('');           // signup email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState({ name: '', role: 'student' as UserRole, department: '', phone: '' });

  const { login, register, isLoading, awaitingEmailVerification, clearAwaitingVerification } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) { setError('Please fill in all fields'); return; }
    try {
      let loginEmail = identifier.trim();
      // Resolve username → email when the identifier is not an email.
      if (!loginEmail.includes('@')) {
        try {
          const resolved = await rpcCall<string>('email_for_username', { p_username: loginEmail });
          if (!resolved) { setError('No account found for that username.'); return; }
          loginEmail = resolved;
        } catch {
          setError('Could not resolve username. Try your email instead.');
          return;
        }
      }
      await login(loginEmail, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleDemo = async (d: typeof DEMO[number]) => {
    setError('');
    setDemoLoading(d.role);
    try {
      await login(d.email, d.password);
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed');
    } finally {
      setDemoLoading(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !userInfo.name) { setError('Please fill in all required fields'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    try {
      await register({ email, password, ...userInfo });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setIdentifier('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUserInfo({ name: '', role: 'student', department: '', phone: '' });
  };

  // ── Email-verification confirmation screen ──────────────────
  if (awaitingEmailVerification) {
    return (
      <motion.div className="w-full text-center py-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-7 h-7 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-ink-950 dark:text-dark-50">Verify your email</h2>
        <p className="text-sm text-ink-500 dark:text-dark-400 mt-2 leading-relaxed">
          We've sent a confirmation link to your inbox. Click it to activate your account, then sign in.
        </p>
        <Button
          className="mt-6"
          fullWidth
          size="lg"
          onClick={() => { clearAwaitingVerification(); setIsSignUp(false); }}
        >
          Back to Sign In
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <motion.div className="mb-7" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="font-heading font-bold text-2xl text-ink-950 dark:text-dark-50">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-ink-500 dark:text-dark-400 mt-1">
          {isSignUp ? 'Join Campus Connect to get started' : 'Sign in with your email or username'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isSignUp ? (
          <motion.form key="login" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email or Username"
              type="text"
              placeholder="you@gmail.com or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              icon={<Mail size={16} />}
              autoComplete="username"
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
              autoComplete="current-password"
              iconRight={
                <button type="button" onClick={() => setShowPass((v) => !v)} className="pointer-events-auto text-ink-400 hover:text-ink-700 dark:hover:text-dark-200 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              fullWidth
              error={error}
            />

            <Button type="submit" fullWidth isLoading={isLoading && !demoLoading} icon={<ArrowRight size={16} />} iconPosition="right" size="lg">
              Sign In
            </Button>

            <p className="text-center text-sm text-ink-500 dark:text-dark-400">
              Don't have an account?{' '}
              <button type="button" onClick={toggleMode} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline transition-colors">
                Sign Up
              </button>
            </p>
          </motion.form>
        ) : (
          <motion.form key="signup" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} onSubmit={handleSignUp} className="space-y-3.5">
            <Input label="Full Name" type="text" placeholder="Jane Smith" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} icon={<User size={16} />} fullWidth autoFocus />
            <Input label="Email" type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={16} />} fullWidth />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-800 dark:text-dark-200">Role</label>
              <select
                value={userInfo.role}
                onChange={(e) => setUserInfo({ ...userInfo, role: e.target.value as UserRole })}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-dark-900 border border-ink-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400 text-ink-950 dark:text-dark-100 transition-all"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="coordinator">Coordinator</option>
              </select>
            </div>

            <Input label="Department" type="text" placeholder="Computer Science" value={userInfo.department} onChange={(e) => setUserInfo({ ...userInfo, department: e.target.value })} icon={<Building size={16} />} fullWidth />
            <Input label="Phone (Optional)" type="tel" placeholder="+91 98765 43210" value={userInfo.phone} onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })} icon={<Phone size={16} />} fullWidth />

            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              iconRight={
                <button type="button" onClick={() => setShowPass((v) => !v)} className="pointer-events-auto text-ink-400 hover:text-ink-700 transition-colors">
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
                <button type="button" onClick={() => setShowConfirmPass((v) => !v)} className="pointer-events-auto text-ink-400 hover:text-ink-700 transition-colors">
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              fullWidth
              error={error}
            />

            <Button type="submit" fullWidth isLoading={isLoading} size="lg">Create Account</Button>

            <p className="text-center text-sm text-ink-500 dark:text-dark-400">
              Already have an account?{' '}
              <button type="button" onClick={toggleMode} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign In</button>
            </p>
          </motion.form>
        )}
      </AnimatePresence>

      {!isSignUp && (
        <motion.div
          className="mt-7 pt-6 border-t border-ink-100 dark:border-dark-700/60"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-heading font-semibold uppercase tracking-wide text-ink-500 dark:text-dark-400">Explore the demo</p>
            <span className="h-px flex-1 bg-ink-100 dark:bg-dark-700/60" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {DEMO.map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => handleDemo(d)}
                disabled={!!demoLoading}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-dark-800 border border-ink-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-soft transition-all disabled:opacity-60 group"
              >
                <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${d.color} text-white flex items-center justify-center flex-shrink-0`}>
                  {demoLoading === d.role
                    ? <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <d.icon size={15} />}
                </span>
                <span className="text-left min-w-0">
                  <span className="block text-xs font-semibold text-ink-800 dark:text-dark-100">Explore as</span>
                  <span className="block text-sm font-heading font-bold text-ink-950 dark:text-dark-50 truncate">{d.role}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-400 dark:text-dark-500 text-center">One click signs you in with a sample account.</p>
        </motion.div>
      )}
    </div>
  );
};

export default AuthForm;
