---
sidebar_position: 4
sidebar_label: Docs MCP Server
title: Documentation MCP Server
---

# Documentation MCP Server

The VeeCode **documentation MCP server** (`@veecode-platform/docs-mcp`) is a
single tool that serves every DevPortal docs version — it is not versioned
separately. Its full guide lives in the current documentation:

**[Documentation MCP Server →](/devportal/docs-mcp)**

To have an agent read the **2.x** docs specifically, install it with
`--version v2`:

```bash
claude mcp add veecode-docs-v2 --scope user \
  -- npx -y @veecode-platform/docs-mcp --version v2
```

See the [full guide](/devportal/docs-mcp#choosing-the-docs-version-v1-v2-or-v3)
for all install methods, the available tools, and configuration.
