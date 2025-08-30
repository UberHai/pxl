// src/types/song.ts
export type TimeSig = `${number}/${1|2|4|8|16}`;
export type NoteName = string; // e.g., "C4", "G#3"

export interface ProjectMeta {
  id: string;
  name: string;
  bpm: number; // 20-300
  timeSig: TimeSig; // e.g., '4/4'
  bars: number; // 1-128
  key: NoteName; // tonic, e.g., 'C'
  scale: string; // 'major' | 'minor' | modes
  swing: number; // 0..1
  createdAt: number;
  updatedAt: number;
}

export interface NoteEvent {
  id: string;
  time: number; // beats from start
  duration: number; // beats
  pitch: NoteName; // or MIDI number
  velocity: number; // 0..1
}

export interface AutomationPoint { 
  time: number; 
  value: number; 
}

export interface AutomationLane {
  id: string;
  param: 'volume'|'pan'|'cutoff'|'delayMix'|'bitcrush';
  points: AutomationPoint[];
}

export interface Clip {
  id: string;
  start: number; // beat position on arrangement
  length: number; // beats
  notes: NoteEvent[];
  muted?: boolean;
}

export interface Track {
  id: string;
  name: string;
  instrumentId: string; // from instrument factory
  volume: number; // dB
  pan: number; // -1..1
  mute: boolean;
  solo: boolean;
  clips: Clip[];
  automation: AutomationLane[];
}

export interface Project {
  meta: ProjectMeta;
  tracks: Track[]; // up to 12
}
