# DevPortal V1/V2 docs versioning + MCP — Design

Date: 2026-05-27
Status: Approved (pending written-spec review)

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

## Content rework (V2 / current surface)

22 HIGH-impact pages move from Helm/`values.yaml`/`dynamic-plugins.yaml`/
`VEECODE_PROFILE` to presets + Docker Compose + OCI bundles +
`app-config.local.yaml`. Top reworks:

1. `installation-guide/simple-setup/create-values-file.md` — `values.yaml` →
   `app-config.local.yaml` + `.env`/presets.
2. `installation-guide/simple-setup/deploy-devportal.md` — `helm upgrade` →
   `docker compose up -d`.
3. `installation-guide/production-setup/setup.md` — bundle image + chart gone.
4. `installation-guide/understand-chart.md` — replace with presets/single-image
   architecture page.
5. `plugins/adding.md` — `dynamic-plugins.yaml`/`global.dynamic.plugins`/`vkdr
   --merge` → runtime OCI bundles under presets.
6. `installation-guide/docker-local/custom-plugins.md` — same conversion.
7. `installation-guide/docker-local/profiles.md` — `VEECODE_PROFILE` (singular)
   → composable `VEECODE_PRESETS`.
8. `plugins/plugins.md` — base/distro split → single image + OCI bundles.
9. `customization/theme-hack.md` — `global.theme` Helm values → app-config.
10. `admin-ui/Settings/05-plugins.md` — realign with preset/OCI selection.

The full per-file classification (22 HIGH / ~18 LOW / ~52 NONE) is the input to
the implementation plan. V1 keeps all current content frozen.

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

## Open question (to resolve before the cut)

The survey found the docs are **already partway migrated**: `docker-local/`
already uses the single image + compose + `app-config.local.yaml`, but still on
`VEECODE_PROFILE` (singular) and `dynamic-plugins.yaml`. So `devportal/` today is
a **hybrid**, not pure V1. Freezing it as-is may misrepresent what the POC teams
actually run. Before running `docs:version v1`, confirm whether the current tree
should be restored to a faithful V1 state first, or whether the hybrid is an
acceptable "V1" snapshot.

## Out of scope

- Versioning platform / admin-ui / vkdr instances.
- Backstage 1.50 upgrade (deferred upstream).
- Any V3 mechanism.
