// Test script for WAV export functionality
// This can be run in the browser console after the app loads

// Function to test export with current project data
async function testWavExportWithCurrentProject() {
  try {
    console.log('🚀 Testing WAV export with current project...');

    // Get the current project from the store
    const { useProjectStore } = await import('./src/state/useProjectStore.js');
    const currentProject = useProjectStore.getState().project;

    console.log('📊 Current project data:');
    console.log(`   Name: ${currentProject.meta.name}`);
    console.log(`   BPM: ${currentProject.meta.bpm}`);
    console.log(`   Tracks: ${currentProject.tracks.length}`);
    console.log(`   Total notes: ${currentProject.tracks.reduce((sum, track) => sum + track.clips.reduce((clipSum, clip) => clipSum + clip.notes.length, 0), 0)}`);

    // Show track details
    currentProject.tracks.forEach((track, index) => {
      const noteCount = track.clips.reduce((sum, clip) => sum + clip.notes.length, 0);
      const hasNotes = noteCount > 0;
      console.log(`   Track ${index}: ${track.name} (${track.instrumentId}) - ${noteCount} notes ${hasNotes ? '✅' : '❌ (empty)'}`);
    });

    // Check if project has any notes at all
    const totalNotes = currentProject.tracks.reduce((sum, track) => sum + track.clips.reduce((clipSum, clip) => clipSum + clip.notes.length, 0), 0);
    if (totalNotes === 0) {
      console.warn('⚠️ Warning: Your project has no notes! Add some notes to your tracks before exporting.');
    }

    // Import the export function
    const { exportToWav } = await import('./src/audio/export.js');

    const result = await exportToWav(currentProject, {}, (progress, status) => {
      console.log(`📊 Progress: ${progress}% - ${status}`);
    });

    console.log(`✅ Export successful! Blob size: ${(result.size / 1024).toFixed(2)} KB`);

    // Create a download link to test the WAV file
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.meta.name.replace(/[^a-z0-9]/gi, '_')}.wav`;
    link.textContent = 'Download WAV Export';
    link.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 10px; background: green; color: white; text-decoration: none; z-index: 1000;';

    document.body.appendChild(link);
    console.log('📥 Download link created - click to test your WAV file');

    return result;
  } catch (error) {
    console.error('💥 Export test failed:', error);
    throw error;
  }
}

// Function to test export with simple test project
async function testWavExportSimple() {
  try {
    console.log('🚀 Testing WAV export with simple test project...');

    // Simple test project
    const testProject = {
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
                  duration: 0.25,
                  pitch: 'C4',
                  velocity: 0.8,
                },
                {
                  id: 'note-2',
                  time: 0.5,
                  duration: 0.25,
                  pitch: 'E4',
                  velocity: 0.8,
                },
                {
                  id: 'note-3',
                  time: 1.0,
                  duration: 0.25,
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

    // Import the export function
    const { exportToWav } = await import('./src/audio/export.js');

    const result = await exportToWav(testProject, {}, (progress, status) => {
      console.log(`📊 Progress: ${progress}% - ${status}`);
    });

    console.log(`✅ Simple export successful! Blob size: ${(result.size / 1024).toFixed(2)} KB`);

    // Create a download link
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'simple-test.wav';
    link.textContent = 'Download Simple Test WAV';
    link.style.cssText = 'position: fixed; top: 50px; right: 10px; padding: 10px; background: blue; color: white; text-decoration: none; z-index: 1000;';

    document.body.appendChild(link);
    console.log('📥 Simple test download link created');

    return result;
  } catch (error) {
    console.error('💥 Simple export test failed:', error);
    throw error;
  }
}

// Make functions available globally
window.testWavExportWithCurrentProject = testWavExportWithCurrentProject;
window.testWavExportSimple = testWavExportSimple;

console.log('🎵 WAV export tests ready!');
console.log('Run testWavExportWithCurrentProject() to test with your current project');
console.log('Run testWavExportSimple() to test with a simple project');
