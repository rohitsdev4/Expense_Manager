import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import type { Payment, Expense, Site, Labour, Client, Task, Habit, ExpenseCategory, UserBalance, PaymentHistory } from '../types';
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
  userBalances: UserBalance[];
  connectionStatus: ConnectionStatus;
  lastSync: Date | null;
  error: string | null;
}

interface DataContextType extends DataContextState {
  refreshData: () => void;
  testConnection: () => Promise<{ success: boolean; message: string }>;
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

// Test connection function
const testGoogleSheetsConnection = async (googleSheetUrl: string, apiKey: string): Promise<{ success: boolean; message: string }> => {
  if (!googleSheetUrl || !apiKey) {
    return { success: false, message: 'Please provide both Google Sheet URL and API key' };
  }

  const sheetIdMatch = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) {
    return { success: false, message: 'Invalid Google Sheets URL format' };
  }

  const sheetId = sheetIdMatch[1];

  try {
    // Test basic spreadsheet access
    const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`;
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        return { success: false, message: 'API key is invalid or Google Sheets API is not enabled' };
      } else if (response.status === 404) {
        return { success: false, message: 'Spreadsheet not found. Check URL and sharing permissions' };
      } else {
        return { success: false, message: errorData.error?.message || `HTTP ${response.status}` };
      }
    }

    const data = await response.json();
    const sheetNames = data.sheets?.map((sheet: any) => sheet.properties.title) || [];
    
    // Check for required sheets
    const requiredSheets = ['Main', 'Labour', 'Parties', 'Sites'];
    const missingSheets = requiredSheets.filter(sheet => !sheetNames.includes(sheet));
    
    if (missingSheets.length > 0) {
      return { 
        success: false, 
        message: `Missing required sheets: ${missingSheets.join(', ')}. Found sheets: ${sheetNames.join(', ')}` 
      };
    }

    return { success: true, message: `Connection successful! Found sheets: ${sheetNames.join(', ')}` };
  } catch (error) {
    return { success: false, message: 'Network error. Check your internet connection.' };
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const settingsContext = useContext(SettingsContext);
  const { googleSheetUrl, googleSheetsApiKey } = settingsContext || { googleSheetUrl: '', googleSheetsApiKey: '' };
  
  console.log('🔄 DataProvider rendering...', { 
    googleSheetUrl: googleSheetUrl ? googleSheetUrl.substring(0, 50) + '...' : 'empty',
    googleSheetsApiKey: googleSheetsApiKey ? googleSheetsApiKey.substring(0, 10) + '...' : 'empty',
    settingsContext 
  });
  
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
    userBalances: [],
    connectionStatus: 'idle',
    lastSync: null,
    error: null,
  });

  // Load tasks and habits from localStorage on initialization
  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const [tasks, habits] = await Promise.all([
          api.tasksApi.get(),
          api.habitsApi.get()
        ]);
        setState(s => ({ ...s, tasks, habits }));
      } catch (error) {
        console.error('Failed to load local data:', error);
      }
    };
    loadLocalData();
  }, []);

  const fetchData = useCallback(async () => {
    if (!googleSheetUrl || !googleSheetsApiKey) {
        console.log('⚠️ No credentials configured');
        setState(s => ({ 
            ...s, 
            connectionStatus: 'idle', 
            error: "Please configure Google Sheets URL and API key in Settings. You need a Google Sheets API key (separate from AI API key)." 
        }));
        return;
    }

    console.log('🔄 Starting data fetch...');
    setState(s => ({ ...s, connectionStatus: 'loading', error: null }));

    // Extract sheet ID from various Google Sheets URL formats
    const sheetIdMatch = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
        console.error('❌ Invalid Sheet URL');
        setState(s => ({ 
            ...s, 
            connectionStatus: 'error', 
            error: "Invalid Google Sheets URL format. Please use the full URL from your browser." 
        }));
        return;
    }
    
    const sheetId = sheetIdMatch[1];
    console.log('✅ Sheet ID:', sheetId);

    // Test API key first with a simple request
    try {
        const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${googleSheetsApiKey}`;
        const testResponse = await fetch(testUrl);
        
        if (!testResponse.ok) {
            const errorData = await testResponse.json();
            console.error('❌ API Key Test Failed:', errorData);
            
            let errorMessage = 'Google Sheets API connection failed. ';
            if (testResponse.status === 403) {
                errorMessage += 'API key is invalid or Google Sheets API is not enabled. Please check your API key and ensure Google Sheets API is enabled in Google Cloud Console.';
            } else if (testResponse.status === 404) {
                errorMessage += 'Spreadsheet not found or not accessible. Please check the URL and sharing permissions.';
            } else {
                errorMessage += `Error: ${errorData.error?.message || `HTTP ${testResponse.status}`}`;
            }
            
            setState(s => ({ ...s, connectionStatus: 'error', error: errorMessage }));
            return;
        }
        
        console.log('✅ API Key test successful');
    } catch (error) {
        console.error('❌ Network error during API test:', error);
        setState(s => ({ 
            ...s, 
            connectionStatus: 'error', 
            error: 'Network error. Please check your internet connection.' 
        }));
        return;
    }

