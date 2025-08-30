/**
 * AI Service Layer for PXL Chiptune Studio
 *
 * Handles communication with AI services for music composition assistance.
 * Supports multiple AI providers and provides structured interfaces for
 * music generation, analysis, and enhancement.
 */

import { Project, Track, NoteEvent, AutomationPoint } from '@/types/song';
import { aiConfig } from '@/config/ai-config';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ProjectContext {
  settings: {
    bpm: number;
    timeSignature: string;
    bars: number;
    key: string;
    scale: string;
    swing: number;
    totalBeats: number;
  };
  tracks: TrackContext[];
  currentView: string;
  stepResolution: number;
}

export interface TrackContext {
  id: string;
  name: string;
  instrumentId: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  noteCount: number;
  notes: NoteContext[];
}

export interface NoteContext {
  time: number;
  duration: number;
  pitch: string;
  velocity: number;
}

export interface AICompositionRequest {
  context: ProjectContext;
  prompt: string;
  mode?: 'generate' | 'enhance' | 'variations' | 'remix';
  temperature?: number;
  maxTokens?: number;
}

export interface AICompositionResponse {
  success: boolean;
  data?: {
    tracks: TrackUpdate[];
    message: string;
    confidence: number;
    metadata: {
      processingTime: number;
      tokensUsed: number;
      model: string;
    };
  };
  error?: string;
}

export interface TrackUpdate {
  id: string; // existing track ID or 'new' for new tracks
  action: 'create' | 'update' | 'clear';
  instrumentId?: string;
  name?: string;
  volume?: number;
  pan?: number;
  notes?: NoteEvent[];
  automation?: AutomationUpdate[];
}

export interface AutomationUpdate {
  param: string;
  points: AutomationPoint[];
}

// ============================================================================
// AI Service Configuration
// ============================================================================

interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'openrouter' | 'mock';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

const DEFAULT_CONFIG: AIServiceConfig = {
  provider: 'mock',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 8000,
  timeout: 30000,
};

// ============================================================================
// Core AI Service Class
// ============================================================================

export class AIService {
  private config: AIServiceConfig;

  constructor(config: Partial<AIServiceConfig> = {}) {
    // Use configuration from config file, with overrides from constructor
    const baseConfig = {
      provider: aiConfig.provider,
      apiKey: aiConfig.openRouter?.apiKey,
      baseUrl: aiConfig.openRouter?.baseUrl,
      model: aiConfig.openRouter?.model || DEFAULT_CONFIG.model,
      temperature: aiConfig.settings.temperature,
      maxTokens: aiConfig.settings.maxTokens,
      timeout: aiConfig.settings.timeout,
    };

    this.config = { ...baseConfig, ...config };
  }

