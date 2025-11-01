import React, { useState, useMemo, useContext } from 'react';
import type { Client, Site, Payment } from '../types';
import { DataContext } from '../contexts/DataContext';
import DataTable from '../components/DataTable';
import CrudModal, { FormField } from '../components/CrudModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EmptyState from '../components/EmptyState';
import PaymentHistoryModal from '../components/PaymentHistoryModal';
import { PlusIcon, HandshakeIcon, InfoIcon, HistoryIcon } from '../components/icons';

const ClientsPage: React.FC = () => {
    const { clients, sites, payments, connectionStatus, addClient, updateClient, deleteClient } = useContext(DataContext);
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deletingClient, setDeletingClient] = useState<Client | null>(null);
    const [viewingPaymentHistory, setViewingPaymentHistory] = useState<Client | null>(null);

    const [isSaveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [pendingSaveData, setPendingSaveData] = useState<Client | null>(null);
    const [saveConfirmMessage, setSaveConfirmMessage] = useState('');

    const performSave = async (clientData: Client) => {
        if (editingClient) {
            await updateClient(editingClient.id, clientData);
        } else {
            await addClient(clientData);
        }
        setModalOpen(false);
        setEditingClient(null);
        setPendingSaveData(null);
    };

    const handleSave = async (clientData: Client) => {
        if (editingClient && (clientData.totalPaid !== editingClient.totalPaid || clientData.balance !== editingClient.balance)) {
            const message = `You are updating financial details for "${clientData.name}".\n\nOld: Paid ₹${editingClient.totalPaid.toLocaleString()}, Balance ₹${editingClient.balance.toLocaleString()}\nNew: Paid ₹${clientData.totalPaid.toLocaleString()}, Balance ₹${clientData.balance.toLocaleString()}\n\nDo you want to proceed?`;
            setSaveConfirmMessage(message);
            setPendingSaveData(clientData);
            setSaveConfirmOpen(true);
        } else {
            await performSave(clientData);
        }
    };
    
    const handleConfirmSave = () => {
        if (pendingSaveData) {
            performSave(pendingSaveData);
        }
        setSaveConfirmOpen(false);
    };

    const handleDelete = async () => {
        if (!deletingClient) return;
        await deleteClient(deletingClient.id);
        setDeletingClient(null);
    };
    
    const handleClientDataChange = (newData: Client, changedFieldName: string): Client => {
        if (changedFieldName === 'siteName' && newData.siteName) {
            const selectedSite = sites.find(s => s.siteName === newData.siteName);
            if (selectedSite && typeof selectedSite.projectValue === 'number') {
                const totalPaidForSite = payments
                    .filter(p => p.site === newData.siteName)
                    .reduce((sum, p) => sum + p.amount, 0);
                
                const balanceForSite = selectedSite.projectValue - totalPaidForSite;

                return {
                    ...newData,
                    totalPaid: totalPaidForSite,
                    balance: balanceForSite,
                };
            }
        }
        return newData;
    };

    const columns = useMemo(() => [
        { header: 'Name', accessor: 'name' as const },
        { header: 'Site', accessor: 'siteName' as const },
        { header: 'Contact', accessor: 'contact' as const },
        { 
            header: 'Total Paid', 
            accessor: 'totalPaid' as const, 
            render: (v: number, client: Client) => (
                <div className="text-right">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                        ₹{v?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {client.paymentHistory?.length || 0} transactions
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
                    ₹{v?.toLocaleString() || 0}
                </div>
            )
        },
        { 
            header: 'Payment History', 
            accessor: 'paymentHistory' as const, 
            render: (v: any, client: Client) => (
                <button
                    onClick={() => setViewingPaymentHistory(client)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    <HistoryIcon className="w-4 h-4" />
                    <span className="text-sm">
                        {client.paymentHistory?.length || 0} payments
                    </span>
                </button>
            )
        },
    ], []);
    
    const siteOptions = useMemo(() => sites.map(s => ({ value: s.siteName, label: s.siteName })), [sites]);

    const fields: FormField[] = [
        { name: 'name', label: 'Client Name', type: 'text', required: true },
        { name: 'contact', label: 'Contact', type: 'text', required: true },
        { name: 'siteName', label: 'Associated Site', type: 'select', options: siteOptions },
        { name: 'totalPaid', label: 'Total Paid', type: 'number', required: true },
        { name: 'balance', label: 'Balance', type: 'number', required: true },
    ];

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        const totalPaid = clients.reduce((sum, client) => sum + (client.totalPaid || 0), 0);
        const totalBalance = clients.reduce((sum, client) => sum + (client.balance || 0), 0);
        const totalTransactions = clients.reduce((sum, client) => sum + (client.paymentHistory?.length || 0), 0);
        const activeClients = clients.filter(client => (client.paymentHistory?.length || 0) > 0).length;
        
        return { totalPaid, totalBalance, totalTransactions, activeClients };
    }, [clients]);

    const renderContent = () => {
        if (connectionStatus === 'loading') return <p className="text-center py-8 text-gray-400">Loading clients...</p>;
        if (clients.length === 0) {
            return (
                <EmptyState
                    icon={HandshakeIcon}
                    title="No Clients Found"
                    message="Manage your clients by adding them here."
                    actionText="Add New Client"
                    onAction={() => { setEditingClient(null); setModalOpen(true); }}
                />
            );
        }
        return (
            <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Received</div>
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
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {summaryStats.totalTransactions}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Active Clients</div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {summaryStats.activeClients} / {clients.length}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mb-6">
                    <button onClick={() => { setEditingClient(null); setModalOpen(true); }} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add New Client</span>
                    </button>
                </div>
                <DataTable<Client> columns={columns} data={clients} onEdit={(p) => {setEditingClient(p); setModalOpen(true);}} onDelete={(p) => setDeletingClient(p)} />
            </>
        )
    };

    return (
        <div className="space-y-6">
            {renderContent()}
            
            <CrudModal<Client>
                isOpen={isModalOpen}
                onClose={() => {setModalOpen(false); setEditingClient(null);}}
                onSave={handleSave}
                fields={fields}
                initialData={editingClient}
                title={editingClient ? "Edit Client" : "Add Client"}
                onDataChange={handleClientDataChange}
            />
            
            <ConfirmationDialog 
                isOpen={!!deletingClient}
                onClose={() => setDeletingClient(null)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the client "${deletingClient?.name}"? This action cannot be undone.`}
            />
            
            <ConfirmationDialog 
                isOpen={isSaveConfirmOpen}
                onClose={() => setSaveConfirmOpen(false)}
                onConfirm={handleConfirmSave}
                title="Confirm Financial Update"
                message={saveConfirmMessage}
                icon={
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                        <InfoIcon className="w-6 h-6 text-blue-400" />
                    </div>
                }
                confirmText="Confirm & Save"
                confirmButtonClass="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800"
            />
            
            <PaymentHistoryModal
                isOpen={!!viewingPaymentHistory}
                onClose={() => setViewingPaymentHistory(null)}
                title={`Payment History - ${viewingPaymentHistory?.name || ''}`}
                paymentHistory={viewingPaymentHistory?.paymentHistory || []}
                totalPaid={viewingPaymentHistory?.totalPaid || 0}
            />
        </div>
    );
};

export default ClientsPage;