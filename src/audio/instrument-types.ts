import * as Tone from 'tone';

/**
 * PXL Chiptune Studio - Instrument Types
 * Type definitions for the instrument system
 */

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
