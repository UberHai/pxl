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
 * Build Pulse Lead instrument (25% duty cycle)
 */
function buildPulse25(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -6 }); // -6 dB to prevent clipping

  const synth = new Tone.Synth({
    oscillator: {
      type: 'pulse',
      width: 0.25, // 25% duty cycle - fuller sound than 12.5%
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
    },
  });

  const filter = new Tone.Filter(1000, 'lowpass'); // Slightly higher cutoff than 12.5%
  filter.Q.value = 1.2;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'pulse25',
    name: 'Pulse Lead 25%',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.7) => {
      try {
        if (time !== undefined) {
          synth.triggerAttackRelease(note, duration, time, velocity);
        } else {
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
 * Build Pulse Lead instrument (50% duty cycle - Square Wave)
 */
function buildPulse50(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -6 }); // -6 dB to prevent clipping

  const synth = new Tone.Synth({
    oscillator: {
      type: 'pulse',
      width: 0.5, // 50% duty cycle = square wave - classic chiptune sound
    },
    envelope: {
      attack: 0.01,
      decay: 0.12,
      sustain: 0.75,
      release: 0.25,
    },
  });

  const filter = new Tone.Filter(1200, 'lowpass'); // Brighter than 25%
  filter.Q.value = 1.5;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'pulse50',
    name: 'Pulse Lead 50%',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.7) => {
      try {
        if (time !== undefined) {
          synth.triggerAttackRelease(note, duration, time, velocity);
        } else {
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
 * Build PWM Lead instrument (Pulse Width Modulation)
 */
function buildPWMLead(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -6 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'pulse',
      width: 0.35, // Fixed width for now - creates nice PWM-like character
    },
    envelope: {
      attack: 0.02,
      decay: 0.15,
      sustain: 0.7,
      release: 0.3,
    },
  });

  const filter = new Tone.Filter(1400, 'lowpass');
  filter.Q.value = 2;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'pwm',
    name: 'PWM Lead',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.7) => {
      try {
        if (time !== undefined) {
          synth.triggerAttackRelease(note, duration, time, velocity);
        } else {
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
 * Build Sub Sine Bass instrument (Deep sub-bass frequencies)
 */
function buildSubSineBass(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -1 }); // Louder for sub-bass impact

  const synth = new Tone.Synth({
    oscillator: {
      type: 'sine', // Pure sine wave for clean sub-bass
    },
    envelope: {
      attack: 0.02,
      decay: 0.4,
      sustain: 0.8,
      release: 0.6,
    },
  });

  // High-pass filter to remove DC offset, low-pass to focus on sub frequencies
  const highPass = new Tone.Filter(30, 'highpass');
  const lowPass = new Tone.Filter(120, 'lowpass'); // Focus on sub-bass range
  lowPass.Q.value = 3;

  synth.connect(highPass);
  highPass.connect(lowPass);
  lowPass.connect(channel);

  return {
    id: 'sub',
    name: 'Sub Sine Bass',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.9) => {
      try {
        if (time !== undefined) {
          synth.triggerAttackRelease(note, duration, time, velocity);
        } else {
          synth.triggerAttackRelease(note, duration, undefined, velocity);
        }
      } catch (error) {
        console.warn('Instrument trigger failed:', error, { note, duration, time, velocity });
      }
    },
    dispose: () => {
      synth.dispose();
      highPass.dispose();
      lowPass.dispose();
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
 * Build Noise Snare instrument
 */
function buildNoiseSnare(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -4 });

  const synth = new Tone.NoiseSynth({
    noise: {
      type: 'white',
    },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.1,
      release: 0.2,
    },
  });

  // Band-pass filter for snare character (200-2000Hz)
  const filter = new Tone.Filter(800, 'bandpass');
  filter.Q.value = 4;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'n-snare',
    name: 'Noise Snare',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.9) => {
      try {
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
 * Build Noise Hat instrument
 */
function buildNoiseHat(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -8 });

  const synth = new Tone.NoiseSynth({
    noise: {
      type: 'white',
    },
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0,
      release: 0.05,
    },
  });

  // High-pass filter for hat character (4000Hz+)
  const filter = new Tone.Filter(4000, 'highpass');
  filter.Q.value = 2;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'n-hat',
    name: 'Noise Hat',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '16n', time?: number, velocity = 0.7) => {
      try {
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
 * Build Chip Arp Pluck instrument (Fast envelope pulse)
 */
function buildChipArpPluck(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -5 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'pulse',
      width: 0.2, // Thin pulse for pluck character
    },
    envelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0.1,
      release: 0.15,
    },
  });

  const filter = new Tone.Filter(2000, 'lowpass');
  filter.Q.value = 3;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'arp-pluck',
    name: 'Chip Arp Pluck',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '16n', time?: number, velocity = 0.8) => {
      try {
        if (time !== undefined) {
          synth.triggerAttackRelease(note, duration, time, velocity);
        } else {
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
 * Build FM Bell instrument (2-operator FM synthesis)
 */
function buildFMBell(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -7 });

  const synth = new Tone.FMSynth({
    harmonicity: 3.01, // Slightly detuned for bell character
    modulationIndex: 10,
    oscillator: {
      type: 'sine',
    },
    envelope: {
      attack: 0.01,
      decay: 0.4,
      sustain: 0.3,
      release: 1.2,
    },
    modulation: {
      type: 'sine',
    },
    modulationEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.1,
      release: 0.8,
    },
  });

  const filter = new Tone.Filter(3000, 'lowpass');
  filter.Q.value = 1;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'fm-bell',
    name: 'FM Bell',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '4n', time?: number, velocity = 0.6) => {
      try {
        if (time !== undefined) {
          synth.triggerAttackRelease(note, duration, time, velocity);
        } else {
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
 * Build Bitcrushed Saw Lead instrument
 */
function buildBitcrushedSaw(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -8 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'sawtooth',
    },
    envelope: {
      attack: 0.02,
      decay: 0.2,
      sustain: 0.6,
      release: 0.4,
    },
  });

  // Bitcrusher for lo-fi digital distortion
  const bitCrusher = new Tone.BitCrusher(4); // 4-bit crushing
  const filter = new Tone.Filter(1800, 'lowpass');
  filter.Q.value = 2;

  synth.connect(bitCrusher);
  bitCrusher.connect(filter);
  filter.connect(channel);

  return {
    id: 'bc-saw',
    name: 'Bitcrushed Saw',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.7) => {
      try {
        if (time !== undefined) {
          synth.triggerAttackRelease(note, duration, time, velocity);
        } else {
          synth.triggerAttackRelease(note, duration, undefined, velocity);
        }
      } catch (error) {
        console.warn('Instrument trigger failed:', error, { note, duration, time, velocity });
      }
    },
    dispose: () => {
      synth.dispose();
      bitCrusher.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build Chip Organ instrument (Additive synthesis)
 */
function buildChipOrgan(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -10 });

  // Create multiple oscillators for additive synthesis
  const fundamental = new Tone.Oscillator(440, 'sine');
  const harmonic2 = new Tone.Oscillator(880, 'sine'); // Octave
  const harmonic3 = new Tone.Oscillator(1320, 'sine'); // Perfect fifth
  const harmonic4 = new Tone.Oscillator(1760, 'sine'); // Double octave

  // Gain nodes for mixing harmonics
  const fundamentalGain = new Tone.Gain(0.8);
  const harmonic2Gain = new Tone.Gain(0.4);
  const harmonic3Gain = new Tone.Gain(0.2);
  const harmonic4Gain = new Tone.Gain(0.1);

  // Envelope for the entire organ sound
  const envelope = new Tone.AmplitudeEnvelope({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.8,
    release: 0.5,
  });

  // Connect oscillators to gains
  fundamental.connect(fundamentalGain);
  harmonic2.connect(harmonic2Gain);
  harmonic3.connect(harmonic3Gain);
  harmonic4.connect(harmonic4Gain);

  // Mix all harmonics
  const mixer = new Tone.Gain(0.25);
  fundamentalGain.connect(mixer);
  harmonic2Gain.connect(mixer);
  harmonic3Gain.connect(mixer);
  harmonic4Gain.connect(mixer);

  // Apply envelope and filter
  mixer.connect(envelope);
  const filter = new Tone.Filter(2000, 'lowpass');
  filter.Q.value = 1;
  envelope.connect(filter);
  filter.connect(channel);

  return {
    id: 'chip-organ',
    name: 'Chip Organ',
    synth: fundamental, // Use fundamental as main synth reference
    channel,
    trigger: (note: string, duration: string | number = '2n', time?: number, velocity = 0.6) => {
      try {
        const freq = Tone.Frequency(note).toFrequency();
        
        // Set all oscillator frequencies
        fundamental.frequency.setValueAtTime(freq, time || Tone.now());
        harmonic2.frequency.setValueAtTime(freq * 2, time || Tone.now());
        harmonic3.frequency.setValueAtTime(freq * 3, time || Tone.now());
        harmonic4.frequency.setValueAtTime(freq * 4, time || Tone.now());

        // Start oscillators and trigger envelope
        const startTime = time || Tone.now();
        fundamental.start(startTime);
        harmonic2.start(startTime);
        harmonic3.start(startTime);
        harmonic4.start(startTime);
        
        envelope.triggerAttackRelease(duration, startTime, velocity);
        
        // Stop oscillators after duration
        const stopTime = startTime + Tone.Time(duration).toSeconds();
        fundamental.stop(stopTime);
        harmonic2.stop(stopTime);
        harmonic3.stop(stopTime);
        harmonic4.stop(stopTime);
      } catch (error) {
        console.warn('Instrument trigger failed:', error, { note, duration, time, velocity });
      }
    },
    dispose: () => {
      fundamental.dispose();
      harmonic2.dispose();
      harmonic3.dispose();
      harmonic4.dispose();
      fundamentalGain.dispose();
      harmonic2Gain.dispose();
      harmonic3Gain.dispose();
      harmonic4Gain.dispose();
      envelope.dispose();
      mixer.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build GamePad Blip SFX instrument
 */
function buildGamePadBlip(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -6 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'pulse',
      width: 0.1, // Very thin pulse for blip character
    },
    envelope: {
      attack: 0.001,
      decay: 0.03,
      sustain: 0,
      release: 0.02,
    },
  });

  const filter = new Tone.Filter(3000, 'lowpass');
  filter.Q.value = 5; // Sharp filter for SFX character

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'sfx-blip',
    name: 'GamePad Blip',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '32n', time?: number, velocity = 0.9) => {
      try {
        if (time !== undefined) {
          synth.triggerAttackRelease(note, duration, time, velocity);
        } else {
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
 * Build PolyPulse Chords instrument (Enhanced chord capabilities)
 */
function buildPolyPulseChords(): InstrumentInstance {
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
 * Core instrument presets (Essential chiptune sounds for quick testing)
 */
export const BASIC_INSTRUMENTS: InstrumentPreset[] = [
  { id: 'pulse12', name: 'Pulse Lead 12.5%', build: buildPulse125 },
  { id: 'pulse25', name: 'Pulse Lead 25%', build: buildPulse25 },
  { id: 'pulse50', name: 'Pulse Lead 50%', build: buildPulse50 },
  { id: 'pwm', name: 'PWM Lead', build: buildPWMLead },
  { id: 'tri-bass', name: 'Triangle Bass', build: buildTriangleBass },
  { id: 'sub', name: 'Sub Sine Bass', build: buildSubSineBass },
  { id: 'n-kick', name: 'Noise Kick', build: buildNoiseKick },
  { id: 'n-snare', name: 'Noise Snare', build: buildNoiseSnare },
  { id: 'n-hat', name: 'Noise Hat', build: buildNoiseHat },
  { id: 'arp-pluck', name: 'Chip Arp Pluck', build: buildChipArpPluck },
  { id: 'fm-bell', name: 'FM Bell', build: buildFMBell },
  { id: 'bc-saw', name: 'Bitcrushed Saw', build: buildBitcrushedSaw },
  { id: 'chip-organ', name: 'Chip Organ', build: buildChipOrgan },
  { id: 'sfx-blip', name: 'GamePad Blip', build: buildGamePadBlip },
  { id: 'poly-pulse', name: 'PolyPulse Chords', build: buildPolyPulseChords },
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
  // ✅ COMPLETE INSTRUMENT LIBRARY - All 16 instruments working!
  
  // Pulse Family
  { id: 'pulse12', name: 'Pulse Lead 12.5%', build: buildPulse125 },
  { id: 'pulse25', name: 'Pulse Lead 25%', build: buildPulse25 },
  { id: 'pulse50', name: 'Pulse Lead 50%', build: buildPulse50 },
  { id: 'pwm', name: 'PWM Lead', build: buildPWMLead },
  
  // Bass Section
  { id: 'tri-bass', name: 'Triangle Bass', build: buildTriangleBass },
  { id: 'sub', name: 'Sub Sine Bass', build: buildSubSineBass },
  
  // Percussion Kit
  { id: 'n-kick', name: 'Noise Kick', build: buildNoiseKick },
  { id: 'n-snare', name: 'Noise Snare', build: buildNoiseSnare },
  { id: 'n-hat', name: 'Noise Hat', build: buildNoiseHat },
  
  // Lead/Melodic
  { id: 'arp-pluck', name: 'Chip Arp Pluck', build: buildChipArpPluck },
  { id: 'fm-bell', name: 'FM Bell', build: buildFMBell },
  { id: 'bc-saw', name: 'Bitcrushed Saw', build: buildBitcrushedSaw },
  { id: 'chip-organ', name: 'Chip Organ', build: buildChipOrgan },
  
  // Special
  { id: 'sfx-blip', name: 'GamePad Blip', build: buildGamePadBlip },
  
  // Chords
  { id: 'poly-pulse', name: 'PolyPulse Chords', build: buildPolyPulseChords },
  { id: 'simple-chords', name: 'Simple Chords', build: buildSimpleChords },
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
