'use client';

import { useProjectStore } from '@/state/useProjectStore';
import TrackRow from './TrackRow';

export default function TrackList() {
  const { project } = useProjectStore();

  return (
    <div className="space-y-1 p-2">
      {project.tracks.map((track, index) => (
        <TrackRow key={track.id} track={track} index={index} />
      ))}
      {project.tracks.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          No tracks yet. Click "Add Track" to get started.
        </div>
      )}
    </div>
  );
}
