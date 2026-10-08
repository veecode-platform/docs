# @veecode-platform/docs-mcp

MCP server exposing the VeeCode Platform documentation (DevPortal, Platform, Admin-UI, VKDR-CLI) to CLI agents over stdio.

## Pick a docs version: V1, V2, or V3

The server serves one DevPortal docs version per instance. It defaults to `v3`.
Pass `--version v1`, `--version v2`, or `--version v3`, or set
`VEECODE_DOCS_MCP_VERSION`:

- **`v3` (default)** — the DevPortal 3.x docs.
- **`v2`** — the DevPortal 2.x docs.
- **`v1`** — the V1 docs.

The selected DevPortal version stays fixed for the session. Platform, Admin-UI,
and VKDR use their current docs in each snapshot. The background refresh uses
the selected version's snapshot URL. `VEECODE_DOCS_MCP_SNAPSHOT_URL` overrides
that URL. Each version uses a separate cache subdirectory. Check the
`docs_version` field from `get_snapshot_info` to confirm the selection.

## Use with Claude Code

V3 (default) requires no version flag:

```bash
claude mcp add veecode-docs --scope user \
  -- npx -y @veecode-platform/docs-mcp
```

V2: pass `--version v2`:

```bash
claude mcp add veecode-docs-v2 --scope user \
  -- npx -y @veecode-platform/docs-mcp --version v2
```

V1: pass `--version v1`:

```bash
claude mcp add veecode-docs-v1 --scope user \
  -- npx -y @veecode-platform/docs-mcp --version v1
```

`npx` downloads the package on first call and caches it. You can add multiple versions side by side. Or add to `~/.mcp.json` manually:

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

## Use with Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.veecode-docs]
command = "npx"
args = ["-y", "@veecode-platform/docs-mcp"]
```

## Other install methods

If you'd rather not depend on `npx` resolution at launch:

```bash
npm install -g @veecode-platform/docs-mcp
# Add --version v2 or --version v1 to select a frozen docs version.
claude mcp add veecode-docs --scope user -- veecode-docs-mcp
```

## Tools exposed

| Tool | Purpose |
|------|---------|
| `search_docs` | BM25 search across all sections; filter by product, limit results |
| `get_doc` | Fetch a doc by path; optionally a specific section by anchor |
| `get_doc_outline` | Frontmatter + heading tree only — cheap preview |
| `list_products` | Overview of the four VeeCode products |
| `list_docs` | Directory tree within a product |
| `get_snapshot_info` | Loaded snapshot version, **docs_version (v1/v2/v3)**, and freshness |

## How it stays fresh

The package ships with all three snapshots bundled at publish time. On every
launch, the server makes a non-blocking `HEAD` request to the selected version's
snapshot URL: `mcp-snapshot.json` for v3, `mcp-snapshot-v2.json` for v2, or
`mcp-snapshot-v1.json` for v1. If a newer snapshot exists, the server downloads
it into that version's subdirectory under `~/.cache/veecode-docs-mcp/` for the
next launch.

The running session never swaps mid-conversation, so the agent's view of the docs is stable for the lifetime of the session.

## Environment variables

| Variable | Effect |
|----------|--------|
| `VEECODE_DOCS_MCP_VERSION=v1\|v2\|v3` | Docs version to serve (default `v3`). Same as the `--version` flag. |
| `VEECODE_DOCS_MCP_OFFLINE=1` | Skip the remote refresh check |
| `VEECODE_DOCS_MCP_SNAPSHOT_URL=<url>` | Override the snapshot URL (takes precedence over the version default) |
| `VEECODE_DOCS_MCP_CACHE_DIR=<path>` | Base directory for the separate version caches |

## Language

The documentation is English. Queries can be made in any language as long as the LLM caller translates them before invoking `search_docs`. The index itself is not multilingual.

## Development

This package is developed in the [veecode-platform/docs](https://github.com/veecode-platform/docs) repository.

- `yarn install` (from repo root) — installs the workspace
- `yarn build` — generates the snapshot via the Docusaurus plugin
- `yarn mcp:ci` — typecheck + lint + test the MCP server
- `yarn workspace mcp-snapshot test` — test the plugin
