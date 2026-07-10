import { create } from 'zustand';
import { Message } from '../types';
import { isSupabaseConfigured, dbSelect, dbInsert, dbDelete } from '../lib/supabase';

const mockMessages: Message[] = [
  { id: '1', content: 'Welcome to the Freshman Orientation room!', senderId: '2', senderName: 'Coordinator User', senderRole: 'coordinator', roomId: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'text' },
  { id: '2', content: "Please check the schedule for today's activities.", senderId: '3', senderName: 'Team Lead', senderRole: 'team_leader', roomId: '1', timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'text' },
  { id: '3', content: 'I have a question about the orientation schedule.', senderId: '4', senderName: 'Student User', senderRole: 'student', roomId: '1', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'text' },
  { id: '4', content: "We'll be covering career opportunities in tech today.", senderId: '2', senderName: 'Coordinator User', senderRole: 'coordinator', roomId: '2', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'text' },
  { id: '5', content: "Today's exam prep session will focus on math concepts.", senderId: '2', senderName: 'Coordinator User', senderRole: 'coordinator', roomId: '3', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'text' },
];

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export const useMessageStore = create<
  MessageState & {
    fetchMessages: (roomId: string) => Promise<void>;
    sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
    deleteMessage: (id: string) => Promise<void>;
  }
>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  fetchMessages: async (roomId) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const rows = await dbSelect('messages', `room_id=eq.${roomId}&select=*,profiles:sender_id(name,role)&order=created_at.asc`);
        const messages: Message[] = rows.map((m: any) => ({
          id: m.id,
          content: m.content,
          senderId: m.sender_id,
          senderName: m.profiles?.name || 'Unknown',
          senderRole: m.profiles?.role || 'student',
          roomId: m.room_id,
          eventId: m.event_id,
          timestamp: m.created_at,
          type: m.type || 'text',
          mediaUrl: m.media_url,
          fileName: m.file_name,
        }));
        set({ messages, isLoading: false });
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
      set({ messages: mockMessages.filter((m) => m.roomId === roomId), isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch messages', isLoading: false });
    }
  },

  sendMessage: async (message) => {
    try {
      if (isSupabaseConfigured()) {
        const created = await dbInsert('messages', {
          content: message.content,
          sender_id: message.senderId,
          room_id: message.roomId,
          event_id: message.eventId || null,
          type: message.type,
          media_url: message.mediaUrl || '',
          file_name: message.fileName || '',
        });
        const newMsg: Message = { ...message, id: created.id, timestamp: created.created_at };
        set((s) => ({ messages: [...s.messages, newMsg] }));
        return;
      }
      const newMsg: Message = { ...message, id: `${Date.now()}`, timestamp: new Date().toISOString() };
      set((s) => ({ messages: [...s.messages, newMsg] }));
    } catch (error) {
      set({ error: 'Failed to send message' });
    }
  },

  deleteMessage: async (id) => {
    try {
      if (isSupabaseConfigured()) await dbDelete('messages', `id=eq.${id}`);
      set((s) => ({ messages: s.messages.filter((m) => m.id !== id) }));
    } catch (error) {
      set({ error: 'Failed to delete message' });
    }
  },
}));
