# PXL Chiptune Masterpiece Studio — Engineering Spec v1.0

utilize context7 and ref mcp server to fully understand Tone.js, music theory, and creating music

**Stack**: Next.js (App Router, TypeScript), Tone.js, shadcn/ui, Zustand, Zod, @tonejs/midi, lucide-react

**No DB.** Persist via localStorage/file export. 100% client‑side audio; AI helper via server route calling Gemini.

---

## 1) North‑Star Vision (What “fully capable” looks like)

A tracker‑style, pattern‑based sequencer with a modern piano‑roll option, built‑in chip‑inspired instruments (15+), fast hotkeys, and zero‑to‑sound in <10 seconds.

* **One‑screen Compose**: Transport (Play/Stop/Record), BPM, Time Signature, Bars, Key/Scale, Swing, Quantize. Tracks (up to 12) shown vertically; each track has Mute/Solo/Arm, instrument picker, volume/pan, FX sends.
* **Pattern Grid**: Tracker grid (per track) with step resolution; toggle to piano‑roll per clip. Clipboard & repeat tools.
* **Chip Instruments**: NES/GB‑style pulse/triangle/noise, FM bells, bitcrushed leads, noise kit (kick/snare/hats), arpeggiators, chord pads. Minimal CPU.
* **Automation Lanes**: Per‑track envelopes (cutoff, resonance, volume, pan, bitcrush, delay mix, etc.).
* **AI Helper (Gemini)**: Suggest keys/scales by mood; generate chord progressions (Roman numerals + voicings), arpeggio patterns, drum motifs; transform selection (e.g., “more heroic”, “8‑bit boss fight”, “Lydian sparkle”).
* **Render/Export**: Realtime preview; offline render to WAV/OGG; export/import Project JSON; MIDI export.
* **Getting Started**: New project auto‑loads demo pattern, default kit, and starter progression; first Play sounds immediately.

---

## 2) MVP Feature List & Acceptance Criteria

**Global**

* [ ] Set **BPM** (20–300), **Time Signature** (e.g., 4/4, 3/4, 5/4), **Bars** (1–128) → Transport length updates.
* [ ] **Key & Scale** selector; snap/quantize notes to scale.
* [ ] Up to **12 tracks**; per‑track **instrument**, volume, pan, mute/solo.
* [ ] **Step grid** (resolution 1/1 … 1/16; default 1/16). Click to toggle notes; drag to extend; velocity per note.
* [ ] **Piano‑roll** view per clip (toggle from grid).
* [ ] **Pattern system**: patterns (P1..Pn) can be placed on arrangement timeline.
* [ ] **Swing** and **quantize** apply globally and per‑track.
* [ ] **Automation lanes** (min: filter cutoff, delay mix, volume) per track.
* [ ] **Save/Load**: Local JSON; **Export**: WAV (offline render), MIDI; **Import**: JSON restores instruments/notes.
* [ ] **AI helper**: returns chord progression & suggested voicings within selected key/scale and meters; “Apply to Track” creates chord clips.

**Tone.js Audio**

* [ ] Central **Transport**; each track uses **Tone.Part/Sequence** tied to samples/synths.
* [ ] Global FX bus: **Limiter**, **Compressor**, **BitCrusher**, **Chorus**, **Delay**, **Reverb** (cheap settings), **EQ3**.
* [ ] Per‑track insert chain with minimal overhead (**Filter**, **Distortion**, **BitCrusher**, **AutoFilter** optional) + **Send** to Delay/Reverb.

**Instruments (Phase 1: 15 presets)**

1. Pulse Lead 12.5%
2. Pulse Lead 25%
3. Pulse Lead 50%
4. PWM Lead
5. Triangle Bass
6. Sub Sine Bass
7. Noise Snare
8. Noise Hat (short)
9. Noise Kick (clicky)
10. Chip Arp Pluck
11. PolyPulse Chords (PolySynth of Pulse)
12. FM Bell
13. Bitcrushed Saw Lead
14. Chip Organ
15. GamePad (blip SFX)

