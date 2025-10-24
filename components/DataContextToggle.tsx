
import React from 'react';
import { DatabaseIcon } from './icons';

interface DataContextToggleProps {
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}

const DataContextToggle: React.FC<DataContextToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onToggle(!isEnabled)}>
        <DatabaseIcon className={`w-6 h-6 transition-colors ${isEnabled ? 'text-green-400' : 'text-gray-400'}`} />
        <span className={`font-medium text-sm transition-colors ${isEnabled ? 'text-green-300' : 'text-gray-300'}`}>
            Data Context
        </span>
        <div className={`relative w-10 h-5 rounded-full transition-colors ${isEnabled ? 'bg-green-600' : 'bg-gray-600'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </div>
    </div>
  );
};

export default DataContextToggle;