import { create } from 'zustand';
import { Department, Assignment, Submission, Grade, AttendanceRecord } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface AcademicState {
  departments: Department[];
  assignments: Assignment[];
  submissions: Submission[];
  grades: Grade[];
  attendanceRecords: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;

  fetchDepartments: () => Promise<void>;
  createDepartment: (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDepartment: (id: string, department: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;

  fetchAssignments: () => Promise<void>;
  createAssignment: (assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;

  fetchSubmissions: (studentId: string) => Promise<void>;
  createSubmission: (submission: Omit<Submission, 'id' | 'submitted_at' | 'created_at'>) => Promise<void>;

  fetchGrades: (studentId: string) => Promise<void>;
  createGrade: (grade: Omit<Grade, 'id' | 'created_at'>) => Promise<void>;

  fetchAttendance: (studentId: string) => Promise<void>;
  createAttendance: (attendance: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase.auth.token');
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
  };
};

export const useAcademicStore = create<AcademicState>((set) => ({
  departments: [],
  assignments: [],
  submissions: [],
  grades: [],
  attendanceRecords: [],
  isLoading: false,
  error: null,

  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/departments?select=*&order=name.asc`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      set({ departments: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createDepartment: async (department) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/departments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(department),
      });

      if (!response.ok) throw new Error('Failed to create department');
      const data = await response.json();
      set((state) => ({
        departments: [...state.departments, data[0]],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateDepartment: async (id, department) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/departments?id=eq.${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...department, updated_at: new Date().toISOString() }),
      });

      if (!response.ok) throw new Error('Failed to update department');
      set((state) => ({
        departments: state.departments.map((d) =>
          d.id === id ? { ...d, ...department } : d
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteDepartment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/departments?id=eq.${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to delete department');
      set((state) => ({
        departments: state.departments.filter((d) => d.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/assignments?select=*&order=due_date.desc`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      set({ assignments: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createAssignment: async (assignment) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/assignments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(assignment),
      });

      if (!response.ok) throw new Error('Failed to create assignment');
      const data = await response.json();
      set((state) => ({
        assignments: [...state.assignments, data[0]],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateAssignment: async (id, assignment) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/assignments?id=eq.${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...assignment, updated_at: new Date().toISOString() }),
      });

      if (!response.ok) throw new Error('Failed to update assignment');
      set((state) => ({
        assignments: state.assignments.map((a) =>
          a.id === id ? { ...a, ...assignment } : a
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteAssignment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/assignments?id=eq.${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to delete assignment');
      set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchSubmissions: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/submissions?student_id=eq.${studentId}&select=*`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      set({ submissions: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createSubmission: async (submission) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(submission),
      });

      if (!response.ok) throw new Error('Failed to create submission');
      const data = await response.json();
      set((state) => ({
        submissions: [...state.submissions, data[0]],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchGrades: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/grades?student_id=eq.${studentId}&select=*&order=created_at.desc`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch grades');
      const data = await response.json();
      set({ grades: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createGrade: async (grade) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/grades`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(grade),
      });

      if (!response.ok) throw new Error('Failed to create grade');
      const data = await response.json();
      set((state) => ({
        grades: [...state.grades, data[0]],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchAttendance: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/attendance_records?student_id=eq.${studentId}&select=*&order=date.desc`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      set({ attendanceRecords: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createAttendance: async (attendance) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/attendance_records`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(attendance),
      });

      if (!response.ok) throw new Error('Failed to create attendance');
      const data = await response.json();
      set((state) => ({
        attendanceRecords: [...state.attendanceRecords, data[0]],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
