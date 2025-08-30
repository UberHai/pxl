import * as Tone from 'tone';
import { InstrumentInstance } from './instrument-types';

/**
 * PXL Chiptune Studio - Pulse Wave Instruments
 * Pulse wave synthesis instruments for chiptune leads
 */

/**
 * Build Pulse Lead instrument (12.5% duty cycle)
 */
export function buildPulse125(): InstrumentInstance {
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
export function buildPulse25(): InstrumentInstance {
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
export function buildPulse50(): InstrumentInstance {
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
export function buildPWMLead(): InstrumentInstance {
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
