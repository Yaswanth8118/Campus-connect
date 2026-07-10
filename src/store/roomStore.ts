import { create } from 'zustand';
import { Room } from '../types';
import { isSupabaseConfigured, dbSelect, dbInsert, dbUpdate, dbDelete } from '../lib/supabase';

const mockRooms: Room[] = [
  { id: '1', name: 'Freshman Orientation', description: 'Room for freshman orientation activities', createdBy: '2', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), members: ['1', '2', '3', '4'], isPrivate: false, category: 'academic' },
  { id: '2', name: 'Career Development', description: 'Career development resources and discussions', createdBy: '2', createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), members: ['2', '3', '4'], isPrivate: false, category: 'social' },
  { id: '3', name: 'Exam Preparation', description: 'Study groups and exam preparation', createdBy: '3', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), members: ['3', '4'], isPrivate: false, category: 'academic' },
];

interface RoomState {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
}

export const useRoomStore = create<
  RoomState & {
    fetchRooms: () => Promise<void>;
    createRoom: (room: Omit<Room, 'id' | 'createdAt'>) => Promise<void>;
    updateRoom: (id: string, room: Partial<Room>) => Promise<void>;
    deleteRoom: (id: string) => Promise<void>;
    addMember: (roomId: string, memberId: string) => Promise<void>;
    removeMember: (roomId: string, memberId: string) => Promise<void>;
  }
>((set) => ({
  rooms: [],
  isLoading: false,
  error: null,

  fetchRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const rows = await dbSelect('rooms', 'select=*&order=created_at.desc');
        const memberRows = await dbSelect('room_members', 'select=room_id,user_id');
        const memberMap: Record<string, string[]> = {};
        for (const m of memberRows) {
          if (!memberMap[m.room_id]) memberMap[m.room_id] = [];
          memberMap[m.room_id].push(m.user_id);
        }
        const rooms: Room[] = rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description || '',
          createdBy: r.created_by || '',
          createdAt: r.created_at,
          members: memberMap[r.id] || [],
          isPrivate: r.is_private || false,
          category: r.category || 'general',
        }));
        set({ rooms, isLoading: false });
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
      set({ rooms: mockRooms, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch rooms', isLoading: false });
    }
  },

  createRoom: async (room) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        const created = await dbInsert('rooms', {
          name: room.name,
          description: room.description,
          created_by: room.createdBy,
          is_private: room.isPrivate,
          category: room.category,
        });
        await dbInsert('room_members', { room_id: created.id, user_id: room.createdBy });
        const newRoom: Room = { ...room, id: created.id, createdAt: created.created_at, members: [room.createdBy] };
        set((s) => ({ rooms: [newRoom, ...s.rooms], isLoading: false }));
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
      const newRoom: Room = { ...room, id: `${Date.now()}`, createdAt: new Date().toISOString() };
      set((s) => ({ rooms: [...s.rooms, newRoom], isLoading: false }));
    } catch (error) {
      set({ error: 'Failed to create room', isLoading: false });
    }
  },

  updateRoom: async (id, room) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) {
        await dbUpdate('rooms', `id=eq.${id}`, {
          ...(room.name && { name: room.name }),
          ...(room.description !== undefined && { description: room.description }),
          ...(room.isPrivate !== undefined && { is_private: room.isPrivate }),
          ...(room.category && { category: room.category }),
        });
      }
      set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...room } : r)), isLoading: false }));
    } catch (error) {
      set({ error: 'Failed to update room', isLoading: false });
    }
  },

  deleteRoom: async (id) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured()) await dbDelete('rooms', `id=eq.${id}`);
      set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id), isLoading: false }));
    } catch (error) {
      set({ error: 'Failed to delete room', isLoading: false });
    }
  },

  addMember: async (roomId, memberId) => {
    try {
      if (isSupabaseConfigured()) await dbInsert('room_members', { room_id: roomId, user_id: memberId });
      set((s) => ({
        rooms: s.rooms.map((r) => r.id === roomId ? { ...r, members: [...r.members, memberId] } : r),
      }));
    } catch (error) {
      set({ error: 'Failed to add member' });
    }
  },

  removeMember: async (roomId, memberId) => {
    try {
      if (isSupabaseConfigured()) await dbDelete('room_members', `room_id=eq.${roomId}&user_id=eq.${memberId}`);
      set((s) => ({
        rooms: s.rooms.map((r) => r.id === roomId ? { ...r, members: r.members.filter((id) => id !== memberId) } : r),
      }));
    } catch (error) {
      set({ error: 'Failed to remove member' });
    }
  },
}));
