export type UserRole = 'admin' | 'coordinator' | 'faculty' | 'candidate';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  phone?: string;
  department?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  otpSent: boolean;
  otpVerified: boolean;
  error: string | null;
  retryCount: number;
  lastOtpSentTime: number | null;
  verificationMethod: 'email' | 'sms';
}

export interface Room {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  members: string[];
  isPrivate: boolean;
  category: 'academic' | 'social' | 'administrative' | 'general';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  roomId: string;
  createdBy: string;
  isLive: boolean;
  attendees: string[];
  maxAttendees?: number;
  category: 'lecture' | 'workshop' | 'meeting' | 'social' | 'exam';
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  roomId: string;
  eventId?: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
  fileName?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  admin: Permission[];
  coordinator: Permission[];
  faculty: Permission[];
  candidate: Permission[];
}

export interface Department {
  id: string;
  name: string;
  head_of_department: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  department_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string;
  submission_text: string;
  status: 'pending' | 'submitted' | 'graded';
  submitted_at: string;
  created_at: string;
}

export interface Grade {
  id: string;
  student_id: string;
  subject: string;
  score: number;
  max_score: number;
  grade_letter: string;
  semester: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  course_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}