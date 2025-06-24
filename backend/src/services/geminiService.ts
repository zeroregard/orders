import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

export interface GeminiConfig {
  model: string;
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
}

export interface GeminiResponse {
  text: string;
  tokenCount?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
}

export interface GeminiError extends Error {
  code?: string;
  status?: number;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private defaultConfig: GeminiConfig;

  constructor() {
    // Initialize config but not the API client yet (lazy initialization)
    
    // Default configuration optimized for cost-effectiveness
    this.defaultConfig = {
      model: 'gemini-2.0-flash-exp', // Most cost-effective model as per RFC
      temperature: 0.1, // Low temperature for consistent parsing
      maxOutputTokens: 2048,
      topK: 1,
      topP: 0.1,
    };

    console.log('✅ Gemini service initialized with model:', this.defaultConfig.model);
  }

  /**
   * Initialize the Google AI client if not already initialized
   */
  private ensureInitialized(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      
      if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY environment variable is required');
      }
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      console.log('🔌 Gemini API client initialized');
    }
    
    return this.genAI;
  }

  /**
   * Get the configured Gemini model instance
   */
  private getModel(config?: Partial<GeminiConfig>): GenerativeModel | undefined {
    const modelConfig = { ...this.defaultConfig, ...config };
    
    const generationConfig: GenerationConfig = {
      temperature: modelConfig.temperature,
      maxOutputTokens: modelConfig.maxOutputTokens,
      topK: modelConfig.topK,
      topP: modelConfig.topP,
    };

    const genAI = this.ensureInitialized();
    return genAI.getGenerativeModel({
      model: modelConfig.model!,
      generationConfig,
    });
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(
    prompt: string,
    config?: Partial<GeminiConfig>
  ): Promise<GeminiResponse> {
    try {
      console.log('🤖 Sending request to Gemini API...');
      
      const model = this.getModel(config);
      if (!model) {
        throw new Error('No model found');
      }
      const result = await model.generateContent(prompt);
      const response = result.response;
      
      if (!response) {
        throw new Error('No response received from Gemini API');
      }

      const text = response.text();
      
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      // Get token usage information if available
      const tokenCount = response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        candidatesTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0,
      } : undefined;

      if (tokenCount) {
        console.log(`📊 Token usage - Prompt: ${tokenCount.promptTokens}, Response: ${tokenCount.candidatesTokens}, Total: ${tokenCount.totalTokens}`);
      }

      console.log('✅ Successfully received response from Gemini API');
      
      return {
        text,
        tokenCount,
      };
    } catch (error: any) {
      console.error('❌ Error calling Gemini API:', error.message);
      
      const geminiError: GeminiError = new Error(`Gemini API error: ${error.message}`);
      geminiError.code = error.code;
      geminiError.status = error.status;
      
      throw geminiError;
    }
  }

  /**
   * Generate and parse JSON content from Gemini API
   */
  async generateJSON<T = any>(
    prompt: string,
    config?: Partial<GeminiConfig>
  ): Promise<T> {
    try {
      const response = await this.generateContent(prompt, config);
      
      // Clean the response text (remove markdown code blocks if present)
      let jsonText = response.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const parsedData = JSON.parse(jsonText);
      console.log('✅ Successfully parsed JSON response from Gemini');
      
      return parsedData;
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        console.error('❌ Failed to parse JSON from Gemini response:', error.message);
        throw new Error(`Invalid JSON response from Gemini: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate content with system prompt and user prompt
   */
  async generateWithSystemPrompt(
    systemPrompt: string,
    userPrompt: string,
    config?: Partial<GeminiConfig>
  ): Promise<GeminiResponse> {
    const combinedPrompt = `${systemPrompt}\n\nUser Input:\n${userPrompt}`;
    return this.generateContent(combinedPrompt, config);
  }

  /**
   * Get current model configuration
   */
  getConfig(): GeminiConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Update default configuration
   */
  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...newConfig };
    console.log('🔧 Updated Gemini service configuration:', this.defaultConfig);
  }

  /**
   * Test the Gemini API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Gemini API connection...');
      
      const testPrompt = 'Please respond with just the word "OK" to confirm the connection is working.';
      const response = await this.generateContent(testPrompt);
      
      const isWorking = response.text.toLowerCase().includes('ok');
      
      if (isWorking) {
        console.log('✅ Gemini API connection test successful');
      } else {
        console.log('⚠️  Gemini API connection test returned unexpected response:', response.text);
      }
      
      return isWorking;
    } catch (error) {
      console.error('❌ Gemini API connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService(); 