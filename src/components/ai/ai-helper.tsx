'use client';

import { useState } from 'react';
import { useProjectStore } from '@/state/useProjectStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Sparkles, Wand2, Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { generateAIComposition, type ProjectContext, type AICompositionResponse } from '@/lib/ai-service';
import { aiConfig } from '@/config/ai-config';

interface AIHelperProps {
  onClose?: () => void;
}

export default function AIHelper({ onClose }: AIHelperProps) {
  const { project, ui, addTrack, updateTrack } = useProjectStore();

  // Add debugging for track creation
  // console.log('🎵 Current project tracks:', project.tracks.length);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);



  // Serialize current project state for AI context
  const getProjectContext = (): ProjectContext => {
    return {
      settings: {
        bpm: project.meta.bpm,
        timeSignature: project.meta.timeSig,
        bars: project.meta.bars,
        key: project.meta.key,
        scale: project.meta.scale,
        swing: project.meta.swing,
        totalBeats: project.meta.bars * parseInt(project.meta.timeSig.split('/')[0]),
      },
      tracks: project.tracks.map(track => ({
        id: track.id,
        name: track.name,
        instrumentId: track.instrumentId,
        volume: track.volume,
        pan: track.pan,
        mute: track.mute,
        solo: track.solo,
        noteCount: track.clips.reduce((sum, clip) => sum + clip.notes.length, 0),
        // Include note data for AI context
        notes: track.clips.flatMap(clip =>
          clip.notes.map(note => ({
            time: note.time,
            duration: note.duration,
            pitch: note.pitch,
            velocity: note.velocity,
          }))
        ),
      })),
      currentView: ui.currentView,
      stepResolution: ui.stepRes,
    };
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setLastResult(null);

    try {
      const context = getProjectContext();

      const response: AICompositionResponse = await generateAIComposition({
        context,
        prompt: prompt.trim(),
      });

      if (response.success && response.data) {
        // Debug: Show the entire AI response
        console.log('🎯 Full AI Response Received:');
        console.log(JSON.stringify(response.data, null, 2));

        console.log('📊 Response Summary:');
        console.log(`- Tracks to process: ${response.data.tracks.length}`);
        console.log(`- Total notes: ${response.data.tracks.reduce((sum, track) => sum + (track.notes?.length || 0), 0)}`);
        console.log(`- Message: ${response.data.message}`);

        // Apply AI-generated changes to project
        await applyAIChanges(response.data.tracks);

        setLastResult({
          success: true,
          message: response.data.message || 'Composition generated successfully!'
        });
      } else {
        setLastResult({
          success: false,
          message: response.error || 'Generation failed'
        });
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsGenerating(false);
    }
  };

    // Apply AI-generated changes to the project
  const applyAIChanges = async (trackUpdates: any[]) => {
    console.log('🎵 ===== STARTING AI CHANGES APPLICATION =====');
    console.log('🎵 Applying AI changes to tracks:', trackUpdates.length);
    console.log('🎵 Full track updates array:', JSON.stringify(trackUpdates, null, 2));

    const currentTrackCount = project.tracks.length;
    console.log(`🎵 Starting with ${currentTrackCount} existing tracks`);

    // Phase 1: Create all tracks first
    const createdTrackIds: string[] = [];
    const trackUpdatesWithIds: any[] = [];

    for (let i = 0; i < trackUpdates.length; i++) {
      const update = trackUpdates[i];
      console.log(`🎵 ===== CREATING TRACK ${i + 1}/${trackUpdates.length} =====`);
      console.log(`🎵 Track: ${update.name} (${update.instrumentId}) - ${update.notes?.length || 0} notes`);

      if (update.action === 'create' && update.id === 'new') {
        console.log(`🎵 Creating new track with instrument: ${update.instrumentId}`);
        const newTrackId = addTrack();

        if (!newTrackId) {
          console.error(`❌ Failed to create track ${i + 1}. addTrack() returned undefined.`);
          continue;
        }

        console.log(`🎵 Successfully created track with ID: ${newTrackId}`);
        createdTrackIds.push(newTrackId);
        trackUpdatesWithIds.push({ ...update, actualId: newTrackId });

        // Small delay between creations
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    console.log(`🎵 Phase 1 complete: Created ${createdTrackIds.length} tracks`);

    // Phase 2: Wait for all state updates to complete
    console.log('🎵 Phase 2: Waiting for state updates...');
    await new Promise(resolve => setTimeout(resolve, 100));

    // Phase 3: Update all tracks with AI data
    console.log('🎵 Phase 3: Updating tracks with AI data...');
    for (let i = 0; i < trackUpdatesWithIds.length; i++) {
      const update = trackUpdatesWithIds[i];
      const trackId = update.actualId;

      console.log(`🎵 ===== UPDATING TRACK ${i + 1}/${trackUpdatesWithIds.length} =====`);
      console.log(`🎵 Updating track ${trackId} with instrument: ${update.instrumentId}`);

      // Get fresh state to verify the track exists
      const store = useProjectStore.getState();
      const currentTrack = store.project.tracks.find(t => t.id === trackId);

      if (!currentTrack) {
        console.error(`❌ Track ${trackId} not found in current state. Available tracks:`, store.project.tracks.map(t => ({ id: t.id, name: t.name })));
        continue;
      }

      console.log(`🎵 Found track in store:`, {
        id: currentTrack.id,
        name: currentTrack.name,
        currentInstrument: currentTrack.instrumentId,
        targetInstrument: update.instrumentId
      });

      // Create clip with AI-generated notes
      const clip = {
        id: `ai-clip-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        start: 0,
        length: store.project.meta.bars * 4, // Length in beats (4 beats per bar in 4/4)
        notes: update.notes || [],
        muted: false
      };

      console.log(`🎵 Created clip with ${clip.notes.length} notes for track ${trackId}`);

      // Update the track with AI data
      updateTrack(trackId, {
        name: update.name || `AI ${update.instrumentId}`,
        instrumentId: update.instrumentId,
        volume: update.volume || 0.7,
        pan: update.pan || 0,
        clips: [clip], // Replace default empty clip with AI-generated clip
      });

      console.log(`✅ Successfully updated track ${trackId} (${update.name}) with ${clip.notes.length} notes`);
    }

    // Handle existing track updates
    for (const update of trackUpdates) {
      if (update.action === 'update' && update.id !== 'new') {
        console.log(`🎵 Updating existing track: ${update.id}`);
        const updateData: any = {};

        if (update.volume !== undefined) updateData.volume = update.volume;
        if (update.pan !== undefined) updateData.pan = update.pan;

        if (update.notes) {
          const existingTrack = project.tracks.find(t => t.id === update.id);
          if (existingTrack && existingTrack.clips.length > 0) {
            const updatedClip = {
              ...existingTrack.clips[0],
              notes: [...existingTrack.clips[0].notes, ...update.notes]
            };
            updateData.clips = [updatedClip];
          }
        }

        if (Object.keys(updateData).length > 0) {
          updateTrack(update.id, updateData);
        }
      } else if (update.action === 'clear' && update.id !== 'new') {
        const existingTrack = project.tracks.find(t => t.id === update.id);
        if (existingTrack && existingTrack.clips.length > 0) {
          const clearedClip = { ...existingTrack.clips[0], notes: [] };
          updateTrack(update.id, { clips: [clearedClip] });
        }
      }
    }

    console.log('🎵 ===== AI CHANGES APPLICATION SUMMARY =====');
    console.log(`✅ Processed ${trackUpdates.length} track updates`);
    console.log(`📊 Expected total notes: ${trackUpdates.reduce((sum, track) => sum + (track.notes?.length || 0), 0)}`);

    // Final verification - count actual tracks created
    const finalTrackCount = project.tracks.length;
    const tracksAdded = finalTrackCount - currentTrackCount;
    console.log(`📈 Tracks added: ${tracksAdded} (from ${currentTrackCount} to ${finalTrackCount})`);

    console.log('🎵 ===== APPLICATION COMPLETE =====\n');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Music Helper
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate musical ideas and patterns using AI assistance
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI Status Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              AI Status
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={aiConfig.provider === 'openrouter' ? 'default' : 'secondary'} className="text-xs">
                {aiConfig.provider === 'openrouter' ? 'OpenRouter + Gemini' : 'Mock Mode'}
              </Badge>
              <div
                className="w-4 h-4 text-muted-foreground cursor-help"
                title={
                  aiConfig.provider === 'openrouter'
                    ? 'Using OpenRouter API with Google Gemini Flash 2.5'
                    : 'Using mock responses for development. Add API key for real AI.'
                }
              >
                <Info className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Project Context */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Current Project
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">BPM:</span>
                <Badge variant="outline">{project.meta.bpm}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Signature:</span>
                <Badge variant="outline">{project.meta.timeSig}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Key:</span>
                <Badge variant="outline">{project.meta.key} {project.meta.scale}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracks:</span>
                <Badge variant="outline">{project.tracks.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bars:</span>
                <Badge variant="outline">{project.meta.bars}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Swing:</span>
                <Badge variant="outline">{Math.round(project.meta.swing * 100)}%</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Describe Your Vision
          </label>

          <Textarea
            placeholder="e.g., 'Create a funky bassline with some syncopated hi-hats and a melodic lead that builds tension'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isGenerating}
          />

          <div className="text-xs text-muted-foreground">
            The AI will use your current project settings and existing tracks as context to generate new musical ideas.
          </div>
        </div>

        {/* Generation Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>

            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>

          {/* Result Status */}
          {lastResult && (
            <div className={`flex items-center gap-2 text-sm ${
              lastResult.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {lastResult.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {lastResult.message}
            </div>
          )}
        </div>

        {/* Example Prompts */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Example Prompts:
          </h4>

          <div className="grid gap-2">
            {[
              "Add a walking bassline that complements the existing melody",
              "Create syncopated drum patterns with some ghost notes",
              "Generate chord progressions in the current key",
              "Add atmospheric pads that evolve over time",
              "Create counter-melodies that harmonize with the lead",
              "Build rhythmic variations using the current swing setting"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-left text-sm p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                disabled={isGenerating}
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
