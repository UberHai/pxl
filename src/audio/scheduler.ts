/**
 * PXL Chiptune Studio - Audio Scheduler
 * Handles scheduling and playback of musical notes and patterns
 */

import * as Tone from 'tone';
import { getMasterOutput } from './engine';
import { createInstrument, type InstrumentInstance } from './instruments';
import { Project, NoteEvent, Clip } from '@/types/song';

// Active instruments and scheduled events
let activeInstruments = new Map<string, InstrumentInstance>();
let scheduledEvents = new Map<string, Tone.Part | Tone.Sequence | number[]>();
let metronomeLoop: Tone.Loop | null = null;

// Keep track of the current project for length calculations
let currentProject: Project | null = null;

/**
 * Initialize scheduler with project data
 */
export function initializeScheduler(project: Project, loopEnabled: boolean = true): void {
  currentProject = project;
  // Clear existing scheduled events
  clearScheduler();

  // Create instruments for all tracks
  project.tracks.forEach(track => {
    const instrument = createInstrument(track.instrumentId);
    if (instrument) {
      // Set track volume and pan
      instrument.channel.volume.value = track.volume;
      instrument.channel.pan.value = track.pan;

      // Connect to master output
      try {
        instrument.channel.connect(getMasterOutput());
      } catch (error) {
        console.warn('Failed to connect instrument to master output:', error);
      }

      activeInstruments.set(track.id, instrument);

      // Schedule notes for this track
      if (track.clips.length > 0) {
        scheduleTrack(track.id, track.clips, instrument, loopEnabled);
      }
    }
  });
}

/**
 * Apply swing timing to a note time
 */
function applySwing(noteTime: number, swingAmount: number): number {
  if (swingAmount === 0) return noteTime;
  
  // Swing affects off-beat 16th notes (positions 1 and 3 within each beat)
  const beatPosition = noteTime % 1; // Get position within the beat (0-1)
  const sixteenthPosition = Math.round(beatPosition * 4); // Get 16th note position (0-3)
  
  // Apply swing to off-beat 16th notes (positions 1 and 3)
  if (sixteenthPosition === 1 || sixteenthPosition === 3) {
    // Swing delays off-beat notes by a percentage
    // 0% swing = straight, 100% swing = triplet feel
    const swingDelay = (swingAmount * 0.167); // Max delay of 1/6 beat (triplet feel)
    return noteTime + swingDelay;
  }
  
  return noteTime;
}

/**
 * Schedule all notes for a track
 */
function scheduleTrack(trackId: string, clips: Clip[], instrument: InstrumentInstance, loopEnabled: boolean = true): void {
  if (!currentProject) return;

  const swingAmount = currentProject.meta.swing || 0;
  const [beatsPerBar] = currentProject.meta.timeSig.split('/').map(Number);

  // helpers
  const beatsToBBQ = (totalBeats: number): string => {
    const bars = Math.floor(totalBeats / beatsPerBar);
    const beats = Math.floor(totalBeats % beatsPerBar);
    const sixteenths = Math.round((totalBeats - Math.floor(totalBeats)) * 4);
    return `${bars}:${beats}:${sixteenths}`;
  };
  const beatsToSixteenths = (beats: number): number => {
    return Math.max(1, Math.round(beats * 4));
  };

  type ScheduledEvent = { timeBBQ: string; note: NoteEvent; durBBQ: string };
  const events: ScheduledEvent[] = [];

  clips.forEach((clip) => {
    if (clip.muted) return;
    clip.notes.forEach((note) => {
      const swungBeats = applySwing(clip.start + note.time, swingAmount);
      const timeBBQ = beatsToBBQ(swungBeats);
      const durSixteenths = beatsToSixteenths(note.duration);
      const durBBQ = `0:0:${durSixteenths}`;
      events.push({ timeBBQ, note, durBBQ });
    });
  });

  // Sort by transport ticks (ensures increasing order)
  events.sort((a, b) => Tone.Time(a.timeBBQ).toTicks() - Tone.Time(b.timeBBQ).toTicks());

  const part = new Tone.Part((time, ev: ScheduledEvent) => {
    try {
      instrument.trigger(
        ev.note.pitch,
        ev.durBBQ,
        time,
        ev.note.velocity
      );
    } catch (error) {
      console.warn('Failed to trigger note:', error, { pitch: ev.note.pitch, time, dur: ev.durBBQ });
    }
  }, events.map((ev) => [ev.timeBBQ, ev] as any));

  part.loop = loopEnabled;
  if (loopEnabled) {
    part.loopEnd = `${currentProject.meta.bars}:0:0`;
  }

  part.start(0);
  scheduledEvents.set(trackId, part);
}

