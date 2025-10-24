export interface Message {
  role: 'user' | 'model';
  content: string;
}

export type Page = 
  | 'Dashboard'
  | 'Payments & Expenses'
  | 'Sites'
  | 'Labour'
  | 'Clients'
  | 'Tasks & Habits'
  | 'Chat with AI'
  | 'Settings';

export interface Payment {
  id: string;
  date: string;
  site: string;
  amount: number;
  mode: 'Cash' | 'Bank Transfer' | 'Cheque';
  remarks?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface Site {
  id: string;
  siteName: string;
  progress: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending';
  startDate: string;
  endDate: string;
  projectValue: number;
}

export interface Labour {
  id: string;
  name: string;
  role: string;
  salary: number;
  paid: number;
  balance: number;
}

export interface Client {
  id:string;
  name: string;
  contact: string;
  siteName?: string;
  totalPaid: number;
  balance: number;
}

export interface Task {
    id: string;
    title: string;
    deadline: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
}

export interface Habit {
    id: string;
    name: string;
    frequency: 'Daily' | 'Weekly';
    streak: number;
}

export type Theme = 'light' | 'dark';

export interface Settings {
    theme: Theme;
    googleSheetUrl: string;
    userName: string;
    apiKey: string;
}