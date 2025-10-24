import React, { useState, useMemo, useContext } from 'react';
// FIX: Replace non-existent 'Party' type with 'Client'.
import type { Client, Site, Payment } from '../types';
import { DataContext } from '../contexts/DataContext';
import DataTable from '../components/DataTable';
import CrudModal, { FormField } from '../components/CrudModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EmptyState from '../components/EmptyState';
import { PlusIcon, HandshakeIcon, InfoIcon } from '../components/icons';

const ClientsPage: React.FC = () => {
    // FIX: Use client-specific data and functions from DataContext.
    // FIX: Replace non-existent 'isLoading' with 'connectionStatus' to align with DataContextType.
    const { clients, sites, payments, connectionStatus, addClient, updateClient, deleteClient } = useContext(DataContext);
    
    const [isModalOpen, setModalOpen] = useState(false);
    // FIX: Update state to use the 'Client' type.
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deletingClient, setDeletingClient] = useState<Client | null>(null);

    const [isSaveConfirmOpen, setSaveConfirmOpen] = useState(false);
    // FIX: Update state to use the 'Client' type.
    const [pendingSaveData, setPendingSaveData] = useState<Client | null>(null);
    const [saveConfirmMessage, setSaveConfirmMessage] = useState('');

    // FIX: Update function signature and logic to use 'Client' type and client-specific update/add functions.
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

    // FIX: Update function signature to use 'Client' type.
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

    // FIX: Use client-specific delete function.
    const handleDelete = async () => {
        if (!deletingClient) return;
        await deleteClient(deletingClient.id);
        setDeletingClient(null);
    };
    
    // FIX: Update function signature to use 'Client' type.
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
        { header: 'Total Paid', accessor: 'totalPaid' as const, render: (v: number) => `₹${v?.toLocaleString() || 0}` },
        { header: 'Balance', accessor: 'balance' as const, render: (v: number) => `₹${v?.toLocaleString() || 0}` },
    ], []);
    
    const siteOptions = useMemo(() => sites.map(s => ({ value: s.siteName, label: s.siteName })), [sites]);

    const fields: FormField[] = [
        { name: 'name', label: 'Client Name', type: 'text', required: true },
        { name: 'contact', label: 'Contact', type: 'text', required: true },
        { name: 'siteName', label: 'Associated Site', type: 'select', options: siteOptions },
        { name: 'totalPaid', label: 'Total Paid', type: 'number', required: true },
        { name: 'balance', label: 'Balance', type: 'number', required: true },
    ];

    const renderContent = () => {
        // FIX: Check 'connectionStatus' instead of the non-existent 'isLoading'.
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
                <div className="flex justify-end">
                    <button onClick={() => { setEditingClient(null); setModalOpen(true); }} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add New Client</span>
                    </button>
                </div>
                {/* FIX: Use the correct generic type for DataTable. */}
                <DataTable<Client> columns={columns} data={clients} onEdit={(p) => {setEditingClient(p); setModalOpen(true);}} onDelete={(p) => setDeletingClient(p)} />
            </>
        )
    };

    return (
        <div className="space-y-6">
            {renderContent()}
            
            {/* FIX: Use the correct generic type for CrudModal. */}
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
        </div>
    );
};

export default ClientsPage;