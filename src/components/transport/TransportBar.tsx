'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useProjectStore } from '@/state/useProjectStore';
import { Play, Pause, Square, Timer, Repeat } from 'lucide-react';
import TimelineIndicator from './TimelineIndicator';
import {
  initializeAudioContext,
  startTransport,
  stopTransport,
  setBPM,
  setTimeSignature,
  isAudioReady,
  getTransportState
} from '@/audio/engine';
import { initializeScheduler, startPlayback, stopPlayback, updateBPM, updateTimeSignature, updateLoopState, updateSwing, updateMetronomeTiming } from '@/audio/scheduler';
import { useEffect, useState } from 'react';

export default function TransportBar() {
  const {
    project,
    ui,
    audio,
    setBpm,
    setTimeSig,
    setBars,
    setKey,
    setScale,
    setSwing,
    togglePlay,
    stop,
    setAudioInitialized,
    toggleMetronome,
    toggleLoop
  } = useProjectStore();

  const audioInitialized = audio.audioInitialized;

  const handleBpmChange = (value: number[]) => {
    setBpm(value[0]);
  };

  const handleSwingChange = (value: number[]) => {
    const swingValue = value[0] / 100;
    setSwing(swingValue);
    
    // Update audio engine with new swing value
    if (audioInitialized) {
      updateSwing(swingValue);
    }
  };

  // Bars helpers
  const clampBars = (v: number) => Math.max(1, Math.min(128, isNaN(v) ? 1 : v));
  const setBarsClamped = (v: number) => setBars(clampBars(v));
  const incrementBars = () => setBarsClamped((project.meta.bars || 1) + 1);
  const decrementBars = () => setBarsClamped((project.meta.bars || 1) - 1);
  const handleBarsKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      incrementBars();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrementBars();
    }
  };

  // Initialize audio on component mount
  useEffect(() => {
    const ready = isAudioReady();
    if (ready && !audioInitialized) {
      setAudioInitialized(true);
    }
  }, [audioInitialized, setAudioInitialized]);

  // Initialize scheduler when audio is ready
  useEffect(() => {
    if (audioInitialized) {
      initializeScheduler(project, ui.loopEnabled);
    }
  }, [audioInitialized, project, ui.loopEnabled]);

  // Sync BPM/time signature changes with Tone.js Transport, Scheduler, and Metronome
  useEffect(() => {
    if (audioInitialized) {
      setBPM(project.meta.bpm);
      updateBPM(project.meta.bpm);
      setTimeSignature(project.meta.timeSig);
      updateTimeSignature(project.meta.timeSig);
      updateMetronomeTiming(project.meta.bpm, project.meta.timeSig);
    }
  }, [project.meta.bpm, project.meta.timeSig, audioInitialized]);

  // Reinitialize scheduler when loop state changes
  useEffect(() => {
    if (audioInitialized) {
      initializeScheduler(project, ui.loopEnabled);
    }
  }, [ui.loopEnabled, audioInitialized, project]);

  // Update loop state for running playback
  useEffect(() => {
    if (audioInitialized && getTransportState() === 'started') {
      updateLoopState(ui.loopEnabled);
    }
  }, [ui.loopEnabled, audioInitialized]);

  const handlePlayClick = async () => {
    // Initialize audio context on first play (required by browser policy)
    if (!audioInitialized) {
      const success = await initializeAudioContext();
      if (success) {
        setAudioInitialized(true);
      } else {
        console.error('Failed to initialize audio context');
        return;
      }
    }

    // Start/stop transport and playback
    if (getTransportState() === 'started') {
      stopTransport();
      stopPlayback();
    } else {
      startTransport();
      startPlayback();
    }

    // Update UI state
    togglePlay();
  };

  const handleStopClick = () => {
    stopTransport();
    stopPlayback();
    stop();
  };

  return (
    <div className="transport-bar flex items-center gap-4 p-3 bg-card border-b border-border">
      {/* Project Info */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex flex-col">
          <Label className="text-sm font-semibold truncate">{project.meta.name}</Label>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full transition-all ${
                audioInitialized 
                  ? 'bg-green-500' + (ui.isPlaying ? ' animate-pulse' : '')
                  : 'bg-red-500 animate-pulse'
              }`} />
              <span>{audioInitialized ? 'Audio Ready' : 'Audio Initializing'}</span>
            </div>
            {audioInitialized && (
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  audio.metronomeEnabled ? 'bg-blue-500 animate-pulse' : 'bg-muted-foreground/30'
                }`} />
                <span className="text-[10px]">Click</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant={ui.isPlaying ? "default" : "outline"}
          size="sm"
          onClick={handlePlayClick}
          disabled={!audioInitialized && false} // Allow first click to initialize
          className="h-8 px-3"
        >
          {ui.isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
          {ui.isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleStopClick} className="h-8 px-3">
          <Square className="h-3 w-3 mr-1" />
          Stop
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button
          variant={audio.metronomeEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggleMetronome}
          title="Toggle Metronome (M)"
          className="h-8 px-2"
        >
          <Timer className="h-4 w-4" />
        </Button>
        <Button
          variant={ui.loopEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggleLoop}
          title="Toggle Loop (L)"
          className="h-8 px-2"
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border mx-1" />

      {/* Project Settings */}
      <div className="flex items-center gap-3">
        {/* BPM Control */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-muted-foreground">BPM</Label>
          <div className="flex items-center gap-1">
            <Slider
              value={[project.meta.bpm]}
              onValueChange={handleBpmChange}
              min={20}
              max={300}
              step={1}
              className="w-20"
            />
            <span className="text-sm font-mono w-10 text-center">{project.meta.bpm}</span>
          </div>
        </div>

        {/* Time Signature */}
        <div className="flex items-center gap-1">
          <Label className="text-xs font-medium text-muted-foreground">Time</Label>
          <Select value={project.meta.timeSig} onValueChange={(v) => setTimeSig(v)}>
            <SelectTrigger className="w-16 h-7 px-2 text-sm">
              <SelectValue placeholder="4/4" />
            </SelectTrigger>
            <SelectContent>
              {/* Top 16 common signatures */}
              <SelectItem value="4/4">4/4</SelectItem>
              <SelectItem value="3/4">3/4</SelectItem>
              <SelectItem value="2/4">2/4</SelectItem>
              <SelectItem value="6/8">6/8</SelectItem>
              <SelectItem value="12/8">12/8</SelectItem>
              <SelectItem value="2/2">2/2</SelectItem>
              <SelectItem value="5/4">5/4</SelectItem>
              <SelectItem value="7/8">7/8</SelectItem>
              <SelectItem value="9/8">9/8</SelectItem>
              <SelectItem value="3/8">3/8</SelectItem>
              <SelectItem value="5/8">5/8</SelectItem>
              <SelectItem value="7/4">7/4</SelectItem>
              <SelectItem value="9/4">9/4</SelectItem>
              <SelectItem value="11/8">11/8</SelectItem>
              <SelectItem value="13/8">13/8</SelectItem>
              <SelectItem value="15/8">15/8</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bars */}
        <div className="flex items-center gap-1">
          <Label className="text-xs font-medium text-muted-foreground">Bars</Label>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={decrementBars} title="Decrease bars (Arrow Down)">-</Button>
            <Input
              type="number"
              value={project.meta.bars}
              onChange={(e) => setBarsClamped(parseInt(e.target.value))}
              onKeyDown={handleBarsKeyDown}
              className="w-14 h-7 text-center text-sm"
              min={1}
              max={128}
            />
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={incrementBars} title="Increase bars (Arrow Up)">+</Button>
          </div>
        </div>

        {/* Key (24-key dropdown) */}
        <div className="flex items-center gap-1">
          <Label className="text-xs font-medium text-muted-foreground">Key</Label>
          {(() => {
            const keys = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const;
            const scales = ['major','minor'] as const;
            const value = `${project.meta.key}-${project.meta.scale}`;
            const handleChange = (v: string) => {
              const [k, s] = v.split('-');
              setKey(k);
              setScale(s);
            };
            return (
              <Select value={value} onValueChange={handleChange}>
                <SelectTrigger className="w-36 h-7 text-sm">
                  <SelectValue placeholder="Select key" />
                </SelectTrigger>
                <SelectContent>
                  {keys.map((k) => (
                    <div key={k} className="px-1 py-0.5">
                      <div className="text-[10px] text-muted-foreground px-2 pt-1 pb-0.5">{k}</div>
                      <SelectItem value={`${k}-major`}>{k} major</SelectItem>
                      <SelectItem value={`${k}-minor`}>{k} minor</SelectItem>
                    </div>
                  ))}
                </SelectContent>
              </Select>
            );
          })()}
        </div>

        {/* Swing */}
        <div className="flex items-center gap-1">
          <Label className="text-xs font-medium text-muted-foreground">Swing</Label>
          <div className="flex items-center gap-1">
            <Slider
              value={[project.meta.swing * 100]}
              onValueChange={handleSwingChange}
              min={0}
              max={100}
              step={5}
              className="w-16"
            />
            <span className="text-xs font-mono w-8 text-center">{Math.round(project.meta.swing * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Timeline Indicator */}
      <TimelineIndicator />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export Button */}
      <Button variant="outline" size="sm">
        Export
      </Button>

      {/* AI Helper Button */}
      <Button variant="outline" size="sm">
        AI Helper
      </Button>
    </div>
  );
}
