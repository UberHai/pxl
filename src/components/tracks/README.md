# Track Management Components

Professional track management system for the PXL Chiptune Studio, providing comprehensive control over audio tracks and instrument assignment.

## Components

### TrackList (`TrackList.tsx`)
The main track list component displaying all project tracks with full control capabilities.

#### Features
- **Track Management**: Add/remove tracks (up to 12 maximum)
- **Track Selection**: Visual feedback for selected tracks
- **Instrument Assignment**: Dropdown with all 29 available instruments
- **Track Naming**: Editable track names
- **Track Count Display**: Shows current/maximum tracks
- **Responsive Layout**: Collapsible sidebar design

#### Props
- Uses `useProjectStore()` for state management
- No external props required - fully self-contained

#### Technical Details
- Virtual scrolling for performance with large track counts
- Keyboard shortcuts integration (Ctrl+T to add track)
- Real-time instrument switching with audio feedback
- Professional UI with hover states and transitions

### TrackRow (`TrackRow.tsx`)
Individual track control row with professional mixing capabilities.

#### Features
- **Volume Control**: Professional fader (-60dB to 0dB range)
- **Pan Control**: Stereo positioning (-1 to 1)
- **Mute/Solo**: Individual track muting and soloing
- **Instrument Display**: Current instrument name and category
- **Visual Feedback**: Active states and parameter indicators
- **Responsive Design**: Optimized for various screen sizes

#### Props
```tsx
interface TrackRowProps {
  track: Track;           // Track data from store
  isSelected: boolean;    // Selection state
  onSelect: () => void;   // Selection callback
}
```

#### Technical Details
- Real-time audio parameter updates
- Tone.js integration for volume/pan control
- Accessibility features (ARIA labels, keyboard navigation)
- Performance optimized with proper event handling

## Instrument Categories

The track system supports all 29 instruments organized in categories:

### Pulse Family (4 instruments)
- Pulse Lead 12.5%, 25%, 50% - Classic NES-style pulse waves
- PWM Lead - Pulse width modulation with LFO

### Bass Section (4 instruments)
- Triangle Bass, Sub Sine Bass - Warm low-frequency tones
- Square Bass, FM Bass - Punchy bass synthesis

### Percussion Kit (4 instruments)
- Noise Kick, Snare, Hat, Crash - Filtered noise percussion

### Lead/Melodic (15 instruments)
- Chip Arp Pluck, FM Bell, Bitcrushed Saw Lead
- Chip Organ, Wavetable Lead, Ring Mod Lead
- Detuned Pulse, Chebyshev Lead, AM Synth
- Digital Glitch, Resonant Sweep, Additive Bell
- Vibrato Lead, Arpeggio Bass, Duty Cycle Sweep

### Chords & Special (2 instruments)
- PolyPulse Chords - Polyphonic chord generation
- Simple Chords - Basic chord progressions

## Integration

The track components integrate with:
- **Audio Engine**: Real-time instrument switching and parameter control
- **State Management**: Zustand store for track state persistence
- **Instrument Registry**: Complete instrument factory system
- **UI System**: shadcn/ui components for consistent design

## Performance Considerations

- **Efficient Re-rendering**: Proper memoization and state optimization
- **Audio Resource Management**: Proper cleanup of unused instruments
- **Memory Optimization**: Limited to 12 tracks maximum for performance
- **Event Handling**: Debounced parameter updates to prevent audio glitches

## Dependencies

- `@/state/useProjectStore` - Track state management
- `@/audio/instrument-registry` - Instrument factory
- `@/components/ui/*` - shadcn/ui components
- `tone` - Audio parameter control