(Phase 2 adds more: chip strings, NES bass, DPCM‑style sampler kit, SFX sweeps, etc.)

**UX**

* [ ] Dark theme; shadcn/ui components; responsive to 1280×800.
* [ ] **Hotkeys**: Space (Play/Stop), R (Record), Q/W (quantize −/+), \[/] step res, Cmd/Ctrl+S (Save JSON), 1–9 select tools, M/S toggle on focused track.
* [ ] Tooltips & a **30‑sec guided overlay** the first time.

---

## 3) Architecture Overview

* **App Router** (`/app`) with client components for editor; minimal server usage for AI route.
* **State**: Zustand store (single source of truth) + Immer for immutable updates. Persist to localStorage.
* **Validation**: Zod schemas for Project/Track/Clip/Note/Automation.
* **Audio Engine**: `src/audio` contains instrument factory, FX graph, scheduler bindings.
* **AI**: `/app/api/ai/chords/route.ts` calls Gemini; server action wrapper `suggestChords()`.
* **Export**: Tone.Offline rendering utility; `@tonejs/midi` for MIDI.

---

## 4) Data Model (TypeScript)

```ts
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

export interface AutomationPoint { time: number; value: number; }
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
```

**Zod Schemas** in `src/schemas` mirror these for validation and persistence.

---

## 5) State & Persistence

* **Zustand store** (`src/state/useProjectStore.ts`): holds `Project`, playback cursor, selection, UI prefs.
* **Persistence**: `localStorage` with debounce (500ms) on change; menu → Export JSON; Import JSON merges/overwrites.

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState { selectedTrackId?: string; isPlaying: boolean; stepRes: 1|2|4|8|16; }
interface ProjectState { project: Project; ui: UIState; /* actions... */ }

export const useProjectStore = create<ProjectState>()(
  persist((set, get) => ({ /* actions */ }), { name: 'chipstudio-v1' })
);
```

---

## 6) Audio Engine (Tone.js)

**Graph**

```
Tracks → Insert FX (Filter/Dist/BitCrush) → Send (Delay, Reverb) → Channel → MasterChain (EQ3→Compressor→BitCrusher→Limiter) → Destination
```

**Components**

* `InstrumentFactory`: builds Tone nodes per preset; returns `{ synth: Tone.PolySynth|Tone.Synth|Tone.NoiseSynth|Tone.Sampler, channel: Tone.Channel, dispose() }`.
* `Scheduler`: converts `Project` to `Tone.Part`/`Tone.Sequence` per track; attaches to `Transport`.
* `AutomationApplier`: on each `Transport` tick, updates param values from lanes.

**Key APIs**

* `Tone.Transport.bpm.value = meta.bpm;`
* `Tone.Transport.timeSignature = [num, den];`
* `Tone.Transport.scheduleRepeat(cb, '16n');` for automation interpolation.
* `new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'pulse' } })`
* `new Tone.FMSynth()`, `new Tone.NoiseSynth()`, `new Tone.MembraneSynth()`
* `Tone.Distortion`, `Tone.BitCrusher`, `Tone.Filter`, `Tone.AutoFilter`, `Tone.FeedbackDelay`, `Tone.Reverb`, `Tone.Compressor`, `Tone.Limiter`, `Tone.EQ3`
* `Tone.Offline(async () => { ... }, durationSeconds)` → AudioBuffer → WAV

**Instrument Presets (Phase 1)**

```ts
// src/audio/instruments.ts
export type InstrumentPreset = { id: string; name: string; build: () => { out: Tone.ToneAudioNode; trigger: (n: string, d: string, t?: number, v?: number) => void; dispose: () => void } };

