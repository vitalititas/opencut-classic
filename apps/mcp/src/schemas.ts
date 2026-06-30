import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  width: z.number().int().positive().optional().default(1920),
  height: z.number().int().positive().optional().default(1080),
  fps: z.number().int().positive().optional().default(30),
});

export const ProjectIdSchema = z.object({
  projectId: z.string().uuid(),
});

export const ImportMediaSchema = z.object({
  projectId: z.string().uuid(),
  source: z.string().min(1),
  type: z.enum(["video", "audio", "image"]),
});

export const ListMediaSchema = z.object({
  projectId: z.string().uuid(),
});

export const AddToTimelineSchema = z.object({
  projectId: z.string().uuid(),
  mediaId: z.string().uuid(),
  trackIndex: z.number().int().nonnegative(),
  position: z.number().nonnegative(),
});

export const ClipOperationSchema = z.object({
  projectId: z.string().uuid(),
  clipId: z.string().uuid(),
});

export const TrimClipSchema = z.object({
  projectId: z.string().uuid(),
  clipId: z.string().uuid(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
});

export const SplitClipSchema = z.object({
  projectId: z.string().uuid(),
  clipId: z.string().uuid(),
  position: z.number().nonnegative(),
});

export const MoveClipSchema = z.object({
  projectId: z.string().uuid(),
  clipId: z.string().uuid(),
  newTrack: z.number().int().nonnegative(),
  newPosition: z.number().nonnegative(),
});

export const AddTextOverlaySchema = z.object({
  projectId: z.string().uuid(),
  text: z.string().min(1),
  position: z.number().nonnegative(),
  duration: z.number().positive(),
  style: z.object({
    fontSize: z.number().positive().optional().default(24),
    color: z.string().optional().default("#ffffff"),
    x: z.number().optional().default(0.5),
    y: z.number().optional().default(0.5),
  }).optional().default({}),
});

export const ExportProjectSchema = z.object({
  projectId: z.string().uuid(),
  format: z.enum(["mp4", "webm"]).optional().default("mp4"),
  quality: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

export const ExportIdSchema = z.object({
  exportId: z.string().uuid(),
});
