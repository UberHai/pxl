import * as Tone from 'tone';
import { InstrumentInstance } from './instrument-types';

/**
 * PXL Chiptune Studio - Bass Instruments
 * Bass synthesis instruments for low-end frequencies
 */

/**
 * Build Triangle Bass instrument
 */
export function buildTriangleBass(): InstrumentInstance {
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
export function buildSubSineBass(): InstrumentInstance {
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
 * Build 8-Bit Square Bass instrument (Heavy square wave bass)
 */
export function buildSquareBass(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -4 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'square', // Classic square wave for heavy bass
    },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.7,
      release: 0.4,
    },
  });

  const filter = new Tone.Filter(300, 'lowpass');
  filter.Q.value = 2.5;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'square-bass',
    name: 'Square Bass',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '4n', time?: number, velocity = 0.8) => {
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
 * Build FM Bass instrument (FM synthesis for deep bass)
 */
export function buildFMBass(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -3 });

  const synth = new Tone.FMSynth({
    harmonicity: 1.5,
    modulationIndex: 8,
    oscillator: {
      type: 'sine',
    },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.8,
      release: 0.5,
    },
    modulation: {
      type: 'sine',
    },
    modulationEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.3,
      release: 0.4,
    },
  });

  const filter = new Tone.Filter(200, 'lowpass');
  filter.Q.value = 2;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'fm-bass',
    name: 'FM Bass',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '4n', time?: number, velocity = 0.9) => {
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
