import * as Tone from 'tone';
import { InstrumentInstance } from './instrument-types';

/**
 * PXL Chiptune Studio - Chord Instruments
 * Chord-based and polyphonic instruments
 */

/**
 * Build PolyPulse Chords instrument (Enhanced chord capabilities)
 */
export function buildPolyPulseChords(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -12 }); // Very quiet for background

  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'pulse',
      width: 0.3,
    },
    envelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.8,
      release: 0.8,
    },
  });

  const filter = new Tone.Filter(800, 'lowpass');
  filter.Q.value = 1.5;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'poly-pulse',
    name: 'PolyPulse Chords',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '2n', time?: number, velocity = 0.4) => {
      try {
        if (Array.isArray(note)) {
          if (time !== undefined) {
            synth.triggerAttackRelease(note, duration, time, velocity);
          } else {
            synth.triggerAttackRelease(note, duration, undefined, velocity);
          }
        } else {
          if (time !== undefined) {
            synth.triggerAttackRelease(note, duration, time, velocity);
          } else {
            synth.triggerAttackRelease(note, duration, undefined, velocity);
          }
        }
      } catch (error) {
        console.warn('Chord trigger failed:', error, { note, duration, time, velocity });
      }
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build Simple Chord Pad instrument (using PolySynth)
 */
export function buildSimpleChords(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -9 }); // Softer for background chords

  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'sawtooth',
    },
    envelope: {
      attack: 0.1,
      decay: 0.3,
      sustain: 0.7,
      release: 1.0,
    },
  });

  const filter = new Tone.Filter(600, 'lowpass');
  filter.Q.value = 1;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'simple-chords',
    name: 'Simple Chords',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '2n', time?: number, velocity = 0.5) => {
      try {
        // For chords, expect note to be a chord name like "C4" or array of notes
        if (Array.isArray(note)) {
          if (time !== undefined) {
            synth.triggerAttackRelease(note, duration, time, velocity);
          } else {
            synth.triggerAttackRelease(note, duration, undefined, velocity);
          }
        } else {
          if (time !== undefined) {
            synth.triggerAttackRelease(note, duration, time, velocity);
          } else {
            synth.triggerAttackRelease(note, duration, undefined, velocity);
          }
        }
      } catch (error) {
        console.warn('Chord trigger failed:', error, { note, duration, time, velocity });
      }
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}
