import { create } from 'zustand';
import { AuthState, User } from '../types';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { supabase } from '../lib/supabase';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  otpSent: false,
  otpVerified: false,
  error: null,
  retryCount: 0,
  lastOtpSentTime: null,
  verificationMethod: 'email',
};

const MAX_RETRY_ATTEMPTS = 3;
const OTP_COOLDOWN_PERIOD = 30000;

export const useAuthStore = create<
  AuthState & {
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    setPassword: (email: string, password: string, userData: Partial<User>) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    resetAuth: () => void;
    resendOtp: (email: string) => Promise<void>;
    setVerificationMethod: (method: 'email' | 'sms') => void;
    initializeAuth: () => Promise<void>;
  }
>((set, get) => ({
  ...initialState,

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          const user: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name || '',
            role: profile.role,
            profileImage: profile.profile_image || undefined,
            phone: profile.phone || undefined,
            department: profile.department || undefined,
            isVerified: profile.is_verified,
            createdAt: profile.created_at,
          };

          set({ user, isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          const user: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name || '',
            role: profile.role,
            profileImage: profile.profile_image || undefined,
            phone: profile.phone || undefined,
            department: profile.department || undefined,
            isVerified: profile.is_verified,
            createdAt: profile.created_at,
          };

          set({ user, isAuthenticated: true });
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false });
      }
    });
  },
  setVerificationMethod: (method: 'email' | 'sms') => {
    set({ verificationMethod: method });
  },

  sendOtp: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      emailSchema.parse(email);

      const lastSentTime = get().lastOtpSentTime;
      if (lastSentTime && Date.now() - lastSentTime < OTP_COOLDOWN_PERIOD) {
        const remainingTime = Math.ceil((OTP_COOLDOWN_PERIOD - (Date.now() - lastSentTime)) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before requesting another OTP`);
      }

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      toast.success(
        <div className="flex flex-col">
          <span className="font-semibold">Continue to Next Step</span>
          <span className="text-sm text-gray-600 mt-1">
            Email validated successfully
          </span>
        </div>,
        { duration: 3000 }
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
          : 'Failed to validate email';

      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      const retryCount = get().retryCount;
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        throw new Error(`Maximum retry attempts (${MAX_RETRY_ATTEMPTS}) reached. Please start over.`);
      }

      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        throw new Error('Please enter a valid 6-digit code');
      }

      toast.success(
        <div className="flex flex-col">
          <span className="font-semibold">Verification Complete</span>
          <span className="text-sm text-gray-600 mt-1">
            Please complete your profile
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
      const message = error instanceof Error ? error.message : 'Verification failed';
      const remainingAttempts = MAX_RETRY_ATTEMPTS - get().retryCount - 1;

      set(state => ({
        error: message,
        isLoading: false,
        retryCount: state.retryCount + 1
      }));

      toast.error(
        <div className="flex flex-col">
          <span className="font-semibold">Verification Failed</span>
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
      passwordSchema.parse(password);

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || '',
            role: userData.role || 'candidate',
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create account');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: userData.name || '',
          role: userData.role || 'candidate',
          phone: userData.phone || null,
          department: userData.department || null,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name || '',
          role: profile.role,
          profileImage: profile.profile_image || undefined,
          phone: profile.phone || undefined,
          department: profile.department || undefined,
          isVerified: profile.is_verified,
          createdAt: profile.created_at,
        };

        set({
          user,
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
      }
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
      emailSchema.parse(email);

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!authData.user) throw new Error('Login failed');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name || '',
          role: profile.role,
          profileImage: profile.profile_image || undefined,
          phone: profile.phone || undefined,
          department: profile.department || undefined,
          isVerified: profile.is_verified,
          createdAt: profile.created_at,
        };

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

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({
        ...initialState,
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
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