export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'admin' | 'coordinator' | 'faculty' | 'candidate'
          profile_image: string | null
          phone: string | null
          department: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: 'admin' | 'coordinator' | 'faculty' | 'candidate'
          profile_image?: string | null
          phone?: string | null
          department?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'admin' | 'coordinator' | 'faculty' | 'candidate'
          profile_image?: string | null
          phone?: string | null
          department?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
