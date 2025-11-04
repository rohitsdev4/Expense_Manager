import type { Message } from '../types';

// OpenRouter API service for AI chat
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Use the GLM-4.5-Air free model
const MODEL_NAME = 'z-ai/glm-4.5-air:free';

export const testApiConnection = async (apiKey: string): Promise<{ success: boolean; message: string; model?: string }> => {
  try {
    console.log('🔍 Testing OpenRouter API connection...');
    console.log(`🔄 Testing model: ${MODEL_NAME}`);
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ExpenseMan'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'user', content: 'Hello, please respond with just "API test successful"' }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenRouter API test failed:', errorData);
      
      if (response.status === 401) {
        return { success: false, message: '❌ Invalid API key. Please check your OpenRouter API key.' };
      } else if (response.status === 402) {
        return { success: false, message: '❌ Insufficient credits. Please add credits to your OpenRouter account or use free models.' };
      } else if (response.status === 429) {
        return { success: false, message: '❌ Rate limit exceeded. Please wait a moment and try again.' };
      } else {
        return { success: false, message: `❌ API error: ${errorData.error?.message || response.statusText}` };
      }
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    
    if (text.length > 0) {
      console.log(`✅ Successfully connected with model: ${MODEL_NAME}`);
      return { 
        success: true, 
        message: `✅ Connected successfully using ${MODEL_NAME}`, 
        model: MODEL_NAME 
      };
    } else {
      return { success: false, message: '❌ No response from model. Please try again.' };
    }
    
  } catch (error) {
    console.error('❌ OpenRouter connection test failed:', error);
    return { 
      success: false, 
      message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Network error'}` 
    };
  }
};

export const generateResponse = async (history: Message[], isThinkingMode: boolean, context?: string, settingsApiKey?: string): Promise<string> => {
  console.log('🚀 generateResponse called with OpenRouter:', {
    historyLength: history.length,
    hasContext: !!context,
    hasApiKey: !!settingsApiKey,
    apiKeyLength: settingsApiKey?.length
  });

  const apiKey = settingsApiKey;
  
  if (!apiKey) {
    console.log('❌ No API key provided');
    return "🔑 **API Key Required**\n\nTo use AI Chat, please:\n1. Click the **🔑 Setup API Key** button above\n2. Get a free key from [OpenRouter Console](https://openrouter.ai/keys)\n3. Paste your API key and test the connection\n\n**Why OpenRouter?**\nOpenRouter provides access to many free AI models with better reliability and no rate limits on free models.";
  }

  console.log('🤖 Using OpenRouter API Key:', apiKey.substring(0, 10) + '...', 'Length:', apiKey.length);
  
  try {
    console.log('🔧 Preparing OpenRouter request...');

    // Prepare messages for OpenRouter API format
    const messages = history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' as const : msg.role,
      content: msg.content
    }));

    console.log('📝 Prepared messages for OpenRouter:', {
      messageCount: messages.length,
      roles: messages.map(m => m.role),
      firstMessage: messages[0]?.content?.substring(0, 50) + '...'
    });

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
      
      messages.unshift(systemMessage);
    } else {
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
      
      messages.unshift(systemMessage);
    }

    console.log(`🔄 Using OpenRouter model: ${MODEL_NAME}`);

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ExpenseMan'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.8,
        stream: false
      })
    });

    console.log(`📡 OpenRouter API response status:`, response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenRouter API error:', errorData);
      
      if (response.status === 401) {
        return "🔑 **Invalid API Key**\n\nYour OpenRouter API key is not valid. Please:\n1. Check your API key in the chat settings\n2. Make sure it's copied correctly\n3. Get a new key from [OpenRouter Console](https://openrouter.ai/keys)";
      } else if (response.status === 402) {
        return "💳 **Insufficient Credits**\n\nYour OpenRouter account needs credits. Please:\n1. Add credits to your [OpenRouter account](https://openrouter.ai/credits)\n2. Or use a free model (should not require credits)\n3. Check your usage limits";
      } else if (response.status === 429) {
        return "📊 **Rate Limit Exceeded**\n\nToo many requests. Please:\n1. Wait a moment and try again\n2. Check your [OpenRouter usage](https://openrouter.ai/activity)\n3. Consider upgrading your plan";
      } else {
        return `❌ **API Error**: ${errorData.error?.message || response.statusText}\n\nPlease check your OpenRouter API key and try again.`;
      }
    }

    const data = await response.json();
    console.log('✅ Received response from OpenRouter');
    
    const text = data.choices?.[0]?.message?.content || 'No response generated';
    
    if (!text || text.trim().length === 0) {
      return "❌ **Empty Response**\n\nThe AI model returned an empty response. Please try again with a different question.";
    }
    
    return text;
    
  } catch (error) {
    console.error("❌ OpenRouter API Error:", error);
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return "🌐 **Network Error**\n\nConnection to OpenRouter failed. Please:\n1. Check your internet connection\n2. Try again in a moment\n3. OpenRouter servers might be temporarily unavailable";
      }
      
      return `⚠️ **Error**: ${error.message}\n\nIf this problem persists, please check your OpenRouter API key configuration.`;
    }
    
    return "❓ **Unknown Error**\n\nAn unexpected error occurred. Please try again or check your API key configuration.";
  }
};