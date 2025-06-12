import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      mood_logs: {
        Row: {
          id: string
          user_id: string
          mood: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      discussions: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          created_at: string
          updated_at: string
          replies_count: number
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
          replies_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
          replies_count?: number
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          read: boolean
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          read?: boolean
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          read?: boolean
          type?: string
          created_at?: string
        }
      }
    }
  }
}