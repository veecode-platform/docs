---
sidebar_position: 3
sidebar_label: Docs MCP Server
title: Documentation MCP Server
---

# Documentation MCP Server

The VeeCode **documentation MCP server** (`@veecode-platform/docs-mcp`) is a
single tool that serves both the V1 and V2 docs — it is not versioned
separately. Its full guide lives in the current documentation:

**[Documentation MCP Server →](/devportal/docs-mcp)**

To have an agent read the **V1** docs specifically, install it with
`--version v1`:

```bash
claude mcp add veecode-docs-v1 --scope user \
  -- npx -y @veecode-platform/docs-mcp --version v1
```

See the [full guide](/devportal/docs-mcp#choosing-the-docs-version-v1-or-v2)
for all install methods, the available tools, and configuration.
