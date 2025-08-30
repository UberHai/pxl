import * as Tone from 'tone';
import { InstrumentInstance } from './instrument-types';

/**
 * PXL Chiptune Studio - Percussion Instruments
 * Noise-based percussion and drum synthesis
 */

/**
 * Build Noise Kick instrument
 */
export function buildNoiseKick(): InstrumentInstance {
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
export function buildNoiseSnare(): InstrumentInstance {
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
export function buildNoiseHat(): InstrumentInstance {
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
 * Build Noise Crash instrument (Long noise burst for impacts)
 */
export function buildNoiseCrash(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -6 });

  const synth = new Tone.NoiseSynth({
    noise: {
      type: 'pink', // Pink noise for smoother crash
    },
    envelope: {
      attack: 0.002,
      decay: 1.2,
      sustain: 0.1,
      release: 0.8,
    },
  });

  // Band-pass filter for crash character
  const filter = new Tone.Filter(600, 'bandpass');
  filter.Q.value = 3;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'n-crash',
    name: 'Noise Crash',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '2n', time?: number, velocity = 0.8) => {
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
