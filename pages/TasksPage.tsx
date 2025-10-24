import React, { useState, useMemo, useContext } from 'react';
import type { Task, Habit } from '../types';
import { DataContext } from '../contexts/DataContext';
import DataTable from '../components/DataTable';
import CrudModal, { FormField } from '../components/CrudModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EmptyState from '../components/EmptyState';
import { PlusIcon, ChecklistIcon, UsersIcon } from '../components/icons';

const TasksPage: React.FC = () => {
    const { tasks, habits, connectionStatus, addTask, updateTask, deleteTask, addHabit, updateHabit, deleteHabit, incrementHabitStreak } = useContext(DataContext);
    
    const [activeTab, setActiveTab] = useState<'tasks' | 'habits'>('tasks');
    
    // Task state
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    
    // Habit state
    const [isHabitModalOpen, setHabitModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

    // Task handlers
    const handleSaveTask = async (data: Task) => {
        if (editingTask) {
            await updateTask(editingTask.id, data);
        } else {
            await addTask(data);
        }
        setTaskModalOpen(false);
        setEditingTask(null);
    };

    const handleDeleteTask = async () => {
        if (!deletingTask) return;
        await deleteTask(deletingTask.id);
        setDeletingTask(null);
    };

    // Habit handlers
    const handleSaveHabit = async (data: Habit) => {
        if (editingHabit) {
            await updateHabit(editingHabit.id, data);
        } else {
            await addHabit(data);
        }
        setHabitModalOpen(false);
        setEditingHabit(null);
    };

    const handleDeleteHabit = async () => {
        if (!deletingHabit) return;
        await deleteHabit(deletingHabit.id);
        setDeletingHabit(null);
    };

    const handleIncrementStreak = async (habitId: string) => {
        await incrementHabitStreak(habitId);
    };

    // Task columns
    const taskColumns = useMemo(() => [
        { header: 'Title', accessor: 'title' as const },
        { header: 'Deadline', accessor: 'deadline' as const },
        { header: 'Status', accessor: 'status' as const, render: (status: string) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
                {status}
            </span>
        )},
        { header: 'Priority', accessor: 'priority' as const, render: (priority: string) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                priority === 'Medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
                {priority}
            </span>
        )},
    ], []);

    // Habit columns
    const habitColumns = useMemo(() => [
        { header: 'Name', accessor: 'name' as const },
        { header: 'Frequency', accessor: 'frequency' as const },
        { header: 'Streak', accessor: 'streak' as const, render: (streak: number) => (
            <span className="font-bold text-blue-600">{streak} days</span>
        )},
        { header: 'Action', accessor: 'id' as const, render: (id: string) => (
            <button
                onClick={() => handleIncrementStreak(id)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
            >
                +1 Day
            </button>
        )},
    ], []);

    // Task form fields
    const taskFields: FormField[] = [
        { name: 'title', label: 'Task Title', type: 'text', required: true },
        { name: 'deadline', label: 'Deadline', type: 'date', required: true },
        { name: 'status', label: 'Status', type: 'select', required: true, options: [
            { value: 'Pending', label: 'Pending' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' },
        ]},
        { name: 'priority', label: 'Priority', type: 'select', required: true, options: [
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
        ]},
    ];

    // Habit form fields
    const habitFields: FormField[] = [
        { name: 'name', label: 'Habit Name', type: 'text', required: true },
        { name: 'frequency', label: 'Frequency', type: 'select', required: true, options: [
            { value: 'Daily', label: 'Daily' },
            { value: 'Weekly', label: 'Weekly' },
        ]},
        { name: 'streak', label: 'Current Streak (days)', type: 'number', required: true },
    ];

    const renderTasksContent = () => {
        if (connectionStatus === 'loading') return <p className="text-center py-8 text-gray-400">Loading tasks...</p>;
        if (tasks.length === 0) {
            return (
                <EmptyState
                    icon={ChecklistIcon}
                    title="No Tasks Found"
                    message="Start managing your tasks by adding your first TODO item."
                    actionText="Add New Task"
                    onAction={() => setTaskModalOpen(true)}
                />
            );
        }
        return (
            <>
                <div className="flex justify-end mb-4 lg:mb-6">
                    <button onClick={() => setTaskModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 lg:px-4 rounded-lg text-sm lg:text-base">
                        <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="hidden sm:inline">Add New Task</span>
                        <span className="sm:hidden">Add Task</span>
                    </button>
                </div>
                <DataTable<Task> columns={taskColumns} data={tasks} onEdit={(t) => {setEditingTask(t); setTaskModalOpen(true);}} onDelete={(t) => setDeletingTask(t)} />
            </>
        );
    };

    const renderHabitsContent = () => {
        if (connectionStatus === 'loading') return <p className="text-center py-8 text-gray-400">Loading habits...</p>;
        if (habits.length === 0) {
            return (
                <EmptyState
                    icon={UsersIcon}
                    title="No Habits Found"
                    message="Start tracking your habits by adding your first habit."
                    actionText="Add New Habit"
                    onAction={() => setHabitModalOpen(true)}
                />
            );
        }
        return (
            <>
                <div className="flex justify-end mb-4 lg:mb-6">
                    <button onClick={() => setHabitModalOpen(true)} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 lg:px-4 rounded-lg text-sm lg:text-base">
                        <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="hidden sm:inline">Add New Habit</span>
                        <span className="sm:hidden">Add Habit</span>
                    </button>
                </div>
                <DataTable<Habit> columns={habitColumns} data={habits} onEdit={(h) => {setEditingHabit(h); setHabitModalOpen(true);}} onDelete={(h) => setDeletingHabit(h)} />
            </>
        );
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex-1 py-2 px-2 lg:px-4 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                        activeTab === 'tasks'
                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    <span className="hidden sm:inline">📋 TODO Tasks</span>
                    <span className="sm:hidden">📋 Tasks</span> ({tasks.length})
                </button>
                <button
                    onClick={() => setActiveTab('habits')}
                    className={`flex-1 py-2 px-2 lg:px-4 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                        activeTab === 'habits'
                            ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    <span className="hidden sm:inline">🎯 Habits Tracker</span>
                    <span className="sm:hidden">🎯 Habits</span> ({habits.length})
                </button>
            </div>

            {/* Content */}
            {activeTab === 'tasks' ? renderTasksContent() : renderHabitsContent()}

            {/* Task Modal */}
            <CrudModal<Task>
                isOpen={isTaskModalOpen}
                onClose={() => {setTaskModalOpen(false); setEditingTask(null);}}
                onSave={handleSaveTask}
                fields={taskFields}
                initialData={editingTask}
                title={editingTask ? "Edit Task" : "Add Task"}
            />

            {/* Habit Modal */}
            <CrudModal<Habit>
                isOpen={isHabitModalOpen}
                onClose={() => {setHabitModalOpen(false); setEditingHabit(null);}}
                onSave={handleSaveHabit}
                fields={habitFields}
                initialData={editingHabit}
                title={editingHabit ? "Edit Habit" : "Add Habit"}
            />

            {/* Task Deletion Confirmation */}
            <ConfirmationDialog 
                isOpen={!!deletingTask}
                onClose={() => setDeletingTask(null)}
                onConfirm={handleDeleteTask}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the task "${deletingTask?.title}"? This action cannot be undone.`}
            />

            {/* Habit Deletion Confirmation */}
            <ConfirmationDialog 
                isOpen={!!deletingHabit}
                onClose={() => setDeletingHabit(null)}
                onConfirm={handleDeleteHabit}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the habit "${deletingHabit?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default TasksPage;