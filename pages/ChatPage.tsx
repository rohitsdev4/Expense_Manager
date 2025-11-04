import React, { useState, useContext, useRef, useEffect } from 'react';
import { DataContext } from '../contexts/DataContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { generateResponse, testApiConnection } from '../services/openrouterService';
import type { Message } from '../types';
import { SendIcon, BrainCircuitIcon, UserIcon } from '../components/icons';

const ChatPage: React.FC = () => {
    const data = useContext(DataContext);
    const settings = useContext(SettingsContext);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            content: 'Hello! I\'m your AI assistant for ExpenseMan. I can help you analyze your business data, answer questions about your finances, and provide insights. What would you like to know?'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [tempApiKey, setTempApiKey] = useState('');
    const [isTestingApiKey, setIsTestingApiKey] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getBusinessContext = () => {
        // Check if we have data
        if (!data || (!data.payments?.length && !data.expenses?.length && !data.sites?.length)) {
            return null; // No data available
        }

        const context = {
            dataSource: "Google Sheets Integration - Live Data",
            lastSync: data.lastSync ? data.lastSync.toISOString() : "Never",
            connectionStatus: data.connectionStatus,
            
            summary: {
                totalPayments: (data.payments || []).reduce((sum, p) => sum + p.amount, 0),
                totalExpenses: (data.expenses || []).reduce((sum, e) => sum + e.amount, 0),
                profit: (data.payments || []).reduce((sum, p) => sum + p.amount, 0) - (data.expenses || []).reduce((sum, e) => sum + e.amount, 0),
                activeSites: (data.sites || []).length,
                totalLabour: (data.labours || []).length,
                totalClients: (data.clients || []).length,
                recentTransactions: (data.payments || []).length + (data.expenses || []).length
            },
            
            userBalances: data.userBalances || [],
            
            recentPayments: (data.payments || [])
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 15), // Last 15 payments
                
            recentExpenses: (data.expenses || [])
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 15), // Last 15 expenses
                
            sites: data.sites || [],
            labours: data.labours || [],
            clients: data.clients || [],
            
            expensesByCategory: (data.expenses || []).reduce((acc, expense) => {
                acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                return acc;
            }, {} as Record<string, number>),
            
            paymentsByMode: (data.payments || []).reduce((acc, payment) => {
                acc[payment.mode] = (acc[payment.mode] || 0) + payment.amount;
                return acc;
            }, {} as Record<string, number>),
            
            siteAnalysis: (data.sites || []).map(site => ({
                name: site.siteName,
                progress: site.progress,
                paymentStatus: site.paymentStatus,
                projectValue: site.projectValue,
                relatedPayments: (data.payments || []).filter(p => 
                    p.site.toLowerCase().includes(site.siteName.toLowerCase())
                ).reduce((sum, p) => sum + p.amount, 0),
                relatedExpenses: (data.expenses || []).filter(e => 
                    e.description.toLowerCase().includes(site.siteName.toLowerCase())
                ).reduce((sum, e) => sum + e.amount, 0)
            }))
        };
        
        console.log('📊 Sending business context to AI:', context);
        return JSON.stringify(context, null, 2);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: inputMessage.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const context = getBusinessContext();
            
            console.log('🔍 Chat Debug Info:', {
                hasApiKey: !!settings?.aiApiKey,
                apiKeyLength: settings?.aiApiKey?.length,
                hasContext: !!context,
                messageCount: messages.length
            });
            
            // Filter out the initial model message and create proper conversation history
            const conversationHistory = messages.filter(msg => msg.role === 'user' || 
                (msg.role === 'model' && !msg.content.includes("Hello! I'm your AI assistant")));
            
            console.log('📝 Sending to OpenRouter:', {
                conversationLength: conversationHistory.length,
                userMessage: userMessage.content.substring(0, 50) + '...',
                hasApiKey: !!settings?.aiApiKey
            });
            
            const response = await generateResponse(
                [...conversationHistory, userMessage],
                isThinkingMode,
                context,
                settings?.aiApiKey
            );

            console.log('✅ Received response:', response.substring(0, 100) + '...');

            const aiMessage: Message = {
                role: 'model',
                content: response
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('❌ Chat error:', error);
            
            // Enhanced error handling for OpenRouter service
            const errorMessage: Message = {
                role: 'model',
                content: typeof error === 'string' ? error : `❌ **Error**: ${error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'}`
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: 'model',
                content: 'Hello! I\'m your AI assistant for ExpenseMan. I can help you analyze your business data, answer questions about your finances, and provide insights. What would you like to know?'
            }
        ]);
    };

    const suggestedQuestions = [
        "What's my current profit margin?",
        "Which expense category costs me the most?",
        "How are my sites performing?",
        "Show me my payment trends",
        "What's my labour cost analysis?",
        "Which clients owe me money?",
        "Compare my income vs expenses",
        "What's my most profitable site?"
    ];

    const handleSuggestedQuestion = (question: string) => {
        setInputMessage(question);
    };

    const testApiKey = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
        try {
            setIsTestingApiKey(true);
            console.log('🔍 Testing API key...');
            
            // Use the improved testing function
            const result = await testApiConnection(apiKey);
            console.log('🔍 Test result:', result);
            
            return result;
        } catch (error) {
            console.error('API key test failed:', error);
            return { 
                success: false, 
                message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
            };
        } finally {
            setIsTestingApiKey(false);
        }
    };

    const handleSaveApiKey = async () => {
        if (!tempApiKey.trim()) {
            alert('Please enter an API key');
            return;
        }

        if (!tempApiKey.startsWith('sk-or-')) {
            alert('Invalid API key format. OpenRouter API keys start with "sk-or-"');
            return;
        }

        // Test the API key first
        const testResult = await testApiKey(tempApiKey.trim());
        
        if (testResult.success) {
            // Save the API key to settings
            await settings?.updateSettings?.({ aiApiKey: tempApiKey.trim() });
            setShowApiKeyModal(false);
            setTempApiKey('');
            
            // Add a success message to chat
            const successMessage: Message = {
                role: 'model',
                content: `🎉 **API Key Configured Successfully!**\n\n${testResult.message}\n\nI'm now ready to help you analyze your business data and answer your questions!`
            };
            setMessages(prev => [...prev, successMessage]);
        } else {
            alert(`API Key Test Failed\n\n${testResult.message}\n\nPlease:\n1. Make sure you're using an OpenRouter API key\n2. Check that the key is copied correctly\n3. Verify you have credits or are using free models`);
        }
    };

    const openOpenRouterConsole = () => {
        window.open('https://openrouter.ai/keys', '_blank');
    };

    const openApiKeyModal = () => {
        // Pre-fill with existing API key if available (for editing)
        if (settings?.aiApiKey) {
            setTempApiKey(settings.aiApiKey);
        }
        setShowApiKeyModal(true);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] lg:h-[calc(100vh-12rem)] bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700 gap-3 sm:gap-0">
                <div className="flex items-center space-x-3">
                    <BrainCircuitIcon className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" />
                    <div>
                        <h3 className="text-lg lg:text-xl font-semibold">AI Business Assistant</h3>
                        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                            Ask questions about your business data
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {/* API Key Status and Management Button */}
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${settings?.aiApiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <button
                            onClick={openApiKeyModal}
                            className={`px-3 py-1 text-xs lg:text-sm rounded transition-colors flex items-center gap-1 ${
                                settings?.aiApiKey 
                                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            🔑 {settings?.aiApiKey ? 'API Connected' : 'Setup API Key'}
                        </button>
                    </div>
                    <button
                        onClick={clearChat}
                        className="px-3 py-1 text-xs lg:text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                        Clear Chat
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex items-start space-x-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        {message.role === 'model' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <BrainCircuitIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-xs sm:max-w-md lg:max-w-3xl px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base ${
                                message.role === 'user'
                                    ? 'bg-blue-500 text-white ml-8 lg:ml-12'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-8 lg:mr-12'
                            }`}
                        >
                            <div className="whitespace-pre-wrap break-words">
                                {message.content}
                            </div>
                        </div>
                        {message.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <BrainCircuitIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg mr-12">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                <span className="text-gray-600 dark:text-gray-400">
                                    Analyzing your data...
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* API Key Setup or Suggested Questions */}
            {messages.length === 1 && (
                <div className="px-3 lg:px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    {!settings?.aiApiKey ? (
                        <div className="text-center py-4">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                                    🤖 AI Chat Setup Required
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    To start chatting with AI and get insights about your business data, you need to configure your OpenRouter API key. OpenRouter provides access to many free AI models perfect for business analysis!
                                </p>
                                <button
                                    onClick={openApiKeyModal}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto text-sm font-medium"
                                >
                                    🔑 Setup API Key Now
                                </button>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Free to get from OpenRouter • Takes 2 minutes
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Data Availability Status */}
                            {(!data?.payments?.length && !data?.expenses?.length && !data?.sites?.length) ? (
                                <div className="text-center py-4">
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                        <h4 className="text-sm font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
                                            📊 No Business Data Available
                                        </h4>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                                            Configure Google Sheets integration in Settings to get AI insights about your business data.
                                        </p>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            <button
                                                onClick={() => handleSuggestedQuestion("How do I set up Google Sheets integration?")}
                                                className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                                            >
                                                Setup Google Sheets
                                            </button>
                                            <button
                                                onClick={() => handleSuggestedQuestion("What data format do I need in my Google Sheet?")}
                                                className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                                            >
                                                Sheet Format
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Try asking about your business data:</p>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                                {(data?.payments?.length || 0) + (data?.expenses?.length || 0)} records loaded
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 lg:gap-2">
                                        {suggestedQuestions.map((question, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestedQuestion(question)}
                                                className="px-2 lg:px-3 py-1 text-xs lg:text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                            >
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Input */}
            <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={!settings?.aiApiKey ? "Setup API key to start chatting..." : "Ask me anything about your business data..."}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base disabled:opacity-50"
                        rows={window.innerWidth < 640 ? 1 : 2}
                        disabled={isLoading || !settings?.aiApiKey}
                    />
                    {!settings?.aiApiKey ? (
                        <button
                            onClick={openApiKeyModal}
                            className="px-3 lg:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                        >
                            🔑
                        </button>
                    ) : (
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="px-3 lg:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            <SendIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line. </span>
                    {!settings?.aiApiKey ? (
                        <span className="text-red-500">🔑 API key required. <button onClick={openApiKeyModal} className="underline hover:text-red-600">Setup your free OpenRouter API key</button> to start chatting.</span>
                    ) : (
                        <span className="text-green-500">✅ Using your configured OpenRouter API key for fast AI responses.</span>
                    )}
                </p>
            </div>

            {/* API Key Setup Modal */}
            {showApiKeyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                🔑 {settings?.aiApiKey ? 'Manage API Key' : 'Setup OpenRouter API Key'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowApiKeyModal(false);
                                    setTempApiKey('');
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Current Status */}
                            {settings?.aiApiKey && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                                            ✅ API Key Connected
                                        </h4>
                                    </div>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Your API key is configured and working. You can update it below if needed.
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-mono">
                                        Current key: {settings.aiApiKey.substring(0, 8)}...{settings.aiApiKey.substring(settings.aiApiKey.length - 4)}
                                    </p>
                                </div>
                            )}

                            {!settings?.aiApiKey && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                        📋 How to get your free OpenRouter API key:
                                    </h4>
                                    <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                                        <li>Click "Get API Key" button below</li>
                                        <li>Sign up/Login to OpenRouter (it's free!)</li>
                                        <li>Go to Keys section</li>
                                        <li>Click "Create Key" and give it a name</li>
                                        <li>Copy the generated key (starts with "sk-or-")</li>
                                        <li>Paste it in the field below and click "Test & Save"</li>
                                    </ol>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                        ⚡ OpenRouter offers access to many free AI models (Llama 3.1, Phi-3, Gemma) perfect for business analysis!
                                    </p>
                                </div>
                            )}

                            <div className="text-center">
                                <button
                                    onClick={openOpenRouterConsole}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    🚀 Get API Key from OpenRouter
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Paste your API Key here:
                                </label>
                                <input
                                    type="password"
                                    value={tempApiKey}
                                    onChange={(e) => setTempApiKey(e.target.value)}
                                    placeholder="sk-or-..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm font-mono"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    OpenRouter API keys start with "sk-or-" and are about 64 characters long
                                </p>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    <strong>🔒 Privacy:</strong> Your API key is stored locally in your browser and never sent to our servers. 
                                    It's only used to communicate directly with OpenRouter's AI services.
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleSaveApiKey}
                                disabled={!tempApiKey.trim() || isTestingApiKey}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {isTestingApiKey ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Testing...
                                    </>
                                ) : (
                                    <>
                                        ✅ Test & Save API Key
                                    </>
                                )}
                            </button>
                            
                            {settings?.aiApiKey && (
                                <button
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to remove the API key? This will disable AI Chat functionality.')) {
                                            await settings?.updateSettings?.({ aiApiKey: '' });
                                            setShowApiKeyModal(false);
                                            setTempApiKey('');
                                            
                                            // Add a message to chat
                                            const removeMessage: Message = {
                                                role: 'model',
                                                content: '🔑 **API Key Removed**\n\nYour API key has been removed. To use AI Chat again, please configure a new API key.'
                                            };
                                            setMessages(prev => [...prev, removeMessage]);
                                        }
                                    }}
                                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                                >
                                    🗑️ Remove
                                </button>
                            )}
                            
                            <button
                                onClick={() => {
                                    setShowApiKeyModal(false);
                                    setTempApiKey('');
                                }}
                                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;