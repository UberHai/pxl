# PXL Chiptune Masterpiece Studio

A tracker-style, pattern-based sequencer with modern piano-roll options, built-in chip-inspired instruments, and zero-to-sound in <10 seconds.

## Features

- 🎵 **One-screen Compose**: Transport controls, BPM, Time Signature, Bars, Key/Scale, Swing, Quantize
- 🎹 **Interactive Pattern Grid**: Click-to-toggle notes with real-time audio playback
- 🎛️ **Complete Chip Instruments**: 29 fully functional chiptune instruments with audio synthesis
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
- ⚠️ Project persistence (save/load project state)
- ✅ WAV export functionality (implemented!)
- ❌ MIDI export functionality
- ❌ AI chord progression helper (UI implemented, API not connected)
- ❌ Advanced pattern editing features (note velocity, duration control)

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
  audio/               # ✅ Tone.js audio engine (29 instruments working!)
  state/               # ✅ Zustand stores (fixed initialization issues)
  schemas/             # ✅ Zod validation schemas
  types/               # ✅ TypeScript type definitions
  lib/                 # ✅ Utility functions
  styles/              # ✅ CSS styles with dark theme
```

## Instruments

The app includes **29 fully functional** chip-inspired instruments organized in categories:

**Pulse Family (4):**
1. Pulse Lead 12.5% - Thin, cutting lead sound
2. Pulse Lead 25% - Fuller pulse lead
3. Pulse Lead 50% - Classic square wave
4. PWM Lead - Pulse width modulation with LFO

**Bass Section (4):**
5. Triangle Bass - Warm triangle wave bass
6. Sub Sine Bass - Deep sub-bass frequencies
7. Square Bass - Classic square wave bass
8. FM Bass - FM synthesis bass

**Percussion Kit (4):**
9. Noise Kick - Punchy filtered noise kick
10. Noise Snare - Band-pass filtered snare
11. Noise Hat - High-pass filtered hat
12. Noise Crash - Filtered crash cymbal

**Lead/Melodic (15):**
13. Chip Arp Pluck - Fast envelope pulse pluck
14. FM Bell - 2-operator FM synthesis
15. Bitcrushed Saw Lead - Lo-fi sawtooth with bitcrusher
16. Chip Organ - Additive synthesis with harmonics
17. Wavetable Lead - Custom wavetable synthesis
18. Ring Mod Lead - Ring modulation effects
19. Detuned Pulse - Pulse with detuning
20. Chebyshev Lead - Chebyshev wave shaping
21. AM Synth - Amplitude modulation
22. Digital Glitch - Digital distortion effects
23. Resonant Sweep - Filtered sweep effects
24. Additive Bell - Additive synthesis bell
25. Vibrato Lead - LFO vibrato effects
26. Arpeggio Bass - Arpeggiated bass lines
27. Duty Cycle Sweep - Pulse width sweeping

**Chords & Special (2):**
28. PolyPulse Chords - Enhanced polyphonic chords
29. Simple Chords - Basic chord progressions

## License

ISC License
