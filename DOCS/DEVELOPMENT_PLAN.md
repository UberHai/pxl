# PXL Chiptune Studio - Development Plan

> **Created:** 2025-01-29
> **Status:** Active Development Plan

## 🎯 Current Status Summary

**✅ MAJOR MILESTONE ACHIEVED:** Working prototype with enhanced musical features!

### What's Working Now:
- ✅ Full audio engine with 4 instruments
- ✅ Enhanced pattern grid with scale-degree highlighting
- ✅ Professional transport controls
- ✅ Real-time audio synthesis and playback
- ✅ Musical theory integration (root/chord/color tone highlighting)
- ✅ Responsive UI with enhanced color palette

### Progress Metrics:
- **MVP Completion:** ~45% (up from 35%)
- **Core Audio:** 100% ✅
- **Basic Sequencing:** 100% ✅ 
- **Enhanced UX:** 85% ✅
- **Instruments:** 27% (4/15 working)
- **Project Persistence:** 0%
- **Export/Render:** 0%

---

## 🚀 SPRINT 1: Complete Instrument Arsenal (Priority #1)

**Duration:** 1-2 weeks
**Goal:** Expand from 4 to 15 working instruments
**Impact:** Massive creative expansion

### ✅ COMPLETED: Complete Instrument Library
**Target:** All 15 instruments implemented and tested
**Status:** ✅ All instruments working, selector updated with categories

#### Day 1-2: Pulse Family
- [ ] Pulse Lead 25% (modify existing pulse width to 0.25)
- [ ] Pulse Lead 50% (square wave, width 0.5)
- [ ] PWM Lead (pulse with LFO modulating width)

#### Day 3-4: Enhanced Percussion
- [ ] Noise Snare (filtered noise burst, band-pass filter)
- [ ] Noise Hat (short high-passed noise, tight envelope)
- [ ] Improve Noise Kick (add click attack, better envelope)

#### Day 5: Bass Expansion
- [ ] Sub Sine Bass (sine wave, sub-bass frequencies 40-80Hz)
- [ ] Enhanced Triangle Bass (multiple variations)

### Week 2: Advanced Instruments
**Target:** Complete remaining 3-5 instruments

#### Day 1-2: Lead/Melodic
- [ ] Chip Arp Pluck (pulse with fast attack/decay)
- [ ] FM Bell (2-operator FM synthesis)

#### Day 3-4: Special Instruments
- [ ] Bitcrushed Saw Lead (sawtooth + bitcrusher effect)
- [ ] Chip Organ (additive synthesis, multiple harmonics)

#### Day 5: Polish & Testing
- [ ] GamePad Blip (rapid envelope SFX)
- [ ] PolyPulse Chords (enhanced chord capabilities)
- [ ] Performance testing with all 15 instruments
- [ ] Audio quality verification

### Success Criteria:
- [ ] All 15 instruments produce distinct, authentic chiptune sounds
- [ ] CPU usage <25% with 12 active tracks
- [ ] Each instrument responds to velocity and note length
- [ ] No audio dropouts or glitches

---

## 🚀 SPRINT 2: Enhanced Pattern Editing (Priority #2)

**Duration:** 1 week
**Goal:** Professional editing workflow

### Day 1: Pattern Control
- [ ] Variable pattern lengths (1-8 bars)
- [ ] Pattern loop points and boundaries
- [ ] Pattern copy/paste between tracks

### Day 2-3: Note Properties
- [ ] Per-note velocity editing (right-click menu)
- [ ] Note length/duration (drag to extend)
- [ ] Note preview on hover (audio feedback)
- [ ] Note selection and multi-select

### Day 4-5: Workflow Improvements
- [ ] Keyboard shortcuts system:
  - Space: Play/Stop
  - R: Record mode toggle
  - Delete: Clear selected notes
  - Ctrl+Z/Y: Undo/Redo
  - 1-9: Track selection
  - Arrow keys: Navigate grid

### Day 6-7: Grid Enhancements
- [ ] Zoom levels (16th, 8th, quarter note resolution)
- [ ] Snap to grid options
- [ ] Visual beat/bar markers
- [ ] Grid customization (colors, spacing)

---

## 🚀 SPRINT 3: Project Persistence (Priority #3)

**Duration:** 3-4 days
**Goal:** Save/load functionality

