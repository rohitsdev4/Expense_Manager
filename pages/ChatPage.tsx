import React, { useState, useContext, useRef, useEffect } from 'react';
import { DataContext } from '../contexts/DataContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { generateResponse } from '../services/geminiService';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getBusinessContext = () => {
        const context = {
            summary: {
                totalPayments: data.payments.reduce((sum, p) => sum + p.amount, 0),
                totalExpenses: data.expenses.reduce((sum, e) => sum + e.amount, 0),
                profit: data.payments.reduce((sum, p) => sum + p.amount, 0) - data.expenses.reduce((sum, e) => sum + e.amount, 0),
                activeSites: data.sites.length,
                totalLabour: data.labours.length,
                totalClients: data.clients.length,
                recentTransactions: data.payments.length + data.expenses.length
            },
            payments: data.payments.slice(-10), // Last 10 payments
            expenses: data.expenses.slice(-10), // Last 10 expenses
            sites: data.sites,
            labours: data.labours,
            clients: data.clients,
            expensesByCategory: data.expenses.reduce((acc, expense) => {
                acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                return acc;
            }, {} as Record<string, number>)
        };
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
            
            // Filter out the initial model message and create proper conversation history
            const conversationHistory = messages.filter(msg => msg.role === 'user' || 
                (msg.role === 'model' && !msg.content.includes("Hello! I'm your AI assistant")));
            
            const response = await generateResponse(
                [...conversationHistory, userMessage],
                isThinkingMode,
                context,
                settings?.apiKey
            );

            const aiMessage: Message = {
                role: 'model',
                content: response
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            let errorContent = 'Sorry, I encountered an error while processing your request. Please make sure your API key is configured in Settings and try again.';
            
            if (error instanceof Error) {
                if (error.message.includes('API key')) {
                    errorContent = 'Invalid API key. Please check your API key in Settings and make sure it has access to the Gemini API.';
                } else if (error.message.includes('quota')) {
                    errorContent = 'API quota exceeded. Please check your Google Cloud Console for usage limits.';
                } else if (error.message.includes('permission')) {
                    errorContent = 'Permission denied. Please ensure your API key has the necessary permissions for Gemini API.';
                }
            }
            
            const errorMessage: Message = {
                role: 'model',
                content: errorContent
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

            {/* Suggested Questions */}
            {messages.length === 1 && (
                <div className="px-3 lg:px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-2">Try asking:</p>
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
                </div>
            )}

            {/* Input */}
            <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about your business data..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                        rows={window.innerWidth < 640 ? 1 : 2}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-3 lg:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                        <SendIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line. </span>
                    {!settings?.apiKey ? (
                        <span className="text-blue-500">AI Chat ready with fallback key. <span className="hidden sm:inline">Configure your own key in Settings for Google Sheets access.</span></span>
                    ) : (
                        <span className="text-green-500">Using your configured API key for both Google Sheets and AI Chat.</span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default ChatPage;