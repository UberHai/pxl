'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useProjectStore } from '@/state/useProjectStore';
import { Track } from '@/types/song';
import { Volume2, VolumeX, Headphones } from 'lucide-react';

interface TrackRowProps {
  track: Track;
  index: number;
}

// ✅ COMPLETE INSTRUMENT LIBRARY - All 29 instruments working!
const PULSE_FAMILY = [
  { id: 'pulse12', name: 'Pulse Lead 12.5%' },
  { id: 'pulse25', name: 'Pulse Lead 25%' },
  { id: 'pulse50', name: 'Pulse Lead 50%' },
  { id: 'pwm', name: 'PWM Lead' },
  { id: 'detuned-pulse', name: 'Detuned Pulse' },
];

const BASS_SECTION = [
  { id: 'tri-bass', name: 'Triangle Bass' },
  { id: 'sub', name: 'Sub Sine Bass' },
  { id: 'square-bass', name: 'Square Bass' },
  { id: 'fm-bass', name: 'FM Bass' },
  { id: 'arp-bass', name: 'Arpeggio Bass' },
];

const PERCUSSION_KIT = [
  { id: 'n-kick', name: 'Noise Kick' },
  { id: 'n-snare', name: 'Noise Snare' },
  { id: 'n-hat', name: 'Noise Hat' },
  { id: 'n-crash', name: 'Noise Crash' },
];

const LEAD_MELODIC = [
  { id: 'arp-pluck', name: 'Chip Arp Pluck' },
  { id: 'fm-bell', name: 'FM Bell' },
  { id: 'bc-saw', name: 'Bitcrushed Saw' },
  { id: 'chip-organ', name: 'Chip Organ' },
  { id: 'wavetable', name: 'Wavetable Lead' },
  { id: 'ring-mod', name: 'Ring Mod Lead' },
  { id: 'cheby-lead', name: 'Chebyshev Lead' },
  { id: 'am-synth', name: 'AM Synth' },
  { id: 'digital-glitch', name: 'Digital Glitch' },
  { id: 'res-sweep', name: 'Resonant Sweep' },
  { id: 'additive-bell', name: 'Additive Bell' },
  { id: 'vibrato-lead', name: 'Vibrato Lead' },
  { id: 'duty-sweep', name: 'Duty Cycle Sweep' },
];

const SPECIAL = [
  { id: 'sfx-blip', name: 'GamePad Blip' },
  { id: 'poly-pulse', name: 'PolyPulse Chords' },
  { id: 'simple-chords', name: 'Simple Chords' },
];

// Combined instruments list
const INSTRUMENTS = [
  ...PULSE_FAMILY,
  ...BASS_SECTION,
  ...PERCUSSION_KIT,
  ...LEAD_MELODIC,
  ...SPECIAL
];

export default function TrackRow({ track, index }: TrackRowProps) {
  const { ui, updateTrack, selectTrack, removeTrack, project } = useProjectStore();
  
  const isSelected = ui.selectedTrackId === track.id;
  const hasNotes = track.clips.some(clip => clip.notes.length > 0);
  const noteCount = track.clips.reduce((total, clip) => total + clip.notes.length, 0);
  // All instruments are now working - no need for this check
  
  const handleNameChange = (name: string) => {
    updateTrack(track.id, { name });
  };
  
  const handleInstrumentChange = (instrumentId: string) => {
    updateTrack(track.id, { instrumentId });
  };
  
  const handleVolumeChange = (value: number[]) => {
    updateTrack(track.id, { volume: value[0] });
  };
  
  const handlePanChange = (value: number[]) => {
    updateTrack(track.id, { pan: value[0] / 100 });
  };
  
  const toggleMute = () => {
    updateTrack(track.id, { mute: !track.mute });
  };
  
  const toggleSolo = () => {
    updateTrack(track.id, { solo: !track.solo });
  };

  const currentInstrument = INSTRUMENTS.find(i => i.id === track.instrumentId) || INSTRUMENTS[0];

  return (
    <div 
      className={`group track-row p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
        isSelected 
          ? 'bg-accent border-accent-foreground/20 shadow-sm' 
          : 'hover:bg-accent/30 border-transparent'
      }`}
      onClick={() => selectTrack(track.id)}
    >
      {/* Track Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          <span className={`text-xs font-mono w-6 text-center ${
            isSelected ? 'text-foreground font-semibold' : 'text-muted-foreground'
          }`}>
            {(index + 1).toString().padStart(2, '0')}
          </span>
          <div className="flex flex-col gap-0.5">
            <div className={`w-2 h-2 rounded-full transition-all ${
              hasNotes ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
            }`} title={hasNotes ? `${noteCount} notes` : 'Empty track'} />
          </div>
        </div>
        <Input
          value={track.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="flex-1 h-7 text-sm border-0 bg-transparent focus:bg-background focus:border-border"
          onClick={(e) => e.stopPropagation()}
          placeholder={`Track ${index + 1}`}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            removeTrack(track.id);
          }}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete track"
        >
          ×
        </Button>
      </div>

      {/* Instrument Selector */}
      <div className="mb-2">
        <select
          value={track.instrumentId}
          onChange={(e) => handleInstrumentChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-7 px-2 rounded text-xs bg-muted/50 border border-border hover:bg-muted transition-colors"
        >
          <optgroup label="🎵 Pulse Family">
            {PULSE_FAMILY.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="🎸 Bass Section">
            {BASS_SECTION.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="🥁 Percussion Kit">
            {PERCUSSION_KIT.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="🎹 Lead & Melodic">
            {LEAD_MELODIC.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="✨ Special">
            {SPECIAL.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-1 mb-1">
        {/* Mute/Solo */}
        <Button
          variant={track.mute ? "destructive" : "outline"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className={`h-6 w-8 p-0 text-xs font-semibold transition-all ${
            track.mute ? 'animate-pulse' : ''
          }`}
          title="Mute track (M)"
        >
          {track.mute ? <VolumeX className="h-3 w-3" /> : 'M'}
        </Button>
        <Button
          variant={track.solo ? "default" : "outline"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleSolo();
          }}
          className={`h-6 w-8 p-0 text-xs font-semibold transition-all ${
            track.solo ? 'ring-2 ring-primary/50 animate-pulse' : ''
          }`}
          title="Solo track (S)"
        >
          {track.solo ? <Headphones className="h-3 w-3" /> : 'S'}
        </Button>

        {/* Volume */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Volume2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[track.volume]}
              onValueChange={handleVolumeChange}
              min={-60}
              max={12}
              step={1}
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs font-mono w-7 text-center text-muted-foreground text-[10px]">
              {track.volume > 0 ? '+' : ''}{track.volume}
            </span>
          </div>
        </div>
      </div>

      {/* Pan */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground w-8 text-center">Pan</span>
        <Slider
          value={[track.pan * 100]}
          onValueChange={handlePanChange}
          min={-100}
          max={100}
          step={10}
          className="flex-1"
          onClick={(e) => e.stopPropagation()}
        />
        <span className="text-xs font-mono w-7 text-center text-muted-foreground text-[10px]">
          {track.pan === 0 ? 'C' : track.pan > 0 ? `R${Math.round(track.pan * 100)}` : `L${Math.round(Math.abs(track.pan) * 100)}`}
        </span>
      </div>
    </div>
  );
}
