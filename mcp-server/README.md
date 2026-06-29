# @veecode-platform/docs-mcp

MCP server exposing the VeeCode Platform documentation (DevPortal, Platform, Admin-UI, VKDR-CLI) to CLI agents over stdio.

## Pick a docs version: V1 or V2

The server serves **one DevPortal docs version per instance** — it never mixes them. Choose with `--version v1|v2` (or `VEECODE_DOCS_MCP_VERSION`):

- **`v2` (default)** — the unified `veecode/devportal` / presets release. This is the current default docs line.
- **`v1`** — the prior split-image / profiles release (`VEECODE_PROFILE`), still supported with security backports.

The choice is bound for the whole session: search/get/list only return that version, and the background refresh only pulls that version's snapshot — so there is no cross-version drift. (`platform`, `admin-ui`, and `vkdr` docs are version-neutral and present in both.) Confirm the loaded version with the `get_snapshot_info` tool (`docs_version` field).

## Use with Claude Code

V2 (default) — no global install:

```bash
claude mcp add veecode-docs --scope user \
  -- npx -y @veecode-platform/docs-mcp
```

V1 — pass `--version v1`:

```bash
claude mcp add veecode-docs-v1 --scope user \
  -- npx -y @veecode-platform/docs-mcp --version v1
```

`npx` downloads the package on first call (~5s) and caches it. You can add both side by side. Or add to `~/.mcp.json` manually:

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
# then point the MCP at the global binary (add --version v1 for the prior line)
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
| `get_snapshot_info` | Loaded snapshot version, **docs_version (v1/v2)**, and freshness |

## How it stays fresh

The package ships with both version snapshots bundled at publish time. On every launch, the server makes a non-blocking `HEAD` request to the snapshot URL for the **selected version** (`mcp-snapshot.json` for v2, `mcp-snapshot-v1.json` for v1); if newer, it downloads it into `~/.cache/veecode-docs-mcp/` for use on the next launch. The refresh is version-scoped, so it never pulls the other version's content.

The running session never swaps mid-conversation, so the agent's view of the docs is stable for the lifetime of the session.

## Environment variables

| Variable | Effect |
|----------|--------|
| `VEECODE_DOCS_MCP_VERSION=v1\|v2` | Docs version to serve (default `v2`). Same as the `--version` flag. |
| `VEECODE_DOCS_MCP_OFFLINE=1` | Skip the remote refresh check |
| `VEECODE_DOCS_MCP_SNAPSHOT_URL=<url>` | Override the snapshot URL (takes precedence over the version default) |
| `VEECODE_DOCS_MCP_CACHE_DIR=<path>` | Override the cache directory |

## Language

The documentation is English. Queries can be made in any language as long as the LLM caller translates them before invoking `search_docs`. The index itself is not multilingual.

## Development

This package is developed in the [veecode-platform/docs](https://github.com/veecode-platform/docs) repository.

- `yarn install` (from repo root) — installs the workspace
- `yarn build` — generates the snapshot via the Docusaurus plugin
- `yarn mcp:ci` — typecheck + lint + test the MCP server
- `yarn workspace mcp-snapshot test` — test the plugin
