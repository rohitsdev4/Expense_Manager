import React, { useState, useMemo, useContext } from 'react';
import type { Labour } from '../types';
import { DataContext } from '../contexts/DataContext';
import DataTable from '../components/DataTable';
import CrudModal, { FormField } from '../components/CrudModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EmptyState from '../components/EmptyState';
import { PlusIcon, UsersIcon } from '../components/icons';

const LabourPage: React.FC = () => {
    const { labours, connectionStatus, addLabour, updateLabour, deleteLabour } = useContext(DataContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingLabour, setEditingLabour] = useState<Labour | null>(null);
    const [deletingLabour, setDeletingLabour] = useState<Labour | null>(null);
    
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
        { header: 'Paid', accessor: 'paid' as const, render: (v: number) => `₹${v.toLocaleString()}` },
        { header: 'Balance', accessor: 'balance' as const, render: (v: number) => `₹${v.toLocaleString()}` },
    ], []);

    const fields: FormField[] = [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'role', label: 'Role', type: 'text', required: true },
        { name: 'salary', label: 'Salary', type: 'number', required: true },
        { name: 'paid', label: 'Amount Paid', type: 'number', required: true },
    ];

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
        </div>
    );
};

export default LabourPage;