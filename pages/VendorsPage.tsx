import React, { useState, useMemo, useContext } from 'react';
// FIX: Replace non-existent 'Party' type with 'Client' as they share the same structure.
import type { Client, Site } from '../types';
import { DataContext } from '../contexts/DataContext';
import DataTable from '../components/DataTable';
import CrudModal, { FormField } from '../components/CrudModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EmptyState from '../components/EmptyState';
import { PlusIcon, InboxIcon } from '../components/icons';

const VendorsPage: React.FC = () => {
    // FIX: Use vendor-specific data and functions from DataContext.
    // FIX: Replace non-existent 'isLoading' with 'connectionStatus' to align with DataContextType.
    const { vendors, sites, connectionStatus, addVendor, updateVendor, deleteVendor } = useContext(DataContext);
    
    const [isModalOpen, setModalOpen] = useState(false);
    // FIX: Update state to use the 'Client' type for vendors.
    const [editingVendor, setEditingVendor] = useState<Client | null>(null);
    const [deletingVendor, setDeletingVendor] = useState<Client | null>(null);

    // FIX: Update function signature and logic to use 'Client' type and vendor-specific functions.
    const handleSave = async (vendorData: Client) => {
        if (editingVendor) {
            await updateVendor(editingVendor.id, vendorData);
        } else {
            await addVendor(vendorData);
        }
        setModalOpen(false);
        setEditingVendor(null);
    };

    // FIX: Use vendor-specific delete function.
    const handleDelete = async () => {
        if (!deletingVendor) return;
        await deleteVendor(deletingVendor.id);
        setDeletingVendor(null);
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
        { name: 'name', label: 'Vendor Name', type: 'text', required: true },
        { name: 'contact', label: 'Contact', type: 'text', required: true },
        { name: 'siteName', label: 'Associated Site', type: 'select', options: siteOptions },
        { name: 'totalPaid', label: 'Total Paid to Vendor', type: 'number', required: true },
        { name: 'balance', label: 'Balance Owed', type: 'number', required: true },
    ];

    const renderContent = () => {
        // FIX: Check 'connectionStatus' instead of the non-existent 'isLoading'.
        if (connectionStatus === 'loading') return <p className="text-center py-8 text-gray-400">Loading vendors...</p>;
        if (vendors.length === 0) {
            return (
                <EmptyState
                    icon={InboxIcon}
                    title="No Vendors Found"
                    message="Manage your vendors by adding their details here."
                    actionText="Add New Vendor"
                    onAction={() => { setEditingVendor(null); setModalOpen(true); }}
                />
            );
        }
        return (
            <>
                <div className="flex justify-end mb-6">
                    <button onClick={() => { setEditingVendor(null); setModalOpen(true); }} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add New Vendor</span>
                    </button>
                </div>
                {/* FIX: Use the correct generic type for DataTable. */}
                <DataTable<Client> columns={columns} data={vendors} onEdit={(p) => {setEditingVendor(p); setModalOpen(true);}} onDelete={(p) => setDeletingVendor(p)} />
            </>
        );
    };

    return (
        <div className="space-y-6">
            {renderContent()}
            
            {/* FIX: Use the correct generic type for CrudModal. */}
            <CrudModal<Client>
                isOpen={isModalOpen}
                onClose={() => {setModalOpen(false); setEditingVendor(null);}}
                onSave={handleSave}
                fields={fields}
                initialData={editingVendor}
                title={editingVendor ? "Edit Vendor" : "Add Vendor"}
            />
            
            <ConfirmationDialog 
                isOpen={!!deletingVendor}
                onClose={() => setDeletingVendor(null)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the vendor "${deletingVendor?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default VendorsPage;