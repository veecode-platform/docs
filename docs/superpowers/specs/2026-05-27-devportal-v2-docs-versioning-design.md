# DevPortal V1/V2 docs versioning + MCP — Design

Date: 2026-05-27
Status: Approved — content design added (pending written-spec review)
Source of truth: devportal-platform repo (cloned to `/tmp/devportal-platform`)

## Problem

VeeCode DevPortal is migrating to the **devportal-platform** architecture:
single unified OCI image (`docker.io/veecode/devportal-platform`), composable
YAML **presets** selected at runtime via `VEECODE_PRESETS`, dynamic plugins as
OCI bundles, Docker Compose quickstart, `app-config.local.yaml` overrides. This
replaces the legacy Helm chart + `values.yaml` + `dynamic-plugins.yaml` +
base/distro image model.

The docs must reflect the new model **without discarding V1**: internal teams
are running V1 today for client POCs and cannot be left without an option —
including agent/MCP support for V1.

Two coupled questions:

1. How to present V1 and V2 on the site without overwriting V1.
2. How the `@veecode/docs-mcp` server relates to that split — its mixed-version
   failure mode (agent sees Helm *and* compose at once) is the thing to avoid.

## Guiding principle

**The solution flows from the MCP, not the reverse.** The MCP's job is to let an
agent build/operate the *current* product with one coherent view per session.
Therefore: a session sees exactly one version, never mixed; default is the
latest (V2); V1 must remain *servable on demand* for the POC teams.

## Decisions

### 1. Scope: version only the `devportal` instance

Docusaurus versioning is per docs-instance. V1/V2 is a **DevPortal** concept
only. The cross-product survey confirmed this:

| Product   | Files | HIGH impact | Verdict          |
|-----------|-------|-------------|------------------|
| devportal | 69    | 14 (+16 LOW)| version this     |
| platform  | 16    | 0           | leave versionless|
| admin-ui  | 11    | 4           | leave versionless|
| vkdr      | 26    | 2           | leave versionless|

`devportal` is the **default** docs instance (`docusaurus.config.js` lines
45-51, `id` omitted). The version dropdown targets it automatically. The other
three products stay single-tree / versionless.

### 2. Site mechanism: native Docusaurus versioning

- Freeze the current DevPortal docs as `version-v1` → lands in
  `versioned_docs/version-v1/`, `versioned_sidebars/`, `versions.json`.
- The unversioned `devportal/` tree becomes "current" = **V2**, the editing
  surface to rewrite.
- Enable the already-present-but-commented `docsVersionDropdown` navbar item
  (`docusaurus.config.js` lines 153-156). For the default instance no
  `docsPluginId` is needed.
- Configure versions: `lastVersion: 'current'` with current labeled **v2** and
  the frozen one labeled **v1**, so new visitors land on V2.

**Cut ordering (matters):** `docs:version` snapshots whatever is in `devportal/`
at run time. So: (a) confirm `devportal/` accurately represents the real V1
product — see Open Question — (b) run `yarn docusaurus docs:version v1`, (c)
relabel current as v2, (d) rewrite the HIGH/LOW pages in current to V2.

**Accepted cost:** the cut duplicates the whole DevPortal tree (~69 files) into
`versioned_docs`, including pages that don't change. This duplication/drift is
inherent to a real version dropdown and is accepted.

### 3. MCP: default V2, `--v1` to pin, never mixed

The snapshot builder (`plugins/mcp-snapshot/`) currently walks
`repoRoot/<product>` for the four current dirs. After the cut it emits **two**
snapshot files:

- `mcp-snapshot.json` (V2 / current): `devportal/` + the three other current
  product dirs. **Unchanged from today's behavior.**
- `mcp-snapshot-v1.json` (V1): `versioned_docs/version-v1/` for devportal **plus
  the three other current product dirs** (they are versionless and shared, so a
  V1-pinned session still gets current Platform/Admin-UI/VKDR docs). This keeps
  the snapshot's required 4-product shape and is semantically correct.