export const INSTRUMENTS: InstrumentPreset[] = [
  { id: 'pulse12', name: 'Pulse Lead 12.5%', build: () => buildPulse(0.125) },
  { id: 'pulse25', name: 'Pulse Lead 25%', build: () => buildPulse(0.25) },
  { id: 'pulse50', name: 'Pulse Lead 50%', build: () => buildPulse(0.5) },
  { id: 'pwm', name: 'PWM Lead', build: buildPWM },
  { id: 'tri-bass', name: 'Triangle Bass', build: buildTriangleBass },
  { id: 'sub', name: 'Sub Sine Bass', build: buildSub },
  { id: 'n-kick', name: 'Noise Kick', build: buildNoiseKick },
  { id: 'n-snare', name: 'Noise Snare', build: buildNoiseSnare },
  { id: 'n-hat', name: 'Noise Hat', build: buildNoiseHat },
  { id: 'arp-pluck', name: 'Chip Arp Pluck', build: buildArpPluck },
  { id: 'poly-pulse', name: 'PolyPulse Chords', build: buildPolyPulse },
  { id: 'fm-bell', name: 'FM Bell', build: buildFMBell },
  { id: 'bc-saw', name: 'Bitcrushed Saw', build: buildBitSaw },
  { id: 'chip-organ', name: 'Chip Organ', build: buildChipOrgan },
  { id: 'sfx-blip', name: 'GamePad Blip', build: buildBlip }
];
```

---

## 7) UI & Components (shadcn/ui)

**Layout**

* **Top Bar**: Project name, BPM, TimeSig, Bars, Key/Scale, Swing, Quantize; Play/Stop/Record; Export; AI button.
* **Track List**: 12 rows max; track header (instrument select `Combobox`, volume `Slider`, pan `Slider`, M/S buttons, FX send dials, name editable).
* **Editor Panel**: Tabs → `Pattern Grid` | `Piano Roll` | `Automation` | `Mixer`.
* **Right Drawer (AI)**: prompt presets ("Heroic", "Chill", "Boss Fight"), key/scale/time context, preview progression, Apply.

**shadcn components**
`Button, Input, Slider, Select, Tabs, Dialog, DropdownMenu, Popover, Toggle, Tooltip, Badge, Card, Sheet, Separator, Label, ScrollArea`.

**Grid Editing**

* Virtualized grid (`@tanstack/react-virtual`).
* Step resolution control ($ $/keys). Paint tool for rapid input; right‑drag erase; alt‑drag repeat; shift‑drag transpose.

---

## 8) AI Helper (Gemini) — Design

**Capabilities**

* Generate chord progressions in Roman numerals for given **key**, **scale**, **time signature**, **bars**, **mood**.
* Output exact **voicings** (pitches with octaves), optional **inversions**, and **rhythmic pattern** (note lengths per bar).
* Provide **alternatives** (A/B/C) and **explanations**.

**Contract**
Request (server):

```json
{
  "key": "C",
  "scale": "minor",
  "timeSig": "4/4",
  "bars": 8,
  "mood": "heroic 8-bit",
  "register": { "low": "C3", "high": "C5" }
}
```

Response:

```json
{
  "progressions": [
    {
      "roman": ["i", "VI", "III", "VII", "i", "iv", "V", "i"],
      "chords": [["C4", "Eb4", "G4"], ["Ab3","C4","Eb4"], ...],
      "rhythm": ["1m","1m","1m","1m","1m","1m","2n","2n"],
      "comment": "Minor tonic with plagal color; cadence V→i at bars 7–8."
    }
  ]
}
```

**Implementation**

* Server route `/api/ai/chords` reads env `GEMINI_API_KEY` and `GEMINI_MODEL` (e.g., `gemini-1.5-pro-latest`).
* Validates input via Zod, crafts system + user prompts with few‑shot examples (8‑bit idioms: cadences, modal interchange minimal, avoid extensions beyond 7ths unless asked).
* Returns **strict JSON**; guards with regex/JSON.parse try/catch + schema.
* Client `useAiChords()` hook calls route, shows 3 options, and “Apply to Track”.

**Few‑Shot Encouragements**

* Prefer triads and power‑chords; use **diatonic** progressions; occasional secondary dominant okay when requested.
* Offer arpeggio patterns `[1e&a]` broken chords for chip feel.

---

## 9) Export/Render

* **WAV**: Use `Tone.Offline` with a rebuilt graph from `Project`, duration = `bars * (4 * 60 / bpm)` for 4/4, generalized by timeSig.
* **MIDI**: Use `@tonejs/midi`. For each track, create MIDI track, push NoteOn/Off with velocity and channel.
* **Project JSON**: `downloadJSON(project)`; import merges.

---

## 10) File/Folder Structure

```
src/
  app/
    layout.tsx
    page.tsx // main editor
    api/
      ai/
        chords/route.ts // POST
  components/
    transport/
    tracks/
    editor/
    ai/
    common/
  audio/
    instruments.ts
    factory.ts
    fx.ts
    scheduler.ts
    automation.ts
    export.ts
  state/
    useProjectStore.ts
  schemas/
    project.ts
  types/
    song.ts
  lib/
    music.ts // theory util (intervals, roman→chord)
    persist.ts
  styles/
    globals.css
