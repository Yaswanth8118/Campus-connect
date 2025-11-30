import { create } from 'zustand';
import { Event } from '../types';

// Mock events data for the demo
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Orientation Session',
    description: 'Welcome session for new students',
    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    roomId: '1',
    createdBy: '3', // Faculty ID
    isLive: true,
  },
  {
    id: '2',
    title: 'Career Development Workshop',
    description: 'Learn about career opportunities in tech',
    startTime: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    endTime: new Date(Date.now() + 93600000).toISOString(), // 1 day + 2 hours from now
    roomId: '2',
    createdBy: '2', // Coordinator ID
    isLive: false,
  },
  {
    id: '3',
    title: 'Exam Preparation',
    description: 'Tips and strategies for upcoming exams',
    startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    roomId: '3',
    createdBy: '3', // Faculty ID
    isLive: true,
  },
];

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

export const useEventStore = create<
  EventState & {
    fetchEvents: () => Promise<void>;
    createEvent: (event: Omit<Event, 'id'>) => Promise<void>;
    updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    getLiveEvents: () => Event[];
  }
>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to fetch events
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({ events: mockEvents, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch events', isLoading: false });
    }
  },

  createEvent: async (event) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to create event
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newEvent: Event = {
        ...event,
        id: `${Date.now()}`, // Generate a new ID
      };
      set((state) => ({
        events: [...state.events, newEvent],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create event', isLoading: false });
    }
  },

  updateEvent: async (id, event) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to update event
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, ...event } : e)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update event', isLoading: false });
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to delete event
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete event', isLoading: false });
    }
  },

  getLiveEvents: () => {
    const { events } = get();
    return events.filter((event) => event.isLive);
  },
}));