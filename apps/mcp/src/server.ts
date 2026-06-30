import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleProjectTools, projectToolDefinitions } from "./tools/projects.js";
import { handleMediaTools, mediaToolDefinitions } from "./tools/media.js";
import { handleTimelineTools, timelineToolDefinitions } from "./tools/timeline.js";
import { handleExportTools, exportToolDefinitions } from "./tools/export.js";

export function createServer(): Server {
  const server = new Server(
    { name: "opencut-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      ...projectToolDefinitions,
      ...mediaToolDefinitions,
      ...timelineToolDefinitions,
      ...exportToolDefinitions,
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result: unknown;

      if (["list_projects", "create_project", "get_project"].includes(name)) {
        result = await handleProjectTools(name, args as Record<string, unknown>);
      } else if (["import_media", "list_media"].includes(name)) {
        result = await handleMediaTools(name, args as Record<string, unknown>);
      } else if (
        [
          "add_to_timeline",
          "trim_clip",
          "split_clip",
          "move_clip",
          "delete_clip",
          "add_text_overlay",
          "get_timeline",
        ].includes(name)
      ) {
        result = await handleTimelineTools(name, args as Record<string, unknown>);
      } else if (["export_project", "get_export_status"].includes(name)) {
        result = await handleExportTools(name, args as Record<string, unknown>);
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }],
        isError: true,
      };
    }
  });

  return server;
}

export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
