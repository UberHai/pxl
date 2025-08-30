### PatternGrid

A step-based note input grid that visualizes and highlights scale degrees based on the project's key and scale.

## Props

- **trackId**: string — The `Track.id` to render and edit notes for.
- **steps**: number (optional) — Override total steps; defaults to `bars * stepRes`.
- **rows**: number (optional) — Number of note rows to display; defaults to 36 (three octaves).

## Behavior

- Highlights are scale-degree based using the current `project.meta.key` and `project.meta.scale` from `useProjectStore()`.
- Emphasis pattern:
  - Root (1): primary tone
  - Chord tones (3, 5, 7): secondary tone
  - Color tones (2/9, 4/11, 6/13): accent tone
  - In-scale others: subtle muted tone
- Includes a compact legend explaining the color map.

## Usage

```tsx
import PatternGrid from '@/components/editor/PatternGrid';

export default function TrackEditor({ trackId }: { trackId: string }) {
  return (
    <div className="p-4">
      <PatternGrid trackId={trackId} />
    </div>
  );
}
```



