import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthForm from '../components/auth/AuthForm';
import GradientText from '../components/ui/GradientText';
import GridDistortion from '../components/ui/GridDistortion';
import ThemeToggle from '../components/ui/ThemeToggle';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Calendar, 
  MessageSquare, 
  Zap, 
  Globe,
  Lock,
  Smartphone,
  GraduationCap,
  BookOpen,
  Award,
  Building,
  Sparkles,
  Rocket,
  Heart
} from 'lucide-react';

const AuthPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Platform",
      description: "Enterprise-grade security with advanced encryption"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Smart Collaboration",
      description: "Connect with peers and faculty seamlessly"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Real-time Communication",
      description: "Instant messaging and live event participation"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Event Management",
      description: "Create, join, and manage campus events effortlessly"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Academic Excellence",
      description: "Tools designed for modern education"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Future Ready",
      description: "Built for the next generation of learners"
    }
  ];

  const campusImages = [
    "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg", // University campus
    "https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg", // Students studying
    "https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg", // Campus building
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950 dark:from-secondary-950 dark:via-secondary-900 dark:to-primary-950">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Interactive Background */}
      <div className="absolute inset-0">
        <GridDistortion
          imageSrc={campusImages[0]}
          grid={25}
          mouse={0.3}
          strength={0.4}
          relaxation={0.85}
          className="opacity-40 dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-secondary-900/50 to-secondary-900/30 dark:from-primary-900/40 dark:via-secondary-900/60 dark:to-secondary-900/40"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full blur-xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-accent-400/20 to-primary-400/20 rounded-full blur-xl"
          animate={{
            y: [0, 40, 0],
            x: [0, -15, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-accent-400/20 to-primary-400/20 rounded-full blur-xl"
          animate={{
            y: [0, -25, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Hero Section */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            {/* Logo and Title */}
            <div className="flex items-center mb-8">
              <motion.div 
                className="w-20 h-20 mr-6 relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img 
                  src="/campusconnect.png" 
                  alt="Campus Connect Logo" 
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <GradientText
                  colors={["#e67544", "#f19967", "#de5a2f", "#b84628", "#e67544"]}
                  animationSpeed={4}
                  className="text-4xl lg:text-6xl font-bold block"
                >
                  Campus Conect
                </GradientText>
                <motion.p 
                  className="text-primary-300 dark:text-primary-200 text-lg font-medium mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Where Education Meets Innovation
                </motion.p>
              </div>
            </div>

            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-white dark:text-gray-100 mb-4 leading-tight">
                The Future of Campus Life is{' '}
                <span className="relative">
                  <GradientText
                    colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                    animationSpeed={3}
                    className="inline"
                  >
                    Here
                  </GradientText>
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-primary-400" />
                  </motion.div>
                </span>
              </h2>
              <p className="text-xl text-gray-300 dark:text-gray-200 leading-relaxed">
                Experience seamless communication, smart event management, and collaborative learning 
                in one powerful platform designed for modern students and faculty.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group bg-white/10 dark:bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-white/10 hover:border-primary-400/50 dark:hover:border-primary-400/30 transition-all duration-300 relative overflow-hidden cursor-pointer"
                  whileHover={{ y: -5, scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-primary-400 dark:text-primary-300 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white dark:text-gray-100 mb-1 group-hover:text-primary-300 dark:group-hover:text-primary-200 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400 dark:text-gray-300 leading-relaxed group-hover:text-gray-300 dark:group-hover:text-gray-200 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Call to Action */}
            <motion.div 
              className="flex items-center p-6 bg-gradient-to-r from-primary-500/20 to-accent-500/20 dark:from-primary-500/15 dark:to-accent-500/15 backdrop-blur-md rounded-xl border border-primary-400/30 dark:border-primary-400/20 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 animate-pulse" />
              <div className="relative flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-primary-300 dark:text-primary-200">
                  <Heart className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Built with passion for education</span>
                </div>
                <div className="ml-auto flex items-center space-x-2 text-accent-300 dark:text-accent-200">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Secure & Private</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/95 dark:bg-secondary-800/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30 dark:border-secondary-700/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-accent-50/50 dark:from-primary-900/20 dark:to-accent-900/20" />
              <div className="relative">
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