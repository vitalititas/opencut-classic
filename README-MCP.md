# OpenCut MCP Server

Built-in MCP (Model Context Protocol) server for OpenCut video editor. Exposes video editing capabilities to AI agents.

## Quick Start

```bash
# Install dependencies
bun install

# Start MCP server (stdio mode)
bun dev:mcp

# Or start everything
bun dev:web   # Editor at localhost:3000
bun dev:mcp   # MCP server
```

## MCP Tools Available

### Project Management
- `list_projects` -- List all video projects
- `create_project` -- Create new project
- `get_project` -- Get project details and timeline

### Media
- `import_media` -- Import video/audio/image into project
- `list_media` -- List media in project

### Timeline
- `get_timeline` -- Get full timeline state
- `add_to_timeline` -- Add media clip to timeline
- `trim_clip` -- Trim a clip
- `split_clip` -- Split a clip at position
- `move_clip` -- Move clip to different track/position
- `delete_clip` -- Remove clip from timeline
- `add_text_overlay` -- Add text overlay

### Export
- `export_project` -- Export video (MP4/WebM)
- `get_export_status` -- Check export progress

## Using with Claude Code

Add to your `.mcp.json`:

```json
{
  "servers": {
    "opencut": {
      "command": "bun",
      "args": ["run", "--filter", "@opencut/mcp", "dev"]
    }
  }
}
```

## Using with Docker

```bash
docker compose up -d mcp
```

## Data Storage

- Projects: `~/.opencut/projects/` (JSON files)
- Exports: `~/.opencut/exports/`

## Architecture

```
AI Agent (Claude/Kimi) --> MCP Client --> @opencut/mcp (stdio)
                                              |
                                       ~/.opencut/ (JSON files)
```
