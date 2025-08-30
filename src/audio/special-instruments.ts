import * as Tone from 'tone';
import { InstrumentInstance } from './instrument-types';

/**
 * PXL Chiptune Studio - Special Instruments
 * Unique and special effect instruments
 */

/**
 * Build GamePad Blip SFX instrument
 */
export function buildGamePadBlip(): InstrumentInstance {
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
 * Build Placeholder instrument (for coming soon instruments)
 */
export function buildPlaceholder(instrumentName: string): InstrumentInstance {
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
