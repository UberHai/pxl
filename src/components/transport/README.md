# Transport Components

Professional transport controls for the PXL Chiptune Studio, providing comprehensive playback and project management functionality.

## Components

### TransportBar (`TransportBar.tsx`)
The main transport control panel with professional audio production features.

#### Features
- **Playback Controls**: Play/Pause/Stop with visual feedback
- **BPM Control**: Range 20-300 BPM with real-time synchronization
- **Time Signature**: Configurable time signatures (4/4, 3/4, etc.)
- **Bars Control**: Project length from 1-128 bars
- **Key & Scale**: Musical key and scale selection
- **Swing Control**: Groove adjustment
- **Metronome**: Toggleable metronome with BPM sync
- **Save/Load/Export**: Complete project persistence system
- **Import**: JSON project file import with validation

#### Props
- Uses `useProjectStore()` for state management
- No external props required - fully self-contained

#### Technical Details
- Integrates with Tone.js Transport for audio synchronization
- Auto-save functionality (every 2 seconds)
- Professional file I/O with download/upload handling
- Error handling for corrupted project files

### TimelineIndicator (`TimelineIndicator.tsx`)
Visual playback position indicator for the pattern grid.

#### Features
- Real-time playback cursor
- Synchronized with Tone.js Transport position
- Visual feedback during playback
- Smooth animation and positioning

#### Usage
```tsx
import TimelineIndicator from '@/components/transport/TimelineIndicator';

// Used within PatternGrid for visual playback feedback
<TimelineIndicator currentStep={currentStep} totalSteps={totalSteps} />
```

## Integration

The transport components integrate seamlessly with:
- **Audio Engine**: Tone.js Transport synchronization
- **State Management**: Zustand store for project state
- **UI System**: shadcn/ui components for consistent design
- **File System**: Browser download/upload APIs

## Dependencies

- `@/state/useProjectStore` - Project state management
- `@/audio/engine` - Audio context and transport
- `@/components/ui/*` - shadcn/ui components
- `tone` - Audio synchronization
