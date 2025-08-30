/**
 * PXL Chiptune Studio - Audio Export Utilities
 * Handles WAV and MIDI export using Tone.Offline and @tonejs/midi
 */

import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { Project } from '@/types/song';
import { createInstrument, ALL_INSTRUMENTS } from './instrument-registry';
import { getMasterOutput, initializeAudioContext } from './engine';

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
  trackConfigs: Map<string, any>;
  transportEvents: any[];
}> {
  // Calculate total duration in seconds
  const timeSigParts = project.meta.timeSig.split('/');
  const beatsPerBar = parseInt(timeSigParts[0]);
  const beatUnit = parseInt(timeSigParts[1]);
  const totalBeats = project.meta.bars * (beatsPerBar / beatUnit) * 4; // Convert to quarter notes
  const duration = (totalBeats / project.meta.bpm) * 60;

  // Don't create instruments here - we'll create them in the offline context
  const instruments: Map<string, any> = new Map();

  // Store track information for later instrument creation
  const trackConfigs: Map<string, any> = new Map();
  for (const track of project.tracks) {
    if (track.clips.length > 0) {
      console.log(`🎼 Processing track: ${track.name} (${track.id}) with instrument: ${track.instrumentId}`);
      trackConfigs.set(track.id, {
        instrumentId: track.instrumentId,
        name: track.name,
        volume: track.volume,
        pan: track.pan,
        mute: track.mute
      });
    }
  }

  // Schedule all notes
  const transportEvents: any[] = [];
  let totalNotes = 0;

  console.log('🎵 Export: Processing tracks:', project.tracks.length);

  for (const track of project.tracks) {
    // Only process tracks that have clips with notes
    const hasNotes = track.clips.some(clip => clip.notes.length > 0);
    if (!hasNotes) {
      console.log(`🎼 Skipping track: ${track.name} (${track.id}) - no notes`);
      continue;
    }

    console.log(`🎼 Export: Processing track ${track.name} (${track.id}) with ${track.clips.length} clips`);

          for (const clip of track.clips) {
      console.log(`📝 Export: Clip has ${clip.notes.length} notes`);
      for (const note of clip.notes) {
        const beatPosition = clip.start + note.time; // Total beats from project start (keep in beats!)

        // Convert duration to Tone.js format (similar to scheduler)
        // note.duration is in beats, convert to sixteenths for consistency with scheduler
        const durationInSixteenths = Math.max(1, Math.round(note.duration * 4));
        const durationString = `0:0:${durationInSixteenths}`; // BBQ format like "0:0:4"

        const eventData = {
          time: beatPosition, // Keep in beats, not seconds!
          duration: durationString,
          note: note.pitch,
          velocity: note.velocity,
          trackId: track.id // Add trackId for instrument lookup
        };
        
        transportEvents.push(eventData);
        
        // Log first few events for diagnosis
        if (totalNotes < 3) {
          console.log(`🎵 DIAGNOSTIC: Event ${totalNotes + 1}:`, eventData);
        }
        totalNotes++;
      }
    }
  }

      console.log(`🎵 Export: Total events scheduled: ${transportEvents.length}, Total notes: ${totalNotes}`);

  // Events will be scheduled inside the offline callback
  console.log(`🎵 Export: Prepared ${transportEvents.length} events for offline rendering`);

  // Log timing analysis
  if (transportEvents.length > 0) {
    const firstEvent = transportEvents[0];
    const lastEvent = transportEvents[transportEvents.length - 1];
    console.log(`🎵 Export: Event timing - First: ${firstEvent.time.toFixed(3)} beats, Last: ${lastEvent.time.toFixed(3)} beats`);
    console.log(`🎵 Export: Expected duration: ${duration.toFixed(3)}s (${(duration * project.meta.bpm / 60).toFixed(3)} beats)`);
  }

  const dispose = () => {
    // Instruments will be created and disposed in the offline callback
    Tone.Transport.cancel();
  };

  return { dispose, duration, trackConfigs, transportEvents };
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

  // Log project details for debugging
  console.log('🎵 Export: Starting WAV export');
  console.log(`🎵 Export: Project "${project.meta.name}" - BPM: ${project.meta.bpm}, Time Sig: ${project.meta.timeSig}, Bars: ${project.meta.bars}`);
  console.log(`🎵 Export: ${project.tracks.length} tracks total`);

  project.tracks.forEach((track, index) => {
    const noteCount = track.clips.reduce((sum, clip) => sum + clip.notes.length, 0);
    console.log(`🎼 Track ${index}: "${track.name}" (${track.instrumentId}) - ${track.clips.length} clips, ${noteCount} notes`);
  });

  // Initialize audio context if not already done
  const audioInitialized = await initializeAudioContext();
  if (!audioInitialized) {
    throw new Error('Failed to initialize audio context for export');
  }

  // Stop any currently playing audio
  Tone.Transport.stop();

      // Build offline transport
    const { dispose, duration, trackConfigs, transportEvents } = await buildOfflineTransport(project);

  try {
    onProgress?.(10, 'Building transport and scheduling notes...');

    // Calculate total duration with some padding
    const totalDuration = duration + 0.5; // Add 0.5 seconds of silence at the end

    onProgress?.(20, `Rendering ${totalDuration.toFixed(1)} seconds of audio...`);

    // Render offline
    console.log(`🎵 Export: Starting offline render for ${totalDuration.toFixed(2)}s at ${sampleRate}Hz`);
    console.log(`🎵 Export: Available track configs: ${trackConfigs.size}`);

    // REAL-TIME RECORDING APPROACH: Use normal playback + recording instead of broken offline rendering
    console.log(`🎵 Export: Using real-time recording approach (normal playback + recording)`);
    
    // Get the existing audio context and connect a recorder
    const audioContext = Tone.getContext();
    const dest = audioContext.createMediaStreamDestination();
    
    // Connect Tone.js master output to our recorder destination
    const masterOutput = getMasterOutput();
    masterOutput.connect(dest);
    
    console.log(`🎵 Export: Connected master output to recorder destination`);
    
    // Set up MediaRecorder
    const mediaRecorder = new MediaRecorder(dest.stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    const audioChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    // Start recording
    mediaRecorder.start();
    console.log(`🎵 Export: Started real-time recording`);
    
    // Use existing scheduler system that actually works
    const { initializeScheduler, startPlayback, stopPlayback, clearScheduler } = await import('./scheduler');
    
    // Initialize the scheduler with the project (this sets up instruments and scheduling)
    console.log(`🎵 Export: Initializing scheduler for real-time playback`);
    initializeScheduler(project, false); // No looping for export
    
    // Start the transport and playback
    Tone.Transport.start();
    console.log(`🎵 Export: Started transport and playback for recording`);
    
    // Wait for playback to complete
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        mediaRecorder.stop();
        Tone.Transport.stop();
        stopPlayback();
        clearScheduler();
        console.log(`🎵 Export: Stopped recording and cleaned up after ${totalDuration}s`);
        resolve();
      }, totalDuration * 1000 + 500);
    });
    
    // Convert recorded audio to WAV
    const buffer = await new Promise<AudioBuffer>((resolve) => {
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Convert webm to AudioBuffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        console.log(`🎵 Export: Converted recorded audio to AudioBuffer, duration: ${audioBuffer.duration.toFixed(2)}s`);
        resolve(audioBuffer);
      };
    });

    console.log(`🎵 Export: Offline render complete, buffer length: ${buffer.length}, duration: ${buffer.duration.toFixed(2)}s`);

    // Check if buffer has actual audio data
    let hasAudioData = false;
    let maxAmplitude = 0;
    let totalSamples = 0;
    let samplesAboveThreshold = 0;
    const threshold = 0.0001; // Lower threshold for better detection

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.abs(channelData[i]);
        maxAmplitude = Math.max(maxAmplitude, sample);
        totalSamples++;

        if (sample > threshold) {
          samplesAboveThreshold++;
          hasAudioData = true;
        }

        // Log some sample values for debugging (first 10 samples)
        if (i < 10) {
          console.log(`🎵 Export: Sample ${i} channel ${channel}: ${sample.toFixed(8)}`);
        }
      }
    }

    const audioPercentage = totalSamples > 0 ? (samplesAboveThreshold / totalSamples) * 100 : 0;

    console.log(`🎵 Export: Buffer analysis - hasAudioData: ${hasAudioData}, maxAmplitude: ${maxAmplitude.toFixed(8)}`);
    console.log(`🎵 Export: Audio statistics - ${samplesAboveThreshold}/${totalSamples} samples above ${threshold} (${audioPercentage.toFixed(2)}%)`);

    if (!hasAudioData) {
      console.warn('⚠️ Warning: No audio data detected in rendered buffer!');
      console.warn('⚠️ This could indicate:');
      console.warn('   - Instruments not triggering properly');
      console.warn('   - Audio routing issues');
      console.warn('   - Timing problems');
      console.warn('   - Empty or invalid project data');
    } else if (maxAmplitude < 0.001) {
      console.warn('⚠️ Warning: Audio detected but very quiet (max amplitude < 0.001)');
    }

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

    // ToneAudioBuffer should work directly with the WAV conversion
    // as it implements the same interface as AudioBuffer
    console.log(`🎵 Export: Converting buffer to WAV, channels: ${buffer.numberOfChannels}, sampleRate: ${buffer.sampleRate}`);
    const wavBlob = audioBufferToWavBlob(buffer as any);

    console.log(`🎵 Export: WAV blob created, size: ${(wavBlob.size / 1024).toFixed(2)} KB`);
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
 * Export project to MIDI file
 */
