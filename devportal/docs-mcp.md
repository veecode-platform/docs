---
sidebar_position: 6
sidebar_label: Docs MCP Server
title: Documentation MCP Server
---

# Documentation MCP Server

`@veecode-platform/docs-mcp` is an [MCP](https://modelcontextprotocol.io/)
server that gives your AI coding agent — Claude Code, Codex CLI, and any
other MCP client — first-class search and read access to the VeeCode Platform
documentation for
all four products (DevPortal, Platform, Admin-UI, VKDR-CLI). Instead of
pasting doc snippets into a prompt, the agent queries the docs directly.

It runs locally over stdio, needs no API key, and is distributed on npm, so
you never install a specific version by hand: `npx` downloads the package on
first call and caches it afterwards. For a guaranteed fresh copy, install
globally with `npm install -g @veecode-platform/docs-mcp`.

:::note This is not the in-portal MCP
There are two different MCP servers in the VeeCode ecosystem, and they solve
different problems:

- **This page — the *documentation* MCP.** A local CLI tool that lets an agent
  read the written docs you are looking at now. No running DevPortal required.
- **The *platform* MCP** — an HTTP server your running DevPortal exposes so
  agents can query the live catalog, TechDocs, and scaffolder templates. That
  one is covered in [MCP — AI Tooling Integration](./integrations/mcp.md).
:::

## Install

The commands below are unpinned on purpose — `npx -y` fetches the latest
published release on each launch and caches it, so there is no version to keep
up to date.

### Claude Code

```bash
claude mcp add veecode-docs --scope user \
  -- npx -y @veecode-platform/docs-mcp
```

`npx` downloads the package on first call and caches it afterwards.

### Manual config (`~/.mcp.json`)

Any MCP client that reads `~/.mcp.json` (or a project-level `.mcp.json`) can
use the same command:

```json
{
  "mcpServers": {
    "veecode-docs": {
      "command": "npx",
      "args": ["-y", "@veecode-platform/docs-mcp"]
    }
  }
}
```

### Codex CLI

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.veecode-docs]
command = "npx"
args = ["-y", "@veecode-platform/docs-mcp"]
```

### Without `npx` at launch

If you'd rather not depend on `npx` resolution every time, install the binary
globally and point the client at it:

```bash
npm install -g @veecode-platform/docs-mcp
claude mcp add veecode-docs --scope user -- veecode-docs-mcp
```

## Choosing the docs version (V1, V2, or V3)

The server serves one DevPortal docs version per instance. It defaults to
**V3**, from the current DevPortal docs. Select another version with the
`--version` flag or the `VEECODE_DOCS_MCP_VERSION` environment variable:

- **`v3` (default):** the DevPortal 3.x docs.
- **`v2`:** the DevPortal 2.x docs.
- **`v1`:** the V1 docs.

To run a separate instance with V2 docs, pass `--version v2`:

```bash
claude mcp add veecode-docs-v2 --scope user \
  -- npx -y @veecode-platform/docs-mcp --version v2
```

To run another instance with V1 docs, pass `--version v1`:

```bash
claude mcp add veecode-docs-v1 --scope user \
  -- npx -y @veecode-platform/docs-mcp --version v1
```

You can register both side by side under different names:

```json
{
  "mcpServers": {
    "veecode-docs": {
      "command": "npx",
      "args": ["-y", "@veecode-platform/docs-mcp"]
    },
    "veecode-docs-v2": {
      "command": "npx",
      "args": ["-y", "@veecode-platform/docs-mcp", "--version", "v2"]
    },
    "veecode-docs-v1": {
      "command": "npx",
      "args": ["-y", "@veecode-platform/docs-mcp", "--version", "v1"]
    }
  }
}
```

The selected DevPortal version stays fixed for the session. The background
refresh uses that version's snapshot URL unless
`VEECODE_DOCS_MCP_SNAPSHOT_URL` overrides it. Each version uses a separate
cache subdirectory. Check the `docs_version` field from `get_snapshot_info` to
confirm the selection.

Not sure which version you run? See
[Which version am I running?](./which-version.md).

## Tools

| Tool | Purpose |
|------|---------|
| `search_docs` | BM25 search across all sections; filter by product, limit results |
| `get_doc` | Fetch a doc by path; optionally a specific section by anchor |
| `get_doc_outline` | Frontmatter + heading tree only — a cheap preview |
| `list_products` | Overview of the four VeeCode products |
| `list_docs` | Directory tree within a product |
| `get_snapshot_info` | Loaded snapshot version, `docs_version` (v1/v2/v3), and freshness |

## Example prompts

Once the server is registered, ask your agent naturally — it picks the right
tool. For example:

- "Search the VeeCode docs for how to enable RBAC in DevPortal."
- "Using the veecode-docs MCP, how do I turn off guest sign-in on the 3.x chart?"
- "Which values enable Keycloak sign-in in 3.x?"

## Environment variables

| Variable | Effect |
|----------|--------|
| `VEECODE_DOCS_MCP_VERSION=v1\|v2\|v3` | Docs version to serve (default `v3`). Same as the `--version` flag. |
| `VEECODE_DOCS_MCP_OFFLINE=1` | Skip the remote refresh check |
| `VEECODE_DOCS_MCP_SNAPSHOT_URL=<url>` | Override the snapshot URL (takes precedence over the version default) |
| `VEECODE_DOCS_MCP_CACHE_DIR=<path>` | Base directory for the separate version caches |

## How it stays fresh

The package ships with all three snapshots bundled at publish time. On every
launch, the server makes a non-blocking `HEAD` request to the selected version's
snapshot URL: `mcp-snapshot.json` for v3, `mcp-snapshot-v2.json` for v2, or
`mcp-snapshot-v1.json` for v1. If a newer snapshot exists, the server downloads
it to that version's cache subdirectory under
`~/.cache/veecode-docs-mcp/` for the next launch. The running session keeps its
loaded snapshot until it ends.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Server doesn't appear in the client | The MCP entry wasn't picked up | Restart the client after editing `~/.mcp.json` / running `claude mcp add`; confirm the entry with `claude mcp list` |
| Results look out of date | Cached snapshot from a previous launch | The refresh applies on the *next* launch — restart the server once; to force a clean pull, delete `~/.cache/veecode-docs-mcp/` (this removes the cached snapshots of all three versions) or only that version's subdirectory, for example `~/.cache/veecode-docs-mcp/v3` |
| Wrong docs version in results | Instance bound to the other version | Check `get_snapshot_info` (`docs_version`); register a separate instance with the correct `--version` |
| `npx` fails at launch behind a proxy/offline | No registry access to resolve the package | Install globally (`npm i -g @veecode-platform/docs-mcp`) and point the client at `veecode-docs-mcp`; set `VEECODE_DOCS_MCP_OFFLINE=1` to skip the refresh check |
