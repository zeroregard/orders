# Services Documentation

## Gemini Service

The Gemini service provides a wrapper around Google's Generative AI API (Gemini models) for use in the auto-order application.

### Setup

1. **Environment Variables**
   ```bash
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

2. **Get API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Add it to your environment variables

### Usage

```typescript
import { geminiService } from '../services/geminiService';

// Basic text generation
const response = await geminiService.generateContent('Hello, world!');
console.log(response.text);

// JSON generation and parsing
const jsonData = await geminiService.generateJSON(
  'Generate a JSON object with name and age fields for a person named John who is 30 years old. Return only JSON.'
);
console.log(jsonData); // { name: 'John', age: 30 }

// Custom configuration
const customResponse = await geminiService.generateContent(
  'Write a creative story', 
  { temperature: 0.8, maxOutputTokens: 1000 }
);

// System prompt + user prompt
const assistantResponse = await geminiService.generateWithSystemPrompt(
  'You are a helpful cooking assistant',
  'How do I make pasta?'
);
```

### API Endpoints

The service exposes the following REST endpoints:

- `GET /api/gemini/test` - Test API connection
- `GET /api/gemini/config` - Get current configuration
- `POST /api/gemini/generate` - Generate text content
- `POST /api/gemini/generate-json` - Generate and parse JSON content

### Configuration

Default configuration optimized for cost-effectiveness:
- Model: `gemini-2.0-flash-exp`
- Temperature: 0.1 (low for consistent parsing)
- Max Output Tokens: 2048
- Top-K: 1
- Top-P: 0.1

### Cost Optimization

The service is configured to use the most cost-effective Gemini model:
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens
- Estimated cost per receipt: ~$0.00015

### Error Handling

The service includes comprehensive error handling:
- API key validation
- Response validation
- JSON parsing errors
- Token usage tracking
- Connection testing

### Testing

Run the test suite:
```bash
npm test -- gemini.test.ts
```

### Future Use Cases

This service is designed to support the email-order-parsing-system RFC, specifically for:
- Parsing receipt emails
- Extracting order information
- Product matching and creation
- Structured data extraction

### Monitoring

The service logs:
- Token usage for cost tracking
- API response times
- Error rates and types
- Connection status 