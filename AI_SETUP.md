# 🤖 AI Integration Setup - OpenRouter + Gemini Flash 2.5

This guide will help you set up the AI Helper feature in PXL Chiptune Studio using OpenRouter with Google Gemini Flash 2.5.

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

1. **Get an OpenRouter API Key:**
   - Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
   - Sign up for an account (free tier available)
   - Create a new API key
   - Copy the API key

2. **Run the Setup Script:**
   ```bash
   node setup-ai.js
   ```
   - Paste your API key when prompted
   - The script will create the necessary configuration files

3. **Restart Your Development Server:**
   ```bash
   npm run dev
   ```

### Option 2: Manual Setup

1. **Create `.env.local` file** in your project root:
   ```bash
   # AI Service Configuration for OpenRouter + Gemini Flash 2.5
   OPENROUTER_API_KEY=your_actual_api_key_here
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   OPENROUTER_MODEL=google/gemini-flash-1.5  # Gemini Flash 2.5

   # AI Service Settings
   AI_PROVIDER=openrouter
   AI_TEMPERATURE=0.7
   AI_MAX_TOKENS=4000
   AI_TIMEOUT=30000
   ```

2. **Replace `your_actual_api_key_here`** with your real OpenRouter API key

3. **Restart your development server**

## 🎵 How It Works

### AI Helper Features

- **Smart Music Generation**: Uses your current project settings (BPM, key, scale, etc.)
- **Instrument-Aware**: Knows the characteristics of all 29 chiptune instruments
- **Contextual**: Generates music that fits your existing tracks
- **Natural Language**: Describe what you want in plain English

### Example Prompts

```
"Create a walking bassline that complements my melody"
"Add syncopated drum patterns with ghost notes"
"Generate atmospheric pads that evolve over time"
"Create counter-melodies that harmonize with the lead"
"Build rhythmic variations using swing"
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Required |
| `OPENROUTER_MODEL` | AI model to use | `google/gemini-flash-1.5` |
| `AI_TEMPERATURE` | Creativity level (0.0-2.0) | `0.7` |
| `AI_MAX_TOKENS` | Maximum response length | `4000` |
| `AI_TIMEOUT` | Request timeout (ms) | `30000` |

### Available Models

- `google/gemini-flash-1.5` - **Recommended**: Fast, high-quality
- `google/gemini-pro` - More detailed responses
- `anthropic/claude-3-haiku` - Alternative model
- `openai/gpt-4o-mini` - OpenAI's efficient model

## 🎯 Usage

1. **Open the AI Helper**: Click the "AI Helper" button in the pattern editor
2. **Review Context**: The AI sees your current project settings
3. **Enter Prompt**: Type what you want to generate
4. **Generate**: Click "Generate" to create new tracks/patterns
5. **Enjoy**: New content appears instantly in your project

## 💰 Pricing & Limits

### OpenRouter Free Tier
- **Credits**: $1 free credit to start
- **Rate Limits**: Reasonable limits for development
- **Models**: Access to Gemini Flash and other models

### Gemini Flash 2.5 Performance
- **Speed**: Very fast response times
- **Quality**: Excellent music understanding
- **Cost**: Very affordable per request

## 🛠️ Troubleshooting

### "API key not found"
- Make sure `.env.local` exists in your project root
- Check that `OPENROUTER_API_KEY` is set correctly
- Restart your development server after adding the key

### "API request failed"
- Verify your API key is valid
- Check your internet connection
- Make sure OpenRouter service is operational

### "Generation too slow"
- Try reducing `AI_MAX_TOKENS`
- Consider using a different model
- Check your internet connection

### Still using Mock mode?
- The system automatically falls back to mock mode if no API key is found
- Check your browser console for configuration messages

## 🔄 Switching Models

To use a different model, update your `.env.local`:

```bash
# For Claude instead of Gemini
OPENROUTER_MODEL=anthropic/claude-3-haiku

# For GPT-4o Mini
OPENROUTER_MODEL=openai/gpt-4o-mini
```

## 🔒 Security

- **API keys are stored locally** in `.env.local`
- **Never commit** `.env.local` to version control
- **Keys are only used** for AI API calls
- **No data is stored** on external servers

## 📈 Advanced Configuration

### Custom Temperature Settings

```bash
# More creative/random (higher temperature)
AI_TEMPERATURE=1.2

# More conservative/predictable (lower temperature)
AI_TEMPERATURE=0.3
```

### Custom Timeouts

```bash
# For slower connections
AI_TIMEOUT=60000

# For faster responses (may cause timeouts)
AI_TIMEOUT=15000
```

## 🎉 You're All Set!

Once configured, your AI Helper will:
- ✅ Generate musical ideas based on your current project
- ✅ Understand your instrument choices
- ✅ Respect your musical settings (key, scale, BPM)
- ✅ Create instantly playable content
- ✅ Learn from your preferences over time

Enjoy creating music with AI assistance! 🎵🤖
