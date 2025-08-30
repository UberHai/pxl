import * as Tone from 'tone';
import { InstrumentInstance, InstrumentPreset } from './instrument-types';

// Import all instrument builders
import { buildPulse125, buildPulse25, buildPulse50, buildPWMLead } from './pulse-instruments';
import {
  buildTriangleBass,
  buildSubSineBass,
  buildSquareBass,
  buildFMBass
} from './bass-instruments';
import {
  buildNoiseKick,
  buildNoiseSnare,
  buildNoiseHat,
  buildNoiseCrash
} from './percussion-instruments';
import {
  buildChipArpPluck,
  buildFMBell,
  buildBitcrushedSaw,
  buildChipOrgan,
  buildWavetableLead,
  buildRingModLead,
  buildDetunedPulse,
  buildChebyshevLead,
  buildAMSynth,
  buildDigitalGlitch,
  buildResonantSweep,
  buildAdditiveBell,
  buildVibratoLead,
  buildArpeggioBass,
  buildDutyCycleSweep
} from './lead-instruments';
import { buildGamePadBlip, buildPlaceholder } from './special-instruments';
import { buildPolyPulseChords, buildSimpleChords } from './chord-instruments';
import { getMasterOutput } from './engine';

/**
 * PXL Chiptune Studio - Instrument Registry
 * Central registry of all instrument presets and utilities
 */

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
 * All instrument presets (working + coming soon)
 */
export const ALL_INSTRUMENTS: InstrumentPreset[] = [
  // ✅ COMPLETE INSTRUMENT LIBRARY - All 29 instruments working!

  // Pulse Family
  { id: 'pulse12', name: 'Pulse Lead 12.5%', build: buildPulse125 },
  { id: 'pulse25', name: 'Pulse Lead 25%', build: buildPulse25 },
  { id: 'pulse50', name: 'Pulse Lead 50%', build: buildPulse50 },
  { id: 'pwm', name: 'PWM Lead', build: buildPWMLead },

  // Bass Section
  { id: 'tri-bass', name: 'Triangle Bass', build: buildTriangleBass },
  { id: 'sub', name: 'Sub Sine Bass', build: buildSubSineBass },
  { id: 'square-bass', name: 'Square Bass', build: buildSquareBass },
  { id: 'fm-bass', name: 'FM Bass', build: buildFMBass },

  // Percussion Kit
  { id: 'n-kick', name: 'Noise Kick', build: buildNoiseKick },
  { id: 'n-snare', name: 'Noise Snare', build: buildNoiseSnare },
  { id: 'n-hat', name: 'Noise Hat', build: buildNoiseHat },
  { id: 'n-crash', name: 'Noise Crash', build: buildNoiseCrash },

  // Lead/Melodic
  { id: 'arp-pluck', name: 'Chip Arp Pluck', build: buildChipArpPluck },
  { id: 'fm-bell', name: 'FM Bell', build: buildFMBell },
  { id: 'bc-saw', name: 'Bitcrushed Saw', build: buildBitcrushedSaw },
  { id: 'chip-organ', name: 'Chip Organ', build: buildChipOrgan },
  { id: 'wavetable', name: 'Wavetable Lead', build: buildWavetableLead },
  { id: 'ring-mod', name: 'Ring Mod Lead', build: buildRingModLead },
  { id: 'detuned-pulse', name: 'Detuned Pulse', build: buildDetunedPulse },
  { id: 'cheby-lead', name: 'Chebyshev Lead', build: buildChebyshevLead },
  { id: 'am-synth', name: 'AM Synth', build: buildAMSynth },
  { id: 'digital-glitch', name: 'Digital Glitch', build: buildDigitalGlitch },
  { id: 'res-sweep', name: 'Resonant Sweep', build: buildResonantSweep },
  { id: 'additive-bell', name: 'Additive Bell', build: buildAdditiveBell },
  { id: 'vibrato-lead', name: 'Vibrato Lead', build: buildVibratoLead },
  { id: 'arp-bass', name: 'Arpeggio Bass', build: buildArpeggioBass },
  { id: 'duty-sweep', name: 'Duty Cycle Sweep', build: buildDutyCycleSweep },

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
