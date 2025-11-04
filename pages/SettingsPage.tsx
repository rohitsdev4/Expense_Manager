import React, { useContext, useState } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { DataContext } from '../contexts/DataContext';
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
    const { testConnection, connectionStatus, error } = useContext(DataContext);
    const [isSaved, setIsSaved] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    // Instead of local state, update the context directly on every change.
    // This makes the component fully controlled by the global context.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateSettings({ [e.target.id]: e.target.value });
        // Clear test result when settings change
        setTestResult(null);
    };

    // The save buttons are now for visual feedback, as data is saved on change.
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const result = await testConnection();
            setTestResult(result);
        } catch (error) {
            setTestResult({ success: false, message: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error') });
        }
        setIsTesting(false);
    };

    if (isLoading) {
        return <p>Loading settings...</p>;
    }

    return (
        <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto">
            
            {/* Migration Notice */}
            {(!currentSettings.googleSheetsApiKey && !currentSettings.aiApiKey) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
                        <div>
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">API Keys Required</h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                This app now uses separate API keys for Google Sheets and AI Chat. Please configure both below to enable all features.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
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
                 <div className="space-y-6">
                     {/* Setup Instructions */}
                     {/* Connection Status */}
                     <div className={`border rounded-lg p-4 ${
                         connectionStatus === 'connected' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                         connectionStatus === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                         connectionStatus === 'loading' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                         'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                     }`}>
                         <div className="flex items-center space-x-2 mb-2">
                             <div className={`w-3 h-3 rounded-full ${
                                 connectionStatus === 'connected' ? 'bg-green-500' :
                                 connectionStatus === 'error' ? 'bg-red-500' :
                                 connectionStatus === 'loading' ? 'bg-yellow-500 animate-pulse' :
                                 'bg-gray-400'
                             }`}></div>
                             <h3 className={`font-semibold ${
                                 connectionStatus === 'connected' ? 'text-green-800 dark:text-green-200' :
                                 connectionStatus === 'error' ? 'text-red-800 dark:text-red-200' :
                                 connectionStatus === 'loading' ? 'text-yellow-800 dark:text-yellow-200' :
                                 'text-gray-800 dark:text-gray-200'
                             }`}>
                                 {connectionStatus === 'connected' ? '✅ Connected to Google Sheets' :
                                  connectionStatus === 'error' ? '❌ Connection Failed' :
                                  connectionStatus === 'loading' ? '🔄 Connecting...' :
                                  '⚪ Not Connected'}
                             </h3>
                         </div>
                         {error && (
                             <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
                         )}
                         {connectionStatus === 'idle' && (
                             <p className="text-sm text-gray-600 dark:text-gray-400">Configure your Google Sheets URL and API key below to connect.</p>
                         )}
                     </div>

                     <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                         <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Setup Instructions</h3>
                         <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                             <li>Create a Google Cloud Project at <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a></li>
                             <li>Enable the Google Sheets API for your project</li>
                             <li>Create an API key (Credentials → Create Credentials → API Key)</li>
                             <li>Restrict the API key to Google Sheets API only (recommended)</li>
                             <li>Share your Google Sheet with "Anyone with the link can view"</li>
                             <li>Copy the sheet URL and API key below</li>
                         </ol>
                     </div>

                     <InputField 
                        id="googleSheetUrl" 
                        label="Google Sheet URL"
                        value={currentSettings.googleSheetUrl}
                        onChange={handleChange}
                        placeholder="https://docs.google.com/spreadsheets/d/1cTdP17tqW1GLpwxc25ewxZ7cRHMNjZeMatnEASH7gsE/edit"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Paste the full URL from your browser. Your sheet should have tabs named: Main, Labour, Parties, Sites
                    </p>
                     
                     <div className="relative">
                         <InputField 
                            id="googleSheetsApiKey" 
                            label="Google Sheets API Key"
                            type="password"
                            value={currentSettings.googleSheetsApiKey}
                            onChange={handleChange}
                            placeholder="AIzaSy... (Google Sheets API key)"
                        />
                        {currentSettings.googleSheetsApiKey && (
                            <div className="absolute right-3 top-8 flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    connectionStatus === 'connected' ? 'bg-green-500' :
                                    connectionStatus === 'error' ? 'bg-red-500' :
                                    'bg-gray-400'
                                }`}></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {connectionStatus === 'connected' ? 'Connected' :
                                     connectionStatus === 'error' ? 'Failed' :
                                     'Testing...'}
                                </span>
                            </div>
                        )}
                     </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                        Create a Google Sheets API key in Google Cloud Console. This is different from the AI API key.
                    </p>

                    {/* Test Connection */}
                    <div className="flex items-center space-x-4 flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={isTesting || !currentSettings.googleSheetUrl || !currentSettings.googleSheetsApiKey}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg text-sm px-4 py-2 focus:ring-4 focus:outline-none focus:ring-green-300"
                        >
                            {isTesting ? 'Testing...' : 'Test Connection'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem('pbms-ai-settings');
                                window.location.reload();
                            }}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg text-sm px-4 py-2"
                        >
                            Reset Settings
                        </button>
                        
                        {testResult && (
                            <div className={`text-sm ${testResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {testResult.message}
                            </div>
                        )}
                    </div>

                    {/* Sheet Structure Guide */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Required Sheet Structure</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <div><strong>Main tab:</strong> Date, Type, Amount, Category, Description, Labour, Site, Party, User</div>
                            <div><strong>Labour tab:</strong> Name, Role, Salary, Paid, Balance</div>
                            <div><strong>Parties tab:</strong> Name, Contact, Site Name, Total Paid, Balance</div>
                            <div><strong>Sites tab:</strong> Site Name, Progress, Payment Status, Start Date, End Date, Project Value</div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="AI Chat Configuration" icon={KeyIcon}
                footer={
                    <button type="submit" className="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-500" disabled={isSaved}>
                        {isSaved ? 'Saved!' : 'Save AI Settings'}
                    </button>
                }
            >
                <div className="space-y-6">
                    {/* AI Setup Instructions */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">AI Chat Setup</h3>
                        <ol className="text-sm text-purple-700 dark:text-purple-300 space-y-1 list-decimal list-inside">
                            <li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">OpenRouter Keys</a></li>
                            <li>Create a free account (no credit card required)</li>
                            <li>Generate an API key</li>
                            <li>Copy and paste it below</li>
                            <li>Start chatting with AI about your business data!</li>
                        </ol>
                    </div>

                    <InputField 
                        id="aiApiKey" 
                        label="AI API Key (OpenRouter)"
                        type="password"
                        value={currentSettings.aiApiKey}
                        onChange={handleChange}
                        placeholder="sk-or-... (OpenRouter API key for AI chat)"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        This is for AI chat functionality. Get a free API key from OpenRouter. This is separate from Google Sheets API key.
                    </p>
                </div>
            </SettingsCard>

            <SettingsCard title="Appearance" icon={SunIcon}>
                <ThemeToggle />
            </SettingsCard>

             {/* Debug Information */}
             <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                 <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Debug Information</h3>
                 <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 font-mono">
                     <div>Connection Status: <span className="font-bold">{connectionStatus}</span></div>
                     <div>Google Sheet URL: <span className="font-bold">{currentSettings.googleSheetUrl ? 'Set' : 'Not Set'}</span></div>
                     <div>Google Sheets API Key: <span className="font-bold">{currentSettings.googleSheetsApiKey ? 'Set' : 'Not Set'}</span></div>
                     <div>AI API Key: <span className="font-bold">{currentSettings.aiApiKey ? 'Set' : 'Not Set'}</span></div>
                     {error && <div>Error: <span className="text-red-600 dark:text-red-400">{error}</span></div>}
                 </div>
             </div>

             <div className="flex justify-end pt-4">
                 <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-8 py-3 text-center disabled:bg-gray-500" disabled={isSaved}>
                        {isSaved ? 'Settings Saved!' : 'Save All Settings'}
                </button>
            </div>
        </form>
    );
};

export default SettingsPage;