# @veecode-platform/docs-mcp

MCP server exposing the VeeCode Platform documentation (DevPortal, Platform, Admin-UI, VKDR-CLI) to CLI agents over stdio.

## Use with Claude Code

One command, no global install:

```bash
claude mcp add veecode-docs --scope user \
  -- npx -y @veecode-platform/docs-mcp
```

That's it. `npx` downloads the package on first call (~5s) and caches it for subsequent runs.

Or add to `~/.mcp.json` manually:

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
# then point the MCP at the global binary
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
| `get_snapshot_info` | Loaded snapshot version and freshness |

## How it stays fresh

The package ships with a snapshot bundled at publish time. On every launch, the server makes a non-blocking `HEAD` request to `https://docs.platform.vee.codes/mcp-snapshot.json`; if newer, it downloads the snapshot into `~/.cache/veecode-docs-mcp/` for use on the next launch.

The running session never swaps mid-conversation, so the agent's view of the docs is stable for the lifetime of the session.

## Environment variables

| Variable | Effect |
|----------|--------|
| `VEECODE_DOCS_MCP_OFFLINE=1` | Skip the remote refresh check |
| `VEECODE_DOCS_MCP_SNAPSHOT_URL=<url>` | Override the snapshot URL |
| `VEECODE_DOCS_MCP_CACHE_DIR=<path>` | Override the cache directory |

## Language

The documentation is English. Queries can be made in any language as long as the LLM caller translates them before invoking `search_docs`. The index itself is not multilingual.

## Development

This package is developed in the [veecode-platform/docs](https://github.com/veecode-platform/docs) repository.

- `yarn install` (from repo root) — installs the workspace
- `yarn build` — generates the snapshot via the Docusaurus plugin
- `yarn mcp:ci` — typecheck + lint + test the MCP server
- `yarn workspace mcp-snapshot test` — test the plugin
