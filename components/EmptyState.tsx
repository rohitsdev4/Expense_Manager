import React from 'react';
import { PlusIcon, InboxIcon } from './icons';

interface EmptyStateProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  message: string;
  actionText: string;
  onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, actionText, onAction }) => {
  return (
    <div className="text-center py-16 px-4 border-2 border-dashed border-gray-700 rounded-2xl bg-gray-800/30">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
             <Icon className="w-8 h-8 text-gray-400" />
        </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">{message}</p>
      <button
        onClick={onAction}
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
      >
        <PlusIcon className="w-5 h-5" />
        {actionText}
      </button>
    </div>
  );
};

export default EmptyState;
