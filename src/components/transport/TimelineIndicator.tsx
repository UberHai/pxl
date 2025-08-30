'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/state/useProjectStore';
import * as Tone from 'tone';

export default function TimelineIndicator() {
  const { project, ui } = useProjectStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Calculate total steps based on UI step resolution
  const stepsPerBar = ui.stepRes || 16; // Use current step resolution
  const totalSteps = project.meta.bars * stepsPerBar;

  // Update current step based on transport position
  useEffect(() => {
    if (!ui.isPlaying) {
      setCurrentStep(0);
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    const updatePosition = () => {
      if (Tone.Transport.state === 'started') {
        try {
          // Parse transport position correctly - it's in "bars:beats:sixteenths" format
          const position = Tone.Transport.position;
          let positionInBeats: number;
          
          if (typeof position === 'string') {
            // Parse BBQ format like "0:0:0" or "1:2:3"
            const parts = position.split(':').map(Number);
            const bars = parts[0] || 0;
            const beats = parts[1] || 0;
            const sixteenths = parts[2] || 0;
            
            // Parse time signature for accurate calculation
            const [numerator] = project.meta.timeSig.split('/').map(Number);
            const beatsPerBar = numerator || 4;
            
            // Convert to total beats - sixteenths are actually sixteenths of a beat, not quarters
            positionInBeats = bars * beatsPerBar + beats + sixteenths / 16;
          } else {
            // Fallback if position is already a number
            positionInBeats = position as number;
          }
          
          // Convert beats to steps based on current step resolution
          const stepValue = 4 / stepsPerBar; // Step value in beats
          const step = Math.floor(positionInBeats / stepValue) % totalSteps;
          setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
        } catch (error) {
          console.warn('Timeline position update failed:', error);
        }
      }
    };

    // Update immediately
    updatePosition();

    // Update frequently for smooth animation
    const interval = setInterval(updatePosition, 50); // Update 20 times per second

    return () => clearInterval(interval);
  }, [ui.isPlaying, totalSteps, stepsPerBar, project.meta.timeSig]);

  // Create timeline squares with enhanced visual feedback
  const squares = Array.from({ length: totalSteps }, (_, index) => {
    const isBarStart = index % stepsPerBar === 0;
    const isBeatStart = index % (stepsPerBar / 4) === 0;
    const isCurrentStep = index === currentStep && isPlaying;
    const isPlayed = index < currentStep;
    const isUpcoming = index > currentStep;

    let bgColor = 'bg-muted-foreground/20'; // Default: upcoming (light gray)
    let size = 'w-1.5 h-1.5'; // Default size
    let animation = '';

    if (isCurrentStep) {
      bgColor = 'bg-primary'; // Current step (primary color)
      size = 'w-2 h-2'; // Larger for current step
      animation = 'animate-pulse';
    } else if (isPlayed) {
      bgColor = 'bg-primary/60'; // Already played (dimmed primary)
    } else if (isBarStart) {
      bgColor = 'bg-accent-foreground/40'; // Bar markers
      size = 'w-1.5 h-2'; // Taller for bar starts
    } else if (isBeatStart) {
      bgColor = 'bg-accent-foreground/30'; // Beat markers
    }

    return (
      <div
        key={index}
        className={`${size} rounded-sm ${bgColor} ${animation} transition-all duration-150`}
        title={`Step ${index + 1}${isBarStart ? ' (Bar start)' : isBeatStart ? ' (Beat)' : ''}`}
      />
    );
  });

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-md">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
        <span className="text-xs font-medium text-muted-foreground">
          {isPlaying ? 'Playing' : 'Stopped'}
        </span>
      </div>
      
      <div className="flex gap-0.5 max-w-80 overflow-hidden p-1 bg-background/50 rounded">
        {squares}
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-xs font-mono text-foreground font-medium">
          {currentStep + 1}
        </span>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-mono text-muted-foreground">
          {totalSteps}
        </span>
      </div>
    </div>
  );
}
