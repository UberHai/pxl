import * as Tone from 'tone';
import { InstrumentInstance } from './instrument-types';

/**
 * PXL Chiptune Studio - Lead Instruments
 * Melodic lead synthesis instruments
 */

/**
 * Build Chip Arp Pluck instrument (Fast envelope pulse)
 */
export function buildChipArpPluck(): InstrumentInstance {
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
export function buildFMBell(): InstrumentInstance {
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
export function buildBitcrushedSaw(): InstrumentInstance {
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
export function buildChipOrgan(): InstrumentInstance {
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
 * Build Wavetable Lead instrument (Custom wavetable synthesis)
 */
export function buildWavetableLead(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -7 });

  // Create custom wavetable using partials for unique sound
  const partials = [1, 0.3, 0.1, 0.05, 0.02]; // Custom harmonic series
  const synth = new Tone.Synth({
    oscillator: {
      type: 'custom',
      partials: partials,
    },
    envelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.6,
      release: 0.25,
    },
  });

  const filter = new Tone.Filter(1800, 'lowpass');
  filter.Q.value = 1.8;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'wavetable',
    name: 'Wavetable Lead',
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
 * Build Ring Mod Lead instrument (Metallic, robotic tones)
 */
export function buildRingModLead(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -10 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'sawtooth',
    },
    envelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.4,
      release: 0.3,
    },
  });

  // Ring modulation effect
  const ringMod = new Tone.FrequencyShifter(100); // 100Hz modulation
  const filter = new Tone.Filter(2500, 'lowpass');
  filter.Q.value = 1.5;

  synth.connect(ringMod);
  ringMod.connect(filter);
  filter.connect(channel);

  return {
    id: 'ring-mod',
    name: 'Ring Mod Lead',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.6) => {
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
      ringMod.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build Detuned Pulse instrument (Two slightly detuned pulse synths)
 */
export function buildDetunedPulse(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -8 });

  // Create two synths with slight detune using the same approach as other pulse instruments
  const synth1 = new Tone.Synth({
    oscillator: {
      type: 'pulse',
      width: 0.25,
    },
    envelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.7,
      release: 0.25,
    },
  });

  const synth2 = new Tone.Synth({
    oscillator: {
      type: 'pulse',
      width: 0.25,
    },
    envelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.7,
      release: 0.25,
    },
  });

  const gain1 = new Tone.Gain(0.5);
  const gain2 = new Tone.Gain(0.5);

  const filter = new Tone.Filter(1200, 'lowpass');
  filter.Q.value = 2;

  // Connect synths
  synth1.connect(gain1);
  synth2.connect(gain2);
  gain1.connect(filter);
  gain2.connect(filter);
  filter.connect(channel);

  return {
    id: 'detuned-pulse',
    name: 'Detuned Pulse',
    synth: synth1, // Use first synth as reference
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.7) => {
      try {
        const baseFreq = Tone.Frequency(note).toFrequency();
        const startTime = time || Tone.now();

        // Play both synths with slight detune
        synth1.triggerAttackRelease(note, duration, startTime, velocity);

        // Detune the second synth by converting back to note with slight pitch shift
        const detunedFreq = baseFreq * 1.002; // ~3 cents detune
        const detunedNote = Tone.Frequency(detunedFreq).toNote();
        synth2.triggerAttackRelease(detunedNote, duration, startTime, velocity);
      } catch (error) {
        console.warn('Instrument trigger failed:', error, { note, duration, time, velocity });
      }
    },
    dispose: () => {
      synth1.dispose();
      synth2.dispose();
      gain1.dispose();
      gain2.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build Chebyshev Lead instrument (Waveshaping distortion)
 */
export function buildChebyshevLead(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -9 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'sawtooth',
    },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.6,
      release: 0.3,
    },
  });

  // Chebyshev waveshaper for harmonic distortion
  const chebyshev = new Tone.Chebyshev(30); // 30th order distortion
  const filter = new Tone.Filter(2200, 'lowpass');
  filter.Q.value = 1.2;

  synth.connect(chebyshev);
  chebyshev.connect(filter);
  filter.connect(channel);

  return {
    id: 'cheby-lead',
    name: 'Chebyshev Lead',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '8n', time?: number, velocity = 0.6) => {
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
      chebyshev.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build AM Synth instrument (Amplitude modulation for tremolo)
 */
export function buildAMSynth(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -7 });

  const synth = new Tone.AMSynth({
    harmonicity: 2,
    oscillator: {
      type: 'sawtooth',
    },
    envelope: {
      attack: 0.02,
      decay: 0.2,
      sustain: 0.7,
      release: 0.4,
    },
    modulation: {
      type: 'square',
    },
    modulationEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.5,
      release: 0.3,
    },
  });

  const filter = new Tone.Filter(1600, 'lowpass');
  filter.Q.value = 1.5;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'am-synth',
    name: 'AM Synth',
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
 * Build Digital Glitch instrument (Stuttering, glitchy effects)
 */
