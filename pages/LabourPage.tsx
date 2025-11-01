import React, { useState, useMemo, useContext } from 'react';
import type { Labour } from '../types';
import { DataContext } from '../contexts/DataContext';
import DataTable from '../components/DataTable';
import CrudModal, { FormField } from '../components/CrudModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EmptyState from '../components/EmptyState';
import PaymentHistoryModal from '../components/PaymentHistoryModal';
import { PlusIcon, UsersIcon, HistoryIcon } from '../components/icons';

const LabourPage: React.FC = () => {
    const { labours, connectionStatus, addLabour, updateLabour, deleteLabour } = useContext(DataContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingLabour, setEditingLabour] = useState<Labour | null>(null);
    const [deletingLabour, setDeletingLabour] = useState<Labour | null>(null);
    const [viewingPaymentHistory, setViewingPaymentHistory] = useState<Labour | null>(null);
    
    const handleSave = async (data: Labour) => {
        const labourData = {
            ...data,
            balance: data.salary - data.paid
        };

        if (editingLabour) {
            await updateLabour(editingLabour.id, labourData);
        } else {
            await addLabour(labourData);
        }
        setModalOpen(false);
        setEditingLabour(null);
    };

    const handleDelete = async () => {
        if (!deletingLabour) return;
        await deleteLabour(deletingLabour.id);
        setDeletingLabour(null);
    };

    const columns = useMemo(() => [
        { header: 'Name', accessor: 'name' as const },
        { header: 'Role', accessor: 'role' as const },
        { header: 'Salary', accessor: 'salary' as const, render: (v: number) => `₹${v.toLocaleString()}` },
        { 
            header: 'Paid', 
            accessor: 'paid' as const, 
            render: (v: number, labour: Labour) => (
                <div className="text-right">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                        ₹{v.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {labour.paymentHistory?.length || 0} payments
                    </div>
                </div>
            )
        },
        { 
            header: 'Balance', 
            accessor: 'balance' as const, 
            render: (v: number) => (
                <div className={`text-right font-semibold ${
                    v > 0 ? 'text-red-600 dark:text-red-400' : 
                    v < 0 ? 'text-green-600 dark:text-green-400' : 
                    'text-gray-600 dark:text-gray-400'
                }`}>
                    ₹{v.toLocaleString()}
                </div>
            )
        },
        { 
            header: 'Payment History', 
            accessor: 'paymentHistory' as const, 
            render: (v: any, labour: Labour) => (
                <button
                    onClick={() => setViewingPaymentHistory(labour)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    <HistoryIcon className="w-4 h-4" />
                    <span className="text-sm">
                        {labour.paymentHistory?.length || 0} payments
                    </span>
                </button>
            )
        },
    ], []);

    const fields: FormField[] = [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'role', label: 'Role', type: 'text', required: true },
        { name: 'salary', label: 'Salary', type: 'number', required: true },
        { name: 'paid', label: 'Amount Paid', type: 'number', required: true },
    ];

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        const totalSalary = labours.reduce((sum, labour) => sum + (labour.salary || 0), 0);
        const totalPaid = labours.reduce((sum, labour) => sum + (labour.paid || 0), 0);
        const totalBalance = labours.reduce((sum, labour) => sum + (labour.balance || 0), 0);
        const totalTransactions = labours.reduce((sum, labour) => sum + (labour.paymentHistory?.length || 0), 0);
        
        return { totalSalary, totalPaid, totalBalance, totalTransactions };
    }, [labours]);

    const renderContent = () => {
        if (connectionStatus === 'loading') return <p className="text-center py-8 text-gray-400">Loading labour data...</p>;
        if (labours.length === 0) {
            return (
                <EmptyState
                    icon={UsersIcon}
                    title="No Labour Records"
                    message="Start managing your workforce by adding your first labourer."
                    actionText="Add New Labour"
                    onAction={() => setModalOpen(true)}
                />
            );
        }
        return (
             <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Salary</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ₹{summaryStats.totalSalary.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Paid</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ₹{summaryStats.totalPaid.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Balance</div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            ₹{summaryStats.totalBalance.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Payments</div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {summaryStats.totalTransactions}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mb-6">
                    <button onClick={() => setModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add New Labour</span>
                    </button>
                </div>
                <DataTable<Labour> columns={columns} data={labours} onEdit={(l) => {setEditingLabour(l); setModalOpen(true);}} onDelete={(l) => setDeletingLabour(l)} />
            </>
        )
    };

    return (
        <div className="space-y-6">
            {renderContent()}
            
            <CrudModal<Labour>
                isOpen={isModalOpen}
                onClose={() => {setModalOpen(false); setEditingLabour(null);}}
                onSave={handleSave}
                fields={fields}
                initialData={editingLabour}
                title={editingLabour ? "Edit Labour" : "Add Labour"}
            />
            
            <ConfirmationDialog 
                isOpen={!!deletingLabour}
                onClose={() => setDeletingLabour(null)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the record for "${deletingLabour?.name}"? This action cannot be undone.`}
            />
            
            <PaymentHistoryModal
                isOpen={!!viewingPaymentHistory}
                onClose={() => setViewingPaymentHistory(null)}
                title={`Payment History - ${viewingPaymentHistory?.name || ''} (${viewingPaymentHistory?.role || ''})`}
                paymentHistory={viewingPaymentHistory?.paymentHistory || []}
                totalPaid={viewingPaymentHistory?.paid || 0}
            />
        </div>
    );
};

export default LabourPage;