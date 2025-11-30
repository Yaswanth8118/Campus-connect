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