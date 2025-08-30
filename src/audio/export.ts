/**
 * PXL Chiptune Studio - Audio Export Utilities
 * Handles WAV and other audio format exports using Tone.Offline
 */

import * as Tone from 'tone';
import { Project } from '@/types/song';
import { createInstrument } from './instrument-registry';
import { getMasterOutput } from './engine';

/**
 * Convert AudioBuffer to WAV Blob
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;

  // Create WAV file data
  const arrayBuffer = new ArrayBuffer(44 + length * numChannels * 2);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numChannels * 2, true);

  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Export options interface
 */
export interface ExportOptions {
  sampleRate?: number;
  bitDepth?: 16 | 24 | 32;
  format?: 'wav' | 'ogg' | 'mp3';
  quality?: 'low' | 'medium' | 'high';
  normalize?: boolean;
}

/**
 * Progress callback for export
 */
export type ExportProgressCallback = (progress: number, status: string) => void;

/**
 * Build transport for offline rendering
 */
async function buildOfflineTransport(project: Project): Promise<{
  dispose: () => void;
  duration: number;
}> {
  const instruments: Map<string, any> = new Map();

  // Calculate total duration in seconds
  const timeSigParts = project.meta.timeSig.split('/');
  const beatsPerBar = parseInt(timeSigParts[0]);
  const beatUnit = parseInt(timeSigParts[1]);
  const totalBeats = project.meta.bars * (beatsPerBar / beatUnit) * 4; // Convert to quarter notes
  const duration = (totalBeats / project.meta.bpm) * 60;

  // Create instruments for each track
  for (const track of project.tracks) {
    if (track.clips.length > 0) {
      const instrument = createInstrument(track.instrumentId);
      if (instrument) {
        instruments.set(track.id, instrument);

        // Connect to master output
        instrument.channel.volume.value = track.volume;
        instrument.channel.pan.value = track.pan;
        instrument.channel.mute = track.mute;
        instrument.channel.connect(getMasterOutput());
      }
    }
  }

  // Schedule all notes
  const transportEvents: any[] = [];

  for (const track of project.tracks) {
    const instrument = instruments.get(track.id);
    if (!instrument) continue;

    for (const clip of track.clips) {
      for (const note of clip.notes) {
        const startTime = (clip.start + note.time) * (60 / project.meta.bpm) / 4; // Convert beats to seconds
        const duration = note.duration * (60 / project.meta.bpm) / 4;

        transportEvents.push({
          time: startTime,
          duration,
          note: note.pitch,
          velocity: note.velocity,
          instrument
        });
      }
    }
  }

  // Schedule events in Tone.Transport
  transportEvents.forEach(event => {
    Tone.Transport.scheduleOnce((time) => {
      event.instrument.trigger(event.note, event.duration + 'n', time, event.velocity);
    }, event.time);
  });

  const dispose = () => {
    // Clean up instruments
    instruments.forEach(instrument => {
      if (instrument.dispose) {
        instrument.dispose();
      }
    });
    instruments.clear();
    Tone.Transport.cancel();
  };

  return { dispose, duration };
}

/**
 * Export project to WAV file
 */
export async function exportToWav(
  project: Project,
  options: ExportOptions = {},
  onProgress?: ExportProgressCallback
): Promise<Blob> {
  const {
    sampleRate = 44100,
    normalize = true
  } = options;

  onProgress?.(0, 'Initializing offline rendering...');

  // Stop any currently playing audio
  Tone.Transport.stop();

  // Build offline transport
  const { dispose, duration } = await buildOfflineTransport(project);

  try {
    onProgress?.(10, 'Building transport and scheduling notes...');

    // Calculate total duration with some padding
    const totalDuration = duration + 0.5; // Add 0.5 seconds of silence at the end

    onProgress?.(20, `Rendering ${totalDuration.toFixed(1)} seconds of audio...`);

    // Render offline
    const buffer = await Tone.Offline(async () => {
      Tone.Transport.start();
      onProgress?.(30, 'Transport started, rendering audio...');
    }, totalDuration, sampleRate);

    onProgress?.(80, 'Audio rendered, processing...');

    // Normalize if requested
    if (normalize) {
      // Find peak level
      let peak = 0;
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          peak = Math.max(peak, Math.abs(channelData[i]));
        }
      }

      // Normalize to -0.2 dBFS (industry standard)
      const targetPeak = 0.794; // -0.2 dBFS
      const gain = peak > 0 ? targetPeak / peak : 1;

      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] *= gain;
        }
      }
    }

    onProgress?.(90, 'Converting to WAV format...');

    // Convert to WAV blob
    const wavBlob = audioBufferToWavBlob(buffer);

    onProgress?.(100, 'Export complete!');

    return wavBlob;

  } finally {
    dispose();
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Main export function with progress handling
 */
export async function exportProject(
  project: Project,
  options: ExportOptions = {},
  onProgress?: ExportProgressCallback
): Promise<void> {
  try {
    const filename = `${project.meta.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`;

    onProgress?.(0, 'Starting export...');
    const wavBlob = await exportToWav(project, options, onProgress);

    onProgress?.(95, 'Preparing download...');
    downloadBlob(wavBlob, filename);

    onProgress?.(100, `Downloaded ${filename}`);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