/**
 * Calculate total project length in beats
 */
function calculateProjectLengthBBQ(project?: Project): string {
  if (project) {
    return `${project.meta.bars}:0:0`;
  }
  return `4:0:0`;
}

/**
 * Start playback of all scheduled events
 */
export function startPlayback(): void {
  scheduledEvents.forEach(event => {
    if (event instanceof Tone.Part || event instanceof Tone.Sequence) {
      if (!event.state || event.state === 'stopped') {
        event.start(0);
      }
    }
  });
}

/**
 * Stop playback of all scheduled events
 */
export function stopPlayback(): void {
  scheduledEvents.forEach(event => {
    if (event instanceof Tone.Part || event instanceof Tone.Sequence) {
      try {
        // Use current time or immediate stop to avoid negative time values
        if (event.state === 'started') {
          event.stop();
        }
      } catch (error) {
        console.warn('Failed to stop scheduled event:', error);
        // Try immediate stop as fallback
        try {
          event.stop();
        } catch (fallbackError) {
          console.warn('Fallback stop also failed:', fallbackError);
        }
      }
    }
    // Individual scheduled events will stop automatically when transport stops
  });
}

/**
 * Update BPM for all scheduled events
 */
export function updateBPM(bpm: number): void {
  Tone.Transport.bpm.value = bpm;
  // Parts are in transport time; no need to rebuild for BPM changes
}

/**
 * Update loop state for all scheduled events
 */
export function updateLoopState(loopEnabled: boolean): void {
  scheduledEvents.forEach(part => {
    if (part instanceof Tone.Part || part instanceof Tone.Sequence) {
      part.loop = loopEnabled;
      if (loopEnabled) {
        part.loopEnd = calculateProjectLengthBBQ(currentProject || undefined);
      }
    }
  });
}

/**
 * Update time signature
 */
export function updateTimeSignature(timeSig: string): void {
  const [numerator, denominator] = timeSig.split('/').map(Number);
  if (numerator && denominator) {
    Tone.Transport.timeSignature = [numerator, denominator];
  }
}

/**
 * Update swing amount - requires rescheduling all tracks
 */
export function updateSwing(swingAmount: number): void {
  if (currentProject) {
    currentProject.meta.swing = swingAmount;
    // Reschedule all tracks to apply new swing
    initializeScheduler(currentProject, true);
  }
}

/**
 * Add a single note to a track (for real-time input)
 */
export function addNote(trackId: string, note: NoteEvent): void {
  const instrument = activeInstruments.get(trackId);
  if (!instrument) {
    console.warn('No instrument found for track:', trackId);
    return;
  }

  // For immediate playback (when clicking notes), just trigger immediately
  if (Tone.Transport.state !== 'started') {
    try {
      instrument.trigger(
        note.pitch,
        `0:0:${Math.max(1, Math.round(note.duration * 4))}`,
        undefined, // Immediate playback
        note.velocity
      );
    } catch (error) {
      console.warn('Failed to trigger immediate note:', error);
    }
    return;
  }

  // For scheduled playback during transport, use proper timing
  try {
    const scheduleTime: any = "+0.02"; // small safety delay in transport time
    const scheduledEventId: any = Tone.Transport.scheduleOnce((time: number) => {
      try {
        instrument.trigger(
          note.pitch,
          `0:0:${Math.max(1, Math.round(note.duration * 4))}`,
          time,
          note.velocity
        );
      } catch (error) {
        console.warn('Failed to trigger scheduled note:', error);
      }
    }, scheduleTime);

    // Store the scheduled event for cleanup if needed
    if (!scheduledEvents.has(trackId)) {
      scheduledEvents.set(trackId, []);
    }
    const trackEvents = scheduledEvents.get(trackId);
    if (Array.isArray(trackEvents)) {
      trackEvents.push(scheduledEventId as number);
    }
  } catch (error) {
    console.warn('Failed to schedule note:', error);
  }
}

/**
 * Remove a note from a track
 */
export function removeNote(trackId: string, noteTime: number, notePitch: string): void {
  // This would need to be implemented with Tone.Transport.clear()
  // For now, we'll need to reschedule the entire track
  console.log('Note removal not fully implemented yet');
}

/**
 * Update instrument for a track
 */
