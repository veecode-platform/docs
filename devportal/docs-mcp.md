---
sidebar_position: 4
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

It runs locally over stdio, needs no API key, and is distributed on npm — so
you never install a specific version by hand: `npx` always resolves the latest
published release.

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

`npx` downloads the package on first call (~5s) and caches it afterwards.

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

## Choosing the docs version (V1 or V2)

The server serves **one DevPortal docs version per instance** — it never mixes
them. The default is **V2**, the current default docs line. Select the version
with the `--version` flag (or the `VEECODE_DOCS_MCP_VERSION` environment
variable):

- **`v2` (default)** — the unified `veecode/devportal` / presets release.
- **`v1`** — the prior split-image / profiles release (`VEECODE_PROFILE`),
  still supported with security backports.

To point an instance at the V1 docs, pass `--version v1`:

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
    "veecode-docs-v1": {
      "command": "npx",
      "args": ["-y", "@veecode-platform/docs-mcp", "--version", "v1"]
    }
  }
}
```

The choice is bound for the whole session: search and read only return that
version, so there is no cross-version drift. (`platform`, `admin-ui`, and
`vkdr` docs are version-neutral and present in both.) Confirm which version an
instance loaded with the `get_snapshot_info` tool — check its `docs_version`
field.

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
| `get_snapshot_info` | Loaded snapshot version, `docs_version` (v1/v2), and freshness |

## Example prompts

Once the server is registered, ask your agent naturally — it picks the right
tool. For example:

- "Search the VeeCode docs for how to enable RBAC in DevPortal."
- "Using the veecode-docs MCP, show me the preset for GitLab integration."
- "What VEECODE_PRESETS do I need to migrate from the V1 gitlab profile?"

## Environment variables

| Variable | Effect |
|----------|--------|
| `VEECODE_DOCS_MCP_VERSION=v1\|v2` | Docs version to serve (default `v2`). Same as the `--version` flag. |
| `VEECODE_DOCS_MCP_OFFLINE=1` | Skip the remote refresh check |
| `VEECODE_DOCS_MCP_SNAPSHOT_URL=<url>` | Override the snapshot URL (takes precedence over the version default) |
| `VEECODE_DOCS_MCP_CACHE_DIR=<path>` | Override the cache directory |

## How it stays fresh

The package ships with both version snapshots bundled at publish time. On every
launch, the server makes a non-blocking `HEAD` request to the snapshot URL for
the selected version; if a newer snapshot exists, it downloads it into
`~/.cache/veecode-docs-mcp/` for use on the next launch. The refresh is
version-scoped, so it never pulls the other version's content, and a running
session never swaps mid-conversation — the agent's view of the docs is stable
for the lifetime of the session.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Server doesn't appear in the client | The MCP entry wasn't picked up | Restart the client after editing `~/.mcp.json` / running `claude mcp add`; confirm the entry with `claude mcp list` |
| Results look out of date | Cached snapshot from a previous launch | The refresh applies on the *next* launch — restart the server once; to force a clean pull, delete `~/.cache/veecode-docs-mcp/` |
| Wrong docs version in results | Instance bound to the other version | Check `get_snapshot_info` (`docs_version`); register a separate instance with the correct `--version` |
| `npx` fails at launch behind a proxy/offline | No registry access to resolve the package | Install globally (`npm i -g @veecode-platform/docs-mcp`) and point the client at `veecode-docs-mcp`; set `VEECODE_DOCS_MCP_OFFLINE=1` to skip the refresh check |
