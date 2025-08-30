/**
 * PXL Chiptune Studio - Main Audio Engine
 * Handles Tone.js initialization, master audio chain, and transport management
 */

import * as Tone from 'tone';

// Audio context state
let audioContextInitialized = false;
let masterChain: Tone.Channel | null = null;
let limiter: Tone.Limiter | null = null;

/**
 * Initialize Tone.js audio context with browser policy compliance
 * Must be called on user interaction (click, keypress, etc.)
 */
export async function initializeAudioContext(): Promise<boolean> {
  if (audioContextInitialized) return true;

  try {
    // Start audio context (handles browser autoplay policy)
    await Tone.start();

    // Create master audio chain
    masterChain = new Tone.Channel({
      volume: 0, // 0 dB
      pan: 0,    // Center
    });

    // Add limiter to prevent clipping
    limiter = new Tone.Limiter(-0.1); // -0.1 dB ceiling
    masterChain.connect(limiter);
    limiter.toDestination();

    audioContextInitialized = true;
    console.log('🎵 Audio context initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize audio context:', error);
    return false;
  }
}

/**
 * Get the master audio output node for connecting instruments
 */
export function getMasterOutput(): Tone.Channel {
  if (!masterChain) {
    throw new Error('Audio context not initialized. Call initializeAudioContext() first.');
  }
  return masterChain;
}

/**
 * Check if audio context is initialized and ready
 */
export function isAudioReady(): boolean {
  return audioContextInitialized && Tone.context.state === 'running';
}

/**
 * Start Tone.js Transport (global playback)
 */
export function startTransport(): void {
  if (!audioContextInitialized) {
    throw new Error('Audio context not initialized');
  }
  Tone.Transport.start();
}

/**
 * Stop Tone.js Transport (global playback)
 */
export function stopTransport(): void {
  Tone.Transport.stop();
}

/**
 * Set BPM and sync with Transport
 */
export function setBPM(bpm: number): void {
  Tone.Transport.bpm.value = Math.max(20, Math.min(300, bpm));
}

/**
 * Set time signature
 */
export function setTimeSignature(timeSig: string): void {
  const [numerator, denominator] = timeSig.split('/').map(Number);
  if (numerator && denominator) {
    Tone.Transport.timeSignature = [numerator, denominator];
  }
}

/**
 * Get current transport position in beats
 */
export function getTransportPosition(): number {
  return Tone.Transport.position as number;
}

/**
 * Dispose of all audio resources
 */
export function disposeAudio(): void {
  if (limiter) {
    limiter.dispose();
    limiter = null;
  }
  if (masterChain) {
    masterChain.dispose();
    masterChain = null;
  }
  Tone.Transport.cancel();
  audioContextInitialized = false;
}

/**
 * Get transport state
 */
export function getTransportState(): 'started' | 'stopped' | 'paused' {
  return Tone.Transport.state as 'started' | 'stopped' | 'paused';
}
