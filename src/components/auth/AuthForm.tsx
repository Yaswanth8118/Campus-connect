import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Building, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';
import GradientText from '../ui/GradientText';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: '',
    role: 'candidate' as UserRole,
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

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        email,
        password,
        ...userInfo,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUserInfo({ name: '', role: 'candidate', department: '', phone: '' });
  };

  return (
    <div className="w-full">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GradientText
          colors={["#ed7544", "#f19968", "#de5a2a", "#b84620"]}
          animationSpeed={3}
          className="text-3xl font-bold block mb-2"
        >
          {isSignUp ? 'Join Campus Connect' : 'Welcome Back'}
        </GradientText>
        <p className="text-gray-700 dark:text-gray-300">
          {isSignUp
            ? 'Create your account to get started'
            : 'Sign in to access your dashboard'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isSignUp ? (
          <motion.form
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              fullWidth
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              fullWidth
              error={error}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
            >
              Sign In
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Don't have an account?
              </span>
              <button
                type="button"
                className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                onClick={toggleAuthMode}
              >
                Sign Up
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.form
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSignUp}
            className="space-y-4"
          >
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              icon={<User size={18} />}
              fullWidth
              autoFocus
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              fullWidth
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={userInfo.role}
                onChange={(e) => setUserInfo({ ...userInfo, role: e.target.value as UserRole })}
                className="w-full px-3 py-2.5 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-900 dark:text-gray-100"
              >
                <option value="candidate">Student</option>
                <option value="faculty">Faculty</option>
                <option value="coordinator">Coordinator</option>
              </select>
            </div>

            <Input
              label="Department"
              type="text"
              placeholder="Enter your department"
              value={userInfo.department}
              onChange={(e) => setUserInfo({ ...userInfo, department: e.target.value })}
              icon={<Building size={18} />}
              fullWidth
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="Enter your phone number"
              value={userInfo.phone}
              onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              icon={<Phone size={18} />}
              fullWidth
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              fullWidth
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={18} />}
              fullWidth
              error={error}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
            >
              Create Account
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Already have an account?
              </span>
              <button
                type="button"
                className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                onClick={toggleAuthMode}
              >
                Sign In
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl border border-primary-200 dark:border-primary-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-3">Demo Accounts:</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1 text-primary-800 dark:text-primary-200">
            <p className="font-medium">Admin</p>
            <p className="text-primary-700 dark:text-primary-300">admin@campus.edu</p>
          </div>
          <div className="space-y-1 text-primary-800 dark:text-primary-200">
            <p className="font-medium">Coordinator</p>
            <p className="text-primary-700 dark:text-primary-300">coordinator@campus.edu</p>
          </div>
          <div className="space-y-1 text-primary-800 dark:text-primary-200">
            <p className="font-medium">Faculty</p>
            <p className="text-primary-700 dark:text-primary-300">faculty@campus.edu</p>
          </div>
          <div className="space-y-1 text-primary-800 dark:text-primary-200">
            <p className="font-medium">Student</p>
            <p className="text-primary-700 dark:text-primary-300">student@campus.edu</p>
          </div>
        </div>
        <p className="mt-3 text-xs font-medium text-primary-800 dark:text-primary-200">Password for all: <span className="font-mono bg-primary-200 dark:bg-primary-800 px-2 py-0.5 rounded">password</span></p>
      </motion.div>
    </div>
  );
};

export default AuthForm;
