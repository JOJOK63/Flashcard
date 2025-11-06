import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript
export interface Database {
  public: {
    Tables: {
      card_lists: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string | null;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: number;
          list_id: string;
          recto: string;
          title: string;
          img: string | null;
          color: string | null;
          recurrence: number;
          position: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          list_id: string;
          recto: string;
          title: string;
          img?: string | null;
          color?: string | null;
          recurrence?: number;
          position?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          list_id?: string;
          recto?: string;
          title?: string;
          img?: string | null;
          color?: string | null;
          recurrence?: number;
          position?: number | null;
          updated_at?: string;
        };
      };
    };
  };
}
