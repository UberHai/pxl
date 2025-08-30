/**
 * PXL Chiptune Studio - Instrument Factory
 * Creates Tone.js instruments for chiptune synthesis
 *
 * This file now serves as the main entry point, re-exporting all instrument functionality
 * from the modular structure for backward compatibility.
 */

// Re-export types
export type { InstrumentInstance, InstrumentPreset } from './instrument-types';

// Re-export all instrument builders
export * from './pulse-instruments';
export * from './bass-instruments';
export * from './percussion-instruments';
export * from './lead-instruments';
export * from './special-instruments';
export * from './chord-instruments';

// Re-export registry and utilities
export * from './instrument-registry';