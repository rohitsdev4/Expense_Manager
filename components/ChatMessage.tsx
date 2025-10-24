

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types';
import { UserIcon, GeminiIcon } from './icons';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-4 ${!isModel ? 'justify-end' : ''}`}>
      {isModel && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <GeminiIcon className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={`max-w-xl px-5 py-3 rounded-2xl break-words ${
          isModel
            ? 'bg-gray-700 text-gray-200 rounded-tl-none'
            : 'bg-blue-600 text-white rounded-br-none'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
       {!isModel && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-gray-300" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;