export function updateTrackInstrument(trackId: string, instrumentId: string): void {
  // Dispose old instrument
  const oldInstrument = activeInstruments.get(trackId);
  if (oldInstrument) {
    oldInstrument.dispose();
    activeInstruments.delete(trackId);
  }

  // Stop and remove old scheduled events
  const oldEvent = scheduledEvents.get(trackId);
  if (oldEvent) {
    if (oldEvent instanceof Tone.Part || oldEvent instanceof Tone.Sequence) {
      oldEvent.stop();
      oldEvent.dispose();
    } else if (Array.isArray(oldEvent)) {
      oldEvent.forEach(eventId => {
        Tone.Transport.clear(eventId);
      });
    }
    scheduledEvents.delete(trackId);
  }

  // Create new instrument
  const newInstrument = createInstrument(instrumentId);
  if (newInstrument) {
    activeInstruments.set(trackId, newInstrument);
    // Note: clips would need to be passed to reschedule the track
  }
}

/**
 * Update track volume
 */
export function updateTrackVolume(trackId: string, volume: number): void {
  const instrument = activeInstruments.get(trackId);
  if (instrument) {
    (instrument.channel.volume as any).value = volume;
  }
}

/**
 * Update track pan
 */
export function updateTrackPan(trackId: string, pan: number): void {
  const instrument = activeInstruments.get(trackId);
  if (instrument) {
    (instrument.channel.pan as any).value = pan;
  }
}

/**
 * Clear all scheduled events and dispose instruments
 */
export function clearScheduler(): void {
  // Stop and dispose all scheduled events
  scheduledEvents.forEach(event => {
    if (event instanceof Tone.Part || event instanceof Tone.Sequence) {
      // Handle Tone.js scheduled parts/sequences
      event.stop();
      event.dispose();
    } else if (Array.isArray(event)) {
      // Handle individual scheduled event IDs
      event.forEach(eventId => {
        Tone.Transport.clear(eventId);
      });
    }
  });
  scheduledEvents.clear();

  // Dispose all instruments
  activeInstruments.forEach(instrument => {
    instrument.dispose();
  });
  activeInstruments.clear();
}

/**
 * Get current playback position
 */
export function getPlaybackPosition(): number {
  return Tone.Transport.position as number;
}

/**
 * Get transport state
 */
export function getSchedulerState(): 'started' | 'stopped' | 'paused' {
  return Tone.Transport.state as 'started' | 'stopped' | 'paused';
}

/**
 * Enable/disable metronome
 */
export function setMetronomeEnabled(enabled: boolean): void {
  if (enabled) {
    enableMetronome();
  } else {
    disableMetronome();
  }
}

/**
 * Create and start metronome loop
 */
function enableMetronome(): void {
  if (metronomeLoop) {
    disableMetronome();
  }

  // Create a simple click sound using MembraneSynth (like a drum)
  const clickSynth = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.1
    }
  });

  // Only connect to master output if audio is initialized
  try {
    clickSynth.connect(getMasterOutput());
  } catch (error) {
    console.warn('Master output not ready for metronome, connecting to destination:', error);
    clickSynth.toDestination();
  }

  // Determine interval based on current time signature (default to 4/4)
  const [numerator, denominator] = (currentProject?.meta.timeSig || '4/4')
    .split('/')
    .map((n) => Number(n) || 0);
  const intervalNote = `${denominator || 4}n`;

  // Create metronome loop
  metronomeLoop = new Tone.Loop((time) => {
    // Parse BBQ position for accurate downbeat detection
    const pos = Tone.Transport.position as unknown as string;
    let beats = 0;
    let sixteenths = 0;
    try {
      const parts = String(pos).split(':').map((p) => Number(p) || 0);
      // parts: [bars, beats, sixteenths]
      beats = parts[1] || 0;
      sixteenths = parts[2] || 0;
    } catch {}

    const beatsPerBar = numerator || 4;
    const isDownBeat = beats % beatsPerBar === 0 && sixteenths === 0;
    const frequency = isDownBeat ? 1000 : 800;

    clickSynth.triggerAttackRelease(frequency, '32n', time);
  }, intervalNote);

  metronomeLoop.start(0);
}

/**
 * Stop and dispose metronome
 */
function disableMetronome(): void {
  if (metronomeLoop) {
    metronomeLoop.stop();
    metronomeLoop.dispose();
    metronomeLoop = null;
  }
}

/**
 * Update metronome timing when BPM or time signature changes
 */
export function updateMetronomeTiming(bpm: number, timeSig: string): void {
  if (metronomeLoop) {
    // Update loop interval based on time signature denominator
    const [, denominator] = timeSig.split('/').map(Number);
    const interval = `${denominator || 4}n`;
    metronomeLoop.interval = interval;
  }
}
