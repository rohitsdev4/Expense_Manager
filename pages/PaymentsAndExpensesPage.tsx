import React, { useState, useMemo, useContext } from 'react';
import type { Payment, Expense, Site, ExpenseCategory } from '../types';
import { DataContext } from '../contexts/DataContext';
import DataTable from '../components/DataTable';
import FilterBar, { Filters } from '../components/FilterBar';
import CrudModal, { FormField } from '../components/CrudModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EmptyState from '../components/EmptyState';
import { PlusIcon, TagIcon, WalletIcon } from '../components/icons';

type ActiveTab = 'payments' | 'expenses' | 'categories';

const PaymentsAndExpensesPage: React.FC = () => {
    const { 
        payments, expenses, sites, expenseCategories, connectionStatus,
        addPayment, updatePayment, deletePayment,
        addExpense, updateExpense, deleteExpense,
        addExpenseCategory, updateExpenseCategory, deleteExpenseCategory
    } = useContext(DataContext);
    
    const [activeTab, setActiveTab] = useState<ActiveTab>('payments');
    
    // Filtering State
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

    // Modal & Deletion State
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
    
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<ExpenseCategory | null>(null);

    React.useEffect(() => {
        setFilteredPayments(payments);
    }, [payments]);
    
    React.useEffect(() => {
        setFilteredExpenses(expenses);
    }, [expenses]);


    const handleFilter = (filters: Filters) => {
        const { startDate, endDate, category } = filters;
        if(activeTab === 'payments') {
            let data = [...payments];
            if (startDate) data = data.filter(p => new Date(p.date) >= new Date(startDate));
            if (endDate) data = data.filter(p => new Date(p.date) <= new Date(endDate));
            if (category !== 'all') data = data.filter(p => p.site === category);
            setFilteredPayments(data);
        } else if (activeTab === 'expenses') {
            let data = [...expenses];
            if (startDate) data = data.filter(e => new Date(e.date) >= new Date(startDate));
            if (endDate) data = data.filter(e => new Date(e.date) <= new Date(endDate));
            if (category !== 'all') data = data.filter(e => e.category === category);
            setFilteredExpenses(data);
        }
    };
    
    const handleReset = () => {
        if(activeTab === 'payments') setFilteredPayments(payments);
        else setFilteredExpenses(expenses);
    };

    const handleSavePayment = async (data: Payment) => {
        if (editingPayment) await updatePayment(editingPayment.id, data);
        else await addPayment(data);
        setPaymentModalOpen(false);
        setEditingPayment(null);
    };
    
    const handleSaveExpense = async (data: Expense) => {
        if (editingExpense) await updateExpense(editingExpense.id, data);
        else await addExpense(data);
        setExpenseModalOpen(false);
        setEditingExpense(null);
    };

    const handleSaveCategory = async (data: ExpenseCategory) => {
        if (editingCategory) await updateExpenseCategory(editingCategory.id, data);
        else await addExpenseCategory(data);
        setCategoryModalOpen(false);
        setEditingCategory(null);
    };
    
    const handleDelete = async () => {
        if (deletingPayment) await deletePayment(deletingPayment.id);
        if (deletingExpense) await deleteExpense(deletingExpense.id);
        if (deletingCategory) await deleteExpenseCategory(deletingCategory.id);
        setDeletingPayment(null);
        setDeletingExpense(null);
        setDeletingCategory(null);
    };
    
    const paymentColumns = useMemo(() => [
        { header: 'Date', accessor: 'date' as const },
        { header: 'Site', accessor: 'site' as const },
        { header: 'Amount', accessor: 'amount' as const, render: (val: number) => `₹${val.toLocaleString()}` },
        { header: 'Mode', accessor: 'mode' as const },
        { header: 'Remarks', accessor: 'remarks' as const },
    ], []);
    
    const expenseColumns = useMemo(() => [
        { header: 'Date', accessor: 'date' as const },
        { header: 'Category', accessor: 'category' as const },
        { header: 'Amount', accessor: 'amount' as const, render: (val: number) => `₹${val.toLocaleString()}` },
        { header: 'Description', accessor: 'description' as const },
    ], []);

    const categoryColumns = useMemo(() => [
        { header: 'Category Name', accessor: 'name' as const },
    ], []);

    const siteOptions = useMemo(() => sites.map(s => ({ value: s.siteName, label: s.siteName })), [sites]);
    const expenseCategoryOptions = useMemo(() => expenseCategories.map(c => ({ value: c.name, label: c.name })), [expenseCategories]);

    const paymentFields: FormField[] = [
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'site', label: 'Site', type: 'select', options: siteOptions, required: true },
        { name: 'amount', label: 'Amount', type: 'number', required: true },
        { name: 'mode', label: 'Payment Mode', type: 'select', options: [{value: 'Cash', label: 'Cash'}, {value: 'Bank Transfer', label: 'Bank Transfer'}, {value: 'Cheque', label: 'Cheque'}], required: true },
        { name: 'remarks', label: 'Remarks', type: 'textarea' },
    ];
    
    const expenseFields: FormField[] = [
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'category', label: 'Category', type: 'select', options: expenseCategoryOptions, required: true },
        { name: 'amount', label: 'Amount', type: 'number', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
    ];

    const categoryFields: FormField[] = [
        { name: 'name', label: 'Category Name', type: 'text', required: true },
    ];

    const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({tab, label}) => (
        <button onClick={() => setActiveTab(tab)} className={`${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm`}>
            {label}
        </button>
    );
    
    const renderContent = () => {
        if (connectionStatus === 'loading') return <p className="text-center py-8 text-gray-400">Loading data...</p>;
        
        if (activeTab === 'payments') {
            return payments.length > 0 ? (
                 <>
                    <FilterBar onFilter={handleFilter} onReset={handleReset} categoryOptions={siteOptions} categoryLabel="Site"/>
                    <DataTable<Payment> columns={paymentColumns} data={filteredPayments} onEdit={(p) => {setEditingPayment(p); setPaymentModalOpen(true);}} onDelete={setDeletingPayment} />
                </>
            ) : (
                <EmptyState
                    icon={WalletIcon}
                    title="No Payments Recorded"
                    message="Get started by adding your first payment record."
                    actionText="Add Payment"
                    onAction={() => setPaymentModalOpen(true)}
                />
            );
        }
        
        if (activeTab === 'expenses') {
             return expenses.length > 0 ? (
                <>
                    <FilterBar onFilter={handleFilter} onReset={handleReset} categoryOptions={expenseCategoryOptions} categoryLabel="Category"/>
                    <DataTable<Expense> columns={expenseColumns} data={filteredExpenses} onEdit={(e) => {setEditingExpense(e); setExpenseModalOpen(true);}} onDelete={setDeletingExpense} />
                </>
            ) : (
                 <EmptyState
                    icon={WalletIcon}
                    title="No Expenses Recorded"
                    message="Get started by adding your first expense record."
                    actionText="Add Expense"
                    onAction={() => setExpenseModalOpen(true)}
                />
            );
        }

        if (activeTab === 'categories') {
             return expenseCategories.length > 0 ? (
                <DataTable<ExpenseCategory> columns={categoryColumns} data={expenseCategories} onEdit={(c) => {setEditingCategory(c); setCategoryModalOpen(true);}} onDelete={setDeletingCategory} />
            ) : (
                 <EmptyState
                    icon={TagIcon}
                    title="No Expense Categories"
                    message="Create categories to organize your expenses."
                    actionText="Add Category"
                    onAction={() => setCategoryModalOpen(true)}
                />
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <TabButton tab="payments" label="Payments" />
                        <TabButton tab="expenses" label="Expenses" />
                        <TabButton tab="categories" label="Categories" />
                    </nav>
                </div>
                 <button onClick={() => {
                        if(activeTab === 'payments') setPaymentModalOpen(true);
                        else if (activeTab === 'expenses') setExpenseModalOpen(true);
                        else setCategoryModalOpen(true);
                    }} 
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                 >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add {activeTab === 'payments' ? 'Payment' : activeTab === 'expenses' ? 'Expense' : 'Category' }</span>
                </button>
            </div>

            {renderContent()}
            
            <CrudModal<Payment> isOpen={isPaymentModalOpen} onClose={() => {setPaymentModalOpen(false); setEditingPayment(null);}} onSave={handleSavePayment} fields={paymentFields} initialData={editingPayment} title={editingPayment ? "Edit Payment" : "Add Payment"} />
            <CrudModal<Expense> isOpen={isExpenseModalOpen} onClose={() => {setExpenseModalOpen(false); setEditingExpense(null);}} onSave={handleSaveExpense} fields={expenseFields} initialData={editingExpense} title={editingExpense ? "Edit Expense" : "Add Expense"} />
            <CrudModal<ExpenseCategory> isOpen={isCategoryModalOpen} onClose={() => {setCategoryModalOpen(false); setEditingCategory(null);}} onSave={handleSaveCategory} fields={categoryFields} initialData={editingCategory} title={editingCategory ? "Edit Category" : "Add Category"} />
            
            <ConfirmationDialog 
                isOpen={!!deletingPayment || !!deletingExpense || !!deletingCategory}
                onClose={() => { setDeletingPayment(null); setDeletingExpense(null); setDeletingCategory(null); }}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete this item? This action cannot be undone.`}
            />
        </div>
    );
};

export default PaymentsAndExpensesPage;