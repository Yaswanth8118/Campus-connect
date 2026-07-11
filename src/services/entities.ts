/*
  Data-access / repository layer.
  Thin, typed wrappers over the Supabase PostgREST helpers in lib/supabase.
  Each repository maps 1:1 to a database table from the ERP baseline schema.
  Pages and stores depend on these — never on raw fetch — so the data layer
  stays in one place and is easy to test and reason about.
*/
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '../lib/supabase';

// ── Database row types (mirror supabase/migrations/0001_campus_erp_baseline.sql)

export interface DBRole { id: number; role_name: 'admin' | 'coordinator' | 'faculty' | 'student'; description: string; }

export interface DBDepartment {
  id: string; department_name: string; department_code: string;
  hod_id: string | null; description: string; created_at: string;
}

export interface DBUser {
  id: string; auth_user_id: string | null; username: string; email: string;
  full_name: string; phone: string; gender: string; role_id: number;
  department_id: string | null; status: 'active' | 'inactive';
  profile_image: string; created_at: string; updated_at: string;
  roles?: { role_name: string } | null;
  departments?: { department_name: string } | null;
}

export interface DBFaculty {
  id: string; user_id: string; employee_id: string;
  department_id: string | null; designation: string;
}

export interface DBStudent {
  id: string; user_id: string; roll_number: string; department_id: string | null;
  semester: number | null; section: string; year: number | null;
}

export interface DBSubject {
  id: string; subject_name: string; subject_code: string; semester: number | null;
  department_id: string | null; faculty_id: string | null; credits: number;
}

export interface DBRoom {
  id: string; room_number: string; building: string; floor: number;
  capacity: number; room_type: string; status: string; created_at: string;
}

export interface DBEvent {
  id: string; event_name: string; description: string; coordinator_id: string | null;
  room_id: string | null; department_id: string | null; start_date: string;
  end_date: string; status: 'upcoming' | 'live' | 'completed' | 'cancelled'; created_at: string;
}

export interface DBAttendance {
  id: string; student_id: string; subject_id: string; faculty_id: string | null;
  date: string; status: 'present' | 'absent' | 'late' | 'excused'; remarks: string; created_at: string;
}

export interface DBGrade {
  id: string; student_id: string; subject_id: string; faculty_id: string | null;
  internal_marks: number; external_marks: number; assignment_marks: number;
  lab_marks: number; final_grade: string; cgpa: number; updated_at: string;
}

export interface DBAnnouncement {
  id: string; title: string; description: string; department_id: string | null;
  created_by: string | null; created_at: string;
}

// ── Generic repository factory ────────────────────────────────

interface Repo<T> {
  list: (query?: string) => Promise<T[]>;
  get: (id: string, select?: string) => Promise<T | null>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

function repo<T>(table: string): Repo<T> {
  return {
    list: (query = 'select=*') => dbSelect<T>(table, query),
    get: async (id, select = '*') => {
      const rows = await dbSelect<T>(table, `id=eq.${id}&select=${select}`);
      return rows[0] ?? null;
    },
    create: (data) => dbInsert<T>(table, data as Record<string, any>),
    update: (id, data) => dbUpdate<T>(table, `id=eq.${id}`, data as Record<string, any>),
    remove: (id) => dbDelete(table, `id=eq.${id}`),
  };
}

// ── Typed repositories ────────────────────────────────────────

export const rolesRepo         = repo<DBRole>('roles');
export const departmentsRepo   = repo<DBDepartment>('departments');
export const usersRepo         = repo<DBUser>('users');
export const facultyRepo       = repo<DBFaculty>('faculty');
export const studentsRepo      = repo<DBStudent>('students');
export const subjectsRepo      = repo<DBSubject>('subjects');
export const roomsRepo         = repo<DBRoom>('rooms');
export const eventsRepo        = repo<DBEvent>('events');
export const attendanceRepo    = repo<DBAttendance>('attendance');
export const gradesRepo        = repo<DBGrade>('grades');
export const announcementsRepo = repo<DBAnnouncement>('announcements');

// ── Convenience queries used by dashboards ────────────────────

export const usersWithRole = (extra = '') =>
  usersRepo.list(
    `select=id,full_name,email,phone,profile_image,status,created_at,` +
      `roles!users_role_id_fkey(role_name),departments!users_department_id_fkey(department_name)` +
      `&order=created_at.desc${extra}`
  );

// ── Joined read queries (FK-hinted where relationships are ambiguous) ──

export const departmentsList = () =>
  departmentsRepo.list('select=*&order=department_name.asc');

export const roomsList = () =>
  roomsRepo.list('select=*&order=room_number.asc');

export const subjectsWithNames = () =>
  subjectsRepo.list(
    'select=*,departments(department_name),faculty(employee_id,users(full_name))&order=subject_name.asc'
  );

export const eventsWithNames = () =>
  eventsRepo.list('select=*,rooms(room_number),departments(department_name)&order=start_date.desc');

export const facultyWithUser = () =>
  facultyRepo.list('select=*,users(full_name,email),departments(department_name)&order=employee_id.asc');

export const studentsWithUser = () =>
  studentsRepo.list('select=*,users(full_name,email),departments(department_name)&order=roll_number.asc');

export const gradesWithNames = (filter = '') =>
  gradesRepo.list(`select=*,students(roll_number,users(full_name)),subjects(subject_name)${filter}`);

export const attendanceWithNames = (filter = '') =>
  attendanceRepo.list(
    `select=*,students(roll_number,users(full_name)),subjects(subject_name)${filter}&order=date.desc`
  );

export const announcementsWithDept = () =>
  announcementsRepo.list('select=*,departments(department_name)&order=created_at.desc');

// Resolve the current user's role-specific record id (for RLS-compliant writes).
export const myFacultyId = async (appUserId: string): Promise<string | null> => {
  const r = await facultyRepo.list(`user_id=eq.${appUserId}&select=id`);
  return r[0]?.id ?? null;
};
export const myStudentId = async (appUserId: string): Promise<string | null> => {
  const r = await studentsRepo.list(`user_id=eq.${appUserId}&select=id`);
  return r[0]?.id ?? null;
};
