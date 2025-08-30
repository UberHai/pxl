/**
 * AI Service Configuration
 * Copy this file to create your local configuration
 */

export interface AIConfig {
  provider: 'mock' | 'openrouter';
  openRouter?: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
  settings: {
    temperature: number;
    maxTokens: number;
    timeout: number;
  };
}

// Default configuration (mock mode)
export const defaultConfig: AIConfig = {
  provider: 'mock',
  settings: {
    temperature: 0.7,
    maxTokens: 8000,
    timeout: 30000,
  },
};

// Production configuration with OpenRouter + Gemini Flash 2.5
export const productionConfig: AIConfig = {
  provider: 'openrouter',
  openRouter: {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || 'your_openrouter_api_key_here',
    baseUrl: process.env.NEXT_PUBLIC_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'google/gemini-flash-1.5',
  },
  settings: {
    temperature: parseFloat(process.env.NEXT_PUBLIC_AI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.NEXT_PUBLIC_AI_MAX_TOKENS || '8000'),
    timeout: parseInt(process.env.NEXT_PUBLIC_AI_TIMEOUT || '30000'),
  },
};

// Get current configuration
export function getAIConfig(): AIConfig {
  // Check if we have OpenRouter API key (client-side accessible)
  const hasOpenRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY &&
                          process.env.NEXT_PUBLIC_OPENROUTER_API_KEY !== 'your_openrouter_api_key_here' &&
                          process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.startsWith('sk-or-v1-');



  // Use production config if API key is available, otherwise mock
  return hasOpenRouterKey ? productionConfig : defaultConfig;
}

// Export for easy access
export const aiConfig = getAIConfig();
