import { mkdir, readFile, writeFile, readdir, unlink } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

const DATA_DIR = process.env.OPENCUT_DATA_DIR || join(homedir(), ".opencut");
const PROJECTS_DIR = join(DATA_DIR, "projects");
const EXPORTS_DIR = join(DATA_DIR, "exports");

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  createdAt: string;
  updatedAt: string;
  media: MediaItem[];
  timeline: Timeline;
}

export interface MediaItem {
  id: string;
  source: string;
  type: "video" | "audio" | "image";
  duration?: number;
  width?: number;
  height?: number;
  addedAt: string;
}

export interface Timeline {
  tracks: Track[];
}

export interface Track {
  id: string;
  index: number;
  name: string;
  clips: Clip[];
}

export interface Clip {
  id: string;
  mediaId: string;
  type: "video" | "audio" | "image" | "text";
  start: number;
  end: number;
  position: number;
  trackIndex: number;
  text?: string;
  style?: Record<string, unknown>;
}

export interface ExportJob {
  id: string;
  projectId: string;
  status: "queued" | "processing" | "completed" | "failed";
  format: string;
  quality: string;
  outputPath: string;
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

async function ensureDirs() {
  await mkdir(PROJECTS_DIR, { recursive: true });
  await mkdir(EXPORTS_DIR, { recursive: true });
}

export async function listProjects(): Promise<Pick<Project, "id" | "name" | "createdAt" | "updatedAt">[]> {
  await ensureDirs();
  try {
    const files = await readdir(PROJECTS_DIR);
    const projects = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          const data = await readFile(join(PROJECTS_DIR, f), "utf-8");
          const p = JSON.parse(data) as Project;
          return { id: p.id, name: p.name, createdAt: p.createdAt, updatedAt: p.updatedAt };
        })
    );
    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const data = await readFile(join(PROJECTS_DIR, `${id}.json`), "utf-8");
    return JSON.parse(data) as Project;
  } catch {
    return null;
  }
}

export async function saveProject(project: Project): Promise<void> {
  await ensureDirs();
  project.updatedAt = new Date().toISOString();
  await writeFile(join(PROJECTS_DIR, `${project.id}.json`), JSON.stringify(project, null, 2));
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await unlink(join(PROJECTS_DIR, `${id}.json`));
  } catch { /* ignore */ }
}

export async function getExportJob(id: string): Promise<ExportJob | null> {
  try {
    const data = await readFile(join(EXPORTS_DIR, `${id}.json`), "utf-8");
    return JSON.parse(data) as ExportJob;
  } catch {
    return null;
  }
}

export async function saveExportJob(job: ExportJob): Promise<void> {
  await ensureDirs();
  await writeFile(join(EXPORTS_DIR, `${job.id}.json`), JSON.stringify(job, null, 2));
}

export async function listExportJobs(projectId?: string): Promise<ExportJob[]> {
  await ensureDirs();
  try {
    const files = await readdir(EXPORTS_DIR);
    const jobs = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          const data = await readFile(join(EXPORTS_DIR, f), "utf-8");
          return JSON.parse(data) as ExportJob;
        })
    );
    const filtered = projectId ? jobs.filter((j) => j.projectId === projectId) : jobs;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}
