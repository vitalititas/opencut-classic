import {
  AddToTimelineSchema,
  TrimClipSchema,
  SplitClipSchema,
  MoveClipSchema,
  ClipOperationSchema,
  AddTextOverlaySchema,
  ProjectIdSchema,
} from "../schemas.js";
import * as projectService from "../services/project.js";

export const timelineToolDefinitions = [
  {
    name: "get_timeline",
    description: "Get the full timeline state of a project including all tracks and clips",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
      },
      required: ["projectId"],
    },
  },
  {
    name: "add_to_timeline",
    description: "Add a media clip to the timeline on a specific track at a position",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
        mediaId: { type: "string", description: "Media file UUID" },
        trackIndex: { type: "number", description: "Track index (0-based)" },
        position: { type: "number", description: "Start position in seconds" },
      },
      required: ["projectId", "mediaId", "trackIndex", "position"],
    },
  },
  {
    name: "trim_clip",
    description: "Trim a clip on the timeline to new start and end times",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
        clipId: { type: "string", description: "Clip UUID" },
        start: { type: "number", description: "New start time in seconds" },
        end: { type: "number", description: "New end time in seconds" },
      },
      required: ["projectId", "clipId", "start", "end"],
    },
  },
  {
    name: "split_clip",
    description: "Split a clip at a specific position, creating two clips",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
        clipId: { type: "string", description: "Clip UUID" },
        position: { type: "number", description: "Split position in seconds" },
      },
      required: ["projectId", "clipId", "position"],
    },
  },
  {
    name: "move_clip",
    description: "Move a clip to a different track and/or position",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
        clipId: { type: "string", description: "Clip UUID" },
        newTrack: { type: "number", description: "Target track index" },
        newPosition: { type: "number", description: "New position in seconds" },
      },
      required: ["projectId", "clipId", "newTrack", "newPosition"],
    },
  },
  {
    name: "delete_clip",
    description: "Remove a clip from the timeline",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
        clipId: { type: "string", description: "Clip UUID" },
      },
      required: ["projectId", "clipId"],
    },
  },
  {
    name: "add_text_overlay",
    description: "Add a text overlay to the timeline",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project UUID" },
        text: { type: "string", description: "Text content" },
        position: { type: "number", description: "Start position in seconds" },
        duration: { type: "number", description: "Duration in seconds" },
        style: {
          type: "object",
          properties: {
            fontSize: { type: "number" },
            color: { type: "string" },
            x: { type: "number", description: "Horizontal position (0-1)" },
            y: { type: "number", description: "Vertical position (0-1)" },
          },
        },
      },
      required: ["projectId", "text", "position", "duration"],
    },
  },
];

export async function handleTimelineTools(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "get_timeline": {
      const parsed = ProjectIdSchema.parse(args);
      const timeline = await projectService.getTimeline(parsed.projectId);
      return { projectId: parsed.projectId, timeline };
    }

    case "add_to_timeline": {
      const parsed = AddToTimelineSchema.parse(args);
      const clip = await projectService.addToTimeline(
        parsed.projectId,
        parsed.mediaId,
        parsed.trackIndex,
        parsed.position
      );
      return clip;
    }

    case "trim_clip": {
      const parsed = TrimClipSchema.parse(args);
      const clip = await projectService.trimClip(
        parsed.projectId,
        parsed.clipId,
        parsed.start,
        parsed.end
      );
      return clip;
    }

    case "split_clip": {
      const parsed = SplitClipSchema.parse(args);
      const clips = await projectService.splitClip(
        parsed.projectId,
        parsed.clipId,
        parsed.position
      );
      return { splitAt: parsed.position, clips };
    }

    case "move_clip": {
      const parsed = MoveClipSchema.parse(args);
      const clip = await projectService.moveClip(
        parsed.projectId,
        parsed.clipId,
        parsed.newTrack,
        parsed.newPosition
      );
      return clip;
    }

    case "delete_clip": {
      const parsed = ClipOperationSchema.parse(args);
      await projectService.deleteClip(parsed.projectId, parsed.clipId);
      return { success: true, deletedClipId: parsed.clipId };
    }

    case "add_text_overlay": {
      const parsed = AddTextOverlaySchema.parse(args);
      const clip = await projectService.addTextOverlay(
        parsed.projectId,
        parsed.text,
        parsed.position,
        parsed.duration,
        parsed.style
      );
      return clip;
    }

    default:
      throw new Error(`Unknown timeline tool: ${name}`);
  }
}
