import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import type { Payment, Expense, Site, Labour, Client, Task, Habit, ExpenseCategory } from '../types';
import * as api from '../services/mockApiService';
import { SettingsContext } from './SettingsContext';

type ConnectionStatus = 'idle' | 'loading' | 'connected' | 'error';

interface DataContextState {
  payments: Payment[];
  expenses: Expense[];
  sites: Site[];
  labours: Labour[];
  clients: Client[];
  vendors: Client[];
  tasks: Task[];
  habits: Habit[];
  expenseCategories: ExpenseCategory[];
  connectionStatus: ConnectionStatus;
  lastSync: Date | null;
  error: string | null;
}

interface DataContextType extends DataContextState {
  refreshData: () => void;
  addPayment: (data: Omit<Payment, 'id'>) => Promise<void>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  addExpense: (data: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addSite: (data: Omit<Site, 'id'>) => Promise<void>;
  updateSite: (id: string, updates: Partial<Site>) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
  addLabour: (data: Omit<Labour, 'id'>) => Promise<void>;
  updateLabour: (id: string, updates: Partial<Labour>) => Promise<void>;
  deleteLabour: (id: string) => Promise<void>;
  addClient: (data: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addVendor: (data: Omit<Client, 'id'>) => Promise<void>;
  updateVendor: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  addTask: (data: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addHabit: (data: Omit<Habit, 'id'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  incrementHabitStreak: (id: string) => Promise<void>;
  addExpenseCategory: (data: Omit<ExpenseCategory, 'id'>) => Promise<void>;
  updateExpenseCategory: (id: string, updates: Partial<ExpenseCategory>) => Promise<void>;
  deleteExpenseCategory: (id: string) => Promise<void>;
}

export const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const settingsContext = useContext(SettingsContext);
  const { googleSheetUrl, apiKey } = settingsContext || { googleSheetUrl: '', apiKey: '' };
  
  console.log('DataProvider rendering...', { settingsContext });
  
  const [state, setState] = useState<DataContextState>({
    payments: [],
    expenses: [],
    sites: [],
    labours: [],
    clients: [],
    vendors: [],
    tasks: [],
    habits: [],
    expenseCategories: [],
    connectionStatus: 'idle',
    lastSync: null,
    error: null,
  });

  const fetchData = useCallback(async () => {

    if (!googleSheetUrl || !apiKey) {
        console.log('⚠️ No credentials configured');
        setState(s => ({ ...s, connectionStatus: 'idle', error: "Configure Google Sheet in Settings" }));
        return;
    }

    console.log('🔄 Starting data fetch...');
    setState(s => ({ ...s, connectionStatus: 'loading', error: null }));

    const sheetIdMatch = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
        console.error('❌ Invalid Sheet URL');
        setState(s => ({ ...s, connectionStatus: 'error', error: "Invalid Sheet URL" }));
        return;
    }
    
    const sheetId = sheetIdMatch[1];
    console.log('✅ Sheet ID:', sheetId);

    try {
        // Fetch multiple sheets: Main, Labour, Parties, Sites
        const sheets = ['Main', 'Labour', 'Parties', 'Sites'];
        const fetchPromises = sheets.map(async (sheetName) => {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A1:J1000?key=${apiKey}`;
            console.log(`📡 Fetching ${sheetName}:`, url);
            
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`${sheetName}: ${errorData.error?.message || 'Fetch failed'}`);
                }
                const data = await response.json();
                return { sheetName, data: data.values || [] };
            } catch (error) {
                console.warn(`⚠️ Failed to fetch ${sheetName}:`, error);
                return { sheetName, data: [] };
            }
        });

        const results = await Promise.all(fetchPromises);
        console.log('✅ All data received:', results);

        // Initialize arrays
        const payments: Payment[] = [];
        const expenses: Expense[] = [];
        const labours: Labour[] = [];
        const clients: Client[] = [];
        const sites: Site[] = [];
        const categories = new Set<string>();

        // Process each sheet
        results.forEach(({ sheetName, data }) => {
            if (!data || data.length < 2) {
                console.log(`⚠️ No data in ${sheetName} sheet`);
                return;
            }

            const rows = data.slice(1); // Skip header row

            if (sheetName === 'Main') {
                // Process Main sheet for payments and expenses
                rows.forEach((row: any[], index: number) => {
                    if (!row || row.length === 0) return;

                    const entry = {
                        id: String(index + 1),
                        date: row[0] ? new Date(row[0]).toISOString().split('T')[0] : '',
                        type: row[1] || '',
                        amount: parseFloat(row[2]) || 0,
                        category: row[3] || '',
                        description: row[4] || '',
                        labour: row[5] || '',
                        site: row[6] || '',
                        party: row[7] || ''
                    };

                    if (entry.category) categories.add(entry.category);

                    if (entry.type.toLowerCase().includes('payment')) {
                        payments.push({
                            id: entry.id,
                            date: entry.date,
                            site: entry.site || entry.party,
                            amount: entry.amount,
                            mode: 'Cash',
                            remarks: entry.description
                        });
                    } else {
                        expenses.push({
                            id: entry.id,
                            date: entry.date,
                            category: entry.category,
                            amount: entry.amount,
                            description: entry.description
                        });
                    }
                });
            } else if (sheetName === 'Labour') {
                // Process Labour sheet
                rows.forEach((row: any[], index: number) => {
                    if (!row || row.length === 0) return;

                    const labour: Labour = {
                        id: String(index + 1),
                        name: row[0] || '',
                        role: row[1] || '',
                        salary: parseFloat(row[2]) || 0,
                        paid: parseFloat(row[3]) || 0,
                        balance: (parseFloat(row[2]) || 0) - (parseFloat(row[3]) || 0)
                    };

                    if (labour.name) {
                        labours.push(labour);
                    }
                });
            } else if (sheetName === 'Parties') {
                // Process Parties sheet (clients)
                rows.forEach((row: any[], index: number) => {
                    if (!row || row.length === 0) return;

                    const client: Client = {
                        id: String(index + 1),
                        name: row[0] || '',
                        contact: row[1] || '',
                        siteName: row[2] || '',
                        totalPaid: parseFloat(row[3]) || 0,
                        balance: parseFloat(row[4]) || 0
                    };

                    if (client.name) {
                        clients.push(client);
                    }
                });
            } else if (sheetName === 'Sites') {
                // Process Sites sheet
                rows.forEach((row: any[], index: number) => {
                    if (!row || row.length === 0) return;

                    const site: Site = {
                        id: String(index + 1),
                        siteName: row[0] || '',
                        progress: parseFloat(row[1]) || 0,
                        paymentStatus: (row[2] as 'Paid' | 'Partially Paid' | 'Pending') || 'Pending',
                        startDate: row[3] ? new Date(row[3]).toISOString().split('T')[0] : '',
                        endDate: row[4] ? new Date(row[4]).toISOString().split('T')[0] : '',
                        projectValue: parseFloat(row[5]) || 0
                    };

                    if (site.siteName) {
                        sites.push(site);
                    }
                });
            }
        });

        const expenseCategories = Array.from(categories).map((cat, i) => ({
            id: String(i + 1),
            name: cat
        }));

        console.log('✅ Parsed all data:', {
            payments: payments.length,
            expenses: expenses.length,
            labours: labours.length,
            clients: clients.length,
            sites: sites.length,
            categories: expenseCategories.length
        });

        setState({
            payments,
            expenses,
            sites,
            labours,
            clients,
            vendors: [], // Keep vendors separate for now
            tasks: state.tasks, // Keep existing tasks (local only)
            habits: state.habits, // Keep existing habits (local only)
            expenseCategories,
            connectionStatus: 'connected',
            lastSync: new Date(),
            error: null
        });

        // Update mock APIs
        api.paymentsApi.setData(payments);
        api.expensesApi.setData(expenses);
        api.sitesApi.setData(sites);
        api.laboursApi.setData(labours);
        api.clientsApi.setData(clients);
        api.expenseCategoriesApi.setData(expenseCategories);
        // Tasks and habits remain local only - no Google Sheets sync

    } catch (error) {
        console.error('❌ Fetch error:', error);
        setState(s => ({ 
            ...s, 
            connectionStatus: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error'
        }));
    }
  }, [googleSheetUrl, apiKey]);

  useEffect(() => {
    if (googleSheetUrl && apiKey) {
        console.log('🚀 Auto-fetching data...');
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    } else {
        setState(s => ({...s, connectionStatus: 'idle'}));
    }
  }, [fetchData, googleSheetUrl, apiKey]);

  // Mutation handlers
  const createMutationHandlers = <T extends { id: string }>(
    apiInstance: any,
    stateKey: keyof Omit<DataContextState, 'connectionStatus' | 'lastSync' | 'error'>
  ) => ({
      addItem: async (data: Omit<T, 'id'>) => {
          const newItem = await apiInstance.add(data);
          setState(s => ({ ...s, [stateKey]: [...(s[stateKey] as any[]), newItem] }));
      },
      updateItem: async (id: string, updates: Partial<T>) => {
          const updatedItem = await apiInstance.update(id, updates);
          setState(s => ({
              ...s,
              [stateKey]: (s[stateKey] as any[]).map((item: any) => item.id === id ? updatedItem : item)
          }));
      },
      deleteItem: async (id: string) => {
          await apiInstance.delete(id);
          setState(s => ({
              ...s,
              [stateKey]: (s[stateKey] as any[]).filter((item: any) => item.id !== id)
          }));
      },
  });

  const { addItem: addPayment, updateItem: updatePayment, deleteItem: deletePayment } = createMutationHandlers(api.paymentsApi, 'payments');
  const { addItem: addExpense, updateItem: updateExpense, deleteItem: deleteExpense } = createMutationHandlers(api.expensesApi, 'expenses');
  const { addItem: addSite, updateItem: updateSite, deleteItem: deleteSite } = createMutationHandlers(api.sitesApi, 'sites');
  const { addItem: addLabour, updateItem: updateLabour, deleteItem: deleteLabour } = createMutationHandlers(api.laboursApi, 'labours');
  const { addItem: addClient, updateItem: updateClient, deleteItem: deleteClient } = createMutationHandlers(api.clientsApi, 'clients');
  const { addItem: addVendor, updateItem: updateVendor, deleteItem: deleteVendor } = createMutationHandlers(api.vendorsApi, 'vendors');
  const { addItem: addTask, updateItem: updateTask, deleteItem: deleteTask } = createMutationHandlers(api.tasksApi, 'tasks');
  const { addItem: addHabit, updateItem: updateHabit, deleteItem: deleteHabit } = createMutationHandlers(api.habitsApi, 'habits');
  const { addItem: addExpenseCategory, updateItem: updateExpenseCategory, deleteItem: deleteExpenseCategory } = createMutationHandlers(api.expenseCategoriesApi, 'expenseCategories');

  const incrementHabitStreak = async (id: string) => {
    const habit = state.habits.find(h => h.id === id);
    if (habit) {
        const updatedHabit = await api.habitsApi.update(id, { streak: habit.streak + 1 });
        setState(s => ({
            ...s,
            habits: s.habits.map(h => h.id === id ? updatedHabit : h)
        }));
    }
  };

  const value: DataContextType = {
      ...state,
      refreshData: fetchData,
      addPayment, updatePayment, deletePayment,
      addExpense, updateExpense, deleteExpense,
      addSite, updateSite, deleteSite,
      addLabour, updateLabour, deleteLabour,
      addClient, updateClient, deleteClient,
      addVendor, updateVendor, deleteVendor,
      addTask, updateTask, deleteTask,
      addHabit, updateHabit, deleteHabit,
      incrementHabitStreak,
      addExpenseCategory, updateExpenseCategory, deleteExpenseCategory,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};