import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Users, Calendar, MessageSquare, BookOpen, BarChart3,
  ArrowRight, GraduationCap, CheckCircle, Star, Building, Zap, UsersRound,
} from 'lucide-react';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';

const features = [
  { icon: Shield,        title: 'Role-Based Access',  desc: 'Dedicated views for Admins, Coordinators, Team Leaders, and Students.' },
  { icon: MessageSquare, title: 'Real-time Chat',     desc: 'Instant messaging in collaboration rooms with media sharing.' },
  { icon: Calendar,      title: 'Event Management',   desc: 'Create, schedule, and broadcast live events with real-time attendance.' },
  { icon: BookOpen,      title: 'Academic Tools',     desc: 'Assignments, grades, and attendance tracking for campus workflows.' },
  { icon: BarChart3,     title: 'Analytics & Reports', desc: 'Coordinators and admins get actionable insights and exportable reports.' },
  { icon: Building,      title: 'Department Hub',     desc: 'Manage departments, rooms, and members from a single dashboard.' },
];

const benefits = [
  'Unified login for all campus stakeholders',
  'Mobile-responsive on every device',
  'Clean minimal UI designed for clarity',
  'Real-time notifications and updates',
  'Secure with role-based access control',
  'Light and dark themes included',
];

const stats = [
  { label: 'Active Rooms',  value: '150+' },
  { label: 'Events/Month',  value: '80+' },
  { label: 'Student Users', value: '2K+' },
  { label: 'Uptime',        value: '99.9%' },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const fadeIn = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-dark-900 overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/90 dark:bg-dark-950/90 backdrop-blur-xl border-b border-ink-100 dark:border-dark-800/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/campus-connect.png" alt="Campus Connect" className="w-8 h-8 object-contain" />
            <span className="font-heading font-bold text-lg text-primary-700 dark:text-primary-400 tracking-tight">
              Campus Connect
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-20 px-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 rounded-full bg-primary-200/20 dark:bg-primary-900/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent-200/15 dark:bg-accent-900/8 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={fadeIn} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-xs font-heading font-semibold border border-primary-200 dark:border-primary-800/40 mb-6">
              <Zap size={13} className="text-primary-500" />
              Academic Collaboration Platform
            </span>
          </motion.div>

          <motion.h1
            className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl text-ink-950 dark:text-dark-50 leading-[1.1] tracking-tight mb-6"
            variants={fadeIn} initial="hidden" animate="show" transition={{ duration: 0.65, delay: 0.1 }}
          >
            Where Education
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-500">
              Meets Innovation
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-ink-500 dark:text-dark-400 max-w-2xl mx-auto leading-relaxed mb-10"
            variants={fadeIn} initial="hidden" animate="show" transition={{ duration: 0.65, delay: 0.2 }}
          >
            A unified platform for students, team leaders, coordinators, and admins. Collaborate in rooms,
            manage events, track academics, and stay connected.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            variants={fadeIn} initial="hidden" animate="show" transition={{ duration: 0.65, delay: 0.3 }}
          >
            <Button size="lg" icon={<ArrowRight size={18} />} iconPosition="right" onClick={() => navigate('/auth')}>
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
              View Demo
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-5 bg-white dark:bg-dark-950 border-y border-ink-100 dark:border-dark-800/60">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <p className="font-heading font-bold text-4xl text-primary-600 dark:text-primary-400">{s.value}</p>
              <p className="text-sm text-ink-500 dark:text-dark-400 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-bold text-4xl text-ink-950 dark:text-dark-50 tracking-tight mb-3">
              Everything your campus needs
            </h2>
            <p className="text-ink-500 dark:text-dark-400 text-lg max-w-xl mx-auto">
              From collaboration rooms to academic management, Campus Connect brings it all together.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="group p-6 bg-white dark:bg-dark-850 rounded-2xl border border-ink-100 dark:border-dark-700/60 hover:border-primary-200 dark:hover:border-primary-700/50 hover:shadow-card-hover transition-all duration-300 cursor-default"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-heading font-semibold text-base text-ink-950 dark:text-dark-50 mb-2">{f.title}</h3>
                <p className="text-sm text-ink-500 dark:text-dark-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5 bg-white dark:bg-dark-950">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading font-bold text-4xl text-ink-950 dark:text-dark-50 tracking-tight mb-4">
              Built for the modern campus
            </h2>
            <p className="text-ink-500 dark:text-dark-400 mb-7 leading-relaxed">
              Designed with clarity and performance in mind, Campus Connect adapts to your workflows
              whether you're a first-year student or a department coordinator.
            </p>
            <ul className="space-y-3">
              {benefits.map((b, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3 text-sm text-ink-800 dark:text-dark-200"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <CheckCircle className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400 flex-shrink-0" size={18} />
                  {b}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {[
              { role: 'Student',      color: 'from-success-500 to-success-600', icon: GraduationCap, desc: 'Grades, assignments, attendance & events' },
              { role: 'Team Leader',   color: 'from-accent-500 to-accent-600',  icon: UsersRound,    desc: 'Coordinate teams, manage task rooms' },
              { role: 'Coordinator',   color: 'from-primary-600 to-primary-700',icon: Users,         desc: 'Departments, reports & event oversight' },
              { role: 'Admin',         color: 'from-danger-500 to-danger-600',  icon: Shield,        desc: 'Full platform control & user management' },
            ].map((r, i) => (
              <motion.div
                key={i}
                className={`p-5 rounded-2xl bg-gradient-to-br ${r.color} text-white shadow-md`}
                whileHover={{ scale: 1.03, y: -3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <r.icon className="w-8 h-8 mb-3 opacity-90" />
                <p className="font-heading font-bold text-base mb-1">{r.role}</p>
                <p className="text-xs opacity-80 leading-snug">{r.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
        </div>
        <motion.div
          className="relative max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-300" fill="currentColor" />
            ))}
          </div>
          <h2 className="font-heading font-bold text-4xl text-white mb-4 tracking-tight">
            Ready to transform your campus?
          </h2>
          <p className="text-primary-100 text-lg mb-8 leading-relaxed">
            Join thousands of students and educators already using Campus Connect to collaborate,
            learn, and grow together.
          </p>
          <Button
            variant="secondary"
            size="lg"
            icon={<ArrowRight size={18} />}
            iconPosition="right"
            onClick={() => navigate('/auth')}
          >
            Start For Free Today
          </Button>
        </motion.div>
      </section>

      <footer className="py-8 px-5 bg-white dark:bg-dark-950 border-t border-ink-100 dark:border-dark-800/60">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/campus-connect.png" alt="" className="w-7 h-7 object-contain" />
            <span className="font-heading font-semibold text-ink-800 dark:text-dark-200">Campus Connect</span>
          </div>
          <p className="text-xs text-ink-400 dark:text-dark-500">
            &copy; {new Date().getFullYear()} Campus Connect. Built for academic excellence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
