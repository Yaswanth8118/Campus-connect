import { create } from 'zustand';
import { Department, Assignment, Submission, Grade } from '../types';
import { isSupabaseConfigured, dbSelect, dbInsert, dbUpdate, dbDelete } from '../lib/supabase';

interface AcademicState {
  departments: Department[];
  assignments: Assignment[];
  submissions: Submission[];
  grades: Grade[];
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
}

export const useAcademicStore = create<AcademicState>((set) => ({
  departments: [],
  assignments: [],
  submissions: [],
  grades: [],
  isLoading: false,
  error: null,

  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const data = await dbSelect('departments', 'select=*&order=name.asc');
        set({ departments: data, isLoading: false });
        return;
      }
      set({ departments: [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createDepartment: async (department) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const created = await dbInsert('departments', department);
        set((s) => ({ departments: [...s.departments, created], isLoading: false }));
        return;
      }
      const mock = { ...department, id: `${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      set((s) => ({ departments: [...s.departments, mock as Department], isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateDepartment: async (id, department) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        await dbUpdate('departments', `id=eq.${id}`, { ...department, updated_at: new Date().toISOString() });
      }
      set((s) => ({ departments: s.departments.map((d) => d.id === id ? { ...d, ...department } : d), isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteDepartment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) await dbDelete('departments', `id=eq.${id}`);
      set((s) => ({ departments: s.departments.filter((d) => d.id !== id), isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const data = await dbSelect('assignments', 'select=*&order=due_date.desc');
        set({ assignments: data, isLoading: false });
        return;
      }
      set({ assignments: [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createAssignment: async (assignment) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const created = await dbInsert('assignments', assignment);
        set((s) => ({ assignments: [...s.assignments, created], isLoading: false }));
        return;
      }
      const mock = { ...assignment, id: `${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      set((s) => ({ assignments: [...s.assignments, mock as Assignment], isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateAssignment: async (id, assignment) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) await dbUpdate('assignments', `id=eq.${id}`, { ...assignment, updated_at: new Date().toISOString() });
      set((s) => ({ assignments: s.assignments.map((a) => a.id === id ? { ...a, ...assignment } : a), isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteAssignment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) await dbDelete('assignments', `id=eq.${id}`);
      set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id), isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchSubmissions: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const data = await dbSelect('submissions', `student_id=eq.${studentId}&select=*`);
        set({ submissions: data, isLoading: false });
        return;
      }
      set({ submissions: [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createSubmission: async (submission) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const created = await dbInsert('submissions', submission);
        set((s) => ({ submissions: [...s.submissions, created], isLoading: false }));
        return;
      }
      const mock = { ...submission, id: `${Date.now()}`, submitted_at: new Date().toISOString(), created_at: new Date().toISOString() };
      set((s) => ({ submissions: [...s.submissions, mock as Submission], isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchGrades: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const data = await dbSelect('grades', `student_id=eq.${studentId}&select=*&order=created_at.desc`);
        set({ grades: data, isLoading: false });
        return;
      }
      set({ grades: [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createGrade: async (grade) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const created = await dbInsert('grades', grade);
        set((s) => ({ grades: [...s.grades, created], isLoading: false }));
        return;
      }
      const mock = { ...grade, id: `${Date.now()}`, created_at: new Date().toISOString() };
      set((s) => ({ grades: [...s.grades, mock as Grade], isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
