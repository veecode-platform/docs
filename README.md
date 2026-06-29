# VeeCode Platform Documentation

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

## Sites

| Branch    | Site                                        | Purpose    |
|-----------|---------------------------------------------|------------|
| `develop` | `https://docs-next.platform.vee.codes/`     | Staging    |
| `main`    | `https://docs.platform.vee.codes/`          | Production |

## Docs MCP server

The documentation is also available to CLI coding agents (Claude Code, Codex, Cursor) as an MCP server — [`@veecode-platform/docs-mcp`](mcp-server/README.md) — so an agent can search and read the docs without leaving the terminal.

It serves **one DevPortal docs version per instance** (it never mixes V1 and V2):

```bash
# V2 (default — the unified veecode/devportal / presets release)
claude mcp add veecode-docs --scope user -- npx -y @veecode-platform/docs-mcp

# V1 (the prior split-image / profiles release)
claude mcp add veecode-docs-v1 --scope user -- npx -y @veecode-platform/docs-mcp --version v1
```

`platform`, `admin-ui`, and `vkdr` docs are version-neutral and present in both. Full setup (Codex CLI, manual `~/.mcp.json`, global install, env vars, the exposed tools, and how the snapshot stays fresh) is in the **[MCP server README](mcp-server/README.md)**.

## Development Workflow

1. Create a feature branch off `develop`.
2. Open a PR targeting `develop` — merging triggers an automatic deploy to the staging site.
3. Review the changes on the staging site.
4. Merge `develop` into `main` — triggers the production deploy.

The staging deploy works by force-pushing the `develop` branch to the `main` branch of the [docs-next](https://github.com/veecode-platform/docs-next) mirror repo, which has its own GitHub Pages deploy. See [ADR-001](adr/001-preview-workflow.md) for details.

## Installation

```bash
corepack enable
yarn install
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Upgrading

Check docusaurus version (the command will also output the current upgrade command):

```bash
./node_modules/.bin/docusaurus -V
```

Upgrade docusaurus version:

```bash
yarn up @docusaurus/core@latest @docusaurus/preset-classic@latest @docusaurus/module-type-aliases@latest @docusaurus/types@latest
```
