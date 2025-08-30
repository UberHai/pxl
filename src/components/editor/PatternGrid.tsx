/**
 * PXL Chiptune Studio - Pattern Grid Component
 * Basic 4x16 step grid for note input
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProjectStore } from '@/state/useProjectStore';
import { addNote } from '@/audio/scheduler';
import { NoteEvent } from '@/types/song';
import * as Tone from 'tone';

// Note Context Menu Component
interface NoteContextMenuProps {
  menu: { x: number; y: number; step: number; noteIndex: number; note?: NoteEvent };
  onClose: () => void;
  onVelocityChange: (velocity: number) => void;
  onDelete: () => void;
}

function NoteContextMenu({ menu, onClose, onVelocityChange, onDelete }: NoteContextMenuProps) {
  const [velocity, setVelocity] = useState(menu.note?.velocity || 0.8);

  const handleVelocityChange = (newVelocity: number) => {
    setVelocity(newVelocity);
    onVelocityChange(newVelocity);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.note-context-menu')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="note-context-menu fixed z-50 bg-card border border-border rounded-lg shadow-lg p-3 min-w-48"
      style={{ left: menu.x, top: menu.y }}
    >
      <div className="space-y-3">
        {/* Note Info */}
        <div className="text-sm font-medium text-foreground">
          Note Properties
        </div>

        {/* Velocity Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Velocity</label>
            <span className="text-xs text-muted-foreground">{Math.round(velocity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={velocity}
            onChange={(e) => handleVelocityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border pt-2">
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full text-left px-2 py-1 text-sm text-destructive hover:bg-destructive/10 rounded"
          >
            Delete Note
          </button>
        </div>
      </div>
    </div>
  );
}

interface PatternGridProps {
  trackId: string;
  steps?: number;
  rows?: number;
}

// Extended note range: one octave higher and one octave lower
const NOTES = [
  'C5', 'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', // Higher octave
  'C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', // Middle octave  
  'C3', 'B2', 'A#2', 'A2', 'G#2', 'G2', 'F#2', 'F2', 'E2', 'D#2', 'D2', 'C#2'  // Lower octave
];

// Pitch class utilities using sharps to match NOTE names above
const PITCH_CLASSES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const;
type PitchClass = typeof PITCH_CLASSES[number];
const noteNameToPc = (name: string | PitchClass): number => PITCH_CLASSES.indexOf(name as PitchClass);
const wrapPc = (n: number) => ((n % 12) + 12) % 12;

function computeHighlightPitchClasses(keyRoot: string, scale: 'major' | 'minor') {
  const rootPc = noteNameToPc(keyRoot);
  // Universal highlighting pattern
  // Always highlight: 1 (root), 3, 5, 7 (b7 for minor, natural 7 for major)
  const third = scale === 'major' ? 4 : 3;
  const fifth = 7;
  const seventh = scale === 'major' ? 11 : 10; // natural 7 in major, b7 in minor
  const chord = new Set<number>([
    wrapPc(rootPc + 0),
    wrapPc(rootPc + third),
    wrapPc(rootPc + fifth),
    wrapPc(rootPc + seventh),
  ]);

  // Optional color tones: 2/9, 4/11, 6/13 (major 6 in major, b6 in minor)
  const sixth = scale === 'major' ? 9 : 8;
  const optional = new Set<number>([
    wrapPc(rootPc + 2), // 2/9
    wrapPc(rootPc + 5), // 4/11
    wrapPc(rootPc + sixth), // 6/13
  ]);

  // In-scale tones for major (Ionian) or natural minor (Aeolian)
  const scaleIntervals = scale === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const scaleSet = new Set<number>(scaleIntervals.map((i) => wrapPc(rootPc + i)));

  return { chord, optional, scale: scaleSet, rootPc };
}

export default function PatternGrid({
  trackId,
  steps: overrideSteps,
  rows = 36 // Default to show all 3 octaves (12 notes per octave)
}: PatternGridProps) {
  const { project, ui, updateTrack, setStepRes } = useProjectStore();
  
  // Calculate steps based on project bars and current step resolution
  const stepsPerBar = ui?.stepRes || 16; // 16 = 16th notes, 8 = 8th notes, etc.
  const steps = overrideSteps || project.meta.bars * stepsPerBar;
  const [beatsPerBarNumerator] = project.meta.timeSig.split('/').map(Number);
  const beatsPerBar = beatsPerBarNumerator || 4;
  const stepValue = ui?.stepRes ? 4 / ui.stepRes : 0.25; // Note value in beats (0.25 for 16th, 0.5 for 8th, etc.)
  const stepsPerBeat = Math.max(1, Math.round(stepsPerBar / beatsPerBar));
  
  const [activeNotes, setActiveNotes] = useState<Map<string, string[]>>(new Map()); // step -> array of pitches
  const [currentPlayingStep, setCurrentPlayingStep] = useState<number>(-1);
  const [recentlyTriggeredNotes, setRecentlyTriggeredNotes] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<number>(-1);
  const [cursorPosition, setCursorPosition] = useState<{ step: number; noteIndex: number }>({ step: 0, noteIndex: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 0.5, 1, 1.5, 2
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; step: number; noteIndex: number; note?: NoteEvent } | null>(null);

  // Compute highlight pitch classes for the current project key/scale
  const { chord: chordPcs, optional: optionalPcs, scale: scalePcs, rootPc } = useMemo(() => {
    const keyRoot = project.meta.key as any as typeof PITCH_CLASSES[number];
    const scale = (project.meta.scale === 'minor' ? 'minor' : 'major') as 'major' | 'minor';
    const result = computeHighlightPitchClasses(keyRoot, scale);
    // console.log('🎵 Scale highlighting computed:', {
    //   key: keyRoot,
    //   scale,
    //   rootPc: result.rootPc,
    //   chordPcs: Array.from(result.chord),
    //   optionalPcs: Array.from(result.optional),
    //   scalePcs: Array.from(result.scale)
    // });
    return result;
  }, [project.meta.key, project.meta.scale]);

  // Find the track
  const track = project.tracks.find(t => t.id === trackId);
  if (!track) {
    // console.log('❌ PatternGrid: Track not found for ID:', trackId);
    return null;
  }

  // console.log('🎼 PatternGrid loaded for track:', {
  //   trackId,
  //   trackName: track.name,
  //   instrumentId: track.instrumentId,
  //   clipsCount: track.clips.length,
  //   totalNotes: track.clips.reduce((sum, clip) => sum + clip.notes.length, 0)
  // });

  // Initialize active notes from existing track clips
  useEffect(() => {
    if (!track.clips.length) {
      // Create a default clip if none exists
      const defaultClip = {
        id: `${trackId}-clip-default`,
        start: 0,
        length: project.meta.bars * 4, // Length in beats (4 beats per bar in 4/4)
        notes: [],
        muted: false
      };
      
      updateTrack(trackId, {
        clips: [defaultClip]
      });
      
      setActiveNotes(new Map());
      return;
    }

    // Load existing notes from clips into local state for UI
    const noteMap = new Map<string, string[]>();
    // console.log('🎼 Loading notes for track:', trackId);

    track.clips.forEach((clip, clipIndex) => {
      // console.log(`🎼 Clip ${clipIndex}: ${clip.notes.length} notes`);
      clip.notes.forEach((note, noteIndex) => {
        // console.log(`🎼 Note ${noteIndex}:`, {
        //   time: note.time,
        //   duration: note.duration,
        //   pitch: note.pitch,
        //   velocity: note.velocity
        // });

        // Convert note time to step index based on current resolution
        const stepIndex = Math.floor(note.time / stepValue);

        // console.log(`🎼 Converting: time ${note.time} -> step ${stepIndex}, pitch ${note.pitch}`);

        if (stepIndex < steps) {
          const stepKey = stepIndex.toString();
          if (!noteMap.has(stepKey)) {
            noteMap.set(stepKey, []);
          }
          const pitches = noteMap.get(stepKey)!;
          if (!pitches.includes(note.pitch)) {
            pitches.push(note.pitch);
          }
        } else {
          // console.log(`❌ Note conversion failed: stepIndex=${stepIndex}, steps=${steps}`);
        }
      });
    });

    // console.log(`🎼 Final active notes count:`, Array.from(noteMap.entries()));

    setActiveNotes(noteMap);
  }, [track.clips, trackId, project.meta.bars, updateTrack, stepValue, steps]);

  // Track current playing position for visual feedback
  useEffect(() => {
    if (!ui?.isPlaying) {
      setCurrentPlayingStep(-1);
      return;
    }

    const updatePlayingStep = () => {
      if (Tone.Transport.state === 'started') {
        try {
          const position = Tone.Transport.position;
          let positionInBeats: number;
          
          if (typeof position === 'string') {
            const parts = position.split(':').map(Number);
            const bars = parts[0] || 0;
            const beats = parts[1] || 0;
            const sixteenths = parts[2] || 0;
            
            positionInBeats = bars * beatsPerBar + beats + sixteenths / 16;
          } else {
            positionInBeats = position as number;
          }
          
          const step = Math.floor(positionInBeats / stepValue) % stepsPerBar;
          setCurrentPlayingStep(step);
        } catch (error) {
          console.warn('Failed to update playing step:', error);
        }
      }
    };

    const interval = setInterval(updatePlayingStep, 50);
    return () => clearInterval(interval);
  }, [ui.isPlaying, stepValue, steps, project.meta.timeSig]);

  const handleStepClick = (step: number, noteIndex: number, event?: React.MouseEvent) => {
    // Handle right-click for context menu
    if (event && event.type === 'contextmenu') {
      event.preventDefault();

      // Find existing note if any
      const noteName = NOTES[noteIndex];
      const stepKey = step.toString();
      const pitches = activeNotes.get(stepKey) || [];
      const hasNote = pitches.includes(noteName);

      let existingNote: NoteEvent | undefined;
      if (hasNote && track.clips.length > 0) {
        existingNote = track.clips[0].notes.find(
          note => Math.floor(note.time / stepValue) === step && note.pitch === noteName
        );
      }

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        step,
        noteIndex,
        note: existingNote
      });
      return;
    }

    const noteKey = `${step}-${noteIndex}`;
    const noteName = NOTES[noteIndex];

    // Get or create the default clip
    let currentClips = [...track.clips];
    if (currentClips.length === 0) {
      currentClips = [{
        id: `${trackId}-clip-default`,
        start: 0,
        length: project.meta.bars * 4,
        notes: [],
        muted: false
      }];
    }

    const clip = currentClips[0]; // Use the first clip for now
    const noteTime = step * stepValue; // Time based on current step resolution

    // Check if note already exists at this step and pitch
    const existingNoteIndex = clip.notes.findIndex(
      note => Math.floor(note.time / stepValue) === step && note.pitch === noteName
    );

    if (existingNoteIndex !== -1) {
      // Remove existing note
      const updatedNotes = clip.notes.filter((_, index) => index !== existingNoteIndex);
      const updatedClip = { ...clip, notes: updatedNotes };

      updateTrack(trackId, {
        clips: [updatedClip, ...currentClips.slice(1)]
      });

      setActiveNotes(prev => {
        const newActive = new Map(prev);
        const stepKey = step.toString();
        const pitches = newActive.get(stepKey) || [];
        const filteredPitches = pitches.filter(p => p !== noteName);
        if (filteredPitches.length === 0) {
          newActive.delete(stepKey);
        } else {
          newActive.set(stepKey, filteredPitches);
        }
        return newActive;
      });
    } else {
      // Add new note
      // Note duration should be independent of step resolution for proper timing
      // Use a reasonable default duration based on step resolution
      const defaultDuration = ui?.stepRes ? (ui.stepRes <= 8 ? 0.5 : 0.25) : 0.25; // 8th note or 16th note (fallback to 16th)
      const noteEvent: NoteEvent = {
        id: `${trackId}-${noteKey}-${Date.now()}`,
        time: noteTime,
        duration: defaultDuration,
        pitch: noteName,
        velocity: 0.8
      };

      const updatedNotes = [...clip.notes, noteEvent];
      const updatedClip = { ...clip, notes: updatedNotes };

      updateTrack(trackId, {
        clips: [updatedClip, ...currentClips.slice(1)]
      });

      setActiveNotes(prev => {
        const newActive = new Map(prev);
        const stepKey = step.toString();
        const pitches = newActive.get(stepKey) || [];
        pitches.push(noteName);
        newActive.set(stepKey, pitches);
        return newActive;
      });

      // Add to audio scheduler for immediate playback
      addNote(trackId, noteEvent);

      // Add visual feedback for recently triggered note
      setRecentlyTriggeredNotes(prev => new Set(prev).add(noteKey));
      setTimeout(() => {
        setRecentlyTriggeredNotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(noteKey);
          return newSet;
        });
      }, 200); // Remove highlight after 200ms
    }
  };

  const isStepActive = (step: number, noteIndex: number) => {
    const stepKey = step.toString();
    const pitches = activeNotes.get(stepKey);
    if (!pitches) return false;
    const noteName = NOTES[noteIndex];
    return pitches.includes(noteName);
  };

  const getNotesAtStep = (step: number) => {
    const stepKey = step.toString();
    return activeNotes.get(stepKey) || [];
  };

  const stepResolutions = [
    { value: 1, label: '1/1', name: 'Whole' },
    { value: 2, label: '1/2', name: 'Half' },
    { value: 4, label: '1/4', name: 'Quarter' },
    { value: 8, label: '1/8', name: 'Eighth' },
    { value: 16, label: '1/16', name: 'Sixteenth' }
  ];

  const clearPattern = () => {
    if (track.clips.length > 0) {
      const clearedClip = { ...track.clips[0], notes: [] };
      updateTrack(trackId, {
        clips: [clearedClip, ...track.clips.slice(1)]
      });
    }
  };

  // Handle velocity change
  const handleVelocityChange = (step: number, noteIndex: number, velocity: number) => {
    const noteName = NOTES[noteIndex];
    const noteTime = step * stepValue;

    if (track.clips.length === 0) return;

    const clip = track.clips[0];
    const existingNoteIndex = clip.notes.findIndex(
      note => Math.abs(note.time - noteTime) < stepValue / 2 && note.pitch === noteName
    );

    if (existingNoteIndex !== -1) {
      // Update existing note velocity
      const updatedNotes = clip.notes.map((note, index) =>
        index === existingNoteIndex ? { ...note, velocity } : note
      );

      updateTrack(trackId, {
        clips: [{ ...clip, notes: updatedNotes }]
      });
    }
  };

  // Handle note deletion
  const handleDeleteNote = (step: number, noteIndex: number) => {
    const noteName = NOTES[noteIndex];
    const noteTime = step * stepValue;

    if (track.clips.length === 0) return;

    const clip = track.clips[0];
    const updatedNotes = clip.notes.filter(
      note => !(Math.abs(note.time - noteTime) < stepValue / 2 && note.pitch === noteName)
    );

    updateTrack(trackId, {
      clips: [{ ...clip, notes: updatedNotes }]
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation when the pattern grid is focused
      if (!e.target || !(e.target as HTMLElement).closest('.pattern-grid')) return;

      const { step, noteIndex } = cursorPosition;
      let newStep = step;
      let newNoteIndex = noteIndex;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newNoteIndex = Math.max(0, noteIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newNoteIndex = Math.min(rows - 1, noteIndex + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newStep = Math.max(0, step - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newStep = Math.min(steps - 1, step + 1);
          break;
        case 'Control':
          e.preventDefault();
          handleStepClick(step, noteIndex);
          break;
        case 'Enter':
          e.preventDefault();
          handleStepClick(step, noteIndex);
          break;
        default:
          return;
      }

      if (newStep !== step || newNoteIndex !== noteIndex) {
        setCursorPosition({ step: newStep, noteIndex: newNoteIndex });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cursorPosition, rows, steps, handleStepClick]);

  return (
    <div className="pattern-grid bg-card border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2" tabIndex={0}>
      {/* Enhanced Header with Sections */}
      <div className="p-3 border-b border-border/50">
        {/* Section 1: Track Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              {track.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 bg-muted/50 rounded text-[10px] font-medium">
                Pattern Grid
              </span>
              <span>•</span>
              <span>{rows}×{steps} steps</span>
            </div>
          </div>
        </div>

        {/* Section 2: Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">View:</label>
              <div className="flex bg-muted/30 rounded-md p-0.5">
                <button className="px-3 py-1 text-xs font-medium bg-background text-foreground rounded border border-border">
                  Grid
                </button>
                <button className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Piano Roll
                </button>
              </div>
            </div>

            {/* Step Resolution */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Resolution:</label>
              <select
                value={ui?.stepRes || 16}
                onChange={(e) => setStepRes(Number(e.target.value) as any)}
                className="text-xs bg-background border border-border rounded px-2 py-1 min-w-24"
              >
                {stepResolutions.map(res => (
                  <option key={res.value} value={res.value}>
                    {res.label} ({res.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Zoom:</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                  className="text-xs px-2 py-1 bg-muted/30 rounded hover:bg-muted/50 transition-colors"
                  title="Zoom out"
                >
                  -
                </button>
                <span className="text-xs font-mono w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                  className="text-xs px-2 py-1 bg-muted/30 rounded hover:bg-muted/50 transition-colors"
                  title="Zoom in"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Actions */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-muted/30 rounded text-[10px]">Arrows</span>
              <span>Navigate</span>
              <span className="px-1.5 py-0.5 bg-muted/30 rounded text-[10px]">CTRL</span>
              <span>Toggle</span>
            </div>
            <button
              onClick={clearPattern}
              className="text-xs px-3 py-1.5 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors font-medium"
              title="Clear all notes"
            >
              Clear Pattern
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-auto max-h-[70vh]">
        <div className="grid min-w-max" style={{ gridTemplateColumns: `60px repeat(${steps}, 1fr)` }}>
          {/* Note labels column */}
          <div className="sticky left-0 bg-card border-r border-border pr-2">
            {/* Header space */}
            <div className="h-6 flex items-center justify-center text-xs font-mono text-muted-foreground border-b border-border">
              Note
            </div>
            {/* Note labels */}
            {NOTES.slice(0, rows).map((note, index) => {
              const octave = note.slice(-1);
              const noteName = note.slice(0, -1);
              const isOctaveStart = noteName === 'C';
              const pc = noteNameToPc(noteName);
              const isRoot = pc === rootPc;
              const isChordTone = chordPcs.has(pc);
              const isOptionalTone = optionalPcs.has(pc);
              const isInScale = scalePcs.has(pc);
              const isHovered = hoveredRow === index;
              
              // Determine background color based on scale degree
              let labelBg = '';
              let labelText = 'text-muted-foreground';
              
              if (isHovered) {
                labelBg = 'bg-primary/40';
                labelText = 'text-foreground font-semibold';
              } else if (isRoot) {
                labelBg = 'bg-primary/30';
                labelText = 'text-foreground font-bold';
              } else if (isChordTone) {
                labelBg = 'bg-secondary/40';
                labelText = 'text-foreground font-semibold';
              } else if (isOptionalTone) {
                labelBg = 'bg-accent/30';
                labelText = 'text-foreground';
              } else if (isInScale) {
                labelBg = 'bg-muted/30';
                labelText = 'text-muted-foreground';
              } else if (isOctaveStart) {
                labelBg = 'bg-card';
                labelText = 'text-muted-foreground';
              }
              
              const labelBorderTop = isOctaveStart ? 'border-t border-accent' : '';
              
              return (
                            <div
              key={`label-${index}`}
              className={`box-border flex items-center justify-end text-xs font-mono pr-1 transition-all duration-200 cursor-pointer ${labelText} ${labelBorderTop} ${labelBg}`}
              style={{ height: `${16 * zoomLevel}px` }}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(-1)}
            >
              <span className="text-[10px]">{noteName}</span>
              <span className="text-[8px] opacity-70 ml-0.5">{octave}</span>
            </div>
              );
            })}
          </div>

          {/* Step columns */}
          {Array.from({ length: steps }, (_, step) => (
            <div key={`step-${step}`} className="flex flex-col">
              {/* Step number header */}
              <div className={`flex items-center justify-center text-[10px] font-mono border-b border-border ${
                step === currentPlayingStep
                  ? 'text-foreground font-semibold bg-primary/30 border-primary/50'
                  : step % stepsPerBar === 0
                    ? 'text-foreground font-semibold bg-accent/20'
                    : step % stepsPerBeat === 0
                      ? 'text-foreground'
                      : 'text-muted-foreground'
              }`}
              style={{ height: `${24 * zoomLevel}px` }}>
                {step % stepsPerBar === 0
                  ? Math.floor(step / stepsPerBar) + 1
                  : step % stepsPerBeat === 0
                    ? Math.floor(step / stepsPerBeat) + 1
                    : '·'}
              </div>

              {/* Note cells */}
              {NOTES.slice(0, rows).map((note, noteIndex) => {
                const isBarStart = step % stepsPerBar === 0;
                const isBeatStart = step % stepsPerBeat === 0;
                const noteNameOnly = note.slice(0, -1);
                const isOctaveStart = noteNameOnly === 'C';
                const isActive = isStepActive(step, noteIndex);
                const isCurrentStep = step === currentPlayingStep;
                const noteKey = `${step}-${noteIndex}`;
                const isRecentlyTriggered = recentlyTriggeredNotes.has(noteKey);
                const pc = noteNameToPc(noteNameOnly);
                const isRoot = pc === rootPc;
                const isChordTone = chordPcs.has(pc);
                const isOptionalTone = optionalPcs.has(pc);
                const isInScale = scalePcs.has(pc);
                const isHovered = hoveredRow === noteIndex;
                const isCursorPosition = cursorPosition.step === step && cursorPosition.noteIndex === noteIndex;

                // Check for chord at this step
                const notesAtStep = getNotesAtStep(step);
                const isChordStep = notesAtStep.length > 1;
                const isPartOfChord = isChordStep && isActive;

                // Determine cell styling based on state priority
                let cellClasses = 'w-full rounded-sm border box-border transition-all duration-200 relative';
                const cellHeight = 16 * zoomLevel;

                if (isActive) {
                  // Active notes override everything
                  cellClasses += isPartOfChord
                    ? ' bg-orange-500 border-orange-400 shadow-md hover:bg-orange-400' // Orange for chord notes
                    : ' bg-primary border-primary shadow-md hover:bg-primary/90';
                } else if (isRecentlyTriggered) {
                  // Recently triggered flash
                  cellClasses += ' bg-primary/80 border-primary animate-pulse';
                } else if (isCursorPosition) {
                  // Cursor position highlighting
                  cellClasses += ' bg-primary/20 border-primary/60 ring-1 ring-primary/40';
                } else {
                  // Scale degree highlighting
                  if (isRoot) {
                    cellClasses += isHovered
                      ? ' bg-primary/60 border-primary shadow-sm hover:bg-primary/70'
                      : ' bg-primary/40 border-primary/70 hover:bg-primary/50';
                  } else if (isChordTone) {
                    cellClasses += isHovered
                      ? ' bg-secondary/60 border-secondary shadow-sm hover:bg-secondary/70'
                      : ' bg-secondary/40 border-secondary/70 hover:bg-secondary/50';
                  } else if (isOptionalTone) {
                    cellClasses += isHovered
                      ? ' bg-accent/50 border-accent shadow-sm hover:bg-accent/60'
                      : ' bg-accent/30 border-accent/70 hover:bg-accent/40';
                  } else if (isInScale) {
                    cellClasses += isHovered
                      ? ' bg-muted/50 border-muted hover:bg-muted/60'
                      : ' bg-muted/30 border-muted/70 hover:bg-muted/40';
                  } else {
                    // Out of scale - neutral
                    cellClasses += isHovered
                      ? ' bg-card/80 border-border hover:bg-card'
                      : ' bg-card/50 border-border hover:bg-card/70';
                  }
                }

                // Add octave markers
                if (isOctaveStart) {
                  cellClasses += ' border-t-2 border-t-accent';
                }

                return (
                  <button
                    key={`cell-${step}-${noteIndex}`}
                    onClick={(e) => handleStepClick(step, noteIndex, e)}
                    onContextMenu={(e) => handleStepClick(step, noteIndex, e)}
                    onMouseEnter={() => setHoveredRow(noteIndex)}
                    onMouseLeave={() => setHoveredRow(-1)}
                    className={cellClasses}
                    style={{ height: `${cellHeight}px` }}
                    title={`${note} - Step ${step + 1}${isRoot ? ' (Root)' : isChordTone ? ' (Chord)' : isOptionalTone ? ' (Color)' : isInScale ? ' (In-scale)' : ''}${isActive ? ` - Velocity: ${Math.round((contextMenu?.note?.velocity || 0.8) * 100)}%` : ''}${isChordStep && !isActive ? ` - Chord step (${notesAtStep.length} notes)` : ''}`}
                  >
                    {isActive && (
                      <div className={`absolute inset-0 rounded-sm animate-pulse ${isPartOfChord ? 'bg-orange-500/30' : 'bg-primary/30'}`} />
                    )}
                    {/* Show chord indicator */}
                    {isChordStep && isActive && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-sm bg-primary/40 border border-primary/70" />
          <span className="text-foreground font-semibold">Root (1)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-sm bg-secondary/40 border border-secondary/70" />
          <span className="text-foreground">Chord (3, 5, 7)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-sm bg-accent/30 border border-accent/70" />
          <span className="text-foreground">Color (2, 4, 6)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-sm bg-muted/30 border border-muted/70" />
          <span className="text-muted-foreground">In-scale</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-sm bg-card/50 border border-border" />
          <span className="text-muted-foreground">Out-of-scale</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-sm bg-orange-500 border border-orange-400" />
          <span className="text-foreground">Chord Note</span>
          <span className="inline-block w-2 h-2 bg-orange-400 rounded-full ml-1" />
        </div>
      </div>

      {/* Current step indicator */}
      {ui?.isPlaying && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Playing</span>
          </div>
          <span>•</span>
          <span>{rows} notes × {steps} steps</span>
        </div>
      )}

      {/* Context Menu for Note Properties */}
      {contextMenu && (
        <NoteContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onVelocityChange={(velocity) => handleVelocityChange(contextMenu.step, contextMenu.noteIndex, velocity)}
          onDelete={() => handleDeleteNote(contextMenu.step, contextMenu.noteIndex)}
        />
      )}
    </div>
  );
}
