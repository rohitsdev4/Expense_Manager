import React, { useState, useMemo, useContext } from 'react';
import type { Task, Habit } from '../types';
import { DataContext } from '../contexts/DataContext';
import DataTable from '../components/DataTable';
import FilterBar, { Filters } from '../components/FilterBar';
import CrudModal, { FormField } from '../components/CrudModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EmptyState from '../components/EmptyState';
import { PlusIcon, FlameIcon, FlagIcon, ChecklistIcon } from '../components/icons';

type ActiveTab = 'tasks' | 'habits';

const priorityColors: Record<Task['priority'], string> = {
    High: 'text-red-400',
    Medium: 'text-yellow-400',
    Low: 'text-blue-400',
};

const statusColors: Record<Task['status'], string> = {
    Completed: 'bg-green-500/20 text-green-300',
    'In Progress': 'bg-blue-500/20 text-blue-300',
    Pending: 'bg-gray-500/20 text-gray-300',
};


const TasksAndHabitsPage: React.FC = () => {
    const { 
        tasks, habits, connectionStatus, 
        addTask, updateTask, deleteTask,
        addHabit, updateHabit, deleteHabit, incrementHabitStreak
    } = useContext(DataContext);
    const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
    
    // Filtering State
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    
    // Modal & Deletion State
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);

    const [isHabitModalOpen, setHabitModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
    
    React.useEffect(() => {
        setFilteredTasks(tasks);
    }, [tasks]);


    const handleFilterTasks = (filters: Filters) => {
        const { category: status } = filters;
        let data = [...tasks];
        if (status && status !== 'all') data = data.filter(t => t.status === status);
        setFilteredTasks(data);
    };
    
    const handleResetTasks = () => setFilteredTasks(tasks);

    const handleSaveTask = async (taskData: Task) => {
        if (editingTask) {
            await updateTask(editingTask.id, taskData);
        } else {
            await addTask(taskData);
        }
        setTaskModalOpen(false);
        setEditingTask(null);
    };
    
    const handleSaveHabit = async (habitData: Habit) => {
        if (editingHabit) {
            await updateHabit(editingHabit.id, habitData);
        } else {
            await addHabit({ ...habitData, streak: 0 });
        }
        setHabitModalOpen(false);
        setEditingHabit(null);
    };
    
    const handleDelete = async () => {
        if (deletingTask) await deleteTask(deletingTask.id);
        if (deletingHabit) await deleteHabit(deletingHabit.id);
        setDeletingTask(null);
        setDeletingHabit(null);
    }
    
    const taskColumns = useMemo(() => [
        { header: 'Title', accessor: 'title' as const },
        { header: 'Deadline', accessor: 'deadline' as const },
        { header: 'Status', accessor: 'status' as const, render: (status: Task['status']) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
                {status}
            </span>
        )},
        { header: 'Priority', accessor: 'priority' as const, render: (priority: Task['priority']) => (
            <span className={`flex items-center gap-2 ${priorityColors[priority]}`}>
                <FlagIcon className="w-4 h-4" /> {priority}
            </span>
        )},
    ], []);
    
    const habitColumns = useMemo(() => [
        { header: 'Habit', accessor: 'name' as const },
        { header: 'Frequency', accessor: 'frequency' as const },
        { header: 'Streak', accessor: 'streak' as const, render: (streak: number, habit: Habit) => (
             <div className="flex items-center space-x-3">
                <span className="flex items-center font-semibold text-orange-400">
                    <FlameIcon className="w-5 h-5 mr-1"/>
                    {streak}
                </span>
                <button 
                    onClick={() => incrementHabitStreak(habit.id)}
                    className="bg-green-500/20 text-green-300 hover:bg-green-500/40 p-1.5 rounded-full"
                    aria-label={`Increment streak for ${habit.name}`}
                >
                    <PlusIcon className="w-4 h-4"/>
                </button>
            </div>
        )},
    ], [incrementHabitStreak]);

    const taskFields: FormField[] = [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'deadline', label: 'Deadline', type: 'date', required: true },
        { name: 'status', label: 'Status', type: 'select', required: true, options: [
            { value: 'Pending', label: 'Pending' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Completed', label: 'Completed' }
        ]},
        { name: 'priority', label: 'Priority', type: 'select', required: true, options: [
            { value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }
        ]},
    ];
    
    const habitFields: FormField[] = [
        { name: 'name', label: 'Habit Name', type: 'text', required: true },
        { name: 'frequency', label: 'Frequency', type: 'select', required: true, options: [
            { value: 'Daily', label: 'Daily' }, { value: 'Weekly', label: 'Weekly' }
        ]},
    ];

    const taskFilterOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
    ];

    const renderContent = () => {
        if (connectionStatus === 'loading') return <p className="text-center py-8 text-gray-400">Loading data...</p>;
        
        if (activeTab === 'tasks') {
            return tasks.length > 0 ? (
                <>
                    <FilterBar onFilter={handleFilterTasks} onReset={handleResetTasks} categoryOptions={taskFilterOptions} categoryLabel="Status" />
                    <DataTable<Task> columns={taskColumns} data={filteredTasks} onEdit={(item) => {setEditingTask(item); setTaskModalOpen(true);}} onDelete={setDeletingTask} />
                </>
            ) : (
                <EmptyState 
                    icon={ChecklistIcon}
                    title="No Tasks Yet"
                    message="Stay organized by adding your first task to the list."
                    actionText="Add New Task"
                    onAction={() => setTaskModalOpen(true)}
                />
            );
        }
        
        if (activeTab === 'habits') {
            return habits.length > 0 ? (
                 <DataTable<Habit> columns={habitColumns} data={habits} onEdit={(item) => {setEditingHabit(item); setHabitModalOpen(true);}} onDelete={setDeletingHabit} />
            ) : (
                <EmptyState 
                    icon={FlameIcon}
                    title="No Habits to Track"
                    message="Build good habits by adding your first one."
                    actionText="Add New Habit"
                    onAction={() => setHabitModalOpen(true)}
                />
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('tasks')} className={`${activeTab === 'tasks' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Tasks</button>
                        <button onClick={() => setActiveTab('habits')} className={`${activeTab === 'habits' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Habits</button>
                    </nav>
                </div>
                 <button onClick={() => activeTab === 'tasks' ? setTaskModalOpen(true) : setHabitModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add {activeTab === 'tasks' ? 'Task' : 'Habit'}</span>
                </button>
            </div>
            
            {renderContent()}

            <CrudModal<Task> isOpen={isTaskModalOpen} onClose={() => {setTaskModalOpen(false); setEditingTask(null);}} onSave={handleSaveTask} fields={taskFields} initialData={editingTask} title={editingTask ? "Edit Task" : "Add Task"} />
            <CrudModal<Habit> isOpen={isHabitModalOpen} onClose={() => {setHabitModalOpen(false); setEditingHabit(null);}} onSave={handleSaveHabit} fields={habitFields} initialData={editingHabit} title={editingHabit ? "Edit Habit" : "Add Habit"} />
            
            <ConfirmationDialog 
                isOpen={!!deletingTask || !!deletingHabit}
                onClose={() => { setDeletingTask(null); setDeletingHabit(null); }}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete this ${deletingTask ? 'task' : 'habit'}? This action cannot be undone.`}
            />
        </div>
    );
};

export default TasksAndHabitsPage;