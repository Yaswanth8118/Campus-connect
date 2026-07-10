import { create } from 'zustand';
import { AuthState, User, UserRole } from '../types';
import toast from 'react-hot-toast';
import { z } from 'zod';
import {
  isSupabaseConfigured,
  signInWithPassword,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  getSessionUser,
  clearSession,
  dbSelect,
  dbUpsert,
} from '../lib/supabase';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

const mockUsers: Record<string, { user: User; password: string }> = {
  'admin@campus.edu': {
    user: { id: '1', email: 'admin@campus.edu', name: 'Dr. Sarah Johnson', role: 'admin', profileImage: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg', phone: '+1234567890', department: 'Administration', isVerified: true, createdAt: new Date().toISOString() },
    password: 'Admin@123',
  },
  'coordinator@campus.edu': {
    user: { id: '2', email: 'coordinator@campus.edu', name: 'Prof. Michael Chen', role: 'coordinator', profileImage: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', phone: '+1234567891', department: 'Student Affairs', isVerified: true, createdAt: new Date().toISOString() },
    password: 'Coord@123',
  },
  'teamlead@campus.edu': {
    user: { id: '3', email: 'teamlead@campus.edu', name: 'Alex Rivera', role: 'team_leader', profileImage: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg', phone: '+1234567892', department: 'Computer Science', isVerified: true, createdAt: new Date().toISOString() },
    password: 'Lead@1234',
  },
  'student@campus.edu': {
    user: { id: '4', email: 'student@campus.edu', name: 'Alex Thompson', role: 'student', profileImage: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg', phone: '+1234567893', department: 'Computer Science', isVerified: true, createdAt: new Date().toISOString() },
    password: 'Student@1',
  },
};

const initialState: AuthState = { user: null, isAuthenticated: false, isLoading: false, error: null };

async function fetchProfile(userId: string): Promise<Partial<User> | null> {
  try {
    const rows = await dbSelect('profiles', `id=eq.${userId}&select=*`);
    if (rows.length > 0) {
      const p = rows[0];
      return {
        id: p.id,
        email: p.email,
        name: p.name,
        role: p.role as UserRole,
        profileImage: p.profile_image,
        phone: p.phone,
        department: p.department,
        isVerified: p.is_verified,
        createdAt: p.created_at,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<
  AuthState & {
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; name: string; role: UserRole; department?: string; phone?: string }) => Promise<void>;
    logout: () => void;
    resetAuth: () => void;
    refreshProfile: () => Promise<void>;
  }
>((set, get) => ({
  ...initialState,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      emailSchema.parse(email);
      const lowerEmail = email.toLowerCase().trim();

      if (isSupabaseConfigured()) {
        try {
          const session = await signInWithPassword(lowerEmail, password);
          const profile = await fetchProfile(session.user.id);
          const meta = session.user.user_metadata || {};
          const user: User = {
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || meta.name || lowerEmail.split('@')[0],
            role: (profile?.role || meta.role || 'student') as UserRole,
            profileImage: profile?.profileImage || meta.profile_image,
            phone: profile?.phone || meta.phone || '',
            department: profile?.department || meta.department || '',
            isVerified: !!session.user.email_confirmed_at,
            createdAt: session.user.created_at,
          };
          set({ user, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome back, ${user.name}!`);
          return;
        } catch (err: any) {
          throw new Error(err.message || 'Invalid email or password');
        }
      }

      // Fallback: mock users for demo
      await new Promise((r) => setTimeout(r, 600));
      const mock = mockUsers[lowerEmail];
      if (mock && mock.password === password) {
        set({ user: mock.user, isAuthenticated: true, isLoading: false });
        toast.success(`Welcome back, ${mock.user.name}!`);
        return;
      }
      throw new Error('Invalid email or password');
    } catch (error) {
      const msg = error instanceof z.ZodError ? error.errors[0].message : error instanceof Error ? error.message : 'Login failed';
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      emailSchema.parse(data.email);
      passwordSchema.parse(data.password);
      if (!data.name.trim()) throw new Error('Full name is required');

      const lowerEmail = data.email.toLowerCase().trim();

      if (isSupabaseConfigured()) {
        const session = await supabaseSignUp(lowerEmail, data.password, {
          name: data.name,
          role: data.role,
          department: data.department || '',
          phone: data.phone || '',
        });

        const user: User = {
          id: session.user.id,
          email: lowerEmail,
          name: data.name,
          role: data.role,
          phone: data.phone || '',
          department: data.department || '',
          isVerified: !!session.user.email_confirmed_at,
          createdAt: new Date().toISOString(),
        };
        set({ user, isAuthenticated: true, isLoading: false });
        toast.success('Account created successfully!');
        return;
      }

      // Fallback: mock registration
      await new Promise((r) => setTimeout(r, 800));
      const user: User = {
        id: `${Date.now()}`,
        email: lowerEmail,
        name: data.name,
        role: data.role,
        phone: data.phone || '',
        department: data.department || '',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success('Account created successfully!');
    } catch (error) {
      const msg = error instanceof z.ZodError ? error.errors[0].message : error instanceof Error ? error.message : 'Registration failed';
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  logout: () => {
    supabaseSignOut().catch(() => {});
    clearSession();
    set({ ...initialState });
    toast.success('Signed out successfully');
  },

  resetAuth: () => set(initialState),

  refreshProfile: async () => {
    const currentUser = get().user;
    if (!currentUser || !isSupabaseConfigured()) return;
    const profile = await fetchProfile(currentUser.id);
    if (profile) {
      set({ user: { ...currentUser, ...profile } });
    }
  },
}));