export function buildDigitalGlitch(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -12 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'square',
    },
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0.1,
      release: 0.08,
    },
  });

  // Bitcrusher for digital degradation
  const bitCrusher = new Tone.BitCrusher(3); // Extreme 3-bit crushing
  const filter = new Tone.Filter(3000, 'highpass');
  filter.Q.value = 4;

  synth.connect(bitCrusher);
  bitCrusher.connect(filter);
  filter.connect(channel);

  return {
    id: 'digital-glitch',
    name: 'Digital Glitch',
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
      bitCrusher.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build Resonant Filter Sweep instrument (Filter modulation)
 */
export function buildResonantSweep(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -8 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'sawtooth',
    },
    envelope: {
      attack: 0.1,
      decay: 0.8,
      sustain: 0.6,
      release: 1.0,
    },
  });

  // Filter with LFO modulation
  const filter = new Tone.Filter(400, 'lowpass');
  filter.Q.value = 8; // High resonance

  const lfo = new Tone.LFO(0.5, 200, 2000); // Slow filter sweep
  lfo.connect(filter.frequency);
  lfo.start();

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'res-sweep',
    name: 'Resonant Sweep',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '2n', time?: number, velocity = 0.6) => {
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
      lfo.dispose();
      synth.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build Additive Bell instrument (Multiple sine harmonics)
 */
export function buildAdditiveBell(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -11 });

  // Create multiple oscillators for additive synthesis
  const fundamental = new Tone.Oscillator(440, 'sine');
  const harmonic2 = new Tone.Oscillator(880, 'sine'); // Octave
  const harmonic3 = new Tone.Oscillator(1320, 'sine'); // Perfect fifth
  const harmonic4 = new Tone.Oscillator(1760, 'sine'); // Double octave
  const harmonic5 = new Tone.Oscillator(2200, 'sine'); // Major third

  // Gain nodes with different volumes for bell character
  const gain1 = new Tone.Gain(0.8);
  const gain2 = new Tone.Gain(0.4);
  const gain3 = new Tone.Gain(0.3);
  const gain4 = new Tone.Gain(0.2);
  const gain5 = new Tone.Gain(0.1);

  const envelope = new Tone.AmplitudeEnvelope({
    attack: 0.01,
    decay: 1.5,
    sustain: 0.2,
    release: 2.0,
  });

  const filter = new Tone.Filter(3000, 'lowpass');
  filter.Q.value = 1;

  // Connect all oscillators
  fundamental.connect(gain1);
  harmonic2.connect(gain2);
  harmonic3.connect(gain3);
  harmonic4.connect(gain4);
  harmonic5.connect(gain5);

  gain1.connect(envelope);
  gain2.connect(envelope);
  gain3.connect(envelope);
  gain4.connect(envelope);
  gain5.connect(envelope);

  envelope.connect(filter);
  filter.connect(channel);

  return {
    id: 'additive-bell',
    name: 'Additive Bell',
    synth: fundamental,
    channel,
    trigger: (note: string, duration: string | number = '1n', time?: number, velocity = 0.5) => {
      try {
        const freq = Tone.Frequency(note).toFrequency();
        const startTime = time || Tone.now();

        fundamental.frequency.setValueAtTime(freq, startTime);
        harmonic2.frequency.setValueAtTime(freq * 2, startTime);
        harmonic3.frequency.setValueAtTime(freq * 3, startTime);
        harmonic4.frequency.setValueAtTime(freq * 4, startTime);
        harmonic5.frequency.setValueAtTime(freq * 5, startTime);

        fundamental.start(startTime);
        harmonic2.start(startTime);
        harmonic3.start(startTime);
        harmonic4.start(startTime);
        harmonic5.start(startTime);

        envelope.triggerAttackRelease(duration, startTime, velocity);

        const stopTime = startTime + Tone.Time(duration).toSeconds();
        fundamental.stop(stopTime);
        harmonic2.stop(stopTime);
        harmonic3.stop(stopTime);
        harmonic4.stop(stopTime);
        harmonic5.stop(stopTime);
      } catch (error) {
        console.warn('Instrument trigger failed:', error, { note, duration, time, velocity });
      }
    },
    dispose: () => {
      fundamental.dispose();
      harmonic2.dispose();
      harmonic3.dispose();
      harmonic4.dispose();
      harmonic5.dispose();
      gain1.dispose();
      gain2.dispose();
      gain3.dispose();
      gain4.dispose();
      gain5.dispose();
      envelope.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build Vibrato Lead instrument (Classic NES/Game Boy lead with pitch modulation)
 */
export function buildVibratoLead(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -7 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'pulse',
      width: 0.125, // Thin pulse for cutting lead sound
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 0.3,
    },
  });

  // Vibrato LFO for classic pitch modulation
  const vibrato = new Tone.LFO(6, -50, 50); // 6Hz vibrato, ±50 cents
  vibrato.connect(synth.oscillator.detune);
  vibrato.start();

  const filter = new Tone.Filter(2000, 'lowpass');
  filter.Q.value = 1.5;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'vibrato-lead',
    name: 'Vibrato Lead',
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
      vibrato.dispose();
      synth.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build Arpeggio Bass instrument (Rapid note cycling bass common in NES games)
 */
