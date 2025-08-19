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
      topics: {
        Row: {
          id: string
          name: string
          color: string
          icon: string
          bio: string | null
          completed_tasks: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          icon?: string
          bio?: string | null
          completed_tasks?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon?: string
          bio?: string | null
          completed_tasks?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          topic_id: string
          completed: boolean
          created_at: string
          completed_at: string | null
          completion_month: number | null
          completion_week: number | null
          completion_day: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          topic_id: string
          completed?: boolean
          created_at?: string
          completed_at?: string | null
          completion_month?: number | null
          completion_week?: number | null
          completion_day?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          topic_id?: string
          completed?: boolean
          created_at?: string
          completed_at?: string | null
          completion_month?: number | null
          completion_week?: number | null
          completion_day?: number | null
          updated_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          title: string
          topic_id: string
          type: 'monthly' | 'weekly'
          month: number
          week: number | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          topic_id: string
          type: 'monthly' | 'weekly'
          month: number
          week?: number | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          topic_id?: string
          type?: 'monthly' | 'weekly'
          month?: number
          week?: number | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      stale_task_records: {
        Row: {
          id: string
          original_task_id: string
          title: string
          topic_id: string
          topic_name: string
          created_at: string
          stale_date: string
          archived_at: string
        }
        Insert: {
          id?: string
          original_task_id: string
          title: string
          topic_id: string
          topic_name: string
          created_at: string
          stale_date?: string
          archived_at?: string
        }
        Update: {
          id?: string
          original_task_id?: string
          title?: string
          topic_id?: string
          topic_name?: string
          created_at?: string
          stale_date?: string
          archived_at?: string
        }
      }
      done_task_records: {
        Row: {
          id: string
          original_task_id: string
          title: string
          topic_id: string
          topic_name: string
          completed_at: string
          archived_date: string
        }
        Insert: {
          id?: string
          original_task_id: string
          title: string
          topic_id: string
          topic_name: string
          completed_at: string
          archived_date?: string
        }
        Update: {
          id?: string
          original_task_id?: string
          title?: string
          topic_id?: string
          topic_name?: string
          completed_at?: string
          archived_date?: string
        }
      }
    }
    quotes: {
      Row: {
        id: string
        text: string
        author: string | null
        color_scheme: string
        priority: number
        is_active: boolean
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        text: string
        author?: string | null
        color_scheme?: string
        priority?: number
        is_active?: boolean
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        text?: string
        author?: string | null
        color_scheme?: string
        priority?: number
        is_active?: boolean
        created_at?: string
        updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}