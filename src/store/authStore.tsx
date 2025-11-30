import { create } from 'zustand';
import { AuthState, User } from '../types';
import toast from 'react-hot-toast';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const otpSchema = z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Mock user data with enhanced profiles
const mockUsers: Record<string, User> = {
  'admin@campus.edu': {
    id: '1',
    email: 'admin@campus.edu',
    name: 'Dr. Sarah Johnson',
    role: 'admin',
    profileImage: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    phone: '+1234567890',
    department: 'Administration',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  'coordinator@campus.edu': {
    id: '2',
    email: 'coordinator@campus.edu',
    name: 'Prof. Michael Chen',
    role: 'coordinator',
    profileImage: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    phone: '+1234567891',
    department: 'Student Affairs',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  'faculty@campus.edu': {
    id: '3',
    email: 'faculty@campus.edu',
    name: 'Dr. Emily Rodriguez',
    role: 'faculty',
    profileImage: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg',
    phone: '+1234567892',
    department: 'Computer Science',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  'student@campus.edu': {
    id: '4',
    email: 'student@campus.edu',
    name: 'Alex Thompson',
    role: 'candidate',
    profileImage: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    phone: '+1234567893',
    department: 'Computer Science',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
};

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  otpSent: false,
  otpVerified: false,
  error: null,
  retryCount: 0,
  lastOtpSentTime: null,
  verificationMethod: 'email',
};

// Constants
const MAX_RETRY_ATTEMPTS = 3;
const OTP_COOLDOWN_PERIOD = 30000; // 30 seconds

export const useAuthStore = create<
  AuthState & {
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    setPassword: (email: string, password: string, userData: Partial<User>) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    resetAuth: () => void;
    resendOtp: (email: string) => Promise<void>;
    setVerificationMethod: (method: 'email' | 'sms') => void;
  }
>((set, get) => ({
  ...initialState,

  setVerificationMethod: (method: 'email' | 'sms') => {
    set({ verificationMethod: method });
  },

  sendOtp: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      // Validate email format
      emailSchema.parse(email);

      // Check cooldown period
      const lastSentTime = get().lastOtpSentTime;
      if (lastSentTime && Date.now() - lastSentTime < OTP_COOLDOWN_PERIOD) {
        const remainingTime = Math.ceil((OTP_COOLDOWN_PERIOD - (Date.now() - lastSentTime)) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before requesting another OTP`);
      }

      // For demo purposes, simulate OTP sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In production, this would call your backend
      // const response = await fetch('/send_otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   body: new URLSearchParams({ email }).toString(),
      // });

      toast.success(
        <div className="flex flex-col">
          <span className="font-semibold">OTP Sent Successfully!</span>
          <span className="text-sm text-gray-600 mt-1">
            Check your email inbox for the verification code
          </span>
          <span className="text-xs text-blue-600 mt-1">
            Demo: Use any 6-digit number (e.g., 123456)
          </span>
        </div>,
        { duration: 5000 }
      );
      
      set({ 
        otpSent: true, 
        isLoading: false,
        lastOtpSentTime: Date.now(),
        retryCount: 0
      });
    } catch (error) {
      const message = error instanceof z.ZodError 
        ? error.errors[0].message 
        : error instanceof Error 
          ? error.message 
          : 'Failed to send OTP';
      
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      // Check retry attempts
      const retryCount = get().retryCount;
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        throw new Error(`Maximum retry attempts (${MAX_RETRY_ATTEMPTS}) reached. Please request a new OTP.`);
      }

      // Validate OTP format
      otpSchema.parse(otp);

      // For demo purposes, accept any 6-digit OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In production, this would call your backend
      // const response = await fetch('/verify_otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   body: new URLSearchParams({ email, otp }).toString(),
      // });

      toast.success(
        <div className="flex flex-col">
          <span className="font-semibold">OTP Verified!</span>
          <span className="text-sm text-gray-600 mt-1">
            Email verified successfully
          </span>
        </div>,
        { duration: 3000 }
      );

      set({ 
        otpVerified: true, 
        isLoading: false,
        retryCount: 0
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify OTP';
      const remainingAttempts = MAX_RETRY_ATTEMPTS - get().retryCount - 1;
      
      set(state => ({ 
        error: message, 
        isLoading: false,
        retryCount: state.retryCount + 1
      }));
      
      toast.error(
        <div className="flex flex-col">
          <span className="font-semibold">Invalid OTP</span>
          <span className="text-sm text-gray-600 mt-1">
            {remainingAttempts} attempts remaining
          </span>
        </div>
      );
    }
  },

  setPassword: async (email: string, password: string, userData: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      // Validate password requirements
      passwordSchema.parse(password);

      // Create new user account
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `${Date.now()}`,
        email: email,
        name: userData.name || 'New User',
        role: userData.role || 'candidate',
        phone: userData.phone,
        department: userData.department,
        isVerified: true,
        createdAt: new Date().toISOString(),
        ...userData,
      };

      // Auto-login the user after account creation
      set({ 
        user: newUser, 
        isAuthenticated: true, 
        isLoading: false,
        otpSent: false,
        otpVerified: false,
        retryCount: 0,
        lastOtpSentTime: null
      });

      toast.success(
        <div className="flex flex-col">
          <span className="font-semibold">Account Created Successfully!</span>
          <span className="text-sm text-gray-600 mt-1">
            Welcome to Campus Connect
          </span>
        </div>,
        { duration: 4000 }
      );
    } catch (error) {
      const message = error instanceof z.ZodError 
        ? error.errors[0].message 
        : error instanceof Error 
          ? error.message 
          : 'Failed to create account';
      
      set({ 
        error: message, 
        isLoading: false,
        otpSent: false,
        otpVerified: false
      });
      toast.error(message);
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Validate email format
      emailSchema.parse(email);

      // Mock API call to login
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const user = mockUsers[email];
      if (user && password === 'password') { // For demo purposes
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false,
          retryCount: 0,
          lastOtpSentTime: null
        });
        
        toast.success(
          <div className="flex flex-col">
            <span className="font-semibold">Welcome back!</span>
            <span className="text-sm text-gray-600 mt-1">
              Logged in as {user.role}
            </span>
          </div>,
          { duration: 3000 }
        );
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      const message = error instanceof z.ZodError 
        ? error.errors[0].message 
        : error instanceof Error 
          ? error.message 
          : 'Failed to login';
      
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  logout: () => {
    set({ 
      ...initialState,
      user: null, 
      isAuthenticated: false 
    });
    toast.success('Logged out successfully');
  },

  resetAuth: () => {
    set(initialState);
  },

  resendOtp: async (email: string) => {
    const store = get();
    if (store.lastOtpSentTime && Date.now() - store.lastOtpSentTime < OTP_COOLDOWN_PERIOD) {
      const remainingTime = Math.ceil((OTP_COOLDOWN_PERIOD - (Date.now() - store.lastOtpSentTime)) / 1000);
      toast.error(`Please wait ${remainingTime} seconds before requesting another OTP`);
      return;
    }
    await store.sendOtp(email);
  }
}));