### Day 1-2: Local Storage
- [ ] Auto-save project state every 30 seconds
- [ ] Project metadata (name, created/modified dates)
- [ ] Local storage management (multiple projects)
- [ ] Recovery from crashes/refresh

### Day 3-4: File Export/Import
- [ ] Export project as JSON file
- [ ] Import project from JSON file
- [ ] Version compatibility handling
- [ ] Error handling for corrupted files

---

## 🚀 SPRINT 4: Audio Export (Priority #4)

**Duration:** 1 week
**Goal:** Render projects to audio files

### Day 1-3: WAV Export
- [ ] Tone.Offline rendering pipeline
- [ ] Progress indication for renders
- [ ] Automatic length calculation
- [ ] Quality settings (44.1kHz, 48kHz)

### Day 4-5: MIDI Export
- [ ] @tonejs/midi integration
- [ ] Convert project data to MIDI
- [ ] Preserve track separation
- [ ] Instrument mapping

### Day 6-7: Export UI
- [ ] Export dialog with options
- [ ] Render progress feedback
- [ ] File naming conventions
- [ ] Batch export capabilities

---

## 🚀 SPRINT 5: AI Helper Integration (Priority #5)

**Duration:** 1-2 weeks
**Goal:** AI-assisted composition

### Week 1: Foundation
- [ ] Gemini API integration
- [ ] Environment variable setup
- [ ] Input validation with Zod
- [ ] Error handling and rate limiting

### Week 2: Chord Generation
- [ ] Roman numeral chord progressions
- [ ] Key/scale-aware suggestions
- [ ] Mood/style presets
- [ ] "Apply to Track" functionality

---

## 📊 Success Metrics & Milestones

### Sprint Completion Targets:
- **Sprint 1 Complete:** 60% MVP (full instrument library)
- **Sprint 2 Complete:** 70% MVP (professional editing)
- **Sprint 3 Complete:** 80% MVP (persistence)
- **Sprint 4 Complete:** 90% MVP (export)
- **Sprint 5 Complete:** 100% MVP (AI helper)

### Quality Gates:
- [ ] No performance regressions
- [ ] All existing features continue working
- [ ] User testing feedback incorporated
- [ ] Documentation updated

### Risk Mitigation:
- **Audio Performance:** Monitor CPU usage, optimize if needed
- **Browser Compatibility:** Test on Chrome, Firefox, Safari
- **User Experience:** Regular testing with real music creation
- **Technical Debt:** Refactor as needed during development

---

## 🎵 MVP Achievement Timeline

**Target:** 4-6 weeks from now (by mid-March 2025)

### Week 1-2: Sprint 1 (Instruments)
### Week 3: Sprint 2 (Editing)
### Week 4: Sprint 3 (Persistence) + Sprint 4 (Export)
### Week 5-6: Sprint 5 (AI) + Polish

**Final MVP Features:**
- ✅ Open app, press play, hear demo tune
- ✅ Edit notes with professional tools
- ✅ Change BPM/timeSig/bars/key/scale
- ✅ Add tracks (≤12) with full instrument library
- ✅ Export WAV & MIDI
- ✅ AI chord suggestions
- ✅ Save/load project JSON
- ✅ No documentation required (intuitive UI)

---

## 📋 Daily Development Workflow

### Morning (Planning):
1. Review previous day's progress
2. Update CURRENT.md if features completed
3. Check GitHub issues/bugs
4. Plan day's specific tasks

### Development:
1. Focus on single sprint at a time
2. Test frequently during development
3. Commit working features immediately
4. Document any new APIs or components

### Evening (Review):
1. Test all existing functionality
2. Update progress in this document
3. Note any blockers or issues
4. Plan next day's priorities

---

## 🔄 Continuous Improvement

### Weekly Reviews:
- [ ] Sprint progress assessment
- [ ] User feedback incorporation
- [ ] Performance monitoring
- [ ] Technical debt evaluation

### Monthly Milestones:
- [ ] Major feature completion
- [ ] User testing sessions
- [ ] Documentation updates
- [ ] Deployment planning

This development plan provides a clear, actionable roadmap to complete the PXL Chiptune Studio MVP within 4-6 weeks, building on our strong foundation of working audio and enhanced pattern editing.