    try {
        // Fetch multiple sheets: Main, Labour, Parties, Sites
        const sheets = ['Main', 'Labour', 'Parties', 'Sites'];
        const fetchPromises = sheets.map(async (sheetName) => {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A1:J1000?key=${googleSheetsApiKey}`;
            console.log(`📡 Fetching ${sheetName}:`, url);
            
            try {
                const response = await fetch(url);
                console.log(`📡 Response for ${sheetName}:`, response.status, response.statusText);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`❌ API Error for ${sheetName}:`, errorData);
                    
                    // Provide specific error messages
                    if (response.status === 403) {
                        throw new Error(`${sheetName}: API key invalid or Google Sheets API not enabled`);
                    } else if (response.status === 404) {
                        throw new Error(`${sheetName}: Sheet not found or not accessible`);
                    } else {
                        throw new Error(`${sheetName}: ${errorData.error?.message || `HTTP ${response.status}`}`);
                    }
                }
                
                const data = await response.json();
                console.log(`✅ Data received for ${sheetName}:`, data.values?.length || 0, 'rows');
                return { sheetName, data: data.values || [] };
            } catch (error) {
                console.error(`❌ Failed to fetch ${sheetName}:`, error);
                return { sheetName, data: [], error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });

        const results = await Promise.all(fetchPromises);
        console.log('✅ All data received:', results);

        // Check for errors in any sheet fetch
        const errors = results.filter(r => (r as any).error).map(r => (r as any).error);
        if (errors.length > 0) {
            console.error('❌ Sheet fetch errors:', errors);
            setState(s => ({ 
                ...s, 
                connectionStatus: 'error', 
                error: `Failed to fetch sheets: ${errors.join(', ')}` 
            }));
            return;
        }

        // Initialize arrays
        const payments: Payment[] = [];
        const expenses: Expense[] = [];
        const labours: Labour[] = [];
        const clients: Client[] = [];
        const sites: Site[] = [];
        const categories = new Set<string>();
        
        // Payment history tracking
        const clientPaymentHistory = new Map<string, PaymentHistory[]>();
        const labourPaymentHistory = new Map<string, PaymentHistory[]>();

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
                        party: row[7] || '',
                        user: row[8] || '' // Extract user from column I (index 8)
                    };

                    if (entry.category) categories.add(entry.category);

                    // Determine user if not explicitly provided
                    let user = entry.user;
                    if (!user) {
                        // Try to extract user from description or other fields
                        const description = entry.description.toLowerCase();
                        if (description.includes('rohit') || description.includes('r.')) {
                            user = 'Rohit';
                        } else if (description.includes('gulshan') || description.includes('g.')) {
                            user = 'Gulshan';
                        } else {
                            user = 'Unknown';
                        }
                    }

                    if (entry.type.toLowerCase().includes('payment')) {
                        payments.push({
                            id: entry.id,
                            date: entry.date,
                            site: entry.site || entry.party,
                            amount: entry.amount,
                            mode: 'Cash',
                            remarks: entry.description,
                            user: user
                        });
                        
                        // Track client payment history
                        if (entry.party) {
                            const clientHistory: PaymentHistory = {
                                id: entry.id,
                                date: entry.date,
                                amount: entry.amount,
                                site: entry.site,
                                description: entry.description,
                                user: user
                            };
                            
                            if (!clientPaymentHistory.has(entry.party)) {
                                clientPaymentHistory.set(entry.party, []);
                            }
                            clientPaymentHistory.get(entry.party)!.push(clientHistory);
                        }
                    } else if (entry.category.toLowerCase().includes('labour payment')) {
                        // Track labour payment history
                        if (entry.labour) {
                            const labourHistory: PaymentHistory = {
                                id: entry.id,
                                date: entry.date,
                                amount: entry.amount,
                                task: entry.description,
                                site: entry.site,
                                description: entry.description,
                                user: user
                            };
                            
                            if (!labourPaymentHistory.has(entry.labour)) {
                                labourPaymentHistory.set(entry.labour, []);
                            }
                            labourPaymentHistory.get(entry.labour)!.push(labourHistory);
                        }
                        
                        expenses.push({
                            id: entry.id,
                            date: entry.date,
                            category: entry.category,
                            amount: entry.amount,
                            description: entry.description,
                            user: user
                        });
                    } else {
                        expenses.push({
                            id: entry.id,
                            date: entry.date,
                            category: entry.category,
                            amount: entry.amount,
                            description: entry.description,
                            user: user
                        });
                    }
                });
            } else if (sheetName === 'Labour') {
                // Process Labour sheet
                rows.forEach((row: any[], index: number) => {
                    if (!row || row.length === 0) return;

                    const paymentHistory = labourPaymentHistory.get(row[0] || '') || [];
                    const actualPaidAmount = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
                    const salaryAmount = parseFloat(row[2]) || 0;
                    
                    const labour: Labour = {
                        id: String(index + 1),
                        name: row[0] || '',
                        role: row[1] || '',
                        salary: salaryAmount,
                        paid: actualPaidAmount, // Use calculated total from payment history
                        balance: salaryAmount - actualPaidAmount, // Calculate balance from actual payments
                        paymentHistory: paymentHistory
                    };

                    if (labour.name) {
                        labours.push(labour);
                    }
                });
            } else if (sheetName === 'Parties') {
                // Process Parties sheet (clients)
                rows.forEach((row: any[], index: number) => {
                    if (!row || row.length === 0) return;

                    const paymentHistory = clientPaymentHistory.get(row[0] || '') || [];
                    const actualTotalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
                    
                    const client: Client = {
                        id: String(index + 1),
                        name: row[0] || '',
                        contact: row[1] || '',
                        siteName: row[2] || '',
                        totalPaid: actualTotalPaid, // Use calculated total from payment history
                        balance: parseFloat(row[4]) || 0,
                        paymentHistory: paymentHistory
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

        // Calculate user balances
        const userBalanceMap = new Map<string, UserBalance>();
        
        // Initialize balances for known users
        ['Rohit', 'Gulshan'].forEach(user => {
            userBalanceMap.set(user, {
                user,
                totalPayments: 0,
                totalExpenses: 0,
                balance: 0,
                transactionCount: 0
            });
        });

        // Calculate payments by user
        payments.forEach(payment => {
            const user = payment.user || 'Unknown';
            if (!userBalanceMap.has(user)) {
                userBalanceMap.set(user, {
                    user,
                    totalPayments: 0,
                    totalExpenses: 0,
                    balance: 0,
                    transactionCount: 0
                });
            }
            const userBalance = userBalanceMap.get(user)!;
            userBalance.totalPayments += payment.amount;
            userBalance.transactionCount += 1;
        });

        // Calculate expenses by user
        expenses.forEach(expense => {
            const user = expense.user || 'Unknown';
            if (!userBalanceMap.has(user)) {
                userBalanceMap.set(user, {
                    user,
                    totalPayments: 0,
                    totalExpenses: 0,
                    balance: 0,
                    transactionCount: 0
                });
            }
            const userBalance = userBalanceMap.get(user)!;
            userBalance.totalExpenses += expense.amount;
            userBalance.transactionCount += 1;
        });

        // Calculate final balances
        const userBalances: UserBalance[] = Array.from(userBalanceMap.values()).map(balance => ({
            ...balance,
            balance: balance.totalPayments - balance.totalExpenses
        }));

        console.log('✅ Parsed all data:', {
            payments: payments.length,
            expenses: expenses.length,
            labours: labours.length,
            clients: clients.length,
            sites: sites.length,
            categories: expenseCategories.length,
            userBalances: userBalances.length
        });

        console.log('👥 User Balances:', userBalances);

        // Load current tasks and habits from localStorage to preserve them
        const [currentTasks, currentHabits] = await Promise.all([
          api.tasksApi.get(),
          api.habitsApi.get()
        ]);

        setState({
            payments,
            expenses,
            sites,
            labours,
            clients,
            vendors: [], // Keep vendors separate for now
            tasks: currentTasks, // Keep existing tasks (local only)
            habits: currentHabits, // Keep existing habits (local only)
            expenseCategories,
            userBalances,
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
  }, [googleSheetUrl, googleSheetsApiKey]);

  useEffect(() => {
    if (googleSheetUrl && googleSheetsApiKey) {
        console.log('🚀 Auto-fetching data...');
        fetchData();
        // Reduce polling frequency to avoid API quota issues
        const interval = setInterval(fetchData, 60000); // Every 1 minute instead of 30 seconds
        return () => clearInterval(interval);
    } else {
        setState(s => ({...s, connectionStatus: 'idle'}));
    }
  }, [fetchData, googleSheetUrl, googleSheetsApiKey]);

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

  const testConnection = useCallback(async () => {
    return await testGoogleSheetsConnection(googleSheetUrl, googleSheetsApiKey);
  }, [googleSheetUrl, googleSheetsApiKey]);

  const value: DataContextType = {
      ...state,
      refreshData: fetchData,
      testConnection,
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