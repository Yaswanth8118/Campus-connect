import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Building, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';
import GradientText from '../ui/GradientText';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

enum AuthStep {
  EMAIL,
  OTP,
  USER_INFO,
  PASSWORD,
  LOGIN,
}

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<AuthStep>(AuthStep.EMAIL);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  
  // User info for sign up
  const [userInfo, setUserInfo] = useState({
    name: '',
    role: 'candidate' as UserRole,
    department: '',
    phone: '',
  });

  const { 
    sendOtp, 
    verifyOtp, 
    setPassword: setUserPassword, 
    login,
    isLoading, 
    otpSent, 
    otpVerified, 
    error: authError,
  } = useAuthStore();

  // Auto-advance to next step when store updates
  React.useEffect(() => {
    if (otpSent && step === AuthStep.EMAIL) {
      setStep(AuthStep.OTP);
    }
    if (otpVerified && step === AuthStep.OTP) {
      setStep(isSignUp ? AuthStep.USER_INFO : AuthStep.LOGIN);
    }
  }, [otpSent, otpVerified, step, isSignUp]);

  React.useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Email is required');
      return;
    }
    await sendOtp(email);
  };

  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('OTP is required');
      return;
    }
    await verifyOtp(email, otp);
  };

  const handleSubmitUserInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userInfo.name) {
      setError('Name is required');
      return;
    }
    setStep(AuthStep.PASSWORD);
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const userData = {
      email: email,
      phone: userInfo.phone,
      ...userInfo,
    };
    
    await setUserPassword(email, password, userData);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Password is required');
      return;
    }
    await login(email, password);
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setStep(AuthStep.EMAIL);
    setError('');
    setEmail('');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setUserInfo({ name: '', role: 'candidate', department: '', phone: '' });
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="w-full">
      {/* Header */}
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
        <p className="text-neutral-600">
          {isSignUp
            ? 'Create your secure account with email verification'
            : 'Sign in to access your dashboard'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Email Step */}
        {step === AuthStep.EMAIL && (
          <motion.form
            key="email"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSubmitEmail}
            className="space-y-6"
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
              error={error}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
            >
              Send Verification Code
            </Button>

            <div className="text-center text-sm">
              <span className="text-neutral-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                className="ml-1 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                onClick={toggleAuthMode}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </motion.form>
        )}

        {/* OTP Step */}
        {step === AuthStep.OTP && (
          <motion.form
            key="otp"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSubmitOtp}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Mail className="w-8 h-8 text-primary-600" />
              </motion.div>
              <p className="text-neutral-600">
                We've sent a verification code to{' '}
                <span className="font-semibold text-primary-700">{email}</span>
              </p>
            </div>

            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              fullWidth
              autoFocus
              error={error}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg"
            >
              Verify Code
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                onClick={() => setStep(AuthStep.EMAIL)}
              >
                Change email address
              </button>
            </div>
          </motion.form>
        )}

        {/* User Info Step (Sign Up Only) */}
        {step === AuthStep.USER_INFO && (
          <motion.form
            key="userinfo"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSubmitUserInfo}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">Tell us about yourself</h3>
              <p className="text-sm text-neutral-600">Help us personalize your experience</p>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Role
              </label>
              <select
                value={userInfo.role}
                onChange={(e) => setUserInfo({ ...userInfo, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
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

            <Button
              type="submit"
              fullWidth
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
            >
              Continue
            </Button>
          </motion.form>
        )}

        {/* Password Step (Sign Up) */}
        {step === AuthStep.PASSWORD && (
          <motion.form
            key="password"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSubmitPassword}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">Secure your account</h3>
              <p className="text-sm text-neutral-600">Create a strong password</p>
            </div>

            <Input
              label="Create Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              fullWidth
              autoFocus
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

            <div className="text-xs text-neutral-500 space-y-1 bg-primary-50 p-3 rounded-lg">
              <p className="font-medium">Password must contain:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character</li>
              </ul>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg"
            >
              Create Account
            </Button>
          </motion.form>
        )}

        {/* Login Step */}
        {step === AuthStep.LOGIN && (
          <motion.form
            key="login"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              fullWidth
              autoFocus
              error={error}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg"
            >
              Sign In
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Demo Account Access */}
      <motion.div 
        className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-medium text-primary-800 mb-2">Demo Accounts:</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-primary-700">
          <div>
            <p>Admin: admin@campus.edu</p>
            <p>Coordinator: coordinator@campus.edu</p>
          </div>
          <div>
            <p>Faculty: faculty@campus.edu</p>
            <p>Student: student@campus.edu</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-primary-600">Password: "password"</p>
      </motion.div>
    </div>
  );
};

export default AuthForm;