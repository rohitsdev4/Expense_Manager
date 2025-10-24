import React from 'react';
import { ChartIcon } from './icons';

interface ChartPlaceholderProps {
    title: string;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title }) => {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 h-80 flex flex-col">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
        <div className="flex-grow flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <ChartIcon className="w-12 h-12 mb-2" />
            <p className="text-sm">Chart data will be displayed here.</p>
        </div>
    </div>
  );
};

export default ChartPlaceholder;