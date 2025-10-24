import React, { useState, useMemo, useContext } from 'react';
import type { Site } from '../types';
import { DataContext } from '../contexts/DataContext';
import DataTable from '../components/DataTable';
import CrudModal, { FormField } from '../components/CrudModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EmptyState from '../components/EmptyState';
import { PlusIcon, BuildingIcon } from '../components/icons';

const SitesPage: React.FC = () => {
    const { sites, connectionStatus, addSite, updateSite, deleteSite } = useContext(DataContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Site | null>(null);
    const [deletingSite, setDeletingSite] = useState<Site | null>(null);

    const handleSave = async (siteData: Site) => {
        if (editingSite) {
            await updateSite(editingSite.id, siteData);
        } else {
            await addSite(siteData);
        }
        setModalOpen(false);
        setEditingSite(null);
    };

    const handleDelete = async () => {
        if (!deletingSite) return;
        await deleteSite(deletingSite.id);
        setDeletingSite(null);
    };

    const columns = useMemo(() => [
        { header: 'Site Name', accessor: 'siteName' as const },
        { header: 'Project Value', accessor: 'projectValue' as const, render: (val: number) => `₹${val?.toLocaleString() || 0}` },
        { header: 'Progress', accessor: 'progress' as const, render: (val: number) => {
            const width = val > 100 ? 100 : val < 0 ? 0 : val;
            const bgColor = val < 40 ? 'bg-red-500' : val < 80 ? 'bg-yellow-500' : 'bg-green-500';
            return (
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                    <div className={`${bgColor} h-2.5 rounded-full`} style={{width: `${width}%`}}></div>
                </div>
            )
        }},
        { header: 'Payment Status', accessor: 'paymentStatus' as const },
        { header: 'Start Date', accessor: 'startDate' as const },
        { header: 'End Date', accessor: 'endDate' as const },
    ], []);

    const fields: FormField[] = [
        { name: 'siteName', label: 'Site Name', type: 'text', required: true },
        { name: 'projectValue', label: 'Total Project Value (₹)', type: 'number', required: true },
        { name: 'progress', label: 'Progress (%)', type: 'number', required: true },
        { name: 'paymentStatus', label: 'Payment Status', type: 'select', required: true, options: [
            { value: 'Paid', label: 'Paid' },
            { value: 'Partially Paid', label: 'Partially Paid' },
            { value: 'Pending', label: 'Pending' },
        ]},
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'End Date', type: 'date', required: true },
    ];

    const renderContent = () => {
        if (connectionStatus === 'loading') return <p className="text-center py-8 text-gray-400">Loading sites...</p>;
        if (sites.length === 0) {
            return (
                <EmptyState
                    icon={BuildingIcon}
                    title="No Sites Found"
                    message="Get started by adding your first project site to track its progress."
                    actionText="Add New Site"
                    onAction={() => setModalOpen(true)}
                />
            );
        }
        return (
            <>
                <div className="flex justify-end mb-6">
                    <button onClick={() => setModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add New Site</span>
                    </button>
                </div>
                <DataTable<Site> columns={columns} data={sites} onEdit={(s) => {setEditingSite(s); setModalOpen(true);}} onDelete={(s) => setDeletingSite(s)} />
            </>
        );
    };

    return (
        <div className="space-y-6">
            {renderContent()}
            
            <CrudModal<Site>
                isOpen={isModalOpen}
                onClose={() => {setModalOpen(false); setEditingSite(null);}}
                onSave={handleSave}
                fields={fields}
                initialData={editingSite}
                title={editingSite ? "Edit Site" : "Add Site"}
            />
            
            <ConfirmationDialog 
                isOpen={!!deletingSite}
                onClose={() => setDeletingSite(null)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the site "${deletingSite?.siteName}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default SitesPage;