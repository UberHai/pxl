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
  const stepsPerBar = ui.stepRes; // 16 = 16th notes, 8 = 8th notes, etc.
  const steps = overrideSteps || project.meta.bars * stepsPerBar;
  const stepValue = 4 / ui.stepRes; // Note value in beats (0.25 for 16th, 0.5 for 8th, etc.)
  const [beatsPerBarNumerator] = project.meta.timeSig.split('/').map(Number);
  const beatsPerBar = beatsPerBarNumerator || 4;
  const stepsPerBeat = Math.max(1, Math.round(stepsPerBar / beatsPerBar));
  
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [currentPlayingStep, setCurrentPlayingStep] = useState<number>(-1);
  const [recentlyTriggeredNotes, setRecentlyTriggeredNotes] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<number>(-1);

  // Compute highlight pitch classes for the current project key/scale
  const { chord: chordPcs, optional: optionalPcs, scale: scalePcs, rootPc } = useMemo(() => {
    const keyRoot = project.meta.key as any as typeof PITCH_CLASSES[number];
    const scale = (project.meta.scale === 'minor' ? 'minor' : 'major') as 'major' | 'minor';
    const result = computeHighlightPitchClasses(keyRoot, scale);
    console.log('🎵 Scale highlighting computed:', {
      key: keyRoot,
      scale,
      rootPc: result.rootPc,
      chordPcs: Array.from(result.chord),
      optionalPcs: Array.from(result.optional),
      scalePcs: Array.from(result.scale)
    });
    return result;
  }, [project.meta.key, project.meta.scale]);

  // Find the track
  const track = project.tracks.find(t => t.id === trackId);
  if (!track) return null;

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
      
      setActiveNotes(new Set());
      return;
    }

    // Load existing notes from clips into local state for UI
    const noteSet = new Set<string>();
    track.clips.forEach(clip => {
      clip.notes.forEach(note => {
        // Convert note time to step index based on current resolution
        const stepIndex = Math.floor(note.time / stepValue);
        const noteIndex = NOTES.indexOf(note.pitch);
        if (noteIndex !== -1 && stepIndex < steps) {
          noteSet.add(`${stepIndex}-${noteIndex}`);
        }
      });
    });
    setActiveNotes(noteSet);
  }, [track.clips, trackId, project.meta.bars, updateTrack, stepValue, steps]);

  // Track current playing position for visual feedback
  useEffect(() => {
    if (!ui.isPlaying) {
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
            
            const [numerator] = project.meta.timeSig.split('/').map(Number);
            const beatsPerBar = numerator || 4;
            
            positionInBeats = bars * beatsPerBar + beats + sixteenths / 16;
          } else {
            positionInBeats = position as number;
          }
          
          const step = Math.floor(positionInBeats / stepValue) % steps;
          setCurrentPlayingStep(step);
        } catch (error) {
          console.warn('Failed to update playing step:', error);
        }
      }
    };

    const interval = setInterval(updatePlayingStep, 50);
    return () => clearInterval(interval);
  }, [ui.isPlaying, stepValue, steps, project.meta.timeSig]);

  const handleStepClick = (step: number, noteIndex: number) => {
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
    
    // Check if note already exists
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
        const newActive = new Set(prev);
        newActive.delete(noteKey);
        return newActive;
      });
    } else {
      // Add new note
      const noteEvent: NoteEvent = {
        id: `${trackId}-${noteKey}-${Date.now()}`,
        time: noteTime,
        duration: stepValue, // Duration matches step resolution
        pitch: noteName,
        velocity: 0.8
      };

      const updatedNotes = [...clip.notes, noteEvent];
      const updatedClip = { ...clip, notes: updatedNotes };
      
      updateTrack(trackId, {
        clips: [updatedClip, ...currentClips.slice(1)]
      });
      
      setActiveNotes(prev => {
        const newActive = new Set(prev);
        newActive.add(noteKey);
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
    return activeNotes.has(`${step}-${noteIndex}`);
  };

  const stepResolutions = [
    { value: 1, label: '1/1', name: 'Whole' },
    { value: 2, label: '1/2', name: 'Half' },
    { value: 4, label: '1/4', name: 'Quarter' },
    { value: 8, label: '1/8', name: 'Eighth' },
    { value: 16, label: '1/16', name: 'Sixteenth' },
    { value: 32, label: '1/32', name: 'Thirty-second' }
  ];

  const clearPattern = () => {
    if (track.clips.length > 0) {
      const clearedClip = { ...track.clips[0], notes: [] };
      updateTrack(trackId, {
        clips: [clearedClip, ...track.clips.slice(1)]
      });
    }
  };

  return (
    <div className="pattern-grid bg-card border border-border rounded-lg p-3">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">
            {track.name} - Pattern Grid
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={clearPattern}
              className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
              title="Clear all notes"
            >
              Clear
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {rows} notes × {steps} steps ({project.meta.bars} bars)
          </p>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Step:</label>
            <select
              value={ui.stepRes}
              onChange={(e) => setStepRes(Number(e.target.value) as any)}
              className="text-xs bg-muted border border-border rounded px-2 py-1"
            >
              {stepResolutions.map(res => (
                <option key={res.value} value={res.value}>
                  {res.label} ({res.name})
                </option>
              ))}
            </select>
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
                  className={`h-4 box-border flex items-center justify-end text-xs font-mono pr-1 transition-all duration-200 cursor-pointer ${labelText} ${labelBorderTop} ${labelBg}`}
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
              <div className={`h-6 flex items-center justify-center text-[10px] font-mono border-b border-border ${
                step === currentPlayingStep
                  ? 'text-foreground font-semibold bg-primary/30 border-primary/50'
                  : step % stepsPerBar === 0
                    ? 'text-foreground font-semibold bg-accent/20'
                    : step % stepsPerBeat === 0
                      ? 'text-foreground'
                      : 'text-muted-foreground'
              }`}>
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
                
                // Determine cell styling based on state priority
                let cellClasses = 'h-4 w-full rounded-sm border box-border transition-all duration-200 relative';
                
                if (isActive) {
                  // Active notes override everything
                  cellClasses += ' bg-primary border-primary shadow-md hover:bg-primary/90';
                } else if (isRecentlyTriggered) {
                  // Recently triggered flash
                  cellClasses += ' bg-primary/80 border-primary animate-pulse';
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
                    onClick={() => handleStepClick(step, noteIndex)}
                    onMouseEnter={() => setHoveredRow(noteIndex)}
                    onMouseLeave={() => setHoveredRow(-1)}
                    className={cellClasses}
                    title={`${note} - Step ${step + 1}${isRoot ? ' (Root)' : isChordTone ? ' (Chord)' : isOptionalTone ? ' (Color)' : isInScale ? ' (In-scale)' : ''}`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/30 rounded-sm animate-pulse" />
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
      </div>

      {/* Current step indicator */}
      {ui.isPlaying && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Playing</span>
          </div>
          <span>•</span>
          <span>{rows} notes × {steps} steps</span>
        </div>
      )}
    </div>
  );
}
