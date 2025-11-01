// This file simulates a backend API by managing data in memory.
// It is now used exclusively for local, in-memory mutations to provide a fast UI experience.
// The initial source of truth is the live, read-only data fetched from the Google Sheets API.
// Any changes made here will be overwritten on the next global data sync.

import type { Payment, Expense, Site, Labour, Client, Task, Habit, ExpenseCategory, Settings } from '../types';

// --- MOCK API FUNCTIONS for IN-MEMORY MUTATIONS ---

// Generic in-memory CRUD operations
const createApi = <T extends { id: string }>(initialData: T[]) => {
  let items = [...initialData];

  // This function is now used to reset the data when a global sync happens
  const setData = (newData: T[]) => {
    items = [...newData];
  }

  // Simulate API delay
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  return {
    setData,
    async get(): Promise<T[]> {
      await delay(50); // Keep a small delay for consistency
      return Promise.resolve(items);
    },
    async add(itemData: Omit<T, 'id'>): Promise<T> {
      await delay(50);
      const newItem = { ...itemData, id: String(Date.now() + Math.random()) } as T;
      items.push(newItem);
      return Promise.resolve(newItem);
    },
    async update(id: string, updates: Partial<T>): Promise<T> {
      await delay(50);
      const index = items.findIndex(i => i.id === id);
      if (index === -1) throw new Error("Item not found");
      items[index] = { ...items[index], ...updates };
      return Promise.resolve(items[index]);
    },
    async delete(id: string): Promise<{ id: string }> {
      await delay(50);
      items = items.filter(i => i.id !== id);
      return Promise.resolve({ id });
    },
  };
};

// Initialize APIs with empty arrays, as they will be populated by the live fetch.
export const sitesApi = createApi<Site>([]);
export const paymentsApi = createApi<Payment>([]);
export const expensesApi = createApi<Expense>([]);
export const laboursApi = createApi<Labour>([]);
export const clientsApi = createApi<Client>([]);
// FIX: Add vendorsApi to manage vendor data in memory.
export const vendorsApi = createApi<Client>([]);
// Local storage keys for tasks and habits
const TASKS_STORAGE_KEY = 'expenseman-tasks';
const HABITS_STORAGE_KEY = 'expenseman-habits';

// Enhanced API with localStorage for tasks
const createLocalStorageApi = <T extends { id: string }>(storageKey: string) => {
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  
  const getFromStorage = (): T[] => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Failed to parse ${storageKey} from localStorage`, error);
      return [];
    }
  };

  const saveToStorage = (items: T[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error(`Failed to save ${storageKey} to localStorage`, error);
    }
  };

  return {
    async get(): Promise<T[]> {
      await delay(50);
      return Promise.resolve(getFromStorage());
    },
    async add(itemData: Omit<T, 'id'>): Promise<T> {
      await delay(50);
      const items = getFromStorage();
      const newItem = { ...itemData, id: String(Date.now() + Math.random()) } as T;
      items.push(newItem);
      saveToStorage(items);
      return Promise.resolve(newItem);
    },
    async update(id: string, updates: Partial<T>): Promise<T> {
      await delay(50);
      const items = getFromStorage();
      const index = items.findIndex(i => i.id === id);
      if (index === -1) throw new Error("Item not found");
      items[index] = { ...items[index], ...updates };
      saveToStorage(items);
      return Promise.resolve(items[index]);
    },
    async delete(id: string): Promise<{ id: string }> {
      await delay(50);
      const items = getFromStorage();
      const filteredItems = items.filter(i => i.id !== id);
      saveToStorage(filteredItems);
      return Promise.resolve({ id });
    },
  };
};

export const tasksApi = createLocalStorageApi<Task>(TASKS_STORAGE_KEY);
export const habitsApi = createLocalStorageApi<Habit>(HABITS_STORAGE_KEY);
export const expenseCategoriesApi = createApi<ExpenseCategory>([]);

// Settings API using localStorage for persistence
const SETTINGS_STORAGE_KEY = 'pbms-ai-settings';

export const settingsApi = {
    async get(): Promise<Settings> {
        try {
            const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error("Failed to parse settings from localStorage", error);
        }
        // Return defaults if nothing is stored or parsing fails
        return {
            theme: 'dark',
            googleSheetUrl: '',
            userName: 'Business Owner',
            googleSheetsApiKey: '',
            aiApiKey: '',
        };
    },
    async update(settings: Partial<Settings>): Promise<Settings> {
        const currentSettings = await this.get();
        const newSettings = { ...currentSettings, ...settings };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
        return Promise.resolve(newSettings);
    }
};