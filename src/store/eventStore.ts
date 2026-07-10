import { create } from 'zustand';
import { Event } from '../types';
import { isSupabaseConfigured, dbSelect, dbInsert, dbUpdate, dbDelete } from '../lib/supabase';

const mockEvents: Event[] = [
  { id: '1', title: 'Orientation Session', description: 'Welcome session for new students', startTime: new Date(Date.now() + 3600000).toISOString(), endTime: new Date(Date.now() + 7200000).toISOString(), roomId: '1', createdBy: '3', isLive: true, attendees: ['1', '2', '3', '4'], category: 'lecture' },
  { id: '2', title: 'Career Development Workshop', description: 'Learn about career opportunities in tech', startTime: new Date(Date.now() + 86400000).toISOString(), endTime: new Date(Date.now() + 93600000).toISOString(), roomId: '2', createdBy: '2', isLive: false, attendees: ['2', '3'], category: 'workshop' },
  { id: '3', title: 'Exam Preparation', description: 'Tips and strategies for upcoming exams', startTime: new Date(Date.now() - 3600000).toISOString(), endTime: new Date(Date.now() + 3600000).toISOString(), roomId: '3', createdBy: '3', isLive: true, attendees: ['3', '4'], category: 'lecture' },
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
      if (isSupabaseConfigured()) {
        const rows = await dbSelect('events', 'select=*&order=start_time.desc');
        const attendeeRows = await dbSelect('event_attendees', 'select=event_id,user_id');
        const attendeeMap: Record<string, string[]> = {};
        for (const a of attendeeRows) {
          if (!attendeeMap[a.event_id]) attendeeMap[a.event_id] = [];
          attendeeMap[a.event_id].push(a.user_id);
        }
        const events: Event[] = rows.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description || '',
          startTime: e.start_time,
          endTime: e.end_time,
          roomId: e.room_id || '',
          createdBy: e.created_by || '',
          isLive: e.is_live || false,
          attendees: attendeeMap[e.id] || [],
          maxAttendees: e.max_attendees,
          category: e.category || 'meeting',
        }));
        set({ events, isLoading: false });
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
      set({ events: mockEvents, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch events', isLoading: false });
    }
  },

  createEvent: async (event) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const created = await dbInsert('events', {
          title: event.title,
          description: event.description,
          start_time: event.startTime,
          end_time: event.endTime,
          room_id: event.roomId || null,
          created_by: event.createdBy,
          is_live: event.isLive,
          max_attendees: event.maxAttendees || null,
          category: event.category,
        });
        const newEvent: Event = { ...event, id: created.id };
        set((s) => ({ events: [newEvent, ...s.events], isLoading: false }));
        return;
      }
      const newEvent: Event = { ...event, id: `${Date.now()}` };
      set((s) => ({ events: [...s.events, newEvent], isLoading: false }));
    } catch (error) {
      set({ error: 'Failed to create event', isLoading: false });
    }
  },

  updateEvent: async (id, event) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const patch: Record<string, any> = {};
        if (event.title !== undefined) patch.title = event.title;
        if (event.description !== undefined) patch.description = event.description;
        if (event.startTime !== undefined) patch.start_time = event.startTime;
        if (event.endTime !== undefined) patch.end_time = event.endTime;
        if (event.isLive !== undefined) patch.is_live = event.isLive;
        if (event.category !== undefined) patch.category = event.category;
        await dbUpdate('events', `id=eq.${id}`, patch);
      }
      set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...event } : e)), isLoading: false }));
    } catch (error) {
      set({ error: 'Failed to update event', isLoading: false });
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) await dbDelete('events', `id=eq.${id}`);
      set((s) => ({ events: s.events.filter((e) => e.id !== id), isLoading: false }));
    } catch (error) {
      set({ error: 'Failed to delete event', isLoading: false });
    }
  },

  getLiveEvents: () => get().events.filter((e) => e.isLive),
}));