export function buildArpeggioBass(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -5 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'triangle', // Classic triangle bass
    },
    envelope: {
      attack: 0.005,
      decay: 0.08,
      sustain: 0.3,
      release: 0.1,
    },
  });

  // Rapid arpeggio effect using frequency modulation
  const arpLFO = new Tone.LFO(16, 0, 12); // 16Hz, ±12 semitones (octave)
  arpLFO.type = 'square'; // Square wave for sharp note jumps
  arpLFO.connect(synth.oscillator.detune);
  arpLFO.start();

  const filter = new Tone.Filter(400, 'lowpass');
  filter.Q.value = 2;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'arp-bass',
    name: 'Arpeggio Bass',
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
      arpLFO.dispose();
      synth.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}

/**
 * Build Duty Cycle Sweep instrument (Gradually changing pulse width during notes)
 */
export function buildDutyCycleSweep(): InstrumentInstance {
  const channel = new Tone.Channel({ volume: -8 });

  const synth = new Tone.Synth({
    oscillator: {
      type: 'pulse',
      width: 0.5, // Start at 50% duty cycle
    },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.6,
      release: 0.4,
    },
  });

  // LFO to sweep the duty cycle from 50% down to 12.5% and back
  const dutySweep = new Tone.LFO(0.5, 0.125, 0.5); // Slow sweep, 12.5% to 50%
  dutySweep.type = 'triangle'; // Smooth up/down sweep
  dutySweep.connect(synth.oscillator.width);
  dutySweep.start();

  const filter = new Tone.Filter(1500, 'lowpass');
  filter.Q.value = 1.8;

  synth.connect(filter);
  filter.connect(channel);

  return {
    id: 'duty-sweep',
    name: 'Duty Cycle Sweep',
    synth,
    channel,
    trigger: (note: string, duration: string | number = '2n', time?: number, velocity = 0.7) => {
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
      dutySweep.dispose();
      synth.dispose();
      filter.dispose();
      channel.dispose();
    },
  };
}