  /**
   * Generate AI-assisted music composition
   */
  async generateComposition(request: AICompositionRequest): Promise<AICompositionResponse> {
    const startTime = Date.now();

    try {
      // Validate request
      this.validateRequest(request);

      // Prepare prompt for AI
      const prompt = this.buildAIPrompt(request);

      // Call AI provider
      const aiResponse = await this.callAIProvider(prompt, request);

      // Parse and validate AI response
      const parsedResponse = this.parseAIResponse(aiResponse);

      // Calculate metadata
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          ...parsedResponse,
          metadata: {
            processingTime,
            tokensUsed: aiResponse.tokensUsed || 0,
            model: this.config.model,
          },
        },
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI service error',
      };
    }
  }

  /**
   * Validate composition request
   */
  private validateRequest(request: AICompositionRequest): void {
    if (!request.prompt?.trim()) {
      throw new Error('Prompt is required');
    }

    if (!request.context) {
      throw new Error('Project context is required');
    }

    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }
  }

  /**
   * Build structured prompt for AI
   */
  private buildAIPrompt(request: AICompositionRequest): string {
    const { context, prompt, mode = 'generate' } = request;

    return `
You are an expert chiptune composer and music producer with deep knowledge of retro gaming music, electronic synthesis, and algorithmic composition. You understand the unique characteristics of each instrument and how they work together in chiptune arrangements.

## 🎼 PROJECT CONTEXT
**Current Settings:**
- BPM: ${context.settings.bpm} (${context.settings.bpm < 100 ? 'slow/ambient' : context.settings.bpm < 140 ? 'moderate' : 'fast/energetic'})
- Time Signature: ${context.settings.timeSignature}
- Key: ${context.settings.key} ${context.settings.scale} (${this.getKeyDescription(context.settings.key, context.settings.scale)})
- Swing: ${Math.round(context.settings.swing * 100)}% (${context.settings.swing > 0 ? 'adds groove and feel' : 'straight timing'})
- Total Duration: ${context.settings.totalBeats} beats (${context.settings.bars} bars)

## 🎹 AVAILABLE INSTRUMENTS
${this.getInstrumentList()}

## 🎵 EXISTING TRACKS
${context.tracks.length > 0 ?
  context.tracks.map(track => `
**${track.name}** (${track.instrumentId})
- Volume: ${Math.round(track.volume * 100)}%, Pan: ${Math.round(track.pan * 100)}%
- Notes: ${track.noteCount} total
${track.notes.length > 0 ? `- Recent notes: ${track.notes.slice(0, 3).map(n => `${n.pitch}(${n.time})`).join(', ')}` : '- Empty track'}`).join('\n') :
  '*No existing tracks - this is a blank project*'
}

## 🎯 USER REQUEST
"${prompt}"

## 🎼 COMPOSITION TASK
Analyze the user's request and create complementary musical elements that enhance the existing arrangement. Consider:

**Musical Analysis:**
- Style and genre expectations from the prompt
- Harmonic compatibility with existing tracks
- Rhythmic patterns that create groove and momentum
- Instrumentation choices that complement the existing sound

**Technical Considerations:**
- Appropriate note velocities (0.3-0.5 for subtle, 0.7-1.0 for prominent)
- Realistic note durations for the chosen instruments
- Proper timing that respects the BPM and swing settings
- Volume and pan settings that create a balanced mix

## 📋 RESPONSE REQUIREMENTS
Return ONLY a valid JSON object with this exact structure:
{
  "tracks": [
    {
      "id": "new",
      "action": "create",
      "instrumentId": "appropriate-instrument-id",
      "name": "Descriptive Track Name",
      "volume": 0.7,
      "pan": 0.0,
      "notes": [
        {
          "time": 0.0,
          "duration": 1.0,
          "pitch": "C4",
          "velocity": 0.8
        }
      ],
      "automation": []
    }
  ],
  "message": "Brief description of the musical elements created and why they work well together",
  "confidence": 0.85
}

## 🎵 COMPOSITION GUIDELINES
- **Harmony**: Choose pitches that complement the key and existing tracks
- **Rhythm**: Create patterns that enhance the groove and feel
- **Dynamics**: Use velocity variations to create musical expression
- **Balance**: Set volumes and pans to maintain mix clarity
- **Style**: Match the chiptune aesthetic and requested genre
- **Efficiency**: Keep note counts reasonable (max 64 notes per track for performance)

## ⚡ IMPORTANT TECHNICAL NOTES
- **Time Format**: Use decimal beats (0.0, 0.25, 0.5, 1.0, etc.)
- **Duration Format**: Use beat fractions (0.25 = 16th note, 0.5 = 8th note, 1.0 = quarter note)
- **Velocity Range**: 0.0 to 1.0 (0.3 = quiet, 0.8 = normal, 1.0 = loud)
- **Pitch Format**: Use standard notation (C4, D#4, F3, etc.)
- **Track IDs**: Always use "new" for new tracks, never reuse existing IDs
- **JSON Only**: Return pure JSON, no markdown formatting or extra text
`;
  }

  /**
   * Get musical description of a key
   */
  private getKeyDescription(key: string, scale: string): string {
    const keyDescriptions: Record<string, string> = {
      'C': 'bright and clear',
      'C#': 'mysterious and tense',
      'D': 'majestic and strong',
      'D#': 'dreamy and romantic',
      'E': 'powerful and energetic',
      'F': 'calm and peaceful',
      'F#': 'exotic and adventurous',
      'G': 'warm and inviting',
      'G#': 'passionate and dramatic',
      'A': 'balanced and natural',
      'A#': 'intense and emotional',
      'B': 'bright and hopeful'
    };

    const scaleDescriptions: Record<string, string> = {
      'major': 'happy and uplifting',
      'minor': 'emotional and introspective',
      'dorian': 'jazz-like and sophisticated',
      'phrygian': 'exotic and mysterious',
      'lydian': 'dreamy and ethereal',
      'mixolydian': 'bluesy and soulful',
      'locrian': 'dark and unstable'
    };

    return `${keyDescriptions[key] || 'neutral'} with a ${scaleDescriptions[scale] || 'balanced'} ${scale} character`;
  }

  /**
   * Get formatted list of available instruments
   */
  private getInstrumentList(): string {
    // Comprehensive list of all available instruments
    const instruments = [
      // Pulse Family - Clean, bright square wave leads
      'pulse12 - Pulse Lead 12.5% (bright, clean square wave)',
      'pulse25 - Pulse Lead 25% (balanced pulse width)',
      'pulse50 - Pulse Lead 50% (thicker pulse sound)',
      'pwm - PWM Lead (pulse width modulation, evolving)',

      // Bass Section - Low frequency instruments
      'tri-bass - Triangle Bass (smooth, warm bass)',
      'sub - Sub Sine Bass (deep sub-bass)',
      'square-bass - Square Bass (aggressive bass)',
      'fm-bass - FM Bass (complex bass with FM synthesis)',

      // Percussion Kit - Drum sounds
      'n-kick - Noise Kick (808-style kick drum)',
      'n-snare - Noise Snare (classic snare sound)',
      'n-hat - Noise Hat (hi-hat cymbal)',
      'n-crash - Noise Crash (crash cymbal)',

      // Lead/Melodic Instruments
      'arp-pluck - Chip Arp Pluck (plucked string sound)',
      'fm-bell - FM Bell (bell-like FM synthesis)',
      'bc-saw - Bitcrushed Saw (distorted saw wave)',
      'chip-organ - Chip Organ (retro organ sound)',
      'wavetable - Wavetable Lead (complex wavetable synthesis)',
      'ring-mod - Ring Mod Lead (ring modulation effect)',
      'detuned-pulse - Detuned Pulse (detuned pulse waves)',
      'cheby-lead - Chebyshev Lead (distorted harmonics)',
      'am-synth - AM Synth (amplitude modulation)',
      'digital-glitch - Digital Glitch (glitchy digital sound)',
      'res-sweep - Resonant Sweep (filtered sweep)',
      'additive-bell - Additive Bell (additive synthesis bell)',
      'vibrato-lead - Vibrato Lead (vibrato effect)',
      'arp-bass - Arpeggio Bass (arpeggiated bass)',
      'duty-sweep - Duty Cycle Sweep (pulse width sweep)',

      // Chord/Pad Instruments
      'poly-pulse - PolyPulse Chords (polyphonic pulse chords)',
      'simple-chords - Simple Chords (basic chord stabs)',

      // Special Effects
      'sfx-blip - GamePad Blip (retro game sound)',
      'placeholder - Placeholder (temporary instrument)'
    ];

    return instruments.map(inst => `- ${inst}`).join('\n');
  }

  /**
   * Call the configured AI provider
   */
  private async callAIProvider(prompt: string, request: AICompositionRequest): Promise<any> {
    const { provider } = this.config;

    switch (provider) {
      case 'mock':
        return this.callMockProvider(prompt, request);

      case 'openai':
        return this.callOpenAIProvider(prompt, request);

      case 'anthropic':
        return this.callAnthropicProvider(prompt, request);

      case 'ollama':
        return this.callOllamaProvider(prompt, request);

      case 'openrouter':
        return this.callOpenRouterProvider(prompt, request);

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Mock provider for development/testing
   */
  private async callMockProvider(prompt: string, request: AICompositionRequest): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Generate mock response based on prompt content
    const mockResponse = this.generateMockResponse(request);

    return {
      content: JSON.stringify(mockResponse),
      tokensUsed: 150 + Math.floor(Math.random() * 50),
    };
  }

  /**
   * Generate realistic mock response for testing
   */
  private generateMockResponse(request: AICompositionRequest): any {
    const { prompt, context } = request;
    const lowerPrompt = prompt.toLowerCase();

    // Analyze prompt to determine what to generate
    let tracks: TrackUpdate[] = [];
    let message = '';

    if (lowerPrompt.includes('bass') || lowerPrompt.includes('bassline')) {
      tracks.push({
        id: 'new',
        action: 'create',
        instrumentId: 'tri-bass',
        name: 'AI Bass',
        volume: 0.7,
        pan: 0,
        notes: this.generateBassLine(context),
      });
      message = 'Generated a complementary bassline that follows the chord progression';
    }

    if (lowerPrompt.includes('drum') || lowerPrompt.includes('beat') || lowerPrompt.includes('rhythm')) {
      // Add kick
      tracks.push({
        id: 'new',
        action: 'create',
        instrumentId: 'n-kick',
        name: 'AI Kick',
        volume: 0.8,
        pan: 0,
        notes: this.generateKickPattern(context),
      });

      // Add snare
      tracks.push({
        id: 'new',
        action: 'create',
        instrumentId: 'n-snare',
        name: 'AI Snare',
        volume: 0.6,
        pan: 0,
        notes: this.generateSnarePattern(context),
      });

      message = message ? message + ' and added rhythmic elements' : 'Created a basic drum pattern with kick and snare';
    }

    if (lowerPrompt.includes('melody') || lowerPrompt.includes('lead')) {
      tracks.push({
        id: 'new',
        action: 'create',
        instrumentId: 'pulse25',
        name: 'AI Lead',
        volume: 0.6,
        pan: 0.2,
        notes: this.generateMelody(context),
      });
      message = message ? message + ' with a melodic lead line' : 'Generated a melodic lead line that complements the harmony';
    }

    // If no specific tracks generated, create a default response
    if (tracks.length === 0) {
      tracks.push({
        id: 'new',
        action: 'create',
        instrumentId: 'arp-pluck',
        name: 'AI Arpeggio',
        volume: 0.5,
        pan: -0.2,
        notes: this.generateArpeggio(context),
      });
      message = 'Created an arpeggiated pattern to enhance the composition';
    }

    return {
      tracks,
      message,
      confidence: 0.8 + Math.random() * 0.15,
    };
  }

  /**
   * Generate bassline notes
   */
  private generateBassLine(context: ProjectContext): NoteEvent[] {
    const notes: NoteEvent[] = [];
    const { key, scale } = context.settings;

    // Simple walking bass pattern
    const bassNotes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4']; // C major scale
    const pattern = [0, 2, 4, 2, 0, 4, 5, 4]; // Simple chord tones

    for (let bar = 0; bar < context.settings.bars; bar++) {
      for (let beat = 0; beat < 4; beat++) {
        const noteIndex = pattern[beat];
        const pitch = bassNotes[noteIndex];
        const time = bar * 4 + beat;

        notes.push({
          id: `bass-${time}`,
          time,
          duration: 1,
          pitch,
          velocity: 0.8,
        });
      }
    }

    return notes;
  }

  /**
   * Generate kick drum pattern
   */
  private generateKickPattern(context: ProjectContext): NoteEvent[] {
    const notes: NoteEvent[] = [];

    for (let bar = 0; bar < context.settings.bars; bar++) {
      // Kick on beats 1 and 3
      notes.push({
        id: `kick-${bar}-1`,
        time: bar * 4 + 0,
        duration: 0.25,
        pitch: 'C2',
        velocity: 1.0,
      });

      notes.push({
        id: `kick-${bar}-3`,
        time: bar * 4 + 2,
        duration: 0.25,
        pitch: 'C2',
        velocity: 0.9,
      });
    }

    return notes;
  }

  /**
   * Generate snare pattern
   */
  private generateSnarePattern(context: ProjectContext): NoteEvent[] {
    const notes: NoteEvent[] = [];

    for (let bar = 0; bar < context.settings.bars; bar++) {
      // Snare on beats 2 and 4
      notes.push({
        id: `snare-${bar}-2`,
        time: bar * 4 + 1,
        duration: 0.25,
        pitch: 'D2',
        velocity: 0.8,
      });

      notes.push({
        id: `snare-${bar}-4`,
        time: bar * 4 + 3,
        duration: 0.25,
        pitch: 'D2',
        velocity: 0.7,
      });
    }

    return notes;
  }

  /**
   * Generate melody notes
   */
  private generateMelody(context: ProjectContext): NoteEvent[] {
    const notes: NoteEvent[] = [];
    const melodyNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const pattern = [4, 6, 7, 6, 4, 2, 4, 6, 4, 2, 0, 2, 4, 2, 0, 2];

    for (let bar = 0; bar < context.settings.bars; bar++) {
      for (let step = 0; step < 16; step++) {
        if (Math.random() > 0.3) { // 70% chance of note
          const noteIndex = pattern[step % pattern.length];
          const pitch = melodyNotes[noteIndex];
          const time = bar * 4 + step * 0.25;

          notes.push({
            id: `melody-${bar}-${step}`,
            time,
            duration: 0.25,
            pitch,
            velocity: 0.6 + Math.random() * 0.3,
          });
        }
      }
    }

    return notes;
  }

  /**
   * Generate arpeggio pattern
   */
  private generateArpeggio(context: ProjectContext): NoteEvent[] {
    const notes: NoteEvent[] = [];
    const arpNotes = ['C4', 'E4', 'G4', 'C5', 'G4', 'E4'];

    for (let bar = 0; bar < context.settings.bars; bar++) {
      for (let step = 0; step < 16; step++) {
        const noteIndex = step % arpNotes.length;
        const pitch = arpNotes[noteIndex];
        const time = bar * 4 + step * 0.25;

        notes.push({
          id: `arp-${bar}-${step}`,
          time,
          duration: 0.125,
          pitch,
          velocity: 0.5,
        });
      }
    }

    return notes;
  }

  /**
   * OpenAI provider implementation
   */
  private async callOpenAIProvider(prompt: string, request: AICompositionRequest): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const response = await fetch(`${this.config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: request.temperature || this.config.temperature,
        max_tokens: request.maxTokens || this.config.maxTokens,
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content,
      tokensUsed: data.usage?.total_tokens,
    };
  }

  /**
   * Anthropic provider implementation
   */
  private async callAnthropicProvider(prompt: string, request: AICompositionRequest): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const response = await fetch(`${this.config.baseUrl || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: request.maxTokens || this.config.maxTokens,
        temperature: request.temperature || this.config.temperature,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0]?.text,
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    };
  }

  /**
   * Ollama provider implementation
   */
  private async callOllamaProvider(prompt: string, request: AICompositionRequest): Promise<any> {
    const response = await fetch(`${this.config.baseUrl || 'http://localhost:11434'}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt,
        stream: false,
        options: {
          temperature: request.temperature || this.config.temperature,
          num_predict: request.maxTokens || this.config.maxTokens,
        },
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.response,
      tokensUsed: data.eval_count,
    };
  }

  /**
   * OpenRouter provider implementation (Unified API for multiple models)
   */
  private async callOpenRouterProvider(prompt: string, request: AICompositionRequest): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    const response = await fetch(`${this.config.baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': window?.location?.origin || 'https://pxl-music-studio.vercel.app',
        'X-Title': 'PXL Chiptune Studio',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: request.temperature || this.config.temperature,
        max_tokens: request.maxTokens || this.config.maxTokens,
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content,
      tokensUsed: data.usage?.total_tokens,
    };
  }

  /**
   * Parse AI response and validate structure
   */
  private parseAIResponse(aiResponse: any): any {
    try {
      let content = aiResponse.content.trim();

      // Debug: Log the raw response to understand the format
      // console.log('🔧 Raw AI Response:', content.substring(0, 200) + (content.length > 200 ? '...' : ''));

      // Handle cases where AI returns JSON wrapped in code blocks or with extra text
      console.log('🔧 Raw AI Response length:', content.length);
      console.log('🔧 Raw AI Response starts with:', content.substring(0, 50));

      if (content.includes('```json')) {
        console.log('📦 Found JSON code block');
        // Extract JSON from markdown code block - handle truncated responses
        const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)(?:\n?\s*```|$)/);
        if (jsonMatch && jsonMatch[1]) {
          content = jsonMatch[1].trim();
          console.log('📦 Extracted JSON code block content length:', content.length);
        } else {
          console.log('❌ Failed to match JSON code block, trying fallback...');
          // Fallback: remove the opening ```json
          if (content.startsWith('```json')) {
            content = content.replace(/^```(?:json)?\s*\n?/, '').trim();
            console.log('📦 Fallback extraction - content length:', content.length);
          }
        }
      } else if (content.includes('```')) {
        console.log('📦 Found generic code block');
        // Extract JSON from generic code block
        const jsonMatch = content.match(/```\s*\n?([\s\S]*?)(?:\n?\s*```|$)/);
        if (jsonMatch && jsonMatch[1]) {
          content = jsonMatch[1].trim();
          console.log('📦 Extracted generic code block content length:', content.length);
        } else {
          console.log('❌ Failed to match generic code block, trying fallback...');
          // Fallback: remove the opening ```
          if (content.startsWith('```')) {
            content = content.replace(/^```\s*\n?/, '').trim();
            console.log('📦 Fallback extraction - content length:', content.length);
          }
        }
      } else if (content.includes('{') && !content.startsWith('{')) {
        console.log('📦 Found JSON within text, extracting...');
        // Extract JSON from text that contains JSON somewhere
        const startIndex = content.indexOf('{');
        const endIndex = content.lastIndexOf('}') + 1;
        if (startIndex !== -1 && endIndex > startIndex) {
          content = content.substring(startIndex, endIndex);
          console.log('📦 Extracted JSON substring length:', content.length);
        }
      }

      console.log('🔧 Final content to parse starts with:', content.substring(0, 50));
      console.log('🔧 Final content to parse ends with:', content.substring(content.length - 50));

      // console.log('🔧 Processed content for parsing:', content.substring(0, 100) + (content.length > 100 ? '...' : ''));
      const parsed = JSON.parse(content);

      // Validate required fields
      if (!parsed.tracks || !Array.isArray(parsed.tracks)) {
        throw new Error('Response must contain a tracks array');
      }

      if (!parsed.message || typeof parsed.message !== 'string') {
        throw new Error('Response must contain a message string');
      }

      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        parsed.confidence = 0.5; // Default confidence
      }

      // Validate track structure
      parsed.tracks.forEach((track: any, index: number) => {
        // console.log(`🔧 Validating track ${index}:`, {
        //   id: track.id,
        //   action: track.action,
        //   instrumentId: track.instrumentId,
        //   notesCount: track.notes?.length || 0,
        //   hasNotes: !!track.notes
        // });

        if (!track.id || !track.action) {
          throw new Error(`Track ${index} must have id and action`);
        }

        if (!['create', 'update', 'clear'].includes(track.action)) {
          throw new Error(`Track ${index} action must be create, update, or clear`);
        }

        if (track.action === 'create' && !track.instrumentId) {
          throw new Error(`New track ${index} must specify instrumentId`);
        }

        if (track.notes && !Array.isArray(track.notes)) {
          throw new Error(`Track ${index} notes must be an array`);
        }

        // Validate note structure if notes exist
        if (track.notes && track.notes.length > 0) {
          track.notes.forEach((note: any, noteIndex: number) => {
            if (typeof note.time !== 'number' || typeof note.duration !== 'number' || !note.pitch) {
              // console.warn(`⚠️ Note ${noteIndex} in track ${index} has invalid structure:`, note);
            }
          });
        }
      });

      // console.log('✅ AI Response parsed successfully:', {
      //   trackCount: parsed.tracks.length,
      //   totalNotes: parsed.tracks.reduce((sum, track) => sum + (track.notes?.length || 0), 0),
      //   message: parsed.message
      // });

      return parsed;
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('❌ Raw AI Response:', aiResponse.content);
      console.error('❌ Full AI Response for debugging:');
      console.log(aiResponse.content);

      // Try to provide a more helpful error by attempting to extract partial JSON
      try {
        let content = aiResponse.content.trim();

        // If the response is truncated, try to extract what's available
        if (content.includes('```json')) {
          const match = content.match(/```(?:json)?\s*\n?([\s\S]*?)(?:\n?\s*```|$)/);
          if (match && match[1]) {
            content = match[1].trim();
          }
        }

        // Try to find the last complete JSON object
        const lastBraceIndex = content.lastIndexOf('}');
        if (lastBraceIndex > 0) {
          const truncatedContent = content.substring(0, lastBraceIndex + 1);
          console.log('🔧 Attempting to parse truncated content:', truncatedContent);

          const partialParsed = JSON.parse(truncatedContent);
          console.log('✅ Successfully parsed partial response:', partialParsed);

          // If we have tracks, we can still use the partial response
          if (partialParsed.tracks && Array.isArray(partialParsed.tracks)) {
            console.log('🔧 Using partial response with', partialParsed.tracks.length, 'tracks');
            return partialParsed;
          }
        }
      } catch (partialError) {
        console.error('❌ Even partial parsing failed:', partialError);
      }

      // Provide more helpful error message with actual response
      const responsePreview = aiResponse.content.length > 200
        ? aiResponse.content.substring(0, 200) + '...'
        : aiResponse.content;

      console.error('🔧 DEBUG: Final content that failed to parse:', content.substring(0, 500));

      throw new Error(`Failed to parse AI response. The response may be truncated due to token limits. Try simplifying your prompt or using shorter requests. Raw response preview: "${responsePreview}". Check the browser console for full debugging info.`);
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}

export function configureAIService(config: Partial<AIServiceConfig>): void {
  aiServiceInstance = new AIService(config);
}

// ============================================================================
// Convenience Functions
// ============================================================================

export async function generateAIComposition(request: AICompositionRequest): Promise<AICompositionResponse> {
  const service = getAIService();
  return service.generateComposition(request);
}
