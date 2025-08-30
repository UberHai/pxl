import { create } from 'zustand';
import { Project, Track, ProjectMeta } from '@/types/song';
import { setMetronomeEnabled, updateMetronomeTiming } from '@/audio/scheduler';

interface UIState {
  selectedTrackId?: string;
  isPlaying: boolean;
  stepRes: 1 | 2 | 4 | 8 | 16; // Step resolution (1 = whole note, 16 = 16th note)
  currentView: 'pattern' | 'piano' | 'automation' | 'mixer';
  playbackPosition: number; // beats
  loopEnabled: boolean;
}

interface AudioState {
  audioInitialized: boolean;
  masterVolume: number; // -60 to 0 dB
  activeInstruments: Map<string, any>; // trackId -> instrument instance
  metronomeEnabled: boolean;
}

interface ProjectState {
  project: Project;
  ui: UIState;
  audio: AudioState;

  // Project actions
  setProject: (project: Project) => void;
  setBpm: (bpm: number) => void;
  setTimeSig: (timeSig: string) => void;
  setBars: (bars: number) => void;
  setKey: (key: string) => void;
  setScale: (scale: string) => void;
  setSwing: (swing: number) => void;
  
  // Track actions
  addTrack: () => string | undefined;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  selectTrack: (trackId: string) => void;
  
  // Transport actions
  togglePlay: () => void;
  stop: () => void;
  setPlaybackPosition: (position: number) => void;
  
  // UI actions
  setStepRes: (stepRes: UIState['stepRes']) => void;
  setCurrentView: (view: UIState['currentView']) => void;
  toggleLoop: () => void;

  // Audio actions
  setAudioInitialized: (initialized: boolean) => void;
  setMasterVolume: (volume: number) => void;
  registerInstrument: (trackId: string, instrument: any) => void;
  unregisterInstrument: (trackId: string) => void;
  updateTrackVolume: (trackId: string, volume: number) => void;
  updateTrackPan: (trackId: string, pan: number) => void;
  toggleMetronome: () => void;
}

// Create default project
const createDefaultProject = (): Project => {
  const now = Date.now();
  return {
    meta: {
      id: 'default-project',
      name: 'Untitled Project',
      bpm: 120,
      timeSig: '4/4' as const,
      bars: 1,
      key: 'C',
      scale: 'major',
      swing: 0,
      createdAt: now,
      updatedAt: now,
    },
    tracks: [],
  };
};

const createDefaultTrack = (id: string, name: string, instrumentId: string): Track => ({
  id,
  name,
  instrumentId,
  volume: 0, // 0 dB
  pan: 0, // center
  mute: false,
  solo: false,
  clips: [],
  automation: [],
});

