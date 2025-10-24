import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import type { Message } from '../types';
import { generateResponse } from '../services/geminiService';
import { DataContext } from '../contexts/DataContext';
import { SettingsContext } from '../contexts/SettingsContext';
import ChatMessage from './ChatMessage';
import ThinkingModeToggle from './ThinkingModeToggle';
import DataContextToggle from './DataContextToggle';
import { SendIcon } from './icons';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your PBMS-AI assistant. How can I help you manage your business today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isDataContextEnabled, setIsDataContextEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { payments, expenses, sites, labours, clients, tasks, habits, expenseCategories } = useContext(DataContext);
  const { apiKey } = useContext(SettingsContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let contextData: string | undefined;
    if (isDataContextEnabled) {
      try {
        contextData = JSON.stringify({ payments, expenses, sites, labours, clients, tasks, habits, expenseCategories }, null, 2);
      } catch (error) {
        console.error("Failed to stringify context data:", error);
      }
    }

    try {
      const response = await generateResponse(newMessages, isThinkingMode, contextData, apiKey);
      const modelMessage: Message = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'model', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, input, isLoading, isThinkingMode, isDataContextEnabled, payments, expenses, sites, labours, clients, tasks, habits, expenseCategories, apiKey]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-grow h-full pb-16 md:pb-0">
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && <ChatMessage message={{ role: 'model', content: '...' }} isLoading={true} />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-4 px-4">
            <ThinkingModeToggle isThinkingMode={isThinkingMode} onToggle={setIsThinkingMode} />
            <div className="h-6 w-px bg-gray-600"></div>
            <DataContextToggle isEnabled={isDataContextEnabled} onToggle={setIsDataContextEnabled} />
        </div>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your business..."
            className="w-full bg-gray-700 text-gray-200 placeholder-gray-400 rounded-full py-3 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ''}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <SendIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