```

---

## 11) Key Implementation Sketches

**Transport & Globals**

```tsx
// components/transport/TransportBar.tsx
'use client';
import { Button, Slider, Select } from '@/components/ui';
import * as Tone from 'tone';
import { useProjectStore } from '@/state/useProjectStore';

export default function TransportBar(){
  const { project, ui, setBpm, setTimeSig, setBars, togglePlay } = useProjectStore();
  return (
    <div className="flex items-center gap-3 p-2 border-b">
      <Button onClick={togglePlay}>{ui.isPlaying ? 'Stop' : 'Play'}</Button>
      <div className="flex items-center gap-2">
        <label>BPM</label>
        <Slider min={20} max={300} value={[project.meta.bpm]} onValueChange={([v])=>setBpm(v)} />
      </div>
      {/* TimeSig, Bars, Key/Scale selectors, Swing, Quantize ... */}
    </div>
  );
}
```

**Scheduler**

```ts
// audio/scheduler.ts
export function buildTransport(project: Project){
  Tone.Transport.cancel();
  Tone.Transport.bpm.value = project.meta.bpm;
  const [num, den] = project.meta.timeSig.split('/') as [string,string];
  Tone.Transport.timeSignature = [Number(num), Number(den)];
  const totalBeats = project.meta.bars * (4 / Number(den)) * Number(num);
  // For each track, build Part
  project.tracks.forEach((t) => {
    const inst = getInstrumentInstance(t.instrumentId); // factory
    const part = new Tone.Part((time, ev: NoteEvent) => {
      inst.trigger(ev.pitch, ev.duration + 'n', time, ev.velocity);
    }, t.clips.flatMap(c => c.notes.map(n => ({ time: n.time + c.start, ...n }))));
    part.start(0);
  });
  return { totalBeats };
}
```

**Offline Export**

```ts
// audio/export.ts
export async function renderWav(project: Project){
  const seconds = project.meta.bars * (60 / project.meta.bpm) * (project.meta.timeSig.startsWith('4/') ? 4 : parseInt(project.meta.timeSig));
  const buffer = await Tone.Offline(async () => {
    buildTransport(project);
    Tone.Transport.start();
  }, seconds);
  return audioBufferToWavBlob(buffer);
}
```

**AI Route**

```ts
// app/api/ai/chords/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const Input = z.object({ key: z.string(), scale: z.string(), timeSig: z.string(), bars: z.number().min(1).max(128), mood: z.string().optional(), register: z.object({low:z.string(),high:z.string()}).optional() });

