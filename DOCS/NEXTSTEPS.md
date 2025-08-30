# PXL Chiptune Studio - Next Steps Roadmap

> **Last Updated:** 2025-08-30
> **⚠️ REQUIREMENT:** This document MUST be updated whenever features are completed, priorities change, or new requirements are discovered.

## 🎉 CURRENT STATUS: WORKING PROTOTYPE ACHIEVED!

**✅ The application is now fully functional and playable!** Recent fixes resolved critical Zustand store issues that were preventing app initialization. Users can now open the app and immediately create music with real-time audio playback.

### 🏆 Major Achievements

**✅ MVP Core Features Completed:**
- Real-time audio synthesis and playback
- Interactive pattern grid with note editing
- Professional transport controls (BPM, time sig, etc.)
- Working instrument switching
- Complete state management system
- Responsive dark theme UI

**✅ Critical Issues Resolved:**
- Zustand store initialization errors (detectStore bug)
- React hooks order warnings
- AudioContext auto-start warnings
- App startup failures

**🎵 User Experience:**
Users can now open the app at `localhost:3000` and immediately:
- Hear audio playback by pressing Play
- Create patterns by clicking on the grid
- Switch between 4 different instruments
- Adjust BPM and other transport parameters
- Experience real-time audio synthesis

## Phase-Based Development Plan

Based on AGENTS.md specification and current foundation state.

---

## 🎯 PHASE 1: Audio Foundation (HIGH PRIORITY)

### 1.1 Basic Audio Infrastructure
**Goal:** Get sound working - first audio playback

**Tasks:**
- [x] **Audio Context Setup** ✅
  - Initialize Tone.js audio context on user interaction
  - Handle browser audio policy compliance
  - Create master audio chain structure

- [x] **Transport Integration** ✅
  - Connect play/stop buttons to Tone.Transport
  - Implement BPM synchronization with Tone.Transport.bpm
  - Add playback position tracking and UI updates

- [x] **Basic Instrument Factory** ✅
  - Create `src/audio/instruments.ts` with 4 basic instruments:
    - Pulse Lead 12.5% (Tone.Synth with pulse oscillator)
    - Triangle Bass (Tone.Synth with triangle wave)
    - Noise Kick (Tone.NoiseSynth)
    - Simple chord pad (Tone.PolySynth)
  - Build instrument loading system in audio engine

**Acceptance Criteria:**
- ✅ Press Play button → hear audio with optional metronome
- ✅ BPM slider changes playback speed in real-time
- ✅ Track instrument selection changes actual sound
- ✅ Volume/pan controls affect audio output
- ✅ Metronome toggle with BPM synchronization

**Files to Create/Modify:**
- `src/audio/engine.ts` - Main audio engine
- `src/audio/instruments.ts` - Instrument factory
- `src/components/transport/TransportBar.tsx` - Add audio integration
- `src/state/useProjectStore.ts` - Add audio state management

---

## 🎹 PHASE 2: Basic Sequencing (MEDIUM PRIORITY)

### 2.1 Simple Pattern Grid
**Goal:** Click to add notes, hear them play back

**Tasks:**
- [x] **Grid Component** ✅
  - Create `src/components/editor/PatternGrid.tsx`
  - 4x16 step grid (4 tracks, 16 steps per bar)
  - Click to toggle notes on/off
  - Visual feedback for active steps and playback position

- [x] **Note Data Management** ✅
  - Basic note storage in component state
  - Real-time note addition during playback
  - Note scheduling through audio scheduler

- [x] **Playback Scheduling** ✅
  - Convert note events to Tone.Part sequences
  - Schedule note playback with Tone.Transport
  - Handle real-time note addition during playback

**Acceptance Criteria:**
- ✅ Click grid cells to add/remove notes
- ✅ Press Play → hear programmed pattern
- ✅ Visual playback cursor moves across grid
- ✅ Notes persist when stopping/starting

**Files to Create:**
- `src/components/editor/PatternGrid.tsx`
- `src/components/editor/StepCell.tsx`
- `src/audio/scheduler.ts`

---

## 🎵 PHASE 3: Complete Instrument Set (MEDIUM PRIORITY)

### 3.1 All 15 Instruments
**Goal:** Implement complete instrument library from AGENTS.md

**Tasks:**
- [ ] **Pulse Family**
  - Pulse Lead 25%, 50% (different pulse widths)
  - PWM Lead (pulse width modulation)

- [ ] **Bass Section**
  - Sub Sine Bass (deep sub frequencies)
  - Triangle Bass variations

- [ ] **Percussion Kit**
  - Noise Snare (filtered noise burst)
  - Noise Hat (short filtered noise)
  - Improve Noise Kick (clickier attack)

- [ ] **Lead/Melodic**
  - Chip Arp Pluck (envelope-shaped pulse)
  - FM Bell (simple FM synthesis)
  - Bitcrushed Saw Lead (saw + bitcrusher effect)
  - Chip Organ (additive/harmonic synthesis)

- [ ] **Special**
  - GamePad Blip (SFX-style rapid envelope)
  - PolyPulse Chords (expanded chord capabilities)

**Acceptance Criteria:**
- ✅ All 15 instruments produce distinct, chiptune-appropriate sounds
- ✅ Instruments respond to velocity and note length
- ✅ CPU usage remains reasonable (<20% for 12 tracks)

---

