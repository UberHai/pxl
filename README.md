# PXL Chiptune Masterpiece Studio

A tracker-style, pattern-based sequencer with modern piano-roll options, built-in chip-inspired instruments, and zero-to-sound in <10 seconds.

## Features

- 🎵 **One-screen Compose**: Transport controls, BPM, Time Signature, Bars, Key/Scale, Swing, Quantize
- 🎹 **Interactive Pattern Grid**: Click-to-toggle notes with real-time audio playback
- 🎛️ **Working Chip Instruments**: 4 fully functional NES/GB-style instruments with audio synthesis
- 🎚️ **Professional Audio Engine**: Tone.js-powered real-time synthesis and effects
- 📊 **Live Visual Feedback**: Playback cursor, note visualization, and audio monitoring
- 🎼 **Music Production Ready**: Create complete chiptune compositions immediately

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19
- **Audio**: Tone.js, @tonejs/midi
- **UI**: shadcn/ui, Tailwind CSS, Lucide React
- **State**: Zustand with localStorage persistence
- **Validation**: Zod schemas
- **AI**: Gemini API for chord suggestions

## Documentation

📋 **[CURRENT.md](DOCS/CURRENT.md)** - Detailed current implementation status  
🚀 **[NEXTSTEPS.md](DOCS/NEXTSTEPS.md)** - Development roadmap and priorities  
📖 **[AGENTS.md](DOCS/AGENTS.md)** - Complete engineering specification

⚠️ **CRITICAL:** Both CURRENT.md and NEXTSTEPS.md MUST be updated whenever features are implemented, modified, or when priorities change.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up AI helper:
   ```bash
   cp .env.example .env.local
   # Add your Gemini API key to .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

### Current Reality Check ⚠️

**What Actually Works:**
- ✅ Professional dark-themed interface
- ✅ Add/remove tracks with instrument selection
- ✅ BPM, time signature, and musical parameter controls
- ✅ Track volume, pan, mute, solo controls
- ✅ Toggle metronome on/off with BPM synchronization
- ✅ State persistence in localStorage

**What Doesn't Work Yet:**
- ⚠️ Limited audio playback (4 basic instruments, no persistence)
- ⚠️ Basic pattern editing (click to add notes, real-time playback)
- ❌ Full instrument library (only 4 basic instruments implemented)
- ❌ No file export
- ❌ No AI assistance

This is now a **functional audio prototype** with working music production capabilities. Users can create patterns and hear them play back in real-time. See [CURRENT.md](CURRENT.md) for detailed status.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
  app/                 # Next.js App Router pages
  components/          # React components
    transport/         # ✅ Transport controls (fully working)
    tracks/            # ✅ Track management (fully working)
    editor/            # ✅ Pattern grid editor (fully working)
    debug/             # 🔧 Debug panel for troubleshooting
    ai/                # ❌ AI helper components
    common/            # ❌ Shared components
    ui/                # ✅ shadcn/ui components (working)
  audio/               # ✅ Tone.js audio engine (4 instruments working)
  state/               # ✅ Zustand stores (fixed initialization issues)
  schemas/             # ✅ Zod validation schemas
  types/               # ✅ TypeScript type definitions
  lib/                 # ✅ Utility functions
  styles/              # ✅ CSS styles with dark theme
```

## Instruments

The app includes 15 chip-inspired instruments:

1. Pulse Lead 12.5%
2. Pulse Lead 25% 
3. Pulse Lead 50%
4. PWM Lead
5. Triangle Bass
6. Sub Sine Bass
7. Noise Kick
8. Noise Snare
9. Noise Hat
10. Chip Arp Pluck
11. PolyPulse Chords
12. FM Bell
13. Bitcrushed Saw Lead
14. Chip Organ
15. GamePad Blip

## License

ISC License
