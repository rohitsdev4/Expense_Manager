


import Groq from "groq-sdk";
import type { Message } from '../types';

// Simple function to test API key and model availability
export const testApiConnection = async (apiKey: string): Promise<{ success: boolean; message: string; model?: string }> => {
  try {
    const groq = new Groq({ 
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Allow browser usage
    });
    
    // Test with the best free models available on Groq
    const modelNames = [
      'llama-3.1-70b-versatile',  // Best overall free model
      'llama-3.1-8b-instant',     // Fastest free model
      'mixtral-8x7b-32768',       // Good alternative
      'gemma-7b-it'               // Lightweight option
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`🔄 Testing Groq model: ${modelName}`);
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: 'Hello, please respond with just "API test successful"' }],
          model: modelName,
          max_tokens: 50,
          temperature: 0.1,
        });
        
        const text = completion.choices[0]?.message?.content || '';
        
        if (text.length > 0) {
          return { 
            success: true, 
            message: `✅ Connected successfully using ${modelName}`, 
            model: modelName 
          };
        }
      } catch (modelError) {
        console.warn(`Groq model ${modelName} failed:`, modelError);
        continue;
      }
    }
    
    return { 
      success: false, 
      message: "❌ No models available with this API key. Please check:\n• API key is valid and active\n• You have access to Groq's free models\n• Try creating a new API key" 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

export const generateResponse = async (history: Message[], isThinkingMode: boolean, context?: string, settingsApiKey?: string): Promise<string> => {
  // Use the provided API key from settings, or show setup message
  const apiKey = settingsApiKey;
  
  if (!apiKey) {
    return "🔑 **API Key Required**\n\nTo use AI Chat, please:\n1. Click the **🔑 Setup API Key** button above\n2. Get a free key from [Groq Console](https://console.groq.com/keys)\n3. Paste your API key and test the connection\n\n**Why do I need an API key?**\nGroq provides fast, free AI models, but requires your own API key for usage tracking and rate limiting.";
  }

  console.log('🤖 Using Groq API Key:', apiKey.substring(0, 10) + '...');
  
  try {
    const groq = new Groq({ 
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Allow browser usage
    });

    // Prepare messages for Groq API format
    const messages = history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' as const : msg.role,
      content: msg.content
    }));

    // Add system message with business context
    if (context) {
      const systemMessage = {
        role: 'system' as const,
        content: `You are an expert AI assistant for ExpenseMan, a Personal Business Management System. You have FULL ACCESS to the user's live business data from Google Sheets integration.

🔗 **DATA SOURCE**: Google Sheets (Live Integration)
📊 **CURRENT BUSINESS DATA**:
${context}

**IMPORTANT INSTRUCTIONS**:
- You have COMPLETE ACCESS to all the business data shown above
- This data is LIVE and comes directly from the user's Google Sheets
- Analyze the provided business data thoroughly and use SPECIFIC NUMBERS
- Answer questions about payments, expenses, profits, user balances (Rohit vs Gulshan), sites, etc.
- Provide precise, helpful responses with actual data from the sheets
- Use the real numbers and data in your responses
- Be concise but informative with actionable insights
- Format responses clearly with emojis and structure
- When asked about specific metrics, calculate and show the exact values
- You can analyze trends, compare data, and provide business insights

**USER BALANCE TRACKING**: The system tracks individual balances for Rohit and Gulshan based on their entries in the Google Sheet.`
      };
      
      // Insert system message at the beginning
      messages.unshift(systemMessage);
    } else {
      // No data available - provide guidance
      const systemMessage = {
        role: 'system' as const,
        content: `You are an expert AI assistant for ExpenseMan, a Personal Business Management System.

⚠️ **NO DATA CURRENTLY AVAILABLE**
The Google Sheets integration is not yet configured or no data has been synced.

When users ask about their business data, explain that:
1. They need to configure Google Sheets integration in Settings
2. Add their Google Sheets URL and API key
3. Make sure their sheet has the correct format with columns for dates, amounts, categories, users (Rohit/Gulshan), etc.
4. Once configured, you'll have full access to analyze their live business data

Be helpful and guide them on how to set up the integration properly.`
      };
      
      // Insert system message at the beginning
      messages.unshift(systemMessage);
    }

    // Try multiple Groq models with fallback (best free models)
    const modelNames = [
      'llama-3.1-70b-versatile',  // Best overall free model - great for business analysis
      'llama-3.1-8b-instant',     // Fastest free model - good for quick responses
      'mixtral-8x7b-32768',       // Good alternative with large context
      'gemma-7b-it'               // Lightweight option
    ];
    
    let modelUsed = '';
    let completion;
    
    for (const modelName of modelNames) {
      try {
        console.log(`🔄 Trying Groq model: ${modelName}`);
        
        completion = await groq.chat.completions.create({
          messages: messages,
          model: modelName,
          max_tokens: 2048,
          temperature: 0.7,
          top_p: 0.8,
          stream: false,
        });
        
        modelUsed = modelName;
        break;
      } catch (modelError) {
        console.warn(`⚠️ Groq model ${modelName} not available:`, modelError);
        continue;
      }
    }
    
    if (!completion) {
      return "🤖 **No Available Models**\n\nNone of the Groq models are currently available. This usually means:\n\n**Common Solutions:**\n1. **Check your API key** - Make sure it's valid and active\n2. **Try again in a moment** - Groq servers might be busy\n3. **Check your internet connection**\n4. **Verify API key permissions** - Make sure your key has access to chat models\n\n**Get a new API key:**\n[Groq Console](https://console.groq.com/keys)\n\n**Models we tried:**\n- llama-3.1-70b-versatile\n- llama-3.1-8b-instant\n- mixtral-8x7b-32768\n- gemma-7b-it";
    }
    
    console.log(`✅ Using Groq model: ${modelUsed}`);
    console.log('🚀 Sending request to Groq API...');

    const text = completion.choices[0]?.message?.content || 'No response generated';
    console.log('✅ Received response from Groq API');
    return text;
    
  } catch (error) {
    console.error("❌ Groq API Error:", error);
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('api key') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid')) {
        return "🔑 **Invalid API Key**\n\nYour Groq API key is not valid. Please:\n1. Check your API key in **Settings**\n2. Make sure it's copied correctly\n3. Get a new key from [Groq Console](https://console.groq.com/keys)";
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('exceeded') || errorMessage.includes('rate')) {
        return "📊 **Rate Limit Exceeded**\n\nYour API usage limit has been reached. Please:\n1. Wait a moment and try again\n2. Check your [Groq Console](https://console.groq.com/) for usage limits\n3. Consider upgrading your plan for higher limits";
      }
      
      if (errorMessage.includes('permission') || errorMessage.includes('denied') || errorMessage.includes('forbidden')) {
        return "🚫 **Permission Denied**\n\nYour API key doesn't have the required permissions. Please:\n1. Check your Groq API key is active\n2. Make sure you have access to the models\n3. Try creating a new API key";
      }
      
      if (errorMessage.includes('not found') || errorMessage.includes('model') || errorMessage.includes('unavailable') || errorMessage.includes('no available models')) {
        return "🤖 **No Available Models**\n\nNone of the Groq models are currently available. This usually means:\n\n**Common Solutions:**\n1. **Check your API key** - Make sure it's valid and active\n2. **Try again in a moment** - Groq servers might be busy\n3. **Check [Groq Status](https://status.groq.com/)**\n4. **Create a new API key** if the current one is old\n\n**Get a new API key:**\n[Groq Console](https://console.groq.com/keys)";
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
        return "🌐 **Network Error**\n\nConnection to Groq failed. Please:\n1. Check your internet connection\n2. Try again in a moment\n3. Groq servers might be temporarily unavailable";
      }
      
      return `⚠️ **Error**: ${error.message}\n\nIf this problem persists, please check your Groq API key configuration.`;
    }
    
    return "❓ **Unknown Error**\n\nAn unexpected error occurred. Please try again or check your API key configuration.";
  }
};