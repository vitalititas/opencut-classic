import {
  ExportProjectSchema,
  ExportIdSchema,
} from "../schemas.js";
import * as projectService from "../services/project.js";

export const exportToolDefinitions = [
  {
    name: "export_project",
    description: "Export a video project to MP4 or WebM format",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
        format: { type: "string", enum: ["mp4", "webm"], description: "Output format" },
        quality: { type: "string", enum: ["low", "medium", "high"], description: "Export quality" },
      },
      required: ["projectId"],
    },
  },
  {
    name: "get_export_status",
    description: "Check the status of an export job",
    inputSchema: {
      type: "object" as const,
      properties: {
        exportId: { type: "string", description: "Export job UUID" },
      },
      required: ["exportId"],
    },
  },
];

export async function handleExportTools(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "export_project": {
      const parsed = ExportProjectSchema.parse(args);
      const job = await projectService.startExport(
        parsed.projectId,
        parsed.format,
        parsed.quality
      );
      return {
        exportId: job.id,
        projectId: job.projectId,
        status: job.status,
        format: job.format,
        quality: job.quality,
        progress: job.progress,
        createdAt: job.createdAt,
      };
    }

    case "get_export_status": {
      const parsed = ExportIdSchema.parse(args);
      const job = await projectService.getExportJob(parsed.exportId);
      if (!job) throw new Error(`Export job ${parsed.exportId} not found`);
      return {
        exportId: job.id,
        projectId: job.projectId,
        status: job.status,
        progress: job.progress,
        outputPath: job.outputPath || null,
        completedAt: job.completedAt || null,
        error: job.error || null,
      };
    }

    default:
      throw new Error(`Unknown export tool: ${name}`);
  }
}