## 🎛️ PHASE 4: Enhanced Sequencing (MEDIUM PRIORITY)

### 4.1 Piano Roll Editor
**Goal:** Alternative to step grid for detailed note editing

**Tasks:**
- [ ] **Piano Roll Component**
  - Horizontal time axis (beats)
  - Vertical pitch axis (chromatic notes)
  - Drag to create notes, resize for duration
  - Toggle between grid and piano roll views

- [ ] **Advanced Note Properties**
  - Per-note velocity editing
  - Note duration (not just triggers)
  - Basic note copy/paste functionality

**4.2 Clips and Arrangement**
**Goal:** Multiple patterns per track, basic song arrangement

**Tasks:**
- [ ] **Clip System**
  - 1-8 bar clips per track
  - Clip triggering and looping
  - Basic clip copy/paste
  - Visual clip timeline

---

## 🎚️ PHASE 5: Audio Processing (LOW-MEDIUM PRIORITY)

### 5.1 Basic Effects Chain
**Goal:** Essential audio processing for chip sound character

**Tasks:**
- [ ] **Per-Track Effects**
  - Filter (high/low-pass for bass/lead character)
  - BitCrusher (essential for chip sound)
  - Simple distortion/saturation

- [ ] **Global Effects**
  - Master limiter (prevent clipping)
  - Global reverb send
  - Basic delay send

- [ ] **Automation Foundation**
  - Filter cutoff automation
  - Volume automation
  - Basic automation recording

---

## 🤖 PHASE 6: AI Helper (LOW PRIORITY)

### 6.1 Gemini Integration
**Goal:** AI-assisted chord progressions and musical suggestions

**Tasks:**
- [ ] **API Setup**
  - Create `src/app/api/ai/chords/route.ts`
  - Environment variable configuration
  - Input validation with Zod

- [ ] **Chord Generation**
  - Roman numeral chord progressions
  - Key/scale-aware suggestions
  - Voicing and inversion options
  - "Apply to Track" functionality

- [ ] **AI UI Components**
  - `src/components/ai/ChordHelper.tsx`
  - Mood/style presets ("Heroic", "Chill", "Boss Fight")
  - Preview and apply interface

---

## 📤 PHASE 7: Export/Render (LOW PRIORITY)

### 7.1 Audio Export
**Goal:** Render projects to audio files

**Tasks:**
- [ ] **WAV Export**
  - Tone.Offline rendering pipeline
  - Progress indication for longer renders
  - Automatic length calculation based on project

- [ ] **MIDI Export**
  - @tonejs/midi integration
  - Convert project data to MIDI file
  - Preserve track separation and instrument info

- [ ] **Project Export/Import**
  - JSON project file format
  - Save/load project state
  - Version compatibility handling

---

## 🎯 PHASE 8: Polish & Optimization (ONGOING)

### 8.1 User Experience
**Tasks:**
- [ ] **Hotkeys System**
  - Space (Play/Stop), R (Record), Q/W (Quantize)
  - [/] (Step resolution), 1-9 (Tool selection)
  - Cmd/Ctrl+S (Save), M/S (Mute/Solo)

- [ ] **Visual Polish**
  - Step grid animations and visual feedback
  - Playback cursor and timing visualization
  - Loading states and error handling

- [ ] **Performance**
  - Audio engine optimization
  - UI virtualization for large patterns
  - Memory management for longer projects

### 8.2 Quality Assurance
**Tasks:**
- [ ] **Testing Framework**
  - Unit tests for audio engine
  - Integration tests for sequencing
  - Performance benchmarks

- [ ] **Browser Compatibility**
  - Chrome/Firefox/Safari testing
  - Mobile responsiveness
  - Audio latency optimization

---

## 🚀 Quick Win Priorities

**For immediate development momentum:**

1. **Week 1-2:** Phase 1.1 (Basic Audio) - Get sound working
2. **Week 3:** Phase 2.1 (Simple Grid) - Basic note programming  
3. **Week 4:** Phase 3.1 (4-6 more instruments) - Expand sonic palette
4. **Week 5-6:** Phase 4.1 (Piano Roll) - Enhanced editing

**Critical Path Dependencies:**
- Audio Foundation → All other phases
- Basic Sequencing → Advanced Sequencing
- Instrument Factory → Effects Processing
- Core Features → AI Helper
- Audio Engine → Export/Render

---

## 📋 Update Checklist

**When completing ANY feature, update:**
- [ ] CURRENT.md - Move feature from "Not Implemented" to "Working"
- [ ] NEXTSTEPS.md - Check off completed tasks, adjust priorities  
- [ ] README.md - Update feature list if user-facing
- [ ] Add any new files to project structure documentation

**When changing priorities:**
- [ ] Update phase ordering in this document
- [ ] Notify team of dependency changes
- [ ] Update completion estimates

**When discovering new requirements:**
- [ ] Add to appropriate phase
- [ ] Assess impact on timeline
- [ ] Update acceptance criteria

---

## 🎵 MVP Definition Reminder

**From AGENTS.md:** User can open app, press play, hear demo tune; edit notes; change BPM/timeSig/bars; add tracks (<=12); pick instruments; export WAV & MIDI; ask AI for chords and apply them; save/load project JSON—all without docs.

**Current Status:** ~35% of MVP complete (audio foundation + basic sequencing)
**Target:** Working MVP in 6-8 weeks with focus on Phases 1-3
