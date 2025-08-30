'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/state/useProjectStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import TransportBar from '@/components/transport/TransportBar';
import TrackList from '@/components/tracks/TrackList';
import PatternGrid from '@/components/editor/PatternGrid';
import { Button } from '@/components/ui/button';


export default function Home() {
  const store = useProjectStore();
  const { project, ui, addTrack } = store;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Debug logging - ENABLED for debugging
  console.log('🔍 RENDER DEBUG:', { 
    store,
    project, 
    ui,
    hasProject: !!project, 
    hasUi: !!ui, 
    hasMeta: !!project?.meta,
    projectKeys: project ? Object.keys(project) : 'no project',
    uiKeys: ui ? Object.keys(ui) : 'no ui',
    metaKeys: project?.meta ? Object.keys(project.meta) : 'no meta',
    isLoading,
    hasError,
    timestamp: new Date().toISOString()
  });

  // Loading timeout to prevent infinite loading
  useEffect(() => {
    console.log('🕐 TIMEOUT EFFECT:', { project, ui, hasUi: !!ui, hasMeta: !!project?.meta });
    
    const timer = setTimeout(() => {
      console.log('⏰ TIMEOUT TRIGGERED after 5s:', { project, ui, hasUi: !!ui, hasMeta: !!project?.meta });
      if (!project || !ui || !project.meta) {
        console.log('❌ SETTING ERROR STATE - missing required fields');
        setHasError(true);
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => {
      console.log('🧹 TIMEOUT CLEANUP');
      clearTimeout(timer);
    };
  }, [project, ui]);

  // Mark as loaded when store is ready
  useEffect(() => {
    console.log('✅ READY CHECK:', { 
      project: !!project, 
      ui: !!ui, 
      meta: !!project?.meta,
      allReady: !!(project && ui && project.meta)
    });
    
    if (project && ui && project.meta) {
      console.log('🎉 ALL READY - setting loaded state');
      setIsLoading(false);
      setHasError(false);
    }
  }, [project, ui]);

  // Initialize with demo tracks on first load (must be before any conditional returns)
  useEffect(() => {
    if (!project || !ui || !project.meta) return;
    if (project.tracks.length === 0) {
      // Start with a single track by default
      addTrack();
    }
  }, [project, ui, project?.tracks.length, addTrack]);

  // Show error state
  if (hasError) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load PXL Chiptune Studio</p>
            <p className="text-sm text-muted-foreground mb-4">
              There was an issue initializing the application. Please refresh the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Show loading state
  if (isLoading || !project || !ui || !project.meta) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Loading PXL Chiptune Studio...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-xs text-muted-foreground mt-4">
              Initializing audio engine and loading project data...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col h-screen">
        {/* Transport Bar */}
        <TransportBar />
        
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Track List */}
          <div className="w-80 min-w-80 max-w-80 border-r border-border bg-card flex flex-col">
            <div className="p-3 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">Tracks ({project.tracks.length}/12)</h2>
                <span className="text-xs text-muted-foreground">Ctrl+T</span>
              </div>
              <Button 
                onClick={addTrack} 
                size="sm" 
                className="w-full h-7"
                disabled={project.tracks.length >= 12}
              >
                Add Track
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TrackList />
            </div>
          </div>
          
          {/* Editor Panel */}
          <div className="flex-1 bg-background">
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Pattern Editor</h2>
                    <p className="text-sm text-muted-foreground">
                      Select a track from the sidebar to edit its pattern
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="bg-muted/50 rounded p-2 space-y-1">
                      <div className="font-semibold">Shortcuts:</div>
                      <div>Space: Play/Pause</div>
                      <div>M: Metronome</div>
                      <div>L: Loop</div>
                      <div>S: Stop</div>
                      <div>↑/↓: Select Track</div>
                      <div>1-9: Select Track #</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pattern Grid for selected track */}
              {ui?.selectedTrackId && (
                <PatternGrid
                  trackId={ui.selectedTrackId}
                  rows={36}
                />
              )}

              {!ui?.selectedTrackId && (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">No track selected</p>
                    <p className="text-sm text-muted-foreground">
                      Select a track from the sidebar to start editing patterns
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