The v1 file is only emitted when `versioned_docs/version-v1/` exists — before the
cut, behavior is identical to today (single snapshot). Backward compatible.

**Server selection** (`mcp-server/src/`): read process argv.

- no flag → load + refresh from `mcp-snapshot.json`.
- `--v1` → load + refresh from `mcp-snapshot-v1.json`.

The selected version maps to its snapshot URL, so V1 stays refreshable (HEAD →
download newer) just like V2. No mixing: a session is bound to one file.

### 4. Install UX: stays a one-liner, no external env

V2 (default) — identical to today:

```bash
claude mcp add veecode-docs --scope user -- npx -y @veecode-platform/docs-mcp
```

V1 (POC teams) — same line plus the flag:

```bash
claude mcp add veecode-docs --scope user -- npx -y @veecode-platform/docs-mcp --v1
```

Everything after `--` is the command Claude Code runs; `npx` forwards `--v1` to
the server process. Flag is `--v1` (short, no collision with `npx --version`).
No environment variable, no external config file. `npx -y` still pulls the latest
package; the flag only selects which snapshot it consumes.

Trade-off noted: `--v1` is boolean and won't scale to a hypothetical V3; if/when
that happens, migrate to `--docs-version <v>`. Accepted for simplicity now.

## Content design (V2 / current surface) — the bulk of the work

The mechanism above is the easy part. The labor is rewriting the DevPortal
install/config/plugin docs to the preset model, sourced from the
**devportal-platform repo**, which carries authoritative docs we adapt from
(not copy verbatim). Read all source via the `codedb` MCP (project
`/home/gio/devportal/devportal-platform`). Source files:

- `docs/topics/{installing,presets,configuration-layering,dynamic-plugins,plugin-selection-surfaces,plugin-authoring,plugin-packaging,theming}.md`
- `docs/reference/{shipped-presets,env-vars,preset-schema,glossary,tech-stack}.md`
- `docs/UPGRADING_FROM_BASE_DISTRO.md` — the profile→preset translation table
- `docs/adr/010-013` — rationale
- Concrete artifacts: `.env.example`, `docker-compose.yml`,
  `app-config.local.template.yaml`, `presets/*.yaml`, `entrypoint.sh`

### IA reshape (decided)

The current install IA is organized around Helm/`values.yaml`/profiles and does
not fit the preset model. The DevPortal install section is **reshaped** to the
preset model (URLs change → client redirects required):

| New / reshaped V2 page | Source |
|---|---|
| `installation-guide/` hub — single image + presets | README, `topics/installing.md` |
| quickstart (compose) — `cp .env.example`, `VEECODE_PRESETS`, `docker compose up -d` | `installing.md`, `docker-compose.yml`, `.env.example` |
| presets (concept) — what they are, tiers, composition | `topics/presets.md` |
| shipped-presets (reference) — preset → required vars table | `reference/shipped-presets.md` |
| env-vars (reference) | `reference/env-vars.md` |
| configuration — `app-config.local.yaml` layering | `topics/configuration-layering.md` |
| `plugins/` — OCI dynamic plugins + the 4 selection surfaces | `topics/dynamic-plugins.md`, `plugin-selection-surfaces.md` |
| migrating-from-v1 — profile→preset translation | `UPGRADING_FROM_BASE_DISTRO.md` |
| `production-setup` → k8s manifests (no Helm chart shipped yet) | `UPGRADING…` §Helm/K8s, `examples/deploy/k8s.yaml` |
| `understand-chart` → "architecture" page (or redirect) | ADR-010 |

### Image name (decided, provisional)

The repo contradicts itself: `docs/topics` say
`docker.io/veecode/devportal-platform`; the actual `docker-compose.yml` ships
`image: veecode/devportal:2.0.0`. **Decision: use `veecode/devportal:2.0.0`**
in the docs for now, with a TODO to verify against the published registry before
release. Do not invent a tag.

### Key facts the V2 content must get right (from source, not invented)