export const useProjectStore = create<ProjectState>((set, get) => {
  console.log('🏪 ZUSTAND STORE CREATING...');
  
  return {
    project: createDefaultProject(),
          ui: {
        selectedTrackId: undefined,
        isPlaying: false,
        stepRes: 16,
        currentView: 'pattern',
        playbackPosition: 0,
        loopEnabled: true,
      },
    audio: {
      audioInitialized: false,
      masterVolume: 0,
      activeInstruments: new Map(),
      metronomeEnabled: false,
    },

    // Project actions
    setProject: (project) => set(() => ({
      project
    })),

    setBpm: (bpm) => set((state) => ({
      project: {
        ...state.project,
        meta: {
          ...state.project.meta,
          bpm,
          updatedAt: Date.now()
        }
      }
    })),

    setTimeSig: (timeSig) => set((state) => ({
      project: {
        ...state.project,
        meta: {
          ...state.project.meta,
          timeSig: timeSig as any,
          updatedAt: Date.now()
        }
      }
    })),

    setBars: (bars) => set((state) => ({
      project: {
        ...state.project,
        meta: {
          ...state.project.meta,
          bars,
          updatedAt: Date.now()
        }
      }
    })),

    setKey: (key) => set((state) => ({
      project: {
        ...state.project,
        meta: {
          ...state.project.meta,
          key,
          updatedAt: Date.now()
        }
      }
    })),

    setScale: (scale) => set((state) => ({
      project: {
        ...state.project,
        meta: {
          ...state.project.meta,
          scale,
          updatedAt: Date.now()
        }
      }
    })),

    setSwing: (swing) => set((state) => ({
      project: {
        ...state.project,
        meta: {
          ...state.project.meta,
          swing,
          updatedAt: Date.now()
        }
      }
    })),

    // Track actions
    addTrack: () => {
      let newTrackId: string | undefined;
      set((state) => {
        const trackCount = state.project.tracks.length;
        if (trackCount >= 12) return state; // Max 12 tracks

        const newTrack = createDefaultTrack(
          `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          `Track ${trackCount + 1}`,
          'pulse12' // Default instrument
        );
        newTrackId = newTrack.id;

        return {
          ...state,
          project: {
            ...state.project,
            tracks: [...state.project.tracks, newTrack],
            meta: {
              ...state.project.meta,
              updatedAt: Date.now()
            }
          },
          ui: {
            ...state.ui,
            selectedTrackId: newTrack.id
          }
        };
      });
      return newTrackId;
    },

    removeTrack: (trackId) => set((state) => {
      const tracks = state.project.tracks.filter(t => t.id !== trackId);
      return {
        ...state,
        project: {
          ...state.project,
          tracks,
          meta: {
            ...state.project.meta,
            updatedAt: Date.now()
          }
        },
        ui: {
          ...state.ui,
          selectedTrackId: state.ui.selectedTrackId === trackId ? tracks[0]?.id : state.ui.selectedTrackId
        }
      };
    }),

    updateTrack: (trackId, updates) => set((state) => ({
      ...state,
      project: {
        ...state.project,
        tracks: state.project.tracks.map(track => 
          track.id === trackId ? { ...track, ...updates } : track
        ),
        meta: {
          ...state.project.meta,
          updatedAt: Date.now()
        }
      }
    })),

    selectTrack: (trackId) => set((state) => ({
      ...state,
      ui: {
        ...state.ui,
        selectedTrackId: trackId
      }
    })),

    // Transport actions
    togglePlay: () => set((state) => ({
      ...state,
      ui: {
        ...state.ui,
        isPlaying: !state.ui.isPlaying
      }
    })),

    stop: () => set((state) => ({
      ...state,
      ui: {
        ...state.ui,
        isPlaying: false,
        playbackPosition: 0
      }
    })),

    setPlaybackPosition: (position) => set((state) => ({
      ...state,
      ui: {
        ...state.ui,
        playbackPosition: position
      }
    })),

    // UI actions
    setStepRes: (stepRes) => set((state) => ({
      ...state,
      ui: {
        ...state.ui,
        stepRes
      }
    })),

    setCurrentView: (view) => set((state) => ({
      ...state,
      ui: {
        ...state.ui,
        currentView: view
      }
    })),

    toggleLoop: () => set((state) => ({
      ...state,
      ui: {
        ...state.ui,
        loopEnabled: !state.ui.loopEnabled
      }
    })),

    // Audio actions
    setAudioInitialized: (initialized) => set((state) => ({
      ...state,
      audio: {
        ...state.audio,
        audioInitialized: initialized
      }
    })),

    setMasterVolume: (volume) => set((state) => ({
      ...state,
      audio: {
        ...state.audio,
        masterVolume: Math.max(-60, Math.min(0, volume))
      }
    })),

    registerInstrument: (trackId, instrument) => set((state) => {
      const newMap = new Map(state.audio.activeInstruments);
      newMap.set(trackId, instrument);
      return {
        ...state,
        audio: {
          ...state.audio,
          activeInstruments: newMap
        }
      };
    }),

    unregisterInstrument: (trackId) => set((state) => {
      const newMap = new Map(state.audio.activeInstruments);
      const instrument = newMap.get(trackId);
      if (instrument && instrument.dispose) {
        instrument.dispose();
      }
      newMap.delete(trackId);
      return {
        ...state,
        audio: {
          ...state.audio,
          activeInstruments: newMap
        }
      };
    }),

    updateTrackVolume: (trackId, volume) => set((state) => {
      // Update track volume in project
      const updatedTracks = state.project.tracks.map(track =>
        track.id === trackId ? { ...track, volume } : track
      );

      // Update active instrument volume if it exists
      const instrument = state.audio.activeInstruments.get(trackId);
      if (instrument && instrument.channel) {
        instrument.channel.volume.value = volume;
      }

      return {
        ...state,
        project: {
          ...state.project,
          tracks: updatedTracks,
          meta: {
            ...state.project.meta,
            updatedAt: Date.now()
          }
        }
      };
    }),

    updateTrackPan: (trackId, pan) => set((state) => {
      // Update track pan in project
      const updatedTracks = state.project.tracks.map(track =>
        track.id === trackId ? { ...track, pan } : track
      );

      // Update active instrument pan if it exists
      const instrument = state.audio.activeInstruments.get(trackId);
      if (instrument && instrument.channel) {
        instrument.channel.pan.value = pan;
      }

      return {
        ...state,
        project: {
          ...state.project,
          tracks: updatedTracks,
          meta: {
            ...state.project.meta,
            updatedAt: Date.now()
          }
        }
      };
    }),

    toggleMetronome: () => set((state) => {
      const newEnabled = !state.audio.metronomeEnabled;

      // Enable/disable metronome in scheduler
      setMetronomeEnabled(newEnabled);

      return {
        ...state,
        audio: {
          ...state.audio,
          metronomeEnabled: newEnabled
        }
      };
    }),
  };
});