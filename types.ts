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
  user?: string; // Added user field for tracking who made the entry
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  user?: string; // Added user field for tracking who made the entry
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface UserBalance {
  user: string;
  totalPayments: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
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

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  site?: string;
  task?: string;
  description: string;
  user?: string;
}

export interface Labour {
  id: string;
  name: string;
  role: string;
  salary: number;
  paid: number;
  balance: number;
  paymentHistory?: PaymentHistory[];
}

export interface Client {
  id:string;
  name: string;
  contact: string;
  siteName?: string;
  totalPaid: number;
  balance: number;
  paymentHistory?: PaymentHistory[];
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
    googleSheetsApiKey: string;  // For Google Sheets API
    aiApiKey: string;            // For AI Chat (Groq API)
}