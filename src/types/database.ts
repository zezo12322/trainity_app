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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          province: string | null
          center: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role: UserRole
          province?: string | null
          center?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          province?: string | null
          center?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      training_requests: {
        Row: {
          id: string
          title: string
          description: string | null
          requester_id: string
          province: string
          center: string
          status: TrainingRequestStatus
          priority: 'low' | 'medium' | 'high'
          requested_date: string
          approved_date: string | null
          trainer_id: string | null
          notes: string | null
          approval_path: 'standard' | 'pm_alternative'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          requester_id: string
          province: string
          center: string
          status?: TrainingRequestStatus
          priority?: 'low' | 'medium' | 'high'
          requested_date: string
          approved_date?: string | null
          trainer_id?: string | null
          notes?: string | null
          approval_path?: 'standard' | 'pm_alternative'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          requester_id?: string
          province?: string
          center?: string
          status?: TrainingRequestStatus
          priority?: 'low' | 'medium' | 'high'
          requested_date?: string
          approved_date?: string | null
          trainer_id?: string | null
          notes?: string | null
          approval_path?: 'standard' | 'pm_alternative'
          created_at?: string
          updated_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          type: 'individual' | 'group'
          participants: string[]
          last_message: string | null
          last_message_at: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'individual' | 'group'
          participants: string[]
          last_message?: string | null
          last_message_at?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'individual' | 'group'
          participants?: string[]
          last_message?: string | null
          last_message_at?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          type: 'text' | 'image' | 'file'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          type?: 'text' | 'image' | 'file'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          content?: string
          type?: 'text' | 'image' | 'file'
          is_read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          type: string
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          type: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string
          type?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type UserRole =
  | 'TRAINER_PREPARATION_PROJECT_MANAGER'
  | 'PROGRAM_SUPERVISOR'
  | 'DEVELOPMENT_MANAGEMENT_OFFICER'
  | 'PROVINCIAL_DEVELOPMENT_OFFICER';

export type TrainingRequestStatus =
  | 'under_review'
  | 'cc_approved'
  | 'sv_approved'
  | 'pm_approved'
  | 'tr_assigned'
  | 'final_approved'
  | 'completed'
  | 'rejected';