export async function POST(req: NextRequest){
  const body = await req.json();
  const { key, scale, timeSig, bars, mood } = Input.parse(body);
  const prompt = buildChordPrompt({ key, scale, timeSig, bars, mood });
  const res = await fetch(process.env.GEMINI_ENDPOINT!, {
    method:'POST', headers:{ 'Content-Type':'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! }, body: JSON.stringify({ model: process.env.GEMINI_MODEL, contents:[{ role:'user', parts:[{text: prompt}]}] })
  });
  const json = await res.json();
  const out = coerceToChordJson(json);
  return NextResponse.json(out);
}
```

---

## 12) Music‑Theory Utilities

* `romanToChord(roman, key, scale, inv?)` → triad notes.
* `snapToScale(note, key, scale)`.
* `generateArpPattern(chordNotes, density, direction)`.
* `humanize(timing, velocity, ±rng)` with small random offsets.

---

## 13) Onboarding & Quickstart

1. On first load, **Project Wizard** (Sheet): choose BPM (120), time 4/4, bars 8, key C major/minor.
2. Auto‑create 4 tracks: **Pulse Lead**, **Triangle Bass**, **PolyPulse Chords**, **Noise Kit**. Load demo pattern + 8‑bar I–V–vi–IV or i–VI–III–VII.
3. “Press **Space** to Play” toast.

---

## 14) Phases

**Phase 0 (Scaffold)**

* Next.js app, shadcn/ui installed; Zustand store; Transport bar UI; 4 demo instruments; Play works.

**Phase 1 (MVP)**

* 12 tracks, pattern grid, piano‑roll, quantize/swing, 15 instruments, save/load, WAV/MIDI export.
* AI chords v1.

**Phase 2**

* Automation lanes; FX sends; arpeggiator module; humanize; theme presets.

**Phase 3**

* Sampler kit (DPCM‑like), SFX randomizer, groove templates, clip transpose, scale lock per track, MIDI in.

---

## 15) Hotkeys

* Space Play/Stop; R Record (step input mode)
* Q/W Quantize −/+
* \[ / ] Step resolution −/+
* ↑/↓ Move selection; ←/→ Move in time; Shift+←/→ stretch note
* Delete: erase; Cmd/Ctrl+C/V copy/paste notes; Alt+Drag: duplicate; +/- transpose semitone; Shift+ +/- octave

---

## 16) Performance & Constraints

* Keep nodes minimal; reuse PolySynths; cap polyphony (<= 12 voices)
* Turn off visual animations when background tab; use requestAnimationFrame for cursors only when playing
* Debounce store writes; shallow compare selectors

---

## 17) QA Checklist

* Changing BPM/timeSig while playing stays in sync (stop/rebuild if needed)
* Import JSON fully reconstructs graph
* Exported WAV length matches bars & timeSig within ±1ms
* AI output always valid JSON; failure path shows helpful error and example

---

## 18) Definition of Done (MVP)

* User can open app, press play, hear demo tune; edit notes; change BPM/timeSig/bars; add tracks (<=12); pick instruments; export WAV & MIDI; ask AI for chords and apply them; save/load project JSON—all without docs.

---

## 19) Backlog (Post‑MVP Ideas)

* Pattern probability per step; Euclidean rhythms; per‑track swing
* LFO mod matrix; step‑automation drawing; oscillator detune drift
* WebMIDI input; computer keyboard note‑entry mode
* Bounce‑in‑place per track; stems export
* Collab via URL‑encoded project (still no DB)

---

## 20) Prompts (AI Few‑Shot Excerpts)

**System gist**: “You are a chiptune composition assistant. Produce compact JSON only. Use diatonic triads, chip‑friendly voice‑leading (P4/P5), sparse rhythms for clarity. Respect key/scale and time signature. Prefer 4/8 bar loops. Offer one adventurous alt.”

**User example**: “Key=C minor, 4/4, bars=8, mood=heroic. Please output roman, chords\[], rhythm\[], comment.”

---

## 21) Readme Snippet for Devs

**Setup**

```
pnpm i
cp .env.example .env.local
# fill GEMINI_API_KEY, GEMINI_MODEL=gemini-1.5-pro-latest, GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models:generateContent
pnpm dev
```

**Scripts**

* `pnpm dev` — run app
* `pnpm lint` — lint
* `pnpm build` — build

---

## 22) Acceptance Test Song

* Project: 120 BPM, 4/4, 16 bars
* Tracks: Pulse Lead (melody), PolyPulse (chords), Triangle Bass (root+5th), Noise Kit (kick 1&3, snare 2&4, hats 8ths), PWM counter‑melody at bars 9–16
* Export WAV \~32s; Verify no clipping (Limiter ceiling −0.2 dB).

---

**End of Spec v1.0**
