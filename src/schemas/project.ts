import { z } from 'zod';

export const TimeSigSchema = z.string().regex(/^\d+\/[124816]$/) as z.ZodType<`${number}/${1|2|4|8|16}`>;

export const NoteNameSchema = z.string();

export const ProjectMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  bpm: z.number().min(20).max(300),
  timeSig: TimeSigSchema,
  bars: z.number().min(1).max(128),
  key: NoteNameSchema,
  scale: z.string(),
  swing: z.number().min(0).max(1),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const AutomationPointSchema = z.object({
  time: z.number(),
  value: z.number(),
});

export const AutomationLaneSchema = z.object({
  id: z.string(),
  param: z.enum(['volume', 'pan', 'cutoff', 'delayMix', 'bitcrush']),
  points: z.array(AutomationPointSchema),
});

export const NoteEventSchema = z.object({
  id: z.string(),
  time: z.number(),
  duration: z.number(),
  pitch: NoteNameSchema,
  velocity: z.number().min(0).max(1),
});

export const ClipSchema = z.object({
  id: z.string(),
  start: z.number(),
  length: z.number(),
  notes: z.array(NoteEventSchema),
  muted: z.boolean().optional(),
});

export const TrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  instrumentId: z.string(),
  volume: z.number(),
  pan: z.number().min(-1).max(1),
  mute: z.boolean(),
  solo: z.boolean(),
  clips: z.array(ClipSchema),
  automation: z.array(AutomationLaneSchema),
});

export const ProjectSchema = z.object({
  meta: ProjectMetaSchema,
  tracks: z.array(TrackSchema).max(12),
});
