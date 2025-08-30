/**
 * Global keyboard shortcuts hook for PXL Chiptune Studio
 */

import { useEffect } from 'react';
import { useProjectStore } from '@/state/useProjectStore';
import { 
  startTransport, 
  stopTransport, 
  isAudioReady, 
  initializeAudioContext,
  getTransportState 
} from '@/audio/engine';
import { startPlayback, stopPlayback } from '@/audio/scheduler';

export function useKeyboardShortcuts() {
  const {
    ui,
    audio,
    togglePlay,
    stop,
    toggleMetronome,
    toggleLoop,
    setAudioInitialized,
    project,
    addTrack,
    removeTrack,
    selectTrack
  } = useProjectStore();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Prevent default for our shortcuts
      const shortcutKeys = [
        'Space',
        'KeyM',
        'KeyL',
        'KeyS',
        'KeyC',
        'Delete',
        'Backspace',
        'ArrowUp',
        'ArrowDown',
        'Escape'
      ];

      if (shortcutKeys.includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case 'Space':
          // Play/Pause
          if (!audio.audioInitialized) {
            const success = await initializeAudioContext();
            if (success) {
              setAudioInitialized(true);
            } else {
              console.error('Failed to initialize audio context');
              return;
            }
          }

          if (getTransportState() === 'started') {
            stopTransport();
            stopPlayback();
          } else {
            startTransport();
            startPlayback();
          }
          togglePlay();
          break;

        case 'KeyM':
          // Toggle Metronome
          if (audio.audioInitialized) {
            toggleMetronome();
          }
          break;

        case 'KeyL':
          // Toggle Loop
          toggleLoop();
          break;

        case 'KeyS':
          // Stop (with Ctrl/Cmd for Save in future)
          if (!event.ctrlKey && !event.metaKey) {
            stopTransport();
            stopPlayback();
            stop();
          }
          break;

        case 'KeyC':
          // Clear pattern (when track is selected)
          if (ui.selectedTrackId && event.ctrlKey) {
            // TODO: Add clear pattern functionality
            console.log('Clear pattern shortcut (Ctrl+C)');
          }
          break;

        case 'KeyT':
          // Add track (Ctrl+T)
          if (event.ctrlKey || event.metaKey) {
            if (project.tracks.length < 12) {
              addTrack();
            }
          }
          break;

        case 'Delete':
        case 'Backspace':
          // Delete selected track
          if (ui.selectedTrackId && event.ctrlKey) {
            removeTrack(ui.selectedTrackId);
          }
          break;

        case 'ArrowUp':
          // Select previous track
          if (ui.selectedTrackId) {
            const currentIndex = project.tracks.findIndex(t => t.id === ui.selectedTrackId);
            if (currentIndex > 0) {
              selectTrack(project.tracks[currentIndex - 1].id);
            }
          } else if (project.tracks.length > 0) {
            selectTrack(project.tracks[0].id);
          }
          break;

        case 'ArrowDown':
          // Select next track
          if (ui.selectedTrackId) {
            const currentIndex = project.tracks.findIndex(t => t.id === ui.selectedTrackId);
            if (currentIndex < project.tracks.length - 1) {
              selectTrack(project.tracks[currentIndex + 1].id);
            }
          } else if (project.tracks.length > 0) {
            selectTrack(project.tracks[0].id);
          }
          break;

        case 'Escape':
          // Deselect track
          if (ui.selectedTrackId) {
            // TODO: Add deselect functionality to store
            console.log('Deselect track shortcut (Esc)');
          }
          break;

        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          // Select track by number (1-9)
          const trackIndex = parseInt(event.code.slice(-1)) - 1;
          if (trackIndex < project.tracks.length) {
            selectTrack(project.tracks[trackIndex].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    ui,
    audio,
    project,
    togglePlay,
    stop,
    toggleMetronome,
    toggleLoop,
    setAudioInitialized,
    addTrack,
    removeTrack,
    selectTrack
  ]);
}