- Quickstart = `cp .env.example .env` → set `VEECODE_PRESETS` → `docker compose up -d`.
- Minimal portal: `VEECODE_PRESETS=recommended,veecode-theme`; open `:7007`.
- Two named volumes: `dp-data:/app/data`, `dp-plugins:/app/dynamic-plugins-root`.
- Preset tiers: Core (always on) / `recommended` / integration presets.
- 14 integration presets; SCM and identity are **separate composable** presets
  (`github` ≠ `github-auth`); `identity` is an exclusive group.
- Required-var failures = exit 78, named per preset; `up -d` masks it (check `ps`).
- Plugins = OCI bundles pulled at boot by `install-dynamic-plugins.py`; 4
  selection surfaces (preset / file `dynamic-plugins.yaml` / marketplace UI / built-in).
- `app-config.local.yaml` layers **after** preset config and wins; `app.title`
  is baked at build time and cannot be overridden at runtime.
- Migration: `VEECODE_PROFILE=x` → `VEECODE_PRESETS=…`; image name changes
  (not a tag bump); `GITHUB_TOKEN` → `GITHUB_PAT`; no automated migration tool.

### Per-page scope

Full classification: **22 HIGH / ~18 LOW / ~52 NONE** across 92 files.
`platform/` (16) is untouched. `vkdr/` and `admin-ui/` get small edits (profile
→ preset wording, the `vkdr devportal install` wrapper, admin-ui plugin UI).
V1 keeps all current content frozen. The full list drives the implementation
plan, sequenced by section: installation → plugins → customization →
integrations/mcp → admin-ui/vkdr edits.

### Execution principle

Adapt, don't copy. Factual content (preset tables, env vars, boot sequence,
exit codes) transfers directly; voice and Docusaurus conventions are ours.
Every claim is verifiable against the devportal-platform repo via `codedb`. No
invented preset, env var, flag, command, or path.

## Components touched

- `docusaurus.config.js` — versions config + uncomment `docsVersionDropdown`.
- `versions.json`, `versioned_docs/version-v1/`, `versioned_sidebars/` — created
  by `docs:version`.
- `plugins/mcp-snapshot/` (`lib/snapshot-builder.js`, `lib/doc-walker.js`) —
  emit second snapshot from `versioned_docs/version-v1/`.
- `mcp-server/src/` (server options + snapshot loader/fetcher) — `--v1` argv flag
  → snapshot URL/file selection.
- `mcp-server/README.md`, `devportal/integrations/mcp.md` — document `--v1`.
- ~22 HIGH + ~18 LOW DevPortal pages — V2 content rewrite.

## Resolved decisions

- **Hybrid-as-V1 (accepted).** The current `devportal/` tree is partway migrated
  (compose + `app-config.local.yaml` but still `VEECODE_PROFILE` + legacy
  `dynamic-plugins.yaml`). It is **not** worth restoring a "pure" V1 first — we
  freeze the current tree as `version-v1` as-is.
- **Image name = `veecode/devportal:2.0.0`** provisionally (see Content design).
- **MCP package name = `@veecode-platform/docs-mcp`** (verified on npm @0.0.2,
  bin `veecode-docs-mcp`; `@veecode/docs-mcp` returns 404). On our `main`
  baseline, `mcp-server/package.json` and `README.md` already use the correct
  name — the stale `@veecode/docs-mcp` references only exist on `develop`.

## Workspace

- Base branch: **`origin/main`** — per user, "what's written today" lives on
  `main`. The parallel `.audit/` V1-accuracy work (branch
  `docs/devportal-accuracy-overhaul`, reconciling V1 docs vs the real base/-distro
  repos) is a **separate workstream, out of scope, not to be touched**.
- Working in git worktree `worktree-v2-docs`.
- **Source of truth for V2 = devportal-platform via the `codedb` MCP**
  (indexed project `/home/gio/devportal/devportal-platform`) — not grep, not a
  clone. `devportal-saas` is also indexed (SaaS path reference).

## Out of scope

- Versioning platform / admin-ui / vkdr instances.
- Backstage 1.50 upgrade (deferred upstream).
- Any V3 mechanism.
