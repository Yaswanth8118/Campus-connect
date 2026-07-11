import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthForm from '../components/auth/AuthForm';
import ThemeToggle from '../components/ui/ThemeToggle';
import { motion } from 'framer-motion';
import { Shield, Users, Calendar, MessageSquare, BookOpen, Rocket, Heart, Lock, Sparkles } from 'lucide-react';

const features = [
  { icon: Shield,        title: 'Secure Platform',     desc: 'Role-based access for Admins, Coordinators, Team Leads, and Students' },
  { icon: Users,         title: 'Smart Collaboration', desc: 'Connect with peers, faculty, and coordinators seamlessly' },
  { icon: MessageSquare, title: 'Real-time Chat',      desc: 'Instant messaging inside rooms and live event threads' },
  { icon: Calendar,      title: 'Event Management',    desc: 'Create, join, and track campus events effortlessly' },
  { icon: BookOpen,      title: 'Academic Tools',      desc: 'Grades, assignments, and attendance in one place' },
  { icon: Rocket,        title: 'Future Ready',        desc: 'Built for the next generation of learners' },
];

const AuthPage: React.FC = () => {
  const { isAuthenticated, initializing } = useAuthStore();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/dashboard';

  // Wait for session restore so we don't flash the login form to a logged-in user.
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-950 via-dark-900 to-dark-950">
        <div className="h-12 w-12 rounded-full border-4 border-primary-300/40 border-t-primary-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-ink-950 via-dark-900 to-dark-950">
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { cls: 'top-16 left-8 w-28 h-28', dur: 8, dx: 20, dy: -30 },
          { cls: 'top-48 right-16 w-36 h-36', dur: 11, dx: -15, dy: 40 },
          { cls: 'bottom-24 left-1/3 w-24 h-24', dur: 13, dx: 10, dy: -25 },
        ].map((b, i) => (
          <motion.div
            key={i}
            className={`absolute ${b.cls} bg-gradient-to-br from-primary-400/10 to-accent-400/10 rounded-full blur-3xl`}
            animate={{ y: [0, b.dy, 0], x: [0, b.dx, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        <motion.div
          className="flex-1 flex flex-col justify-center px-8 py-14 lg:px-16"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-xl">
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                className="relative w-16 h-16"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <img src="/campus-connect.png" alt="Campus Connect" className="w-full h-full object-contain drop-shadow-2xl" />
                <motion.div
                  className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <h1 className="font-heading font-bold text-4xl lg:text-5xl text-white tracking-tight">
                  Campus <span className="text-primary-400">Connect</span>
                </h1>
                <p className="text-primary-300/90 text-sm font-medium mt-1">Where Education Meets Innovation</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl lg:text-3xl text-white leading-snug mb-3">
                The Future of Campus Life is{' '}
                <span className="text-primary-400 inline-flex items-center gap-1.5 align-middle">
                  Here
                  <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                    <Sparkles className="w-5 h-5 text-primary-400" />
                  </motion.span>
                </span>
              </h2>
              <p className="text-gray-300/90 text-base leading-relaxed">
                Experience seamless communication, smart event management, and collaborative
                learning — designed for modern students and faculty.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  className="group flex items-start gap-3 bg-white/[0.06] backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-primary-400/35 hover:bg-white/[0.10] transition-all duration-300 cursor-default"
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.07 * i + 0.3 }}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <f.icon size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-heading font-semibold text-white/95 group-hover:text-primary-300 transition-colors">{f.title}</p>
                    <p className="text-xs text-gray-400/90 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="flex flex-wrap items-center gap-4 px-5 py-3.5 bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center gap-2 text-primary-300 text-sm font-medium">
                <Heart className="w-4 h-4 animate-pulse text-primary-400" />
                Built with passion for education
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-accent-300 text-xs">
                <Lock className="w-3.5 h-3.5" />
                Secure &amp; Private
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="w-full max-w-md"
          >
            <div className="relative bg-white/96 dark:bg-dark-900/96 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-dark-700/60 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary-700 via-primary-600 to-accent-500" />
              <div className="p-8">
                <AuthForm />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
