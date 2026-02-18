// types.ts

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  created_at?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  streak: number;
  completed_dates: string[];
  reminder_time?: string;
  created_at?: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  updated_at?: string;
  created_at?: string;
}


export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month_year: string;
}

export interface Saving {
  id: string;
  user_id: string;
  name: string;
  target: number;
  current: number;
  created_at?: string;
}

// --- Tipe Aplikasi ---

export type AppTab = 'dashboard' | 'finance' | 'habits' | 'notes' | 'settings';
export type Language = 'en' | 'id';
export type Theme = 'light' | 'dark';

export interface QuickAction {
  id: string;
  label: string;
  amount: number;
  category: string;
}

export interface Subscription {
  id: string;
  label: string;
  amount: number;
  category: string;
  dayOfMonth: number;
}