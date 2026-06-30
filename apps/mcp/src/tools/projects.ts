import {
  CreateProjectSchema,
  ProjectIdSchema,
} from "../schemas.js";
import * as projectService from "../services/project.js";

export const projectToolDefinitions = [
  {
    name: "list_projects",
    description: "List all video editing projects",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "create_project",
    description: "Create a new video editing project",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Project name" },
        width: { type: "number", description: "Canvas width in pixels (default: 1920)" },
        height: { type: "number", description: "Canvas height in pixels (default: 1080)" },
        fps: { type: "number", description: "Frames per second (default: 30)" },
      },
      required: ["name"],
    },
  },
  {
    name: "get_project",
    description: "Get a project's full details including timeline and media",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
      },
      required: ["projectId"],
    },
  },
];

export async function handleProjectTools(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "list_projects": {
      return await projectService.listProjects();
    }

    case "create_project": {
      const parsed = CreateProjectSchema.parse(args);
      const project = await projectService.createProject(parsed);
      return {
        id: project.id,
        name: project.name,
        width: project.width,
        height: project.height,
        fps: project.fps,
        createdAt: project.createdAt,
        trackCount: project.timeline.tracks.length,
      };
    }

    case "get_project": {
      const parsed = ProjectIdSchema.parse(args);
      const project = await projectService.getProject(parsed.projectId);
      if (!project) throw new Error(`Project ${parsed.projectId} not found`);
      return project;
    }

    default:
      throw new Error(`Unknown project tool: ${name}`);
  }
}
