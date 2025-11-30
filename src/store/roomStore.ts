import { create } from 'zustand';
import { Room } from '../types';

// Mock rooms data for the demo
const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Freshman Orientation',
    description: 'Room for freshman orientation activities',
    createdBy: '2', // Coordinator ID
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    members: ['1', '2', '3', '4'], // Admin, Coordinator, Faculty, Student
  },
  {
    id: '2',
    name: 'Career Development',
    description: 'Career development resources and discussions',
    createdBy: '2', // Coordinator ID
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 14 days ago
    members: ['2', '3', '4'], // Coordinator, Faculty, Student
  },
  {
    id: '3',
    name: 'Exam Preparation',
    description: 'Study groups and exam preparation',
    createdBy: '3', // Faculty ID
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    members: ['3', '4'], // Faculty, Student
  },
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
      // Mock API call to fetch rooms
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({ rooms: mockRooms, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch rooms', isLoading: false });
    }
  },

  createRoom: async (room) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to create room
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newRoom: Room = {
        ...room,
        id: `${Date.now()}`, // Generate a new ID
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        rooms: [...state.rooms, newRoom],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create room', isLoading: false });
    }
  },

  updateRoom: async (id, room) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to update room
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set((state) => ({
        rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...room } : r)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update room', isLoading: false });
    }
  },

  deleteRoom: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to delete room
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set((state) => ({
        rooms: state.rooms.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete room', isLoading: false });
    }
  },

  addMember: async (roomId, memberId) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to add member
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set((state) => ({
        rooms: state.rooms.map((r) =>
          r.id === roomId
            ? {
                ...r,
                members: [...r.members, memberId],
              }
            : r
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add member', isLoading: false });
    }
  },

  removeMember: async (roomId, memberId) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call to remove member
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set((state) => ({
        rooms: state.rooms.map((r) =>
          r.id === roomId
            ? {
                ...r,
                members: r.members.filter((id) => id !== memberId),
              }
            : r
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to remove member', isLoading: false });
    }
  },
}));