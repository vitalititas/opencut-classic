import { randomUUID } from "crypto";
import * as storage from "./storage.js";

export async function createProject(params: {
  name: string;
  width: number;
  height: number;
  fps: number;
}): Promise<storage.Project> {
  const now = new Date().toISOString();
  const project: storage.Project = {
    id: randomUUID(),
    name: params.name,
    width: params.width,
    height: params.height,
    fps: params.fps,
    createdAt: now,
    updatedAt: now,
    media: [],
    timeline: { tracks: [{ id: randomUUID(), index: 0, name: "Video 1", clips: [] }] },
  };
  await storage.saveProject(project);
  return project;
}

export async function getProject(id: string): Promise<storage.Project | null> {
  return storage.getProject(id);
}

export async function listProjects() {
  return storage.listProjects();
}

export async function deleteProject(id: string): Promise<void> {
  return storage.deleteProject(id);
}

export async function importMedia(
  projectId: string,
  source: string,
  type: "video" | "audio" | "image"
): Promise<storage.MediaItem> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  const media: storage.MediaItem = {
    id: randomUUID(),
    source,
    type,
    addedAt: new Date().toISOString(),
  };
  project.media.push(media);
  await storage.saveProject(project);
  return media;
}

export async function listMedia(projectId: string): Promise<storage.MediaItem[]> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);
  return project.media;
}

export async function addToTimeline(
  projectId: string,
  mediaId: string,
  trackIndex: number,
  position: number
): Promise<storage.Clip> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  const media = project.media.find((m) => m.id === mediaId);
  if (!media) throw new Error(`Media ${mediaId} not found`);

  while (project.timeline.tracks.length <= trackIndex) {
    project.timeline.tracks.push({
      id: randomUUID(),
      index: project.timeline.tracks.length,
      name: `Track ${project.timeline.tracks.length + 1}`,
      clips: [],
    });
  }

  const clip: storage.Clip = {
    id: randomUUID(),
    mediaId,
    type: media.type,
    start: 0,
    end: media.duration || 5,
    position,
    trackIndex,
  };

  project.timeline.tracks[trackIndex].clips.push(clip);
  await storage.saveProject(project);
  return clip;
}

export async function getTimeline(projectId: string): Promise<storage.Timeline> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);
  return project.timeline;
}

export async function trimClip(
  projectId: string,
  clipId: string,
  start: number,
  end: number
): Promise<storage.Clip> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  for (const track of project.timeline.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) {
      clip.start = start;
      clip.end = end;
      await storage.saveProject(project);
      return clip;
    }
  }
  throw new Error(`Clip ${clipId} not found`);
}

export async function splitClip(
  projectId: string,
  clipId: string,
  position: number
): Promise<storage.Clip[]> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  for (const track of project.timeline.tracks) {
    const idx = track.clips.findIndex((c) => c.id === clipId);
    if (idx !== -1) {
      const clip = track.clips[idx];
      if (position <= clip.start || position >= clip.end) {
        throw new Error("Split position must be within clip bounds");
      }

      const clip2: storage.Clip = {
        ...clip,
        id: randomUUID(),
        start: position,
        position: clip.position + (position - clip.start),
      };
      clip.end = position;

      track.clips.splice(idx + 1, 0, clip2);
      await storage.saveProject(project);
      return [clip, clip2];
    }
  }
  throw new Error(`Clip ${clipId} not found`);
}

export async function moveClip(
  projectId: string,
  clipId: string,
  newTrack: number,
  newPosition: number
): Promise<storage.Clip> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  let clip: storage.Clip | undefined;
  for (const track of project.timeline.tracks) {
    const idx = track.clips.findIndex((c) => c.id === clipId);
    if (idx !== -1) {
      clip = track.clips.splice(idx, 1)[0];
      break;
    }
  }
  if (!clip) throw new Error(`Clip ${clipId} not found`);

  while (project.timeline.tracks.length <= newTrack) {
    project.timeline.tracks.push({
      id: randomUUID(),
      index: project.timeline.tracks.length,
      name: `Track ${project.timeline.tracks.length + 1}`,
      clips: [],
    });
  }

  clip.trackIndex = newTrack;
  clip.position = newPosition;
  project.timeline.tracks[newTrack].clips.push(clip);
  await storage.saveProject(project);
  return clip;
}

export async function deleteClip(projectId: string, clipId: string): Promise<void> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  for (const track of project.timeline.tracks) {
    const idx = track.clips.findIndex((c) => c.id === clipId);
    if (idx !== -1) {
      track.clips.splice(idx, 1);
      await storage.saveProject(project);
      return;
    }
  }
  throw new Error(`Clip ${clipId} not found`);
}

export async function addTextOverlay(
  projectId: string,
  text: string,
  position: number,
  duration: number,
  style: Record<string, unknown>
): Promise<storage.Clip> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  const clip: storage.Clip = {
    id: randomUUID(),
    mediaId: "text",
    type: "text",
    start: 0,
    end: duration,
    position,
    trackIndex: 0,
    text,
    style,
  };

  project.timeline.tracks[0].clips.push(clip);
  await storage.saveProject(project);
  return clip;
}

export async function startExport(
  projectId: string,
  format: string,
  quality: string
): Promise<storage.ExportJob> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  const job: storage.ExportJob = {
    id: randomUUID(),
    projectId,
    status: "queued",
    format,
    quality,
    outputPath: ``,
    progress: 0,
    createdAt: new Date().toISOString(),
  };

  await storage.saveExportJob(job);

  setTimeout(async () => {
    job.status = "processing";
    job.progress = 50;
    await storage.saveExportJob(job);

    setTimeout(async () => {
      job.status = "completed";
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.outputPath = `/exports/${job.id}.${format}`;
      await storage.saveExportJob(job);
    }, 2000);
  }, 1000);

  return job;
}

export async function getExportJob(id: string): Promise<storage.ExportJob | null> {
  return storage.getExportJob(id);
}
