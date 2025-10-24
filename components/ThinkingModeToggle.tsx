
import React from 'react';
import { BrainCircuitIcon } from './icons';

interface ThinkingModeToggleProps {
  isThinkingMode: boolean;
  onToggle: (isEnabled: boolean) => void;
}

const ThinkingModeToggle: React.FC<ThinkingModeToggleProps> = ({ isThinkingMode, onToggle }) => {
  return (
    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onToggle(!isThinkingMode)}>
        <BrainCircuitIcon className={`w-6 h-6 transition-colors ${isThinkingMode ? 'text-purple-400' : 'text-gray-400'}`} />
        <span className={`font-medium text-sm transition-colors ${isThinkingMode ? 'text-purple-300' : 'text-gray-300'}`}>
            Thinking Mode
        </span>
        <div className={`relative w-10 h-5 rounded-full transition-colors ${isThinkingMode ? 'bg-purple-600' : 'bg-gray-600'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isThinkingMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </div>
    </div>
  );
};

export default ThinkingModeToggle;