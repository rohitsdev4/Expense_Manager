


import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Message } from '../types';

export const generateResponse = async (history: Message[], isThinkingMode: boolean, context?: string, settingsApiKey?: string): Promise<string> => {
  const apiKey = settingsApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).GEMINI_API_KEY || 'AIzaSyBoVqFPgUzd_MmNjmcV5jSlBDdKfwY7qKA';
  if (!apiKey) {
    return "Error: Gemini API key is not available. Please ensure it is configured in your environment.";
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  // The last message is the current user prompt. The rest is the history.
  const latestUserMessage = history[history.length - 1];
  const chatHistory = history.slice(0, -1);

  // FIX: Correctly map chat history to the format expected by the Gemini API.
  const contents = chatHistory.map(message => ({
    role: message.role,
    parts: [{ text: message.content }]
  }));

  let finalUserPrompt = latestUserMessage.content;

  if (context) {
    finalUserPrompt = `You are an expert AI assistant for a Personal Business Management System (PBMS-AI). Your task is to answer the user's question based on the real-time business data provided below. Analyze the data thoroughly and provide a precise and helpful response.

DATA:
\`\`\`json
${context}
\`\`\`

USER QUESTION:
"${latestUserMessage.content}"`;
  }

  // FIX: Push the final user prompt as a new part of the contents array.
  contents.push({
    role: 'user',
    parts: [{ text: finalUserPrompt }]
  });

  try {
    // Use the standard gemini-pro model which is widely available
    const modelName = 'gemini-pro';
    const model = genAI.getGenerativeModel({ model: modelName });

    // Only include history if there are previous messages
    const historyToUse = contents.slice(0, -1);
    
    let result;
    if (historyToUse.length === 0) {
      // First message - no history
      result = await model.generateContent(finalUserPrompt);
    } else {
      // Subsequent messages - use chat with history
      const chat = model.startChat({
        history: historyToUse,
      });
      result = await chat.sendMessage(finalUserPrompt);
    }
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating response from Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('not supported')) {
            return "The AI model is currently unavailable. Please check your API key permissions and ensure the Gemini API is enabled in your Google Cloud Console.";
        } else if (error.message.includes('API key')) {
            return "Invalid API key. Please check your API key in Settings and ensure it has access to the Gemini API.";
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
            return "API quota exceeded. Please check your Google Cloud Console for usage limits or try again later.";
        } else if (error.message.includes('permission')) {
            return "Permission denied. Please ensure your API key has the necessary permissions for the Gemini API.";
        }
        return `An error occurred: ${error.message}`;
    }
    return "An unknown error occurred while contacting the Gemini API.";
  }
};