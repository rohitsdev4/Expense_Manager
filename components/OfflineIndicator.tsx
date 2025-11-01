import React, { useState, useEffect } from 'react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline message if starting offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide the offline message after 5 seconds when back online
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineMessage]);

  if (!showOfflineMessage) return null;

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm transition-all duration-300 ${
      isOnline ? 'translate-y-0' : 'translate-y-0'
    }`}>
      <div className={`p-3 rounded-lg shadow-lg border ${
        isOnline 
          ? 'bg-green-600 text-white border-green-500' 
          : 'bg-orange-600 text-white border-orange-500'
      }`}>
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            {isOnline ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isOnline ? 'Back online!' : 'You\'re offline'}
            </p>
            <p className="text-xs opacity-90">
              {isOnline 
                ? 'Data will sync automatically' 
                : 'Tasks and habits are saved locally'
              }
            </p>
          </div>
          <button
            onClick={() => setShowOfflineMessage(false)}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;