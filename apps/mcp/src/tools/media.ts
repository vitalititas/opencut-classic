import {
  ImportMediaSchema,
  ListMediaSchema,
} from "../schemas.js";
import * as projectService from "../services/project.js";

export const mediaToolDefinitions = [
  {
    name: "import_media",
    description: "Import a video, audio, or image file into a project",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
        source: { type: "string", description: "Absolute file path or URL to the media file" },
        type: { type: "string", enum: ["video", "audio", "image"], description: "Media type" },
      },
      required: ["projectId", "source", "type"],
    },
  },
  {
    name: "list_media",
    description: "List all media files imported into a project",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
      },
      required: ["projectId"],
    },
  },
];

export async function handleMediaTools(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "import_media": {
      const parsed = ImportMediaSchema.parse(args);
      const media = await projectService.importMedia(
        parsed.projectId,
        parsed.source,
        parsed.type
      );
      return media;
    }

    case "list_media": {
      const parsed = ListMediaSchema.parse(args);
      const media = await projectService.listMedia(parsed.projectId);
      return { projectId: parsed.projectId, media };
    }

    default:
      throw new Error(`Unknown media tool: ${name}`);
  }
}
