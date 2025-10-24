import React, { useContext } from 'react';
import { RefreshCwIcon } from './icons';
import { DataContext } from '../contexts/DataContext';

const ConnectionStatusIndicator: React.FC = () => {
    const { connectionStatus, lastSync, error } = useContext(DataContext);

    const getStatusInfo = () => {
        switch (connectionStatus) {
            case 'connected':
                return {
                    color: 'bg-green-500',
                    tooltip: `Connected. Last synced at ${lastSync?.toLocaleTimeString()}`,
                    pulse: false,
                };
            case 'loading':
                return {
                    color: 'bg-yellow-500',
                    tooltip: 'Syncing data now...',
                    pulse: true,
                };
            case 'error':
                 return {
                    color: 'bg-red-500',
                    tooltip: `Connection error. ${error || ''}`,
                    pulse: false,
                };
            case 'idle':
            default:
                return {
                    color: 'bg-gray-500',
                    tooltip: 'Not configured. Please add connection details in Settings.',
                    pulse: false,
                };
        }
    };

    const { color, tooltip, pulse } = getStatusInfo();

    return (
        <div className="relative group flex items-center">
            <span className={`w-3 h-3 rounded-full ${color} ${pulse ? 'animate-pulse' : ''}`}></span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 shadow-lg z-20 border border-gray-600">
                {tooltip}
            </div>
        </div>
    );
}

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { connectionStatus, refreshData } = useContext(DataContext);
  const isLoading = connectionStatus === 'loading';

  return (
    <header className="p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ConnectionStatusIndicator />
        <button 
          onClick={refreshData}
          disabled={isLoading}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
          aria-label="Sync data"
        >
          <RefreshCwIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isLoading ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;