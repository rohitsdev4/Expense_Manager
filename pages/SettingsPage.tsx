import React, { useContext, useState } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import type { Theme } from '../types';
import { UserIcon, SunIcon, MoonIcon, SheetIcon, KeyIcon } from '../components/icons';

const SettingsCard: React.FC<{ title: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, children: React.ReactNode, footer?: React.ReactNode }> = ({ title, icon: Icon, children, footer }) => (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
                <Icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
            </div>
        </div>
        <div className="p-6">
            {children}
        </div>
        {footer && (
             <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl flex justify-end">
                {footer}
            </div>
        )}
    </div>
);

const InputField: React.FC<{ id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, type?: string, placeholder?: string, as?: 'textarea' }> = ({ id, label, as, ...props }) => (
    <div>
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {as === 'textarea' ? (
             <textarea 
                id={id}
                rows={3}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                {...props}
            />
        ) : (
            <input 
                id={id}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                {...props}
            />
        )}
    </div>
);

const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useContext(SettingsContext);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
         <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-300">Appearance</p>
            <button 
                onClick={toggleTheme}
                className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
                <SunIcon className={`w-5 h-5 ${theme === 'light' ? 'text-blue-500' : 'text-gray-500'}`} />
                <div className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
                <MoonIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-500'}`} />
            </button>
        </div>
    );
}

const SettingsPage: React.FC = () => {
    const { isLoading, updateSettings, ...currentSettings } = useContext(SettingsContext);
    const [isSaved, setIsSaved] = useState(false);

    // Instead of local state, update the context directly on every change.
    // This makes the component fully controlled by the global context.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateSettings({ [e.target.id]: e.target.value });
    };

    // The save buttons are now for visual feedback, as data is saved on change.
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    if (isLoading) {
        return <p>Loading settings...</p>;
    }

    return (
        <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto">
            
            <SettingsCard title="User Profile" icon={UserIcon}>
                <div className="space-y-4">
                    <InputField 
                        id="userName" 
                        label="Your Name"
                        value={currentSettings.userName}
                        onChange={handleChange}
                    />
                </div>
            </SettingsCard>
            
            <SettingsCard title="Live Data Connection" icon={SheetIcon}
                 footer={
                    <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-500" disabled={isSaved}>
                        {isSaved ? 'Saved!' : 'Save Connection'}
                    </button>
                }
            >
                 <div className="space-y-4">
                     <InputField 
                        id="googleSheetUrl" 
                        label="Google Sheet URL"
                        value={currentSettings.googleSheetUrl}
                        onChange={handleChange}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paste the full URL of your Google Sheet from the browser address bar. The app will extract the Sheet ID automatically.</p>
                     <InputField 
                        id="apiKey" 
                        label="Google API Key"
                        type="password"
                        value={currentSettings.apiKey}
                        onChange={handleChange}
                        placeholder="Enter your Google API Key"
                    />
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                        Create an API key in your Google Cloud Console and enable the Google Sheets API.
                        Ensure the sheet's sharing settings are "Anyone with the link can view".
                    </p>
                </div>
            </SettingsCard>


            <SettingsCard title="Appearance" icon={SunIcon}>
                <ThemeToggle />
            </SettingsCard>

             <div className="flex justify-end pt-4">
                 <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-8 py-3 text-center disabled:bg-gray-500" disabled={isSaved}>
                        {isSaved ? 'Settings Saved!' : 'Save All Settings'}
                </button>
            </div>
        </form>
    );
};

export default SettingsPage;