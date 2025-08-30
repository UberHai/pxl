/**
 * PXL Chiptune Studio - Instrument Factory
 * Creates Tone.js instruments for chiptune synthesis
 */

import * as Tone from 'tone';
import { getMasterOutput } from './engine';

// Instrument interface
export interface InstrumentInstance {
  id: string;
  name: string;
  synth: Tone.ToneAudioNode;
  channel: Tone.Channel;
  trigger: (note: string, duration?: string | number, time?: number, velocity?: number) => void;
  dispose: () => void;
}

// Instrument preset definition
export interface InstrumentPreset {
  id: string;
  name: string;
  build: () => InstrumentInstance;
}

/**
 * Build Pulse Lead instrument (12.5% duty cycle)
 */
function buildPulse125(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -6 }); // -6 dB to prevent clipping

  const synth = new Tone.Synth({
    oscillator: {
      type: 'pulse',
      width: 0.125, // 12.5% duty cycle
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
    },
  });

  const filter = new Tone.Filter(800, 'lowpass');
  filter.Q.value = 1;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'pulse12',
    name: 'Pulse Lead 12.5%',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.7) => {
      try {
        if (time !== undefined) {
          // For scheduled notes, use the provided time
          synth.triggerAttackRelease(note, duration, time, velocity);
        } else {
          // For immediate playback, use current time
          synth.triggerAttackRelease(note, duration, undefined, velocity);
        }
      } catch (error) {
        console.warn('Instrument trigger failed:', error, { note, duration, time, velocity });
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
 * Build Triangle Bass instrument
 */
function buildTriangleBass(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -3 }); // Slightly louder for bass

  const synth = new Tone.Synth({
    oscillator: {
      type: 'triangle',
    },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.6,
      release: 0.4,
    },
  });

  const filter = new Tone.Filter(400, 'lowpass');
  filter.Q.value = 2;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'tri-bass',
    name: 'Triangle Bass',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.8) => {
      try {
        if (time !== undefined) {
          // For scheduled notes, use the provided time
          synth.triggerAttackRelease(note, duration, time, velocity);
        } else {
          // For immediate playback, use current time
          synth.triggerAttackRelease(note, duration, undefined, velocity);
        }
      } catch (error) {
        console.warn('Instrument trigger failed:', error, { note, duration, time, velocity });
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
 * Build Noise Kick instrument
 */
function buildNoiseKick(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -6 });

  const synth = new Tone.NoiseSynth({
    noise: {
      type: 'white',
    },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.1,
    },
  });

  const filter = new Tone.Filter(200, 'lowpass');
  filter.Q.value = 1;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'n-kick',
    name: 'Noise Kick',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 1.0) => {
      try {
        // For drums, we ignore the note and just trigger the noise
        if (time !== undefined) {
          synth.triggerAttackRelease(duration, time, velocity);
        } else {
          synth.triggerAttackRelease(duration, undefined, velocity);
        }
      } catch (error) {
        console.warn('Drum trigger failed:', error, { duration, time, velocity });
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
 * Build Simple Chord Pad (using PolySynth)
 */
function buildSimpleChords(): InstrumentInstance {
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

/**
 * Available instrument presets (Phase 1: Basic 4 instruments working)
 */
export const BASIC_INSTRUMENTS: InstrumentPreset[] = [
  { id: 'pulse12', name: 'Pulse Lead 12.5%', build: buildPulse125 },
  { id: 'tri-bass', name: 'Triangle Bass', build: buildTriangleBass },
  { id: 'n-kick', name: 'Noise Kick', build: buildNoiseKick },
  { id: 'simple-chords', name: 'Simple Chords', build: buildSimpleChords },
];

/**
 * Placeholder for coming soon instruments
 */
function buildPlaceholder(instrumentName: string): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -60 }); // Silent

  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0, decay: 0, sustain: 0, release: 0 },
  });

  synth.connect(channel);

  return {
    id: 'placeholder',
    name: instrumentName,
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.7) => {
      // Silent placeholder - no sound
      console.log(`🎵 ${instrumentName} not yet implemented`);
    },
    dispose: () => {
      synth.dispose();
      channel.dispose();
    },
  };
}

/**
 * All instrument presets (working + coming soon)
 */
export const ALL_INSTRUMENTS: InstrumentPreset[] = [
  // Working instruments
  { id: 'pulse12', name: 'Pulse Lead 12.5%', build: buildPulse125 },
  { id: 'tri-bass', name: 'Triangle Bass', build: buildTriangleBass },
  { id: 'n-kick', name: 'Noise Kick', build: buildNoiseKick },
  { id: 'simple-chords', name: 'Simple Chords', build: buildSimpleChords },

  // Coming soon (placeholder)
  { id: 'pulse25', name: 'Pulse Lead 25%', build: () => buildPlaceholder('Pulse Lead 25%') },
  { id: 'pulse50', name: 'Pulse Lead 50%', build: () => buildPlaceholder('Pulse Lead 50%') },
  { id: 'pwm', name: 'PWM Lead', build: () => buildPlaceholder('PWM Lead') },
  { id: 'sub', name: 'Sub Sine Bass', build: () => buildPlaceholder('Sub Sine Bass') },
  { id: 'n-snare', name: 'Noise Snare', build: () => buildPlaceholder('Noise Snare') },
  { id: 'n-hat', name: 'Noise Hat', build: () => buildPlaceholder('Noise Hat') },
  { id: 'arp-pluck', name: 'Chip Arp Pluck', build: () => buildPlaceholder('Chip Arp Pluck') },
  { id: 'poly-pulse', name: 'PolyPulse Chords', build: () => buildPlaceholder('PolyPulse Chords') },
  { id: 'fm-bell', name: 'FM Bell', build: () => buildPlaceholder('FM Bell') },
  { id: 'bc-saw', name: 'Bitcrushed Saw', build: () => buildPlaceholder('Bitcrushed Saw') },
  { id: 'chip-organ', name: 'Chip Organ', build: () => buildPlaceholder('Chip Organ') },
  { id: 'sfx-blip', name: 'GamePad Blip', build: () => buildPlaceholder('GamePad Blip') },
];

/**
 * Create an instrument instance by ID
 */
export function createInstrument(instrumentId: string): InstrumentInstance | null {
  const preset = ALL_INSTRUMENTS.find(inst => inst.id === instrumentId);
  if (!preset) return null;

  const instance = preset.build();

  // Connect to master output
  try {
    instance.channel.connect(getMasterOutput());
  } catch (error) {
    console.warn('Master output not ready, instrument created but not connected:', error);
  }

  return instance;
}

/**
 * Test function to trigger a note on any instrument
 * Used for development/testing
 */
export function testInstrument(instrumentId: string, note = 'C4'): void {
  const preset = ALL_INSTRUMENTS.find(inst => inst.id === instrumentId);
  if (!preset) {
    console.warn(`Instrument ${instrumentId} not found`);
    return;
  }

  const instance = createInstrument(instrumentId);
  if (instance) {
    instance.trigger(note);
    // Clean up after test
    setTimeout(() => instance.dispose(), 1000);
  }
}
