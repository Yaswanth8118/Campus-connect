import { create } from 'zustand';
import { AuthState, User, UserRole } from '../types';
import toast from 'react-hot-toast';
import { z } from 'zod';
import {
  isSupabaseConfigured,
  signInWithPassword,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  clearSession,
  restoreSession,
  dbSelect,
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
  'faculty@campus.edu': {
    user: { id: '3', email: 'faculty@campus.edu', name: 'Alex Rivera', role: 'faculty', profileImage: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg', phone: '+1234567892', department: 'Computer Science', isVerified: true, createdAt: new Date().toISOString() },
    password: 'Lead@1234',
  },
  'student@campus.edu': {
    user: { id: '4', email: 'student@campus.edu', name: 'Alex Thompson', role: 'student', profileImage: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg', phone: '+1234567893', department: 'Computer Science', isVerified: true, createdAt: new Date().toISOString() },
    password: 'Student@1',
  },
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  initializing: true,
  error: null,
};

// PostgREST returns an embedded to-one as an object, but be defensive about arrays.
function embedOne(v: any): any {
  return Array.isArray(v) ? v[0] : v;
}

function mapProfile(p: any): User {
  const role = embedOne(p.roles)?.role_name;
  const dept = embedOne(p.departments)?.department_name;
  return {
    id: p.id,
    email: p.email,
    name: p.full_name,
    role: (role ?? 'student') as UserRole,
    profileImage: p.profile_image,
    phone: p.phone,
    department: dept ?? '',
    isVerified: p.status === 'active',
    createdAt: p.created_at,
  };
}

// Returns the raw `users` row (joined to roles/departments) for an auth uid.
// NOTE: `departments` is embedded via the explicit FK hint because there are two
// relationships between users<->departments (users.department_id and
// departments.hod_id). Without the hint PostgREST throws an ambiguity error and
// the whole profile fetch fails — which would silently fall back to a stale role.
async function fetchProfileRow(authUserId: string): Promise<any | null> {
  try {
    const rows = await dbSelect(
      'users',
      `auth_user_id=eq.${authUserId}&select=id,email,full_name,phone,profile_image,status,created_at,` +
        `roles!users_role_id_fkey(role_name),departments!users_department_id_fkey(department_name)`
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<
  AuthState & {
    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; name: string; role: UserRole; department?: string; phone?: string }) => Promise<void>;
    logout: () => void;
    resetAuth: () => void;
    refreshProfile: () => Promise<void>;
  }
>((set, get) => ({
  ...initialState,

  // Restore a persisted session on app startup. Called once from <App>.
  // Guarantees `initializing` ends false so protected routes stop showing the loader.
  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({ initializing: false });
      return;
    }
    try {
      const session = await restoreSession(); // refreshes transparently if expired
      if (!session) {
        clearSession();
        set({ user: null, isAuthenticated: false, initializing: false });
        return;
      }

      const row = await fetchProfileRow(session.user.id);

      // Account exists but is deactivated → deny access.
      if (row && row.status !== 'active') {
        clearSession();
        set({ user: null, isAuthenticated: false, initializing: false });
        return;
      }

      const meta = session.user.user_metadata || {};
      const user: User = row
        ? mapProfile(row)
        : {
            // Session valid but profile row not found yet (e.g. trigger lag) —
            // fall back to session metadata rather than logging the user out.
            id: session.user.id,
            email: session.user.email,
            name: meta.full_name || meta.name || session.user.email.split('@')[0],
            role: (meta.role || 'student') as UserRole,
            profileImage: meta.profile_image || '',
            phone: meta.phone || '',
            department: meta.department || '',
            isVerified: !!session.user.email_confirmed_at,
            createdAt: session.user.created_at,
          };

      set({ user, isAuthenticated: true, initializing: false });
    } catch {
      // Any unexpected failure → treat as unauthenticated, never hang the loader.
      set({ user: null, isAuthenticated: false, initializing: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      emailSchema.parse(email);
      const lowerEmail = email.toLowerCase().trim();

      if (isSupabaseConfigured()) {
        try {
          const session = await signInWithPassword(lowerEmail, password);
          const row = await fetchProfileRow(session.user.id);

          if (row && row.status !== 'active') {
            clearSession();
            throw new Error('Your account is inactive. Contact an administrator.');
          }

          const meta = session.user.user_metadata || {};
          const user: User = row
            ? mapProfile(row)
            : {
                id: session.user.id,
                email: session.user.email,
                name: meta.full_name || meta.name || lowerEmail.split('@')[0],
                role: (meta.role || 'student') as UserRole,
                profileImage: meta.profile_image || '',
                phone: meta.phone || '',
                department: meta.department || '',
                isVerified: !!session.user.email_confirmed_at,
                createdAt: session.user.created_at,
              };
          set({ user, isAuthenticated: true, isLoading: false, initializing: false });
          toast.success(`Welcome back, ${user.name}!`);
          return;
        } catch (err: any) {
          throw new Error(err.message || 'Invalid email or password');
        }
      }

      // Fallback: mock users for local dev without Supabase configured
      await new Promise((r) => setTimeout(r, 600));
      const mock = mockUsers[lowerEmail];
      if (mock && mock.password === password) {
        set({ user: mock.user, isAuthenticated: true, isLoading: false, initializing: false });
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
        set({ user, isAuthenticated: true, isLoading: false, initializing: false });
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
      set({ user, isAuthenticated: true, isLoading: false, initializing: false });
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
    set({ ...initialState, initializing: false });
    toast.success('Signed out successfully');
  },

  resetAuth: () => set({ ...initialState, initializing: false }),

  refreshProfile: async () => {
    const currentUser = get().user;
    if (!currentUser || !isSupabaseConfigured()) return;
    const row = await fetchProfileRow(currentUser.id);
    if (row) set({ user: mapProfile(row) });
  },
}));
