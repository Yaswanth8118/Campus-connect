import { create } from 'zustand';
import { Message } from '../types';

// Mock messages data for the demo
const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Welcome to the Freshman Orientation room!',
    senderId: '2', // Coordinator ID
    senderName: 'Coordinator User',
    senderRole: 'coordinator',
    roomId: '1',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    type: 'text',
  },
  {
    id: '2',
    content: 'Please check the schedule for today\'s activities.',
    senderId: '3', // Faculty ID
    senderName: 'Faculty User',
    senderRole: 'faculty',
    roomId: '1',
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    type: 'text',
  },
  {
    id: '3',
    content: 'I have a question about the orientation schedule.',
    senderId: '4', // Student ID
    senderName: 'Student User',
    senderRole: 'candidate',
    roomId: '1',
    timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    type: 'text',
  },
  {
    id: '4',
    content: 'We\'ll be covering career opportunities in tech today.',
    senderId: '2', // Coordinator ID
    senderName: 'Coordinator User',
    senderRole: 'coordinator',
    roomId: '2',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    type: 'text',
  },
  {
    id: '5',
    content: 'Today\'s exam prep session will focus on math concepts.',
    senderId: '3', // Faculty ID
    senderName: 'Faculty User',
    senderRole: 'faculty',
    roomId: '3',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    type: 'text',
  },
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
      // Mock API call to fetch messages
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const roomMessages = mockMessages.filter((m) => m.roomId === roomId);
      set({ messages: roomMessages, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch messages', isLoading: false });
    }
  },

  sendMessage: async (message) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to send message
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newMessage: Message = {
        ...message,
        id: `${Date.now()}`, // Generate a new ID
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, newMessage],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to send message', isLoading: false });
    }
  },

  deleteMessage: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to delete message
      await new Promise((resolve) => setTimeout(resolve, 500));
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete message', isLoading: false });
    }
  },
}));