
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Health' | 'Entertainment' | 'Others';
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDates: string[]; // ISO Strings
  category: 'health' | 'productivity' | 'learning' | 'spirituality';
  reminderTime?: string; // Format: "HH:mm"
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export type AppTab = 'dashboard' | 'finance' | 'habits' | 'notes' | 'settings';
export type Language = 'en' | 'id';
export type Theme = 'light' | 'dark' | 'system';