export async function exportToMidi(
  project: Project,
  options: ExportOptions = {},
  onProgress?: ExportProgressCallback
): Promise<Blob> {
  onProgress?.(0, 'Initializing MIDI export...');

  try {
    // Create a new MIDI file
    const midi = new Midi();

    // Set tempo
    midi.header.setTempo(project.meta.bpm);

    // Set time signature (assuming 4/4 for now, could be extended)
    const [numerator, denominator] = project.meta.timeSig.split('/').map(Number);
    midi.header.timeSignatures = [{
      ticks: 0,
      timeSignature: [numerator || 4, denominator || 4],
      measures: 0
    }];

    onProgress?.(20, 'Processing tracks...');

    // Process each track
    for (let trackIndex = 0; trackIndex < project.tracks.length; trackIndex++) {
      const track = project.tracks[trackIndex];

      // Skip empty tracks
      if (track.clips.length === 0 || track.clips.every(clip => clip.notes.length === 0)) {
        continue;
      }

      onProgress?.(30 + (trackIndex / project.tracks.length) * 50, `Processing track: ${track.name}`);

      // Create a MIDI track
      const midiTrack = midi.addTrack();
      midiTrack.name = track.name;

      // Process all notes in this track's clips
      for (const clip of track.clips) {
        if (clip.muted) continue;

        for (const note of clip.notes) {
          // Convert note name to MIDI number
          const midiNote = noteNameToMidiNumber(note.pitch);

          // Convert time from beats to ticks (assuming 96 PPQ - Pulses Per Quarter note)
          const ppq = 96;
          const startTicks = Math.round((clip.start + note.time) * ppq);
          const durationTicks = Math.max(1, Math.round(note.duration * ppq));

          // Convert velocity from 0-1 to 0-127
          const midiVelocity = Math.round(note.velocity * 127);

          // Add note on/off events
          midiTrack.addNote({
            midi: midiNote,
            time: startTicks,
            duration: durationTicks,
            velocity: midiVelocity
          });
        }
      }
    }

    onProgress?.(90, 'Converting to MIDI format...');

    // Convert to blob
    const midiArrayBuffer = midi.toArray();
    const midiBlob = new Blob([midiArrayBuffer.buffer as ArrayBuffer], { type: 'audio/midi' });

    onProgress?.(100, 'MIDI export complete!');
    return midiBlob;

  } catch (error) {
    console.error('MIDI export failed:', error);
    throw new Error(`MIDI export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert note name (e.g., "C4", "F#3") to MIDI number
 */
function noteNameToMidiNumber(noteName: string): number {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octaveMatch = noteName.match(/([A-G]#?)(\d+)/);

  if (!octaveMatch) {
    console.warn(`Invalid note name: ${noteName}, using C4`);
    return 60; // C4 as fallback
  }

  const note = octaveMatch[1];
  const octave = parseInt(octaveMatch[2]);

  const noteIndex = noteNames.indexOf(note);
  if (noteIndex === -1) {
    console.warn(`Invalid note: ${note}, using C`);
    return octave * 12 + 60; // C in that octave
  }

  return (octave + 1) * 12 + noteIndex;
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

/**
 * Test export function for development/debugging
 */
export async function testExport(): Promise<Blob | void> {
  console.log('🎵 Testing WAV export with minimal project...');

  // Create a minimal test project
  const testProject: Project = {
    meta: {
      id: 'test-project',
      name: 'Test Export',
      bpm: 120,
      timeSig: '4/4',
      bars: 1,
      key: 'C',
      scale: 'major',
      swing: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    tracks: [
      {
        id: 'test-track-1',
        name: 'Test Pulse Lead',
        instrumentId: 'pulse12',
        volume: 0,
        pan: 0,
        mute: false,
        solo: false,
        clips: [
          {
            id: 'test-clip-1',
            start: 0,
            length: 1,
            notes: [
              {
                id: 'note-1',
                time: 0,
                duration: 0.25, // quarter note
                pitch: 'C4',
                velocity: 0.8,
              },
              {
                id: 'note-2',
                time: 0.5,
                duration: 0.25, // quarter note
                pitch: 'E4',
                velocity: 0.8,
              },
              {
                id: 'note-3',
                time: 1.0,
                duration: 0.25, // quarter note
                pitch: 'G4',
                velocity: 0.8,
              },
            ],
          },
        ],
        automation: [],
      },
    ],
  };

  try {
    const result = await exportToWav(testProject, {}, (progress, status) => {
      console.log(`📊 Progress: ${progress}% - ${status}`);
    });

    console.log(`✅ Test export successful! Blob size: ${(result.size / 1024).toFixed(2)} KB`);
    return result;
  } catch (error) {
    console.error('❌ Test export failed:', error);
  }
}

/**
 * Main MIDI export function with progress handling
 */
export async function exportProjectToMidi(
  project: Project,
  options: ExportOptions = {},
  onProgress?: ExportProgressCallback
): Promise<void> {
  try {
    const filename = `${project.meta.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mid`;

    onProgress?.(0, 'Starting MIDI export...');
    const midiBlob = await exportToMidi(project, options, onProgress);

    onProgress?.(95, 'Preparing download...');
    downloadBlob(midiBlob, filename);

    onProgress?.(100, `Downloaded ${filename}`);
  } catch (error) {
    console.error('MIDI export failed:', error);
    throw new Error(`MIDI